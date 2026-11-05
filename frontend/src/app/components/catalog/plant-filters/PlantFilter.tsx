"use client";
import Image from "next/image";
import CategoryFilter from "./CategoryFilter";
import { usePlantFilter } from "@/app/store/usePlantFilterStore";

interface PlantFilterProps {
  count: number;
}

export default function PlantFilter({ count }: PlantFilterProps) {
  const searchQuery = usePlantFilter((state) => state.searchQuery);
  const setSearchQuery = usePlantFilter((state) => state.setSearchQuery);
  return (
    <div className="mx-auto w-full max-w-7xl flex flex-col gap-7 py-6 px-4 md:px-10 xl:px-0">
      <div className="flex flex-wrap gap-4 max-w-2xl">
        <h1 className="text-[30px] text-[#244D3A] font-bold">Каталог растений</h1>
        <p className="text-[14px] md:text-[16px] text-[#727A70]">
          Найдите того самого зелёного друга — для вашего дома и ритма жизни.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-[6px] bg-white px-3 border-2 border-[#727A70]/20">
        <Image src="/main/search.svg" alt="" width={20} height={20} className="size-5 shrink-0" />

        <input
          type="text"
          placeholder="Найти своё растение..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-12 text-black placeholder:text-[#303630]/50 focus:placeholder-transparent focus:outline-none"
        />
      </div>

      <CategoryFilter />

      <span className="text-[#727A70]">
        Найдено растений: <span className="text-[#244D3A]">{count}</span>
      </span>
    </div>
  );
}
