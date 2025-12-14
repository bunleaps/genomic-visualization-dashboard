import { useState } from "react";

export default function FeatureTable({
  selectedFeatures,
  selectedSequence,
  sequenceLength,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(selectedFeatures.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFeatures = selectedFeatures.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 3);

      if (endPage - startPage < maxPagesToShow - 3) {
        startPage = Math.max(2, endPage - maxPagesToShow + 3);
      }

      if (startPage > 2) {
        pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">
            Features in{" "}
            <span className="text-blue-400">{selectedSequence}</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, selectedFeatures.length)} of{" "}
            <span className="font-semibold text-blue-400">
              {selectedFeatures.length}
            </span>{" "}
            features
          </p>
        </div>
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {selectedFeatures.length} found
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b-2 border-slate-600 bg-slate-900">
            <tr>
              <th className="text-left py-4 px-4 font-bold text-white">
                Feature ID
              </th>
              <th className="text-left py-4 px-4 font-bold text-white">Type</th>
              <th className="text-center py-4 px-4 font-bold text-white">
                Start (bp)
              </th>
              <th className="text-center py-4 px-4 font-bold text-white">
                End (bp)
              </th>
              <th className="text-center py-4 px-4 font-bold text-white">
                Length (bp)
              </th>
              <th className="text-center py-4 px-4 font-bold text-white">
                Strand
              </th>
            </tr>
          </thead>
          <tbody>
            {currentFeatures.map((feature) => {
              const length = feature.length || feature.end - feature.start;
              const typeClass =
                {
                  gene: "bg-blue-600",
                  CDS: "bg-red-600",
                  ORF: "bg-purple-600",
                  GC_rich_region: "bg-cyan-600",
                  CpG_island: "bg-green-600",
                  tandem_repeat: "bg-orange-600",
                }[feature.type] || "bg-gray-600";

              // Build tooltip with all available properties
              const tooltipParts = [feature.type];
              if (feature.frame !== undefined)
                tooltipParts.push(`Frame: ${feature.frame}`);
              if (feature.gc_content !== undefined)
                tooltipParts.push(
                  `GC: ${(feature.gc_content * 100).toFixed(2)}%`
                );
              if (feature.obs_exp_ratio !== undefined)
                tooltipParts.push(`O/E: ${feature.obs_exp_ratio}`);
              if (feature.repeat_count !== undefined)
                tooltipParts.push(`Repeats: ${feature.repeat_count}`);
              if (feature.unit_length !== undefined)
                tooltipParts.push(`Unit: ${feature.unit_length}bp`);
              if (feature.repeat_unit !== undefined)
                tooltipParts.push(`Pattern: ${feature.repeat_unit}`);

              return (
                <tr
                  key={feature.id}
                  className="border-b border-slate-700 hover:bg-slate-700 transition-colors"
                  title={tooltipParts.join(" | ")}
                >
                  <td className="py-4 px-4 font-mono text-blue-400 hover:text-blue-300">
                    {feature.id}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold text-white ${typeClass}`}
                    >
                      {feature.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center text-gray-300">
                    {feature.start}
                  </td>
                  <td className="py-4 px-4 text-center text-gray-300">
                    {feature.end}
                  </td>
                  <td className="py-4 px-4 text-center font-semibold text-green-400">
                    {length}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`font-bold text-lg ${
                        feature.strand === "+"
                          ? "text-blue-400"
                          : "text-red-400"
                      }`}
                    >
                      {feature.strand}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded bg-slate-700 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition"
          >
            ← Previous
          </button>

          {/* Page Numbers */}
          <div className="flex gap-1">
            {getPageNumbers().map((page, idx) => (
              <button
                key={idx}
                onClick={() => typeof page === "number" && setCurrentPage(page)}
                disabled={typeof page !== "number"}
                className={`
                  px-3 py-2 rounded text-sm font-semibold transition
                  ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : typeof page === "number"
                      ? "bg-slate-700 text-white hover:bg-slate-600"
                      : "bg-slate-800 text-gray-400 cursor-default"
                  }
                  ${
                    typeof page !== "number"
                      ? "disabled:cursor-not-allowed"
                      : ""
                  }
                `}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded bg-slate-700 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
