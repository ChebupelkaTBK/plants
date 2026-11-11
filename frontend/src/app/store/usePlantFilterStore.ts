import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlantFilterStore {
  selectedCategory: string;
  searchQuery: string;
  setCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
}

export const usePlantFilter = create<PlantFilterStore>()(
  persist(
    (set) => ({
      selectedCategory: "Все растения",
      searchQuery: "",

      setCategory: (category) => {
        set({ selectedCategory: category });
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },
    }),
    { name: "plant-filter-storage" },
  ),
);
