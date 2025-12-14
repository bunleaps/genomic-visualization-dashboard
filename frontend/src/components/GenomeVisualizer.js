"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import StatisticsCards from "./StatisticsCards";
import Controls from "./Controls";
import SequenceComposition from "./SequenceComposition";
import VisualizationWrapper from "./VisualizationWrapper";
import DetailedStatistics from "./DetailedStatistics";
import FeatureTable from "./FeatureTable";

export default function GenomeVisualizer() {
  const [genomeData, setGenomeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fastaUrl, setFastaUrl] = useState(
    "https://raw.githubusercontent.com/bunleaps/genomic-visualization-dashboard/refs/heads/main/backend/test/NC_003198.1.fasta"
  );
  const [inputUrl, setInputUrl] = useState(fastaUrl);

  const fetchGenomeData = async (url) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setGenomeData(data);
      setFastaUrl(url);

      if (data.features && data.features.length > 0) {
        const uniqueSeqs = [...new Set(data.features.map((f) => f.seq_id))];
        setSelectedSequence(uniqueSeqs[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadFasta = () => {
    if (inputUrl.trim()) {
      fetchGenomeData(inputUrl);
    } else {
      setError("Please enter a valid URL");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLoadFasta();
    }
  };

  if (error && !genomeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-4xl mx-auto">
          <Header />
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Load Genome Data
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">
                  FASTA File URL (GitHub Raw Link)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="https://raw.githubusercontent.com/..."
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleLoadFasta}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded transition-colors"
                  >
                    {loading ? "Loading..." : "Load"}
                  </button>
                </div>
              </div>
              {error && (
                <div className="p-4 bg-red-900 border border-red-700 rounded text-red-200">
                  <p className="font-semibold">Error:</p>
                  <p>{error}</p>
                </div>
              )}
              <p className="text-gray-400 text-sm">
                Example:
                https://raw.githubusercontent.com/bunleaps/genomic-visualization-dashboard/refs/heads/main/backend/test/NC_003198.1.fasta
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!genomeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-4xl mx-auto">
          <Header />
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Load Genome Data
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">
                  FASTA File URL (GitHub Raw Link)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="https://raw.githubusercontent.com/..."
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleLoadFasta}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded transition-colors"
                  >
                    {loading ? "Loading..." : "Load"}
                  </button>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Example:
                https://raw.githubusercontent.com/bunleaps/genomic-visualization-dashboard/refs/heads/main/backend/test/NC_003198.1.fasta
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get unique sequences from data
  const uniqueSeqs = genomeData.sequences
    ? genomeData.sequences.map((s) => s.id).sort()
    : [...new Set(genomeData.features.map((f) => f.seq_id))].sort();

  // Get sequence metadata
  const sequenceMetadata = genomeData.sequences
    ? genomeData.sequences.find((s) => s.id === selectedSequence)
    : null;

  // Filter features for selected sequence
  const selectedFeatures = genomeData.features.filter(
    (f) => f.seq_id === selectedSequence
  );

  // Get sequence length
  const sequenceLength = sequenceMetadata
    ? sequenceMetadata.length
    : genomeData.sequence_length;

  // Function to calculate pixel position
  const getPixelPosition = (position) => {
    return (position / sequenceLength) * 800;
  };

  // Function to get color based on feature type
  const getFeatureColor = (type) => {
    const colors = {
      gene: "#3b82f6",
      CDS: "#ef4444",
      ORF: "#8b5cf6",
      GC_rich_region: "#06b6d4",
      CpG_island: "#10b981",
      tandem_repeat: "#f97316",
      promoter: "#10b981",
      terminator: "#f59e0b",
    };
    return colors[type] || "#6b7280";
  };

  // Function to get y position based on strand and feature index
  const getYPosition = (strand, featureIndex) => {
    const rowHeight = 40;
    const baseY = strand === "+" ? 50 : 130;
    return baseY + Math.floor(featureIndex / 3) * rowHeight;
  };

  // Calculate statistics for selected sequence
  const calculateStats = () => {
    const geneFeatures = selectedFeatures.filter((f) => f.type === "gene");
    const cdsFeatures = selectedFeatures.filter((f) => f.type === "CDS");
    const totalGeneLength = geneFeatures.reduce(
      (sum, f) => sum + (f.end - f.start),
      0
    );
    const totalCDSLength = cdsFeatures.reduce(
      (sum, f) => sum + (f.end - f.start),
      0
    );
    return {
      totalFeatures: selectedFeatures.length,
      geneCount: geneFeatures.length,
      cdsCount: cdsFeatures.length,
      totalGeneLength,
      totalCDSLength,
      coverage: (
        ((totalGeneLength + totalCDSLength) / sequenceLength) *
        100
      ).toFixed(2),
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <Header />

        {/* URL Input Section */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">
            Load Different Genome
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://raw.githubusercontent.com/..."
              className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleLoadFasta}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded transition-colors"
            >
              {loading ? "Loading..." : "Load"}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-900 border border-red-700 rounded text-red-200">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center text-gray-400 py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4">Loading genome data...</p>
            </div>
          </div>
        )}

        {!loading && genomeData && (
          <>
            <StatisticsCards
              stats={stats}
              sequenceLength={sequenceLength}
              sequenceMetadata={sequenceMetadata}
            />
            <Controls
              selectedSequence={selectedSequence}
              onSequenceChange={setSelectedSequence}
              zoomLevel={zoomLevel}
              onZoomChange={setZoomLevel}
              uniqueSeqs={uniqueSeqs}
            />
            <SequenceComposition sequenceMetadata={sequenceMetadata} />
            <VisualizationWrapper
              selectedSequence={selectedSequence}
              selectedFeatures={selectedFeatures}
              sequenceLength={sequenceLength}
              zoomLevel={zoomLevel}
              hoveredFeature={hoveredFeature}
              onHoverFeature={setHoveredFeature}
              getPixelPosition={getPixelPosition}
              getFeatureColor={getFeatureColor}
              getYPosition={getYPosition}
            />
            <DetailedStatistics
              stats={stats}
              selectedSequence={selectedSequence}
              sequenceLength={sequenceLength}
              genomeData={genomeData}
            />
            <FeatureTable
              selectedFeatures={selectedFeatures}
              selectedSequence={selectedSequence}
              sequenceLength={sequenceLength}
            />
          </>
        )}
      </div>
    </div>
  );
}
