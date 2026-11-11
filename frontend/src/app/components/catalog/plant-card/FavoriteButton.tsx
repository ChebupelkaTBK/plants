import Image from "next/image";

export default function FavoriteButton() {
  return (
    <button className="flex bg-white rounded-md cursor-pointer ">
      <Image
        src="/icons/heart.svg"
        alt="favorite"
        width={18}
        height={18}
        className="w-full h-full p-2.5"
      />
    </button>
  );
}
