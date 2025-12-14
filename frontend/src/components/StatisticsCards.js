import { Card, CardContent } from "@/components/ui/card";

export default function StatisticsCards({
  stats,
  sequenceLength,
  sequenceMetadata,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      {/* Total Features */}
      <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-600 transition-transform duration-300 hover:scale-105">
        <CardContent className="p-4">
          <div className="text-blue-300 text-sm font-semibold mb-2">
            Total Features
          </div>
          <div className="text-3xl font-bold text-white">
            {stats.totalFeatures}
          </div>
        </CardContent>
      </Card>

      {/* Genes */}
      <Card className="bg-gradient-to-br from-red-900 to-red-800 border-red-600 transition-transform duration-300 hover:scale-105">
        <CardContent className="p-4">
          <div className="text-red-300 text-sm font-semibold mb-2">Genes</div>
          <div className="text-3xl font-bold text-white">{stats.geneCount}</div>
        </CardContent>
      </Card>

      {/* CDS */}
      <Card className="bg-gradient-to-br from-orange-900 to-orange-800 border-orange-600 transition-transform duration-300 hover:scale-105">
        <CardContent className="p-4">
          <div className="text-orange-300 text-sm font-semibold mb-2">CDS</div>
          <div className="text-3xl font-bold text-white">{stats.cdsCount}</div>
        </CardContent>
      </Card>

      {/* Length */}
      <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-600 transition-transform duration-300 hover:scale-105">
        <CardContent className="p-4">
          <div className="text-purple-300 text-sm font-semibold mb-2">
            Length
          </div>
          <div className="text-2xl font-bold text-white">
            {(sequenceLength / 1e6).toFixed(2)}M bp
          </div>
        </CardContent>
      </Card>

      {/* GC Content */}
      <Card className="bg-gradient-to-br from-cyan-900 to-cyan-800 border-cyan-600 transition-transform duration-300 hover:scale-105">
        <CardContent className="p-4">
          <div className="text-cyan-300 text-sm font-semibold mb-2">
            GC Content
          </div>
          <div className="text-3xl font-bold text-white">
            {sequenceMetadata ? sequenceMetadata.gc_content.toFixed(2) : "N/A"}%
          </div>
        </CardContent>
      </Card>
    </div>
  );
}