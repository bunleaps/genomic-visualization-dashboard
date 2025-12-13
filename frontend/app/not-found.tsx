import SearchInput from "@/components/SearchInput";
import NucleotideVisualizer from "@/components/NucleotideVisualizer";
import NucleotideSimpleStats from "@/components/NucleotideSimpleStats";
import { FaDna } from "react-icons/fa";
import Link from "next/link";
import { LuConstruction } from "react-icons/lu";
import { BiHome } from "react-icons/bi";

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
            <div>
              <FaDna size={32} />
            </div>
          </div>
        </div>
      </header>

      {/* main */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 text-center py-4.75 mt-8">
        <div className="bg-blue-100 p-6 rounded-full mb-6">
          <LuConstruction className="w-16 h-16" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 max-w-md mb-8">
          Sorry, the page you are looking for either does not exist or is currently going under maintenance. Please try
          again.
        </p>

        <Link
          href="/"
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <BiHome className="w-5 h-5" />
          Navigate to Page
        </Link>
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
