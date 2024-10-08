import { create } from "zustand";

interface SearchTerm {
  searchTerm: string;
  setTerm: (searchTerm: string) => void;
}

export const useSearchTerm = create<SearchTerm>((set) => ({
  searchTerm: "",
  setTerm: (searchTerm) => set({ searchTerm }),
}));
