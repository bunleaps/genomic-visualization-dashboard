from io import StringIO
from Bio import SeqIO
from flask import Flask, jsonify, request
from flask_cors import CORS
from logic import (
    process_nucleotide_sequence,
    get_nucleotide_counts,
    calculate_gc_content,
    get_reverse_complement,
    fetch_data_from_url,
)

app = Flask(__name__)
CORS(app)


@app.route("/api/sequence_data", methods=["POST"])
def get_data():
    try:
        data = request.get_json()
        print("Received data:", data)
        json_data = process_nucleotide_sequence(data["sequence"])
        return jsonify(json_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/simple_stats", methods=["POST"])
def get_simple_stats():
    try:
        data = request.get_json()
        print("Received data:", data)
        json_data = {
            "nucleotide_counts": get_nucleotide_counts(data["sequence"]),
            "gc_content": calculate_gc_content(data["sequence"]),
            "reverse_complement": get_reverse_complement(data["sequence"]),
        }
        return jsonify(json_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/ingest/fasta", methods=["POST"])
def ingest_fasta_url():
    data = request.get_json()
    url = data.get("url")

    if not url:
        return jsonify({"error": "Missing 'url' in request body."}), 400

    file_content = fetch_data_from_url(url)
    if not file_content:
        return jsonify({"error": "Failed to retrieve content from the URL."}), 400

    try:
        # Use StringIO to treat the string content as a file-like object for SeqIO
        handle = StringIO(file_content)

        # Parse all sequences from the FASTA file
        sequences_data = {}
        total_bases = 0

        for record in SeqIO.parse(handle, "fasta"):
            raw_sequence = str(record.seq)

            # --- CRITICAL STEP: Call your processing function here ---
            processed_seq_data = process_nucleotide_sequence(raw_sequence)

            sequences_data[record.id] = {
                "sequence_id": record.id,
                "description": record.description,
                "length": len(raw_sequence),
                "visualization_data": processed_seq_data,  # The structured array
            }
            total_bases += len(raw_sequence)

        if not sequences_data:
            return (
                jsonify(
                    {"error": "FASTA file was parsed but no sequences were found."}
                ),
                400,
            )

        # Example overall statistic
        avg_length = total_bases / len(sequences_data)

        # Return the structured data array and summary statistics
        return (
            jsonify(
                {
                    "status": "success",
                    "message": f"FASTA data ingested and processed. {len(sequences_data)} sequences detected.",
                    "url": url,
                    "summary": {
                        "total_sequences": len(sequences_data),
                        "total_bases": total_bases,
                        "avg_seq_length": f"{avg_length:.2f}",
                    },
                    # Return the processed data structure
                    "processed_sequences": sequences_data,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": f"Failed to process FASTA data from URL: {e}"}), 500


@app.route("/")
def home():
    return "The Modular Flask API is running!"


if __name__ == "__main__":
    app.run(debug=True)
