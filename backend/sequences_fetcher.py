import os
from Bio import Entrez, SeqIO

Entrez.email = "dennis.william@binus.ac.id" # Required

# Search for bacterial genomes
search_term = '"Bacteria"[Organism] AND "complete genome"[Title] AND "refseq"[Filter]'
print("Searching for genomes...")
handle = Entrez.esearch(db="nucleotide", term=search_term, retmax=50, idtype="acc")
record = Entrez.read(handle)
handle.close()

accession_list = record["IdList"]
print(f"Found {len(accession_list)} genomes. Downloading...")

os.makedirs("test_genomes", exist_ok=True)

for acc in accession_list:
    try:
        filename = os.path.join("test_genomes", f"{acc}.fasta")
        if os.path.exists(filename):
            print(f"Skipping {acc} (already exists)")
            continue
            
        print(f"Fetching {acc}...")
        with Entrez.efetch(db="nucleotide", id=acc, rettype="fasta", retmode="text") as handle:
            seq_data = handle.read()
            with open(filename, "w") as f:
                f.write(seq_data)
                
    except Exception as e:
        print(f"Error fetching {acc}: {e}")

print("Done! Check the 'test_genomes' folder.")