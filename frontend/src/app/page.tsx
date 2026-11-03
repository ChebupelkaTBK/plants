import PlantCard from "./components/catalog/plant-card/PlantCard";
import PlantFilter from "./components/catalog/plant-filters/PlantFilter";

export default async function Home() {
  return (
    <main className="">
      <PlantFilter />
      <PlantCard />
    </main>
  );
}
