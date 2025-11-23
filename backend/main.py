from flask import Flask, jsonify, request
from flask_cors import CORS
from logic import (
    process_nucleotide_sequence,
    get_nucleotide_counts,
    calculate_gc_content,
    get_reverse_complement,
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


@app.route("/")
def home():
    return "The Modular Flask API is running!"


if __name__ == "__main__":
    app.run(debug=True)
