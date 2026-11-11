"use client";

import PlantCard from "./plant-card/PlantCard";
import { usePlantFilter } from "@/app/store/usePlantFilterStore";
import type Plant from "@/app/types/plantCardProps";
import PlantFilter from "./plant-filters/PlantFilter";

interface PlantCatalogProps {
  plants: Plant[];
}

export default function PlantCatalog({ plants }: PlantCatalogProps) {
  const searchQuery = usePlantFilter((state) => state.searchQuery);
  const selectedCategory = usePlantFilter((state) => state.selectedCategory);
  const filteredPlants = plants.filter((plant) => {
    return (
      (selectedCategory === "Все растения" ? true : plant.category === selectedCategory) &&
      plant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  return (
    <>
      <PlantFilter count={filteredPlants.length} />
      <div className="w-full mx-auto mb-20 max-w-[1270px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 px-4 md:px-10 xl:px-0">
        {filteredPlants.map((plant) => (
          <PlantCard
            key={plant.id}
            id={plant.id}
            image={plant.image}
            name={plant.name}
            description={plant.description}
          />
        ))}
      </div>
    </>
  );
}
