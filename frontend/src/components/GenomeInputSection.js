import { Loader2 } from "lucide-react"; // Standard icon library with Shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const GenomeInputSection = ({
  inputUrl,
  setInputUrl,
  handleLoadFasta,
  loading,
  error,
  handleKeyPress,
  title = "Load Genome Data",
}) => {
  return (
    <Card className="bg-slate-800 border-slate-700 mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-white">
          {error ? "Error Loading Genome" : title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-gray-300 font-semibold">
            FASTA File URL (GitHub Raw Link)
          </Label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={handleKeyPress} // Changed from onKeyPress to onKeyDown (React best practice)
              placeholder="https://raw.githubusercontent.com/..."
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
            />
            <Button
              onClick={handleLoadFasta}
              disabled={loading}
              className="cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-400 hover:brightness-85"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading
                </>
              ) : (
                "Load"
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-900/50 border border-red-700 rounded-md text-red-200 text-sm">
            <p className="font-semibold mb-1">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <p className="text-gray-400 text-xs">
          Example: https://raw.githubusercontent.com/bunleaps/genomic-visualization-dashboard/refs/heads/main/backend/test/NC_003198.1.fasta
        </p>
      </CardContent>
    </Card>
  );
};