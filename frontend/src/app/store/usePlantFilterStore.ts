import { create } from "zustand";

interface PlantFilterStore {
  selectedCategory: string;
  searchQuery: string;
  setCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
}

export const usePlantFilter = create<PlantFilterStore>((set) => ({
  selectedCategory: "Все растения",
  searchQuery: "",

  setCategory: (category) => {
    set({ selectedCategory: category });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
}));
