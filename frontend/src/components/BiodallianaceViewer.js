"use client";

import { useEffect, useRef } from "react";

export default function BiodallianaceViewer({
  selectedSequence,
  selectedFeatures,
  sequenceLength,
}) {
  const containerRef = useRef(null);
  const biodallanceRef = useRef(null);

  useEffect(() => {
    // Load Biodalliance script dynamically
    if (typeof window !== "undefined" && !window.BioDalliance) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/biodalliance/0.13.8/dalliance-all.min.js";
      script.async = true;
      script.onerror = () => {
        console.error("Failed to load Biodalliance from CDN");
      };
      script.onload = () => {
        initializeBiodalliance();
      };
      document.body.appendChild(script);

      // Load CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/biodalliance/0.13.8/dalliance-all.min.css";
      document.head.appendChild(link);

      return () => {
        if (script.parentNode) {
          document.body.removeChild(script);
        }
        if (link.parentNode) {
          document.head.removeChild(link);
        }
      };
    } else if (window.BioDalliance) {
      initializeBiodalliance();
    }
  }, [selectedSequence, sequenceLength]);

  const initializeBiodalliance = () => {
    if (!containerRef.current || !window.BioDalliance) return;

    // Clear previous instance
    if (biodallanceRef.current) {
      containerRef.current.innerHTML = "";
    }

    try {
      // Create a custom track from our features
      const featureTrack = {
        name: `${selectedSequence} Features`,
        desc: "Genomic features",
        tier_type: "tabix",
        style: [
          {
            type: "ORF",
            style: {
              glyph: "BOX",
              BGCOLOR: "#8b5cf6",
              FGCOLOR: "#8b5cf6",
              HEIGHT: 8,
              BUMP: true,
              LABEL: true,
            },
          },
          {
            type: "GC_rich_region",
            style: {
              glyph: "BOX",
              BGCOLOR: "#06b6d4",
              FGCOLOR: "#06b6d4",
              HEIGHT: 8,
              BUMP: true,
              LABEL: true,
            },
          },
          {
            type: "CpG_island",
            style: {
              glyph: "BOX",
              BGCOLOR: "#10b981",
              FGCOLOR: "#10b981",
              HEIGHT: 8,
              BUMP: true,
              LABEL: true,
            },
          },
          {
            type: "tandem_repeat",
            style: {
              glyph: "BOX",
              BGCOLOR: "#f97316",
              FGCOLOR: "#f97316",
              HEIGHT: 8,
              BUMP: true,
              LABEL: true,
            },
          },
          {
            type: "default",
            style: {
              glyph: "BOX",
              BGCOLOR: "#6b7280",
              FGCOLOR: "#6b7280",
              HEIGHT: 8,
              BUMP: true,
              LABEL: true,
            },
          },
        ],
      };

      // Initialize Biodalliance browser
      biodallanceRef.current = new window.BioDalliance({
        chr: selectedSequence,
        viewStart: 1,
        viewEnd: Math.min(sequenceLength, 100000), // Show first 100kb by default
        coordSystem: {
          speciesName: selectedSequence,
          taxon: 0,
          auth: "custom",
          version: "1",
          ucscName: selectedSequence,
        },
        sources: [
          {
            name: "Genome",
            twoBitURI: "//www.biodalliance.org/datasets/hg19.2bit",
            tier_type: "sequence",
          },
          featureTrack,
        ],
        uiPrefix: "https://www.biodalliance.org/release-0.13/",
        fullScreen: false,
        maxViewWidth: sequenceLength,
      });

      // Inject browser into container
      if (containerRef.current) {
        containerRef.current.appendChild(biodallanceRef.current.hc);
      }
    } catch (error) {
      console.error("Error initializing Biodalliance:", error);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">
        Biodalliance Genome Browser:{" "}
        <span className="text-blue-400">{selectedSequence}</span>
      </h2>

      <div
        ref={containerRef}
        className="bg-white rounded border border-slate-600 min-h-[400px]"
        style={{ width: "100%" }}
      >
        <div className="flex items-center justify-center h-[400px] text-gray-500">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading Biodalliance genome browser...</p>
            <p className="text-xs mt-2">This may take a moment to initialize</p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-slate-700 rounded border border-slate-600">
        <p className="text-gray-300 text-sm">
          <strong>Note:</strong> Biodalliance is an interactive genome browser
          that allows you to zoom, pan, and explore genomic features. Use the
          controls above the visualization to navigate.
        </p>
        <ul className="mt-2 text-xs text-gray-400 space-y-1">
          <li>• Click and drag to pan</li>
          <li>• Use zoom buttons or scroll to zoom in/out</li>
          <li>• Click features for detailed information</li>
        </ul>
      </div>
    </div>
  );
}
