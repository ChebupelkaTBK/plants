import type InfoItem from "@/app/types/infoItemProps";
import Image from "next/image";

export default function InfoItem({ icon, label, value }: InfoItem) {
  return (
    <div className="flex">
      <Image src={icon} alt="" width={20} height={20} />
      <div className="flex flex-col gap-1 pl-3">
        <span className="text-[#727A70] text-[14px]">{label}</span>
        <span className="text-[#244D3A] text-[14px] font-bold">{value}</span>
      </div>
    </div>
  );
}
