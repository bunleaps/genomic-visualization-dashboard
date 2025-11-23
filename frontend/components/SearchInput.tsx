"use client";

import useSearchStore from "../store/useSearchStore";
import React, { useState } from "react";

export default function SearchInput() {
  const [inputValue, setInputValue] = useState("");
  const setSearchTerm = useSearchStore((state) => state.setSearchTerm);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchTerm(inputValue.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="Enter your search query..."
        value={inputValue}
        onChange={handleChange}
        className="p-2 border border-gray-300 rounded grow"
      />

      <button
        type="submit"
        className="p-2 bg-blue-500 text-white font-bold rounded"
      >
        Search
      </button>
    </form>
  );
}
