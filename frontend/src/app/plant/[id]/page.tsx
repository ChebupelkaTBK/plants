import type { Plant } from "@/app/types/plantsType";
import InfoItem from "@/app/components/ui/infoItem";
import { notFound } from "next/navigation";
import plants from "@/app/plants.json";
import Image from "next/image";

function getplantsById(id: string): Plant | undefined {
  return plants.find((plant) => plant.id === id);
}

export default async function Plant({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plant = await getplantsById(id);

  if (!plant) notFound();

  const plantInfo = [
    { icon: "/icons/sprout.svg", label: "Сложность ухода", value: plant.difficulty },
    { icon: "/icons/sun.svg", label: "Освещение", value: plant.light },
    {
      icon: "/icons/thermometer.svg",
      label: "Температура",
      value: `${plant.temperature.min}-${plant.temperature.max}°C`,
    },
    {
      icon: "/icons/wind.svg",
      label: "Влажность",
      value: `${plant.humidity.min}-${plant.humidity.max}%`,
    },
    {
      icon: "/icons/droplets.svg",
      label: "Полив",
      value: `Раз в ${plant.wateringIntervalDays} дней`,
    },
    {
      icon: "/icons/flower-2.svg",
      label: "Подкормка",
      value: `Раз в ${plant.feedingIntervalDays} дней`,
    },
  ];

  return (
    <main className="w-full mx-auto flex flex-col sm:flex-row gap-5 mb-20 max-w-[1270px] py-6 px-6 md:px-10 xl:px-0">
      <div className="w-full mx-auto sm:mx-4 max-w-[640px] h-[360px] sm:h-[510px] relative">
        <Image src={plant.image} alt={plant.name} fill className="object-cover rounded-xl" />
      </div>
      <div className="flex flex-col">
        <div className="flex flex-col gap-2  py-3 border-b border-gray-300 self-start">
          <span className="text-[#727A70] text-[13px]">{plant.category}</span>
          <h1 className="text-[35px] text-[#244D3A] font-bold">{plant.name}</h1>
          <span className="text-[#727A70] text-[13px]">
            {plant.latinName} · {plant.family}
          </span>
          <p className="text-[#727A70] text-[13px] leading-7">{plant.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 py-4 border-b border-gray-300">
          {plantInfo.map((item) => (
            <InfoItem key={item.label} {...item} />
          ))}
        </div>

        <div className="flex flex-col gap-3 py-4">
          <div className="flex gap-3">
            <div>
              <Image src="/icons/sprout.svg" alt="" width={20} height={20} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[#244D3A] text-[13px] font-bold">Когда пересаживать</span>
              <span className="text-[#727A70] text-[13px]">{plant.repotting}</span>
            </div>
          </div>
          <button className="w-full h-11 flex items-center justify-center gap-2 bg-[#244D3A] text-white text-[13px] rounded-md cursor-pointer">
            <Image src="/icons/plus.svg" alt="" width={20} height={20} />
            <span>Добавить в мои растения</span>
          </button>
        </div>
      </div>
    </main>
  );
}
