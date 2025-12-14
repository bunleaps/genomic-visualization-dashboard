# Genomic Visualization Backend

# Genomic Visualization Backend

Flask API to ingest FASTA sequences (from raw strings or URLs) and return biological features, per-sequence metrics, and summary statistics.

Note: Optional AI interpretation is available via Gemini when requested; otherwise it’s not required to run the API.

## Prerequisites

- Python 3.12+
- uv (recommended Python package manager)

## Setup

1. Navigate to the backend folder and install dependencies:

```pwsh
uv sync
```

## Run the server

```pwsh
uv run python .\maintest.py
```

Server runs at `http://127.0.0.1:8000`.

## API

### POST /api/ingest

Process FASTA content from a URL or raw FASTA string. Returns detected features, per-sequence metrics, and a summary.

Body options:

- Using a URL to a FASTA file:

```pwsh
$body = @{ url = "https://example.com/path/to/file.fasta" } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "http://127.0.0.1:8000/api/ingest" -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 10
```

- Using a raw FASTA string:

```pwsh
$body = @{ fasta = ">seq1`nACGTACGTACGT`n>seq2`nGGGCCC" } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "http://127.0.0.1:8000/api/ingest" -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 10
```

Optional:

- Add interpretation with Gemini by including `interpret: true` (requires `GEMINI_API_KEY` in environment or `.env`). The response will include an `interpretation` field or an `interpretation_error`.

## Notes

- CORS is enabled for all origins, methods, and headers.
- Feature extraction is optimized to limit extremely large outputs.
- If URL fetch fails, ensure the link serves raw FASTA content.
- The ingest endpoint is optimized to avoid excessive features using stricter thresholds and limits.
- If AI interpretation is requested without `GEMINI_API_KEY` set, the response will include `interpretation_error`.

## Troubleshooting

- "Gemini AI is not configured": ensure `GEMINI_API_KEY` is set in your environment or `.env` file.
- "Failed to fetch URL": confirm the `url` points to a publicly accessible FASTA content.
- Install/update dependencies: run `uv sync`.
