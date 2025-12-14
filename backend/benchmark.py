import time
import os
import tracemalloc
from controllers.ingest_controller import process_fasta_content

# Setup
files = [f for f in os.listdir("test_genomes") if f.endswith(".fasta")]
results = []

print(f"Starting benchmark on {len(files)} files...")

for i, f in enumerate(files, 1):
    file_path = os.path.join("test_genomes", f)
    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
    
    # Skip huge files (>10MB) to prevent freezing
    if file_size_mb > 10:
        print(f"[{i}/{len(files)}] SKIPPING {f} (Too big: {file_size_mb:.2f} MB)")
        continue

    print(f"[{i}/{len(files)}] Processing {f} ({file_size_mb:.2f} MB)... ", end="", flush=True)
    
    try:
        with open(file_path, "r") as file:
            content = file.read()
        
        # Start Timer
        start_time = time.time()
        
        # --- RUN PROCESS ---
        data = process_fasta_content(content)
        # -------------------
        
        duration = time.time() - start_time
        print(f"Done in {duration:.2f}s")
        
        results.append({
            "filename": f,
            "genome_length": data['summary']['total_bases'],
            "processing_time": round(duration, 4),
            "gc_content": data['summary']['overall_gc_content']
        })
        
    except Exception as e:
        print(f"FAILED! Error: {e}")

# Results and Export to CSV
import csv

csv_file = "performance_metrics.csv"
csv_columns = ["filename", "genome_length", "processing_time", "gc_content"]

try:
    with open(csv_file, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=csv_columns)
        writer.writeheader()
        for data in results:
            writer.writerow(data)
    print(f"Benchmark complete. Data saved to {csv_file}")
except IOError:
    print("I/O error")