import { Dna } from "lucide-react";


export default function Header() {
  return (
    <div className="mb-8 text-center">
      <h1 className="flex items-center justify-center gap-3 text-5xl font-bold mb-2">
        <Dna className="w-12 h-12 text-blue-400" />
        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
        Genome Visualizer
        </span>
      </h1>
      <p className="text-gray-300">
        Interactive visualization of genomic features with detailed analysis
      </p>
    </div>
  );
}
