from flask import Flask, jsonify, request
from flask_cors import CORS
from Bio import SeqIO
from Bio.SeqUtils import gc_fraction
from Bio.Seq import Seq
import httpx
import io
import re
import os
from google import genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=False,
    expose_headers=["*"],
    allow_headers=["*"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)

DATA_CACHE = None

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    gemini_client = genai.Client()
else:
    gemini_client = None
    print("Warning: GEMINI_API_KEY not set. AI interpretations will be disabled.")


def extract_biological_features(
    seq: Seq, seq_id: str, params: dict | None = None
) -> list:
    """Extract biological features without limiting counts.
    Supports payload-driven tuning to speed up scanning without imposing caps."""
    params = params or {}
    min_orf_length = max(30, int(params.get("min_orf_length", 90)))
    gc_window_size = max(50, int(params.get("gc_window", 200)))
    gc_step_size = max(1, int(params.get("gc_step", 25)))
    gc_threshold = float(params.get("gc_threshold", 0.6))
    cpg_window_size = max(50, int(params.get("cpg_window", 200)))
    cpg_step_size = max(1, int(params.get("cpg_step", 50)))
    cpg_gc_threshold = float(params.get("cpg_gc_threshold", 0.5))
    cpg_oe_threshold = float(params.get("cpg_oe_threshold", 0.6))
    repeat_min_length = max(2, int(params.get("repeat_min_length", 2)))
    repeat_max_unit_length = max(
        repeat_min_length, int(params.get("repeat_max_unit_length", 50))
    )
    repeat_min_repeats = max(2, int(params.get("repeat_min_repeats", 2)))
    repeat_stride = max(1, int(params.get("repeat_stride", 1)))

    # Optional fast mode (user opt-in) to trade completeness for speed
    if params.get("fast_mode"):
        gc_step_size = max(gc_step_size, gc_window_size)
        cpg_step_size = max(cpg_step_size, cpg_window_size)
        repeat_stride = max(repeat_stride, 5)
        min_orf_length = max(min_orf_length, 300)
        repeat_max_unit_length = min(repeat_max_unit_length, 30)
    features = []
    seq_str = str(seq)
    seq_len = len(seq_str)
    if seq_len == 0:
        return features

    # 1. ORFs (all frames, both strands)
    orfs = []
    for strand, seq_strand in [("+", seq), ("-", seq.reverse_complement())]:
        seq_str_strand = str(seq_strand)
        for frame in range(3):
            start = frame
            while start <= len(seq_str_strand) - 3:
                idx = seq_str_strand.find("ATG", start)
                if idx == -1:
                    break
                # walk in codons to stop
                i = idx
                while i <= len(seq_str_strand) - 3:
                    codon = seq_str_strand[i : i + 3]
                    if codon in ("TAA", "TAG", "TGA"):
                        orf_length = i + 3 - idx
                        if orf_length >= min_orf_length:
                            if strand == "+":
                                actual_start = idx
                                actual_end = i + 3
                            else:
                                actual_start = seq_len - (i + 3)
                                actual_end = seq_len - idx
                            orfs.append(
                                {
                                    "start": actual_start,
                                    "end": actual_end,
                                    "strand": strand,
                                    "length": orf_length,
                                    "frame": frame,
                                }
                            )
                        break
                    i += 3
                start = idx + 1
    # sort by start to keep natural order
    orfs.sort(key=lambda x: (x["start"], -x["length"]))
    for idx, orf in enumerate(orfs):
        feature_type = "gene" if orf["length"] > 900 else "CDS"
        features.append(
            {
                "id": f"{feature_type}_{seq_id}_{idx}",
                "type": feature_type,
                "seq_id": seq_id,
                **orf,
            }
        )
        features.append(
            {"id": f"orf_{seq_id}_{idx}", "type": "ORF", "seq_id": seq_id, **orf}
        )

    # 2. GC-rich regions with sliding window (overlapping)
    last_region = None
    for i in range(0, seq_len - gc_window_size + 1, gc_step_size):
        window_seq = seq[i : i + gc_window_size]
        gc_content = gc_fraction(window_seq)  # BioPython handles Seq directly
        if gc_content >= gc_threshold:
            region = {
                "start": i,
                "end": i + gc_window_size,
                "gc_content": round(gc_content * 100, 2),
            }
            # merge consecutive overlaps
            if last_region and region["start"] <= last_region["end"]:
                last_region["end"] = max(last_region["end"], region["end"])
                last_region["gc_content"] = max(
                    last_region["gc_content"], region["gc_content"]
                )
            else:
                if last_region:
                    features.append(
                        {
                            "id": f"gc_rich_{seq_id}_{len([f for f in features if f['type']=='GC_rich_region'])}",
                            "type": "GC_rich_region",
                            "seq_id": seq_id,
                            "strand": "+",
                            **last_region,
                        }
                    )
                last_region = region
    if last_region:
        features.append(
            {
                "id": f"gc_rich_{seq_id}_{len([f for f in features if f['type']=='GC_rich_region'])}",
                "type": "GC_rich_region",
                "seq_id": seq_id,
                "strand": "+",
                **last_region,
            }
        )

    # 3. Tandem repeats: exhaustive scan of repeat lengths
    seen = set()
    for unit_len in range(
        repeat_min_length, min(repeat_max_unit_length, seq_len // 2) + 1
    ):
        i = 0
        while i <= seq_len - unit_len * 2:
            unit = seq_str[i : i + unit_len]
            count = 1
            pos = i + unit_len
            while pos <= seq_len - unit_len and seq_str[pos : pos + unit_len] == unit:
                count += 1
                pos += unit_len
            if count >= repeat_min_repeats:
                key = (i, pos)
                if key not in seen:
                    seen.add(key)
                    features.append(
                        {
                            "id": f"repeat_{seq_id}_{len([f for f in features if f['type']=='tandem_repeat'])}",
                            "type": "tandem_repeat",
                            "seq_id": seq_id,
                            "start": i,
                            "end": pos,
                            "strand": "+",
                            "repeat_unit": unit[:20]
                            + ("..." if len(unit) > 20 else ""),
                            "repeat_count": count,
                            "unit_length": unit_len,
                        }
                    )
                i = pos
            else:
                i += repeat_stride

    # 4. CpG islands with standard criteria
    for i in range(0, seq_len - cpg_window_size + 1, cpg_step_size):
        window = seq_str[i : i + cpg_window_size]
        cg = window.count("CG")
        c = window.count("C")
        g = window.count("G")
        if c > 0 and g > 0:
            expected = (c * g) / cpg_window_size
            oe = cg / expected if expected > 0 else 0
            gc_pct = (c + g) / cpg_window_size
            if gc_pct > cpg_gc_threshold and oe > cpg_oe_threshold:
                features.append(
                    {
                        "id": f"cpg_island_{seq_id}_{len([f for f in features if f['type']=='CpG_island'])}",
                        "type": "CpG_island",
                        "seq_id": seq_id,
                        "start": i,
                        "end": i + cpg_window_size,
                        "strand": "+",
                        "gc_content": round(gc_pct * 100, 2),
                        "obs_exp_ratio": round(oe, 2),
                    }
                )

    return features


def calculate_sequence_metrics(seq_str: str) -> dict:
    seq_upper = seq_str.upper()
    seq_len = len(seq_upper)
    if seq_len == 0:
        return {
            "length": 0,
            "gc_content": 0.0,
            "at_content": 0.0,
            "gc_count": 0,
            "at_count": 0,
            "nucleotide_counts": {"A": 0, "T": 0, "G": 0, "C": 0, "N": 0},
            "nucleotide_frequencies": {
                "A": 0.0,
                "T": 0.0,
                "G": 0.0,
                "C": 0.0,
                "N": 0.0,
            },
            "ambiguous_bases": 0,
            "gc_skew": 0.0,
            "at_skew": 0.0,
        }
    A = seq_upper.count("A")
    T = seq_upper.count("T")
    G = seq_upper.count("G")
    C = seq_upper.count("C")
    N = seq_upper.count("N")
    ambiguous = sum(seq_upper.count(base) for base in "RYSWKMBDHV")
    gc = G + C
    at = A + T
    gc_content = (gc / seq_len) * 100
    at_content = (at / seq_len) * 100
    freqs = {
        "A": (A / seq_len) * 100,
        "T": (T / seq_len) * 100,
        "G": (G / seq_len) * 100,
        "C": (C / seq_len) * 100,
        "N": (N / seq_len) * 100,
    }
    gc_skew = ((G - C) / (G + C)) if (G + C) > 0 else 0.0
    at_skew = ((A - T) / (A + T)) if (A + T) > 0 else 0.0
    return {
        "length": seq_len,
        "gc_content": round(gc_content, 2),
        "at_content": round(at_content, 2),
        "gc_count": gc,
        "at_count": at,
        "nucleotide_counts": {"A": A, "T": T, "G": G, "C": C, "N": N},
        "nucleotide_frequencies": {k: round(v, 2) for k, v in freqs.items()},
        "ambiguous_bases": N + ambiguous,
        "gc_skew": round(gc_skew, 4),
        "at_skew": round(at_skew, 4),
    }


def process_fasta_content(fasta_content: str, params: dict | None = None) -> dict:
    records = SeqIO.parse(io.StringIO(fasta_content), "fasta")
    features_list = []
    sequences_info = []
    total_length = 0
    total_gc = 0
    total_at = 0
    for record in records:
        seq_str = str(record.seq)
        seq_len = len(seq_str)
        total_length += seq_len
        seq_id = record.id
        metrics = calculate_sequence_metrics(seq_str)
        total_gc += metrics["gc_count"]
        total_at += metrics["at_count"]
        seq_features = extract_biological_features(record.seq, seq_id, params)
        features_list.extend(seq_features)
        sequences_info.append(
            {
                "id": seq_id,
                "description": record.description,
                "length": seq_len,
                "gc_content": metrics["gc_content"],
                "at_content": metrics["at_content"],
                "nucleotide_counts": metrics["nucleotide_counts"],
                "nucleotide_frequencies": metrics["nucleotide_frequencies"],
                "gc_skew": metrics["gc_skew"],
                "at_skew": metrics["at_skew"],
                "ambiguous_bases": metrics["ambiguous_bases"],
                "sequence_preview": seq_str[:100] + ("..." if seq_len > 100 else ""),
            }
        )
    overall_gc_content = (total_gc / total_length * 100) if total_length > 0 else 0.0
    overall_at_content = (total_at / total_length * 100) if total_length > 0 else 0.0
    avg_seq_length = (total_length / len(sequences_info)) if sequences_info else 0
    return {
        "sequence_length": total_length,
        "features": features_list,
        "sequences": sequences_info,
        "summary": {
            "total_sequences": len(sequences_info),
            "total_bases": total_length,
            "average_length": round(avg_seq_length, 2),
            "overall_gc_content": round(overall_gc_content, 2),
            "overall_at_content": round(overall_at_content, 2),
            "total_gc_bases": total_gc,
            "total_at_bases": total_at,
        },
    }


@app.route("/api/ingest", methods=["POST"])
def ingest_fasta():
    payload = request.get_json(silent=True) or {}
    fasta_content = None
    include_interpretation = payload.get("interpret", False)
    scan_params = payload.get("params") or {}
    if payload.get("fast_mode"):
        scan_params["fast_mode"] = True
    if "fasta" in payload and isinstance(payload["fasta"], str):
        fasta_content = payload["fasta"].strip()
    elif "url" in payload and isinstance(payload["url"], str):
        try:
            resp = httpx.get(payload["url"], timeout=20)
            resp.raise_for_status()
            fasta_content = resp.text
        except Exception as e:
            return jsonify({"error": f"Failed to fetch URL: {e}"}), 400
    else:
        return jsonify({"error": "Provide 'fasta' string or 'url' in JSON body."}), 400
    try:
        result = process_fasta_content(fasta_content, scan_params)
        global DATA_CACHE
        DATA_CACHE = result
        if include_interpretation and gemini_client:
            try:
                summary = result.get("summary", {})
                sequences = result.get("sequences", [])
                features = result.get("features", [])
                feature_counts = {}
                for feat in features:
                    t = feat.get("type", "unknown")
                    feature_counts[t] = feature_counts.get(t, 0) + 1
                prompt = f"""As a genomic analysis expert, please interpret the following genomic data and provide insights:

Summary Statistics:
- Total sequences: {summary.get('total_sequences', 0)}
- Total bases: {summary.get('total_bases', 0):,} bp
- Average sequence length: {summary.get('average_length', 0):.2f} bp
- Overall GC content: {summary.get('overall_gc_content', 0):.2f}%
- Overall AT content: {summary.get('overall_at_content', 0):.2f}%

Detected Features:
{chr(10).join([f'- {feat_type}: {count}' for feat_type, count in feature_counts.items()])}

Sequence Details (first 3):
{chr(10).join([f"- {seq['id']}: {seq['length']} bp, GC: {seq.get('gc_content', 0):.2f}%, AT skew: {seq.get('at_skew', 0):.4f}" for seq in sequences[:3]])}

Please provide:
1. Overall interpretation of the genomic composition
2. Significance of the GC content and what it suggests about the organism
3. Analysis of detected features (genes, ORFs, CDS, regulatory regions)
4. Any notable patterns or characteristics
5. Potential biological implications

Keep the response concise but informative (max 500 words)."""
                response = gemini_client.models.generate_content(
                    model="gemini-2.5-flash", contents=prompt
                )
                result["interpretation"] = response.text
                result["feature_counts"] = feature_counts
            except Exception as e:
                result["interpretation_error"] = (
                    f"Failed to generate interpretation: {str(e)}"
                )
        elif include_interpretation and not gemini_client:
            result["interpretation_error"] = (
                "Gemini AI is not configured. Please set GEMINI_API_KEY environment variable."
            )
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": f"Failed to process FASTA: {e}"}), 500


@app.route("/api/genome_data", methods=["GET"])
def get_genome_data():
    if DATA_CACHE is None:
        return jsonify({"message": "Data not yet loaded"}), 503
    return jsonify(DATA_CACHE)


if __name__ == "__main__":
    app.run(debug=True, port=8001)
