export default function StatisticsCards({
  stats,
  sequenceLength,
  sequenceMetadata,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-4 border border-blue-600">
        <div className="text-blue-300 text-sm font-semibold mb-2">
          Total Features
        </div>
        <div className="text-3xl font-bold text-white">
          {stats.totalFeatures}
        </div>
      </div>
      <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-lg p-4 border border-red-600">
        <div className="text-red-300 text-sm font-semibold mb-2">Genes</div>
        <div className="text-3xl font-bold text-white">{stats.geneCount}</div>
      </div>
      <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-lg p-4 border border-orange-600">
        <div className="text-orange-300 text-sm font-semibold mb-2">CDS</div>
        <div className="text-3xl font-bold text-white">{stats.cdsCount}</div>
      </div>
      <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-4 border border-purple-600">
        <div className="text-purple-300 text-sm font-semibold mb-2">Length</div>
        <div className="text-2xl font-bold text-white">
          {(sequenceLength / 1e6).toFixed(2)}M bp
        </div>
      </div>
      <div className="bg-gradient-to-br from-cyan-900 to-cyan-800 rounded-lg p-4 border border-cyan-600">
        <div className="text-cyan-300 text-sm font-semibold mb-2">
          GC Content
        </div>
        <div className="text-3xl font-bold text-white">
          {sequenceMetadata ? sequenceMetadata.gc_content.toFixed(2) : "N/A"}%
        </div>
      </div>
      {/* <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-4 border border-green-600">
        <div className="text-green-300 text-sm font-semibold mb-2">
          Coverage
        </div>
        <div className="text-3xl font-bold text-white">{stats.coverage}%</div>
      </div> */}
    </div>
  );
}
