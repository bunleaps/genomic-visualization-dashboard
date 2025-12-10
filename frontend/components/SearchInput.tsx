"use client";

import useSearchStore from "../store/useSearchStore";
import React, { useState } from "react";

export default function SearchInput() {
  const [inputValue, setInputValue] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const setSearchTerm = useSearchStore((state) => state.setSearchTerm);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setSearchTerm(data.result);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (uploadedFile) {
      uploadFile(uploadedFile);
    } else if (inputValue.trim()) {
      setSearchTerm(inputValue.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      {/* text input */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-xs font-bold">
            1
          </span>
          Enter or Paste Sequence
        </label>
        <textarea
          placeholder="Paste your DNA sequence (e.g., ATGCATGC...) or FASTA format (>header\nATGC...)"
          value={inputValue}
          onChange={handleChange}
          className="p-4 border border-gray-200 rounded-lg w-full min-h-48 resize-vertical font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-colors"
        />
      </div>

      {/* file upload */}
      <div className="flex flex-col gap-3 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center text-xs font-bold">
            2
          </span>
          Or Upload a FASTA File
        </label>
        <p className="text-xs text-gray-600">Supported formats: .fasta, .fa</p>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".fasta,.fa"
          className="p-3 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-indigo-500 file:text-white hover:file:from-blue-600 hover:file:to-indigo-600 file:transition-colors file:cursor-pointer"
        />
        {uploadedFile && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{uploadedFile.name}</span>
          </div>
        )}
      </div>

      {/* submit */}
      <button
        type="submit"
        className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:shadow-lg active:scale-95 w-full flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Analyze Sequence
      </button>
    </form>
  );
}
