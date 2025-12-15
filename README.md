# Genome Visualization Dashboard

Genome Visualization Dashboard is a web-based application for interactive exploration and analysis of genomic data. It provides intuitive visualizations and statistical summaries for genomic sequences supplied in FASTA format, enabling users to analyze sequence composition and genomic features without requiring specialized bioinformatics tools.

## Project Structure

This repository consists of separate frontend and backend components:

/genomic-visualization-dashboard
├── backend/ # Python-based API
│ ├── controllers/ # Logic for handling API requests
│ ├── test/ # Backend unit tests
│ ├── test_genomes/ # 50 FASTA files for benchmarking
│ ├── .gitignore
│ ├── .python-version
│ ├── README.md # Backend-specific documentation
│ ├── benchmark.py # Script for evaluating performance
│ ├── main.py # Main entry point for the backend server
│ ├── performance_metrics.csv # Output data from benchmarks
│ ├── pyproject.toml # Project metadata and dependencies
│ ├── sequences_fetcher.py # Logic to fetch genomic sequences
│ └── uv.lock # Lock file for uv package manager
│
├── frontend/ # Next.js application
│ ├── public/ # Static assets served by Next.js
│ ├── screenshots/ # UI screenshots
│ ├── src/ # Main frontend source code
│ ├── .gitignore
│ ├── README.md # Frontend-specific documentation
│ ├── biome.json # Biome linter/formatter configuration
│ ├── components.json # shadcn/ui components configuration
│ ├── jsconfig.json # JavaScript path aliases
│ ├── next.config.mjs # Next.js configuration
│ ├── package-lock.json
│ ├── package.json # Frontend dependencies
│ └── postcss.config.mjs # PostCSS (Tailwind CSS) configuration
│
├── README.md # Root documentation
└── package-lock.json

## Frontend

The frontend is a React-based web application built with Next.js. It provides the user interface for loading genomic data, interacting with genome visualizations, and viewing analytical results.

Key responsibilities of the frontend include:

- Accepting raw FASTA file URLs as input
- Rendering interactive genome visualizations (linear and circular views)
- Displaying statistical summaries such as GC content, nucleotide frequencies, and feature counts
- Presenting tabular views of genomic features with sorting and navigation

The frontend runs independently and communicates with the backend via HTTP requests.

## Backend

The backend is a Python-based API responsible for ingesting and processing genomic data. It parses FASTA files, performs sequence analysis, and returns structured results to the frontend.

Key responsibilities of the backend include:

- Fetching and parsing FASTA sequences
- Computing sequence statistics (e.g., GC content, nucleotide frequencies)
- Identifying and organizing genomic features
- Serving processed data through a RESTful API

The backend is designed to run locally and serves as the computational core of the application.

## Getting Started

Each component has its own setup instructions and dependencies. Please refer to the `README` files inside the `frontend` and `backend` directories for detailed installation and usage guidelines.

## Use Cases

Genome Visualizer is intended for:

- Educational use in genomics and bioinformatics courses
- Exploratory analysis of bacterial genomes
- Rapid visualization of FASTA-based genomic data without complex setup

## License

This project is provided for academic and educational use. Please refer to the repository license for more information.
