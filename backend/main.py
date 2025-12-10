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
        sequence = data["sequence"]
        
        # If sequence starts with FASTA header, skip the first line
        lines = sequence.split('\n')
        if lines[0].strip().startswith(">"):
            lines = lines[1:]  # Remove first line
        
        # Join remaining lines and remove all whitespace
        sequence = ''.join(''.join(lines).split())
        
        print("Processing sequence data:", sequence[:50])
        json_data = process_nucleotide_sequence(sequence)
        return jsonify(json_data), 200

    except Exception as e:
        print(f"Error in get_data: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/simple_stats", methods=["POST"])
def get_simple_stats():
    try:
        data = request.get_json()
        sequence = data["sequence"]
        
        # If the sequence contains FASTA header (starts with '>'), remove it
        if sequence.strip().startswith(">"):
            # Find the position of first actual line break and remove everything before it
            first_newline = sequence.find('\n')
            if first_newline != -1:
                sequence = sequence[first_newline+1:]
            else:
                # No newline found, remove everything up to first space after >
                space_pos = sequence.find(' ', 1)
                if space_pos != -1:
                    sequence = sequence[space_pos+1:]
        
        # Remove any remaining whitespace from the sequence
        sequence = ''.join(sequence.split())
        
        print(f"Final sequence for stats: {sequence[:50]}...")
        json_data = {
            "nucleotide_counts": get_nucleotide_counts(sequence),
            "gc_content": calculate_gc_content(sequence),
            "reverse_complement": get_reverse_complement(sequence),
        }
        print(f"GC Content result: {json_data['gc_content']}")
        return jsonify(json_data), 200

    except Exception as e:
        print(f"Error in simple_stats: {e}")
        import traceback
        traceback.print_exc()
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
        handle = StringIO(file_content)
        sequences_data = {}
        total_bases_file = 0

        for record in SeqIO.parse(handle, "fasta"):
            raw_sequence = str(record.seq)

            # 1. Visualization Data Preparation
            processed_seq_data = process_nucleotide_sequence(raw_sequence)

            # 2. Feature Extraction (Calculating Metrics)
            nucleotide_metrics = get_nucleotide_counts(raw_sequence)
            gc_content = calculate_gc_content(raw_sequence)
            reverse_complement = get_reverse_complement(raw_sequence)

            sequences_data[record.id] = {
                "sequence_id": record.id,
                "description": record.description,
                "length": len(raw_sequence),
                "gc_content": gc_content,  # New Feature
                "nucleotide_counts": nucleotide_metrics["counts"],  # New Feature
                "nucleotide_frequencies": nucleotide_metrics[
                    "frequencies"
                ],  # New Feature
                # The reverse complement can be used for contextual analysis
                "reverse_complement_preview": reverse_complement[:50] + "...",
                "visualization_data": processed_seq_data,  # Structured array for plotting
            }
            total_bases_file += len(raw_sequence)

        if not sequences_data:
            return (
                jsonify(
                    {"error": "FASTA file was parsed but no sequences were found."}
                ),
                400,
            )

        avg_length = total_bases_file / len(sequences_data)

        # The final response includes comprehensive statistics and visualization data
        return (
            jsonify(
                {
                    "status": "success",
                    "message": f"FASTA data ingested and analyzed. {len(sequences_data)} sequences detected.",
                    "summary": {
                        "total_sequences": len(sequences_data),
                        "total_bases": total_bases_file,
                        "avg_seq_length": f"{avg_length:.2f}",
                    },
                    "processed_sequences": sequences_data,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": f"Failed to process FASTA data from URL: {e}"}), 500


@app.route("/api/upload", methods=["POST"])
def upload_file():
    """Handle file uploads (FASTA, FASTQ, etc.)"""
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        content = file.read().decode("utf-8")

        filename = file.filename.lower()

        if filename.endswith((".fasta", ".fa")):
            # Process as FASTA
            handle = StringIO(content)
            sequences_data = {}
            total_bases_file = 0
            first_sequence = None

            for record in SeqIO.parse(handle, "fasta"):
                raw_sequence = str(record.seq)

                processed_seq_data = process_nucleotide_sequence(raw_sequence)
                nucleotide_metrics = get_nucleotide_counts(raw_sequence)
                gc_content = calculate_gc_content(raw_sequence)
                reverse_complement = get_reverse_complement(raw_sequence)

                sequences_data[record.id] = {
                    "sequence_id": record.id,
                    "description": record.description,
                    "length": len(raw_sequence),
                    "gc_content": gc_content,
                    "nucleotide_counts": nucleotide_metrics["counts"],
                    "nucleotide_frequencies": nucleotide_metrics["frequencies"],
                    "reverse_complement_preview": reverse_complement[:50] + "...",
                    "visualization_data": processed_seq_data,
                }
                total_bases_file += len(raw_sequence)
                
                # Store the first sequence to return as search term
                if first_sequence is None:
                    first_sequence = raw_sequence

            if not sequences_data:
                return (
                    jsonify(
                        {"error": "FASTA file was parsed but no sequences were found."}
                    ),
                    400,
                )

            avg_length = total_bases_file / len(sequences_data)

            return (
                jsonify(
                    {
                        "status": "success",
                        "message": f"File processed successfully. {len(sequences_data)} sequences detected.",
                        "result": first_sequence,  # Return actual first sequence for search term
                        "summary": {
                            "total_sequences": len(sequences_data),
                            "total_bases": total_bases_file,
                            "avg_seq_length": f"{avg_length:.2f}",
                        },
                        "processed_sequences": sequences_data,
                    }
                ),
                200,
            )
        else:
            # For other file types, just return the content
            return (
                jsonify(
                    {
                        "status": "success",
                        "message": "File uploaded successfully.",
                        "result": content[:500],
                        "filename": filename,
                    }
                ),
                200,
            )

    except Exception as e:
        return jsonify({"error": f"File processing failed: {str(e)}"}), 500


@app.route("/")
def home():
    return "The Modular Flask API is running!"


if __name__ == "__main__":
    app.run(debug=True)
