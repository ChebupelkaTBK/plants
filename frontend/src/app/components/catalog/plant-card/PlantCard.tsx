import type PlantCardProps from "@/app/types/plantCardProps";
import Image from "next/image";
import Link from "next/link";

import FavoriteButton from "./FavoriteButton";

export default function PlantCard({ id, name, image, description }: PlantCardProps) {
  return (
    <div className="flex flex-col w-full mx-auto max-w-[600px] bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative w-full">
        <Link href={`/plant/${id}`}>
          <Image
            src={image}
            alt={name}
            width={350}
            height={250}
            className="w-full block aspect-7/5 object-cover rounded-t-2xl"
          />
        </Link>
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <Link
          href={`/plant/${id}`}
          className="text-[20px] text-[#244D3A] wrap-break-word line-clamp-2"
        >
          {name}
        </Link>
        <span className="text-[#727A70] text-[13px] line-clamp-2">{description}</span>
        <Link
          href={`/plant/${id}`}
          className="flex justify-between text-[#244D3A] py-3 px-6 rounded-md border border-[#727A70]/20 hover:bg-[#F7F8F2]"
        >
          Подробнее
          <Image
            src="/icons/arrow-up-right.svg"
            alt="icons"
            width={24}
            height={24}
            className="size-6"
          />
        </Link>
      </div>
    </div>
  );
}
