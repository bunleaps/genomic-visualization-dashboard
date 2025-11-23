import SearchInput from "@/components/SearchInput";
import NucleotideVisualizer from "@/components/NucleotideVisualizer";
import NucleotideSimpleStats from "@/components/NucleotideSimpleStats";

export default async function Home() {
  return (
    <div>
      <div className="w-3/5 mx-auto p-5">
        <SearchInput />
        <NucleotideSimpleStats />
        <NucleotideVisualizer />
      </div>
    </div>
  );
}
