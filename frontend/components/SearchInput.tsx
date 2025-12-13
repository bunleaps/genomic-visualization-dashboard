"use client";

import { BiCheck } from "react-icons/bi";
import useSearchStore from "../store/useSearchStore";
import React, { useState } from "react";
import { detectFileType, GenomicFileType } from "@/app/utils";
import { BsLightning, BsLightningChargeFill } from "react-icons/bs";
import Link from "next/link";

export default function SearchInput() {
  const [inputValue, setInputValue] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [detectedType, setDetectedType] = useState<GenomicFileType | null>(null);
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
      setDetectedType(null);

      // Reader for header
      const reader = new FileReader();
      const blob = file.slice(0, 1024);

      reader.onload = (e) => {
        const text = e.target?.result;

        if (typeof text === "string") {
          const type = detectFileType(text);
          setDetectedType(type);
          console.log(`File: ${file.name}, Detected: ${type}`);
        }
      };

      reader.onerror = () => {
        console.error("Error reading file");
        setDetectedType("UNKNOWN");
      };

      reader.readAsText(blob);
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
          Or Upload a FASTA, VCF, or RNA-seq (FASTQ) File
        </label>
        <p className="text-xs text-gray-600">Supported formats: .fasta, .fa, .vcf, .fastq</p>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".fasta,.fa,.vcf,.fastq"
          className="p-3 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-indigo-500 file:text-white hover:file:from-blue-600 hover:file:to-indigo-600 file:transition-colors file:cursor-pointer"
        />
        {uploadedFile && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
            <BiCheck size={24} />
            <span className="font-medium">{uploadedFile.name}</span>
          </div>
        )}
      </div>

      {/* detect file type */}
      {uploadedFile && (
        <div>
          <div className="flex flex-row items-center">
            <div>
              <BiCheck color="green" size={24} />
            </div>
            <div>
              <span className="opacity-60 text-green-600">
                <b>{detectedType}</b> file type detected.
              </span>
            </div>
          </div>
          <span className="opacity-60 text-[14px]">
            File detection issue?{" "}
            <Link href="/submit-bug" className="font-semibold text-blue-800 hover:underline">
              Submit bug
            </Link>
          </span>
        </div>
      )}

      {/* submit */}
      <button
        type="submit"
        className="cursor-pointer p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:shadow-lg active:scale-95 w-full flex items-center justify-center gap-2"
      >
        <BsLightningChargeFill />
        Analyze Sequence
      </button>
    </form>
  );
}
