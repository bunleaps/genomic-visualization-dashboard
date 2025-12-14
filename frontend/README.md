# Genome Visualizer

## Project Overview

Genome Visualizer is an interactive web-based dashboard designed for the exploration and analysis of genomic data. The application processes FASTA files to provide a dual-view visualization (linear and circular) of genomic features, alongside detailed statistical analysis of sequence composition, gene distribution, and nucleotide properties.

## Key Features

### Data Ingestion

- Rapid loading of genomic data via raw FASTA file URLs.

### Interactive Genome Browser

- **Linear View**: Pannable track showing gene and feature placement.
- **Circular View**: Global representation of the genome structure.
- **Navigation Controls**: Zoom in/out functionality, window size adjustments, and drag-to-pan capabilities.

### Sequence Composition Analysis

- Real-time calculation of nucleotide counts and frequencies.
- Content analysis including GC content, AT content, GC skew, and AT skew.

### Feature Management

- Tabular view of all genomic features (Genes, ORFs) with sorting and pagination.
- Detailed metadata including feature ID, type, start/end positions, length, and strand orientation.

### Statistical Dashboards

- High-level summary cards for total features, gene counts, and sequence length.
- Detailed breakdown of gene vs. CDS statistics, region summaries, and genome coverage percentages.

## Technical Stack

- **Frontend**: React.js, Next.js
- **Styling**: Tailwind CSS
- **Backend**: Python (Flask)
- **Data Format**: FASTA

## Setup and Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- Python (v3.8 or higher)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/bunleaps/genomic-visualization-dashboard.git
cd genomic-visualization-dashboard
```

### 2. Start backend (Flask)

```
Instructions to run the backend can be found in README.md in the backend folder
```

### 3. Frontend Setup

```bash
cd frontend
# Install Node dependencies
npm install

# Start the development server
npm run dev
```

### 4. Start the development server

- Open your web browser and navigate to http://localhost:3000.
- The application will load with a default input field.
- Enter a valid raw FASTA URL (e.g., from GitHub) or use the default provided URL.
- Click Load to visualize the genome.
