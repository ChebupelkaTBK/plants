"use client";

import { useState } from "react";

export default function CategoryFilter() {
  const category = [
    "Все растения",
    "Декоративно-лиственные",
    "Цветущие",
    "Кактусы и суккуленты",
    "Тропические",
  ];

  const [selectedCategory, setSelectedCategory] = useState("Все растения");

  return (
    <div className="flex flex-wrap gap-2">
      {category.map((category) => (
        <button
          key={category}
          onClick={() => setSelectedCategory(category)}
          className={`text-[11px]  h-10 ${selectedCategory === category ? "text-white bg-[#244D3A]" : "text-[#244D3A] bg-white border border-[#727A70]/30"}  rounded-[6px] px-3 cursor-pointer`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
