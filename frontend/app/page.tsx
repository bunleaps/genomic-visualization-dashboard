import SearchInput from "@/components/SearchInput";
import NucleotideVisualizer from "@/components/NucleotideVisualizer";
import NucleotideSimpleStats from "@/components/NucleotideSimpleStats";

export default async function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Genomic Visualization</h1>
              <p className="text-gray-600 mt-1 text-base">Explore and analyze DNA sequences</p>
            </div>
            <div className="text-4xl">🧬</div>
          </div>
        </div>
      </header>

      {/* main */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* search */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload or Enter Sequence</h2>
            <SearchInput />
          </section>

          {/* stats */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Sequence Analysis</h2>
            <NucleotideSimpleStats />
          </section>

          {/* vis */}
          <section className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nucleotide Visualization</h2>
            <NucleotideVisualizer />
          </section>
        </div>
      </main>

      {/* footer */}
      <footer className="bg-gray-900 text-gray-400 mt-16 py-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p>© 2025 Genomic Visualization Dashboard. Built for sequence analysis.</p>
        </div>
      </footer>
    </div>
  );
}
