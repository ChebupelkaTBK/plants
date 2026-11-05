import PlantCatalog from "./components/catalog/PlantCatalog";
import plants from "@/app/plants.json";

export default async function Home() {
  return (
    <main className="flex flex-col">
      <PlantCatalog plants={plants} />
    </main>
  );
}
