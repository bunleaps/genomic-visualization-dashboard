import { create } from 'zustand';

interface SearchState {
  searchTerm: string;
}

interface SearchActions {
  setSearchTerm: (newTerm: string) => void;
}

type SearchStore = SearchState & SearchActions;

const useSearchStore = create<SearchStore>((set) => ({
  searchTerm: '',
  setSearchTerm: (newTerm: string) => set({ searchTerm: newTerm }),
}));

export default useSearchStore;