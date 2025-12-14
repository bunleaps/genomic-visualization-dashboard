"use client";

import { useState } from "react";
import Header from "./Header";
import StatisticsCards from "./StatisticsCards";
import Controls from "./Controls";
import SequenceComposition from "./SequenceComposition";
import VisualizationWrapper from "./VisualizationWrapper";
import DetailedStatistics from "./DetailedStatistics";
import FeatureTable from "./FeatureTable";
import { GenomeInputSection } from "./GenomeInputSection";

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

  const getPixelPosition = (position) => {
    const len = sequenceMetadata ? sequenceMetadata.length : genomeData?.sequence_length || 1000;
    return (position / len) * 800;
  };

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

  const getYPosition = (strand, featureIndex) => {
    const rowHeight = 40;
    const baseY = strand === "+" ? 50 : 130;
    return baseY + Math.floor(featureIndex / 3) * rowHeight;
  };

  // No Data Rendering (Conditional)
  if (!genomeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-4xl mx-auto">
          <Header />
          <GenomeInputSection 
            inputUrl={inputUrl}
            setInputUrl={setInputUrl}
            handleLoadFasta={handleLoadFasta}
            loading={loading}
            error={error}
            handleKeyPress={handleKeyPress}
            title={error ? "Error Loading Genome" : "Load Genome Data"}
          />
        </div>
      </div>
    );
  }

  // Data Rendering
  const uniqueSeqs = genomeData.sequences
    ? genomeData.sequences.map((s) => s.id).sort()
    : [...new Set(genomeData.features.map((f) => f.seq_id))].sort();

  const sequenceMetadata = genomeData.sequences
    ? genomeData.sequences.find((s) => s.id === selectedSequence)
    : null;

  const selectedFeatures = genomeData.features.filter(
    (f) => f.seq_id === selectedSequence
  );

  const sequenceLength = sequenceMetadata
    ? sequenceMetadata.length
    : genomeData.sequence_length;

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

        {/* Reusing the same component, but with a different title */}
        <GenomeInputSection 
            inputUrl={inputUrl}
            setInputUrl={setInputUrl}
            handleLoadFasta={handleLoadFasta}
            loading={loading}
            error={error}
            handleKeyPress={handleKeyPress}
            title="Load Different Genome"
        />

        {/* dna-themed loading sequence */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 min-h-[200px]">
            <div className="relative flex h-16 w-48 justify-between items-center">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="relative flex h-full flex-col justify-between">
                  <div
                    className="h-3 w-3 rounded-full bg-blue-500 dna-oscillate shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                  <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-full bg-slate-700/30"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                  <div
                    className="h-3 w-3 rounded-full bg-cyan-400 dna-oscillate-reverse shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-gray-300 font-medium animate-pulse uppercase tracking-wider text-sm">
              Sequencing Data...
            </p>
          </div>
        )}

        {!loading && (
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
