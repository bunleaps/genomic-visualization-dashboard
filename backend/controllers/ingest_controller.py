from flask import Blueprint, jsonify, request
from Bio import SeqIO
from Bio.SeqUtils import gc_fraction
from Bio.Seq import Seq
import httpx
import io
import re
import os
from google import genai


bp = Blueprint("api", __name__)


# Optional Gemini client (reads GEMINI_API_KEY from env)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
gemini_client = genai.Client() if GEMINI_API_KEY else None


def extract_biological_features(
    seq: Seq, seq_id: str, max_features_per_type: int = 50
) -> list:
    """Extract ORFs, GC-rich regions, repeats, and CpG islands."""
    features = []
    seq_str = str(seq)
    seq_len = len(seq_str)
    if seq_len == 0:
        return features

    feature_counts = {
        "ORF": 0,
        "GC_rich_region": 0,
        "tandem_repeat": 0,
        "CpG_island": 0,
    }

    min_orf_length = 300
    orfs_temp = []
    for strand, seq_strand in [("+", seq), ("-", seq.reverse_complement())]:
        if feature_counts["ORF"] >= max_features_per_type:
            break
        seq_str_strand = str(seq_strand)
        for frame in range(3):
            if feature_counts["ORF"] >= max_features_per_type:
                break
            for match in re.finditer(r"ATG", seq_str_strand[frame:]):
                start_pos = match.start() + frame
                for i in range(start_pos, len(seq_str_strand) - 2, 3):
                    codon = seq_str_strand[i : i + 3]
                    if codon in ["TAA", "TAG", "TGA"]:
                        orf_length = i + 3 - start_pos
                        if orf_length >= min_orf_length:
                            if strand == "+":
                                actual_start = start_pos
                                actual_end = i + 3
                            else:
                                actual_start = seq_len - (i + 3)
                                actual_end = seq_len - start_pos
                            orfs_temp.append(
                                {
                                    "start": actual_start,
                                    "end": actual_end,
                                    "strand": strand,
                                    "length": orf_length,
                                    "frame": frame,
                                }
                            )
                            feature_counts["ORF"] += 1
                        break

    orfs_temp.sort(key=lambda x: x["length"], reverse=True)
    for idx, orf in enumerate(orfs_temp[:max_features_per_type]):
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

    window_size = 200
    gc_threshold = 0.65
    step_size = 200
    gc_regions_temp = []
    for i in range(0, seq_len - window_size, step_size):
        if feature_counts["GC_rich_region"] >= max_features_per_type:
            break
        window_seq = seq[i : i + window_size]
        gc_content = gc_fraction(window_seq)
        if gc_content >= gc_threshold:
            gc_regions_temp.append(
                {
                    "start": i,
                    "end": i + window_size,
                    "gc_content": round(gc_content * 100, 2),
                }
            )
            feature_counts["GC_rich_region"] += 1
    merged_gc_regions = []
    for region in gc_regions_temp:
        if merged_gc_regions and region["start"] - merged_gc_regions[-1]["end"] < 100:
            merged_gc_regions[-1]["end"] = region["end"]
            merged_gc_regions[-1]["gc_content"] = max(
                merged_gc_regions[-1]["gc_content"], region["gc_content"]
            )
        else:
            merged_gc_regions.append(region)
    for idx, region in enumerate(merged_gc_regions[:max_features_per_type]):
        features.append(
            {
                "id": f"gc_rich_{seq_id}_{idx}",
                "type": "GC_rich_region",
                "seq_id": seq_id,
                "strand": "+",
                **region,
            }
        )

    repeat_min_length = 15
    repeat_pattern_limit = 30
    repeat_step = 100
    seen_repeats = set()
    for repeat_len in range(repeat_min_length, min(repeat_pattern_limit, seq_len // 4)):
        if feature_counts["tandem_repeat"] >= max_features_per_type:
            break
        for i in range(0, seq_len - repeat_len * 2, repeat_step):
            if feature_counts["tandem_repeat"] >= max_features_per_type:
                break
            pattern = seq_str[i : i + repeat_len]
            if seq_str[i + repeat_len : i + repeat_len * 2] == pattern:
                repeat_count = 2
                pos = i + repeat_len * 2
                while (
                    pos + repeat_len <= seq_len
                    and seq_str[pos : pos + repeat_len] == pattern
                ):
                    repeat_count += 1
                    pos += repeat_len
                if repeat_count >= 3:
                    repeat_key = (i, i + (repeat_len * repeat_count))
                    if repeat_key not in seen_repeats:
                        seen_repeats.add(repeat_key)
                        features.append(
                            {
                                "id": f"repeat_{seq_id}_{feature_counts['tandem_repeat']}",
                                "type": "tandem_repeat",
                                "seq_id": seq_id,
                                "start": i,
                                "end": i + (repeat_len * repeat_count),
                                "strand": "+",
                                "repeat_unit": pattern[:20]
                                + ("..." if len(pattern) > 20 else ""),
                                "repeat_count": repeat_count,
                                "unit_length": repeat_len,
                            }
                        )
                        feature_counts["tandem_repeat"] += 1

    window_size = 200
    cpg_step = 200
    for i in range(0, seq_len - window_size, cpg_step):
        if feature_counts["CpG_island"] >= max_features_per_type:
            break
        window = seq_str[i : i + window_size]
        cg_count = window.count("CG")
        c_count = window.count("C")
        g_count = window.count("G")
        if c_count > 0 and g_count > 0:
            expected_cg = (c_count * g_count) / window_size
            obs_exp_ratio = cg_count / expected_cg if expected_cg > 0 else 0
            gc_content = (c_count + g_count) / window_size
            if gc_content > 0.55 and obs_exp_ratio > 0.65:
                features.append(
                    {
                        "id": f"cpg_island_{seq_id}_{feature_counts['CpG_island']}",
                        "type": "CpG_island",
                        "seq_id": seq_id,
                        "start": i,
                        "end": i + window_size,
                        "strand": "+",
                        "gc_content": round(gc_content * 100, 2),
                        "obs_exp_ratio": round(obs_exp_ratio, 2),
                    }
                )
                feature_counts["CpG_island"] += 1

    return features


def calculate_sequence_metrics(seq_str: str) -> dict:
    """Compute base composition stats and skews."""
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
    count_A = seq_upper.count("A")
    count_T = seq_upper.count("T")
    count_G = seq_upper.count("G")
    count_C = seq_upper.count("C")
    count_N = seq_upper.count("N")
    ambiguous = sum(seq_upper.count(base) for base in "RYSWKMBDHV")
    total_ambiguous = count_N + ambiguous
    gc_count = count_G + count_C
    at_count = count_A + count_T
    gc_content = (gc_count / seq_len) * 100 if seq_len > 0 else 0.0
    at_content = (at_count / seq_len) * 100 if seq_len > 0 else 0.0
    frequencies = {
        "A": (count_A / seq_len) * 100,
        "T": (count_T / seq_len) * 100,
        "G": (count_G / seq_len) * 100,
        "C": (count_C / seq_len) * 100,
        "N": (count_N / seq_len) * 100,
    }
    gc_skew = (
        ((count_G - count_C) / (count_G + count_C)) if (count_G + count_C) > 0 else 0.0
    )
    at_skew = (
        ((count_A - count_T) / (count_A + count_T)) if (count_A + count_T) > 0 else 0.0
    )
    return {
        "length": seq_len,
        "gc_content": round(gc_content, 2),
        "at_content": round(at_content, 2),
        "gc_count": gc_count,
        "at_count": at_count,
        "nucleotide_counts": {
            "A": count_A,
            "T": count_T,
            "G": count_G,
            "C": count_C,
            "N": count_N,
        },
        "nucleotide_frequencies": {k: round(v, 2) for k, v in frequencies.items()},
        "ambiguous_bases": total_ambiguous,
        "gc_skew": round(gc_skew, 4),
        "at_skew": round(at_skew, 4),
    }


def process_fasta_content(fasta_content: str) -> dict:
    """Parse FASTA, compute metrics, and extract features."""
    records = SeqIO.parse(io.StringIO(fasta_content), "fasta")
    features_list = []
    sequences_info = []
    total_length = 0
    total_gc = 0
    total_at = 0
    for i, record in enumerate(records):
        seq_str = str(record.seq)
        seq_len = len(seq_str)
        total_length += seq_len
        seq_id = record.id
        metrics = calculate_sequence_metrics(seq_str)
        total_gc += metrics["gc_count"]
        total_at += metrics["at_count"]
        seq_features = extract_biological_features(record.seq, seq_id)
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


DATA_CACHE = None


@bp.route("/api/genome_data", methods=["GET"])
def get_genome_data():
    if DATA_CACHE is None:
        return jsonify({"message": "Data not yet loaded"}), 503
    return jsonify(DATA_CACHE)


@bp.route("/api/ingest", methods=["POST"])
def ingest_fasta():
    payload = request.get_json(silent=True) or {}
    fasta_content = None
    include_interpretation = payload.get("interpret", False)

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
        result = process_fasta_content(fasta_content)
        global DATA_CACHE
        DATA_CACHE = result

        if include_interpretation and gemini_client:
            try:
                summary = result.get("summary", {})
                sequences = result.get("sequences", [])
                features = result.get("features", [])
                feature_counts = {}
                for feat in features:
                    feat_type = feat.get("type", "unknown")
                    feature_counts[feat_type] = feature_counts.get(feat_type, 0) + 1
                prompt = (
                    "As a genomic analysis expert, please interpret the following genomic data and provide insights:\n\n"
                    f"Total sequences: {summary.get('total_sequences', 0)}\n"
                    f"Total bases: {summary.get('total_bases', 0):,} bp\n"
                    f"Average sequence length: {summary.get('average_length', 0):.2f} bp\n"
                    f"Overall GC content: {summary.get('overall_gc_content', 0):.2f}%\n"
                    f"Overall AT content: {summary.get('overall_at_content', 0):.2f}%\n\n"
                    + "Detected Features:\n"
                    + "\n".join(
                        [f"- {ft}: {cnt}" for ft, cnt in feature_counts.items()]
                    )
                )
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
