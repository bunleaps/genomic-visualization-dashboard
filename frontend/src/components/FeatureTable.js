import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-bold text-white">
            Features in <span className="text-blue-400">{selectedSequence}</span>
          </CardTitle>
          <CardDescription className="text-gray-400 mt-1">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, selectedFeatures.length)} of{" "}
            <span className="font-semibold text-blue-400">
              {selectedFeatures.length}
            </span>{" "}
            features
          </CardDescription>
        </div>
        <Badge variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 text-sm">
          {selectedFeatures.length} found
        </Badge>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border border-slate-700 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-900">
              <TableRow className="border-slate-700 hover:bg-slate-900">
                <TableHead className="text-white font-bold w-[120px] pl-4">Feature ID</TableHead>
                <TableHead className="text-white font-bold w-[120px]">Type</TableHead>
                <TableHead className="text-white font-bold text-center">Start (bp)</TableHead>
                <TableHead className="text-white font-bold text-center">End (bp)</TableHead>
                <TableHead className="text-white font-bold text-center">Length (bp)</TableHead>
                <TableHead className="text-white font-bold text-center">Strand</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentFeatures.map((feature) => {
                const length = feature.length || feature.end - feature.start;
                const typeClass =
                  {
                    gene: "bg-blue-600 hover:bg-blue-700",
                    CDS: "bg-red-600 hover:bg-red-700",
                    ORF: "bg-purple-600 hover:bg-purple-700",
                    GC_rich_region: "bg-cyan-600 hover:bg-cyan-700",
                    CpG_island: "bg-green-600 hover:bg-green-700",
                    tandem_repeat: "bg-orange-600 hover:bg-orange-700",
                  }[feature.type] || "bg-gray-600 hover:bg-gray-700";

                const tooltipParts = [feature.type];
                if (feature.frame !== undefined) tooltipParts.push(`Frame: ${feature.frame}`);
                if (feature.gc_content !== undefined) tooltipParts.push(`GC: ${(feature.gc_content * 100).toFixed(2)}%`);

                return (
                  <TableRow
                    key={feature.id}
                    className="border-slate-700 hover:bg-slate-700/50 transition-colors"
                    title={tooltipParts.join(" | ")}
                  >
                    <TableCell className="pl-4 font-mono text-blue-400 font-medium">
                      {feature.id}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${typeClass} text-white border-0`}>
                        {feature.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-gray-300">
                      {feature.start.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center text-gray-300">
                      {feature.end.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-green-400">
                      {length.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`font-bold text-lg ${
                          feature.strand === "+" ? "text-blue-400" : "text-red-400"
                        }`}
                      >
                        {feature.strand}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="cursor-pointer bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:text-white disabled:opacity-50"
            >
              ← Previous
            </Button>

            <div className="flex gap-1">
              {getPageNumbers().map((page, idx) => (
                <Button
                  key={idx}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => typeof page === "number" && setCurrentPage(page)}
                  disabled={typeof page !== "number"}
                  className={`
                    min-w-[36px]
                    ${
                      page === currentPage
                        ? "cursor-pointer bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                        : "cursor-pointer bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:text-white"
                    }
                    ${typeof page !== "number" ? "opacity-50 cursor-pointer hover:bg-slate-700" : ""}
                  `}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="cursor-pointer bg-slate-700 border-slate-600 text-white hover:bg-slate-600 hover:text-white disabled:opacity-50"
            >
              Next →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}