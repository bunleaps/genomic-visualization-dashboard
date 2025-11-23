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
      <div className="p-4">
        <div>No stats available. Submit a sequence to see statistics.</div>
      </div>
    );
  }

  const { gc_content, nucleotide_counts, reverse_complement } = stats;
  const letters = Object.keys(nucleotide_counts.counts);

  return (
    <div className="w-full p-4">
      <div className="mb-3">
        <strong>GC Content:</strong> {gc_content}%
      </div>

      <div className="mb-3">
        <strong>Nucleotide Counts / Frequencies</strong>
        <table className="w-full mt-2 text-sm">
          <thead>
            <tr className="text-left">
              <th className="pr-4">Base</th>
              <th className="pr-4">Count</th>
              <th className="pr-4">Frequency</th>
            </tr>
          </thead>
          <tbody>
            {letters.map((base) => (
              <tr key={base}>
                <td className="pr-4 font-mono">{base}</td>
                <td className="pr-4">{nucleotide_counts.counts[base] ?? 0}</td>
                <td className="pr-4">
                  {(nucleotide_counts.frequencies[base] ?? 0).toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <strong>Reverse Complement:</strong>
        <div className="font-mono mt-1 break-all w-full">
          {reverse_complement}
        </div>
      </div>
    </div>
  );
};

export default NucleotideSimpleStats;
