NUCLEOTIDE_PROPERTIES = {
    "A": {"label": "Adenine"},
    "T": {"label": "Thymine"},
    "C": {"label": "Cytosine"},
    "G": {"label": "Guanine"},
    "N": {"label": "Unknown"},
}


def process_nucleotide_sequence(sequence: str):
    visualization_data = []

    for i, base in enumerate(sequence.upper()):
        props = NUCLEOTIDE_PROPERTIES.get(base, NUCLEOTIDE_PROPERTIES["N"])

        visualization_data.append(
            {
                "index": i + 1,
                "base": base,
                "label": props["label"],
            }
        )

    return visualization_data


def get_nucleotide_counts(sequence: str) -> dict:
    """
    Calculates the count and frequency of A, T, G, C, and N (unknown) nucleotides.
    Returns a dictionary with counts and frequencies.
    """
    sequence = sequence.upper()
    total_length = len(sequence)
    counts = {}

    # Count the relevant bases (excluding U for this DNA-centric version)
    for base in ["A", "T", "G", "C", "N"]:
        counts[base] = sequence.count(base)

    if total_length == 0:
        return {"counts": counts, "frequencies": {}}

    # Calculate frequencies for present bases
    frequencies = {}
    for base, count in counts.items():
        if count > 0:
            frequencies[base] = count / total_length

    return {"counts": counts, "frequencies": frequencies}


def calculate_gc_content(sequence: str) -> float:
    """
    Calculates the percentage of Guanine (G) and Cytosine (C) in the sequence.
    Excludes 'N' (unknown bases) from the total length used for the percentage calculation.
    Returns the GC-content as a percentage (0.0 to 100.0).
    """
    sequence = sequence.upper()
    g_count = sequence.count("G")
    c_count = sequence.count("C")

    # Calculate the effective length (A + T + G + C only, excluding N and other unknown characters)
    effective_length = sum(sequence.count(base) for base in ["A", "T", "G", "C"])

    if effective_length == 0:
        return 0.0

    gc_content = ((g_count + c_count) / effective_length) * 100
    return round(gc_content, 2)


def get_reverse_complement(sequence: str) -> str:
    """
    Calculates the reverse complement of a DNA sequence.
    Assumes T pairs with A, and C pairs with G. 'N' complements to 'N'.
    Returns the reverse complementary strand (5' to 3').
    """
    sequence = sequence.upper()

    # Define the complement mapping (DNA, with N mapping to N)
    complement_map = {"A": "T", "T": "A", "G": "C", "C": "G", "N": "N"}

    # 1. Complement the sequence
    complement_seq = "".join([complement_map.get(base, base) for base in sequence])

    # 2. Reverse the complemented sequence
    reverse_complement = complement_seq[::-1]

    return reverse_complement
