'use client';

import React, { useState, useEffect } from 'react';
import useSearchStore from "@/store/useSearchStore";

export interface NucleotideData {
  index: number;
  base: string;
  label: string;
}

const BASE_BG_CLASSES: Record<string, string> = {
  A: 'bg-red-500',
  T: 'bg-green-500',
  C: 'bg-blue-500',
  G: 'bg-yellow-500',
  N: 'bg-gray-300'
};

const NucleotideVisualizer: React.FC = () => {

    const searchTerm = useSearchStore((state) => state.searchTerm);
    const [sequenceData, setSequenceData] = useState<NucleotideData[]>([]);

    useEffect(() => {
        try {
            const fetchData = async () => {
                const response = await fetch('http://127.0.0.1:5000/api/sequence_data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ "sequence": searchTerm })
                });
                const result = await response.json();
                setSequenceData(result);
            };
            fetchData();
        } catch (error) {
            console.error('Error fetching sequence data:', error);
        }
    }, [searchTerm])

  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-2">
        {sequenceData.map((nuc) => {
          const baseChar = String(nuc.base ?? '').toUpperCase();
          const bgClass = BASE_BG_CLASSES[baseChar] ?? 'bg-gray-100';

          return (
            <div
              key={nuc.index}
              className={`${bgClass} p-2 rounded text-sm font-bold`}
            >
              {baseChar}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NucleotideVisualizer;
 