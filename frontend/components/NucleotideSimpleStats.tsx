"use client";

import React, { useState, useEffect } from "react";
import useSearchStore from "@/store/useSearchStore";

export interface NucleotideCounts {
  counts: Record<string, number>;
  frequencies: Record<string, number>;
}

export interface NucleotideStatsData {
  gc_content: number;
  nucleotide_counts: NucleotideCounts;
  reverse_complement: string;
}

const API_URL = "http://127.0.0.1:5000/api/simple_stats";

const NucleotideSimpleStats: React.FC = () => {
  const searchTerm = useSearchStore((state) => state.searchTerm);
  const [stats, setStats] = useState<NucleotideStatsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sequence: searchTerm }),
        });

        if (!response.ok) {
          console.error("Stats endpoint error:", response.status);
          setStats(null);
          return;
        }

        const result: NucleotideStatsData = await response.json();
        setStats(result);
      } catch (error) {
        console.error("Error fetching sequence stats:", error);
        setStats(null);
      }
    };

    if (searchTerm && searchTerm.trim().length > 0) {
      fetchData();
    }
  }, [searchTerm]);

  if (!stats) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="font-medium">No analysis yet</p>
        <p className="text-sm">Submit a sequence to see statistics</p>
      </div>
    );
  }

  const { gc_content, nucleotide_counts, reverse_complement } = stats;
  const letters = Object.keys(nucleotide_counts.counts);

  // Get base color for visualization
  const getBaseColor = (base: string) => {
    const colors: Record<string, string> = {
      A: "from-red-500 to-pink-500",
      T: "from-blue-500 to-cyan-500",
      G: "from-green-500 to-emerald-500",
      C: "from-yellow-500 to-amber-500",
      N: "from-gray-500 to-gray-600",
    };
    return colors[base] || "from-gray-500 to-gray-600";
  };

  return (
    <div className="w-full space-y-6">
      {/* gc content div */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-1">GC Content</p>
            <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
              {gc_content}%
            </p>
          </div>
          <div className="w-24 h-24 rounded-full bg-white border-4 border-indigo-200 flex items-center justify-center">
            <svg className="w-12 h-12 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* nucleotides table */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="inline-block w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded"></span>
          Nucleotide Distribution
        </h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Base</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Count</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Frequency</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Visualization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {letters.map((base) => {
                const count = nucleotide_counts.counts[base] ?? 0;
                const freq = nucleotide_counts.frequencies[base] ?? 0;
                return (
                  <tr key={base} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-lg text-gray-800">{base}</td>
                    <td className="px-6 py-4 text-gray-700 font-semibold">{count}</td>
                    <td className="px-6 py-4 text-gray-600">{(freq * 100).toFixed(2)}%</td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${getBaseColor(
                            base
                          )} transition-all duration-300`}
                          style={{ width: `${freq * 100}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* reverse complement */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="inline-block w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded"></span>
          Reverse Complement
        </h3>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 overflow-x-auto">
          <code className="text-emerald-400 font-mono text-sm break-all leading-relaxed">{reverse_complement}</code>
        </div>
      </div>
    </div>
  );
};

export default NucleotideSimpleStats;
