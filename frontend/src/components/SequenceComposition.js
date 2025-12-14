export default function SequenceComposition({ sequenceMetadata }) {
  if (!sequenceMetadata) return null;

  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
      <h3 className="text-2xl font-bold text-white mb-6">
        Sequence Composition & Properties
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Nucleotide Counts */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white">
            Nucleotide Counts
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between bg-slate-700 px-3 py-2 rounded">
              <span className="text-green-400">A (Adenine)</span>
              <span className="font-bold text-white">
                {sequenceMetadata.nucleotide_counts.A.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between bg-slate-700 px-3 py-2 rounded">
              <span className="text-red-400">T (Thymine)</span>
              <span className="font-bold text-white">
                {sequenceMetadata.nucleotide_counts.T.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between bg-slate-700 px-3 py-2 rounded">
              <span className="text-blue-400">G (Guanine)</span>
              <span className="font-bold text-white">
                {sequenceMetadata.nucleotide_counts.G.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between bg-slate-700 px-3 py-2 rounded">
              <span className="text-yellow-400">C (Cytosine)</span>
              <span className="font-bold text-white">
                {sequenceMetadata.nucleotide_counts.C.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Nucleotide Frequencies */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white">
            Nucleotide Frequencies (%)
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between bg-slate-700 px-3 py-2 rounded">
              <span className="text-green-400">A</span>
              <span className="font-bold text-white">
                {sequenceMetadata.nucleotide_frequencies.A.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between bg-slate-700 px-3 py-2 rounded">
              <span className="text-red-400">T</span>
              <span className="font-bold text-white">
                {sequenceMetadata.nucleotide_frequencies.T.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between bg-slate-700 px-3 py-2 rounded">
              <span className="text-blue-400">G</span>
              <span className="font-bold text-white">
                {sequenceMetadata.nucleotide_frequencies.G.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between bg-slate-700 px-3 py-2 rounded">
              <span className="text-yellow-400">C</span>
              <span className="font-bold text-white">
                {sequenceMetadata.nucleotide_frequencies.C.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* GC/AT Content */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white">Content Analysis</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between bg-gradient-to-r from-blue-900 to-blue-800 px-3 py-2 rounded">
              <span>GC Content</span>
              <span className="font-bold">
                {sequenceMetadata.gc_content.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between bg-gradient-to-r from-red-900 to-red-800 px-3 py-2 rounded">
              <span>AT Content</span>
              <span className="font-bold">
                {sequenceMetadata.at_content.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between bg-gradient-to-r from-purple-900 to-purple-800 px-3 py-2 rounded">
              <span>GC Skew</span>
              <span className="font-bold">
                {sequenceMetadata.gc_skew.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between bg-gradient-to-r from-orange-900 to-orange-800 px-3 py-2 rounded">
              <span>AT Skew</span>
              <span className="font-bold">
                {sequenceMetadata.at_skew.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {/* Sequence Info */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white">Sequence Info</h4>
          <div className="space-y-2 text-sm">
            <div className="bg-slate-700 px-3 py-2 rounded">
              <div className="text-gray-400 mb-1">Ambiguous Bases</div>
              <div className="font-bold text-white">
                {sequenceMetadata.ambiguous_bases}
              </div>
            </div>
            <div className="bg-slate-700 px-3 py-2 rounded">
              <div className="text-gray-400 mb-1">Total Length</div>
              <div className="font-bold text-white">
                {(sequenceMetadata.length / 1e6).toFixed(2)}M bp
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sequence Description */}
      <div className="mt-6 bg-slate-700 rounded-lg p-4 border border-slate-600">
        <h4 className="text-white font-semibold mb-2">Description</h4>
        <p className="text-gray-300 text-sm leading-relaxed">
          {sequenceMetadata.description}
        </p>
      </div>

      {/* Sequence Preview */}
      <div className="mt-4 bg-slate-700 rounded-lg p-4 border border-slate-600">
        <h4 className="text-white font-semibold mb-2">
          Sequence Preview (5' → 3')
        </h4>
        <p className="text-cyan-400 text-xs font-mono break-all">
          {sequenceMetadata.sequence_preview}
        </p>
      </div>
    </div>
  );
}
