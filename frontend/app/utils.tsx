export type GenomicFileType = "FASTA" | "VCF" | "FASTQ" | "UNKNOWN";

{
  /* Regex for file type detection */
}
export const detectFileType = (contentSnippet: string): GenomicFileType => {
  const content = contentSnippet.trimStart();

  if (/^##fileformat=VCF/i.test(content)) return "VCF";
  if (/^@[^\r\n]+[\r\n]+[ATCGNatcgn]+[\r\n]+\+/m.test(content)) return "FASTQ";
  if (/^>[^\n]*\n/.test(content)) return "FASTA";

  return "UNKNOWN";
};
