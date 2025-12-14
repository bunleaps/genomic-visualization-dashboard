import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DetailedStatistics({
  stats,
  selectedSequence,
  sequenceLength,
  genomeData,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Gene Statistics */}
      <Card className="bg-slate-800 border-slate-700 transform-transition duration-300 hover:scale-105">
        <CardHeader className="pb-2">
          <CardTitle className="text-white font-semibold text-lg">
            Gene Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Count:</span>
              <span className="text-blue-400 font-semibold">
                {stats.geneCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Length:</span>
              <span className="text-blue-400 font-semibold">
                {stats.totalGeneLength.toLocaleString()} bp
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Length:</span>
              <span className="text-blue-400 font-semibold">
                {stats.geneCount > 0
                  ? Math.round(
                      stats.totalGeneLength / stats.geneCount
                    ).toLocaleString()
                  : 0}{" "}
                bp
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CDS Statistics */}
      <Card className="bg-slate-800 border-slate-700 transform-transition duration-300 hover:scale-105">
        <CardHeader className="pb-2">
          <CardTitle className="text-white font-semibold text-lg">
            CDS Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Count:</span>
              <span className="text-red-400 font-semibold">
                {stats.cdsCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Length:</span>
              <span className="text-red-400 font-semibold">
                {stats.totalCDSLength.toLocaleString()} bp
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Length:</span>
              <span className="text-red-400 font-semibold">
                {stats.cdsCount > 0
                  ? Math.round(
                      stats.totalCDSLength / stats.cdsCount
                    ).toLocaleString()
                  : 0}{" "}
                bp
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Region Summary */}
      <Card className="bg-slate-800 border-slate-700 transform-transition duration-300 hover:scale-105">
        <CardHeader className="pb-2">
          <CardTitle className="text-white font-semibold text-lg">
            Region Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Sequence:</span>
              <span className="text-green-400 font-semibold truncate max-w-[120px]" title={selectedSequence}>
                {selectedSequence}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Coverage:</span>
              <span className="text-green-400 font-semibold">
                {stats.coverage}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Uncovered:</span>
              <span className="text-green-400 font-semibold">
                {(100 - parseFloat(stats.coverage)).toFixed(2)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Summary (Conditional) */}
      {genomeData.summary && (
        <Card className="bg-slate-800 border-slate-700 transform-transition duration-300 hover:scale-105">
          <CardHeader className="pb-2">
            <CardTitle className="text-white font-semibold text-lg">
              Overall Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Sequences:</span>
                <span className="text-purple-400 font-semibold">
                  {genomeData.summary.total_sequences}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Bases:</span>
                <span className="text-purple-400 font-semibold">
                  {(genomeData.summary.total_bases / 1e6).toFixed(2)}M
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Overall GC:</span>
                <span className="text-purple-400 font-semibold">
                  {genomeData.summary.overall_gc_content.toFixed(2)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}