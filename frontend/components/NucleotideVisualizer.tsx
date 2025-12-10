"use client";

import React, { useState, useEffect } from "react";
import useSearchStore from "@/store/useSearchStore";

export interface NucleotideData {
  index: number;
  base: string;
  label: string;
}

const BASE_BG_CLASSES: Record<string, string> = {
  A: "bg-red-500",
  T: "bg-green-500",
  C: "bg-blue-500",
  G: "bg-yellow-500",
  N: "bg-gray-300",
};

const NucleotideVisualizer: React.FC = () => {
  const searchTerm = useSearchStore((state) => state.searchTerm);
  const [sequenceData, setSequenceData] = useState<NucleotideData[]>([]);

  useEffect(() => {
    try {
      const fetchData = async () => {
        const response = await fetch("http://127.0.0.1:5000/api/sequence_data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sequence: searchTerm }),
        });
        const result = await response.json();
        setSequenceData(result);
      };
      fetchData();
    } catch (error) {
      console.error("Error fetching sequence data:", error);
    }
  }, [searchTerm]);

  return (
    <div className="p-4">
      {sequenceData.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="font-medium">No sequence to visualize yet</p>
          <p className="text-sm">Submit a sequence above to see the nucleotide visualization</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {sequenceData.map((nuc) => {
            const baseChar = String(nuc.base ?? "").toUpperCase();
            const bgClass = BASE_BG_CLASSES[baseChar] ?? "bg-gray-100";

            return (
              <div
                key={nuc.index}
                className={`${bgClass} p-2 rounded text-sm font-bold text-white shadow-sm hover:shadow-md transition-shadow`}
                title={`Position ${nuc.index}: ${nuc.label}`}
              >
                {baseChar}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NucleotideVisualizer;
