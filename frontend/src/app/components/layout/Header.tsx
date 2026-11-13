import Image from "next/image";
import Link from "next/link";
import AuthNav from "@/app/components/auth/AuthNav";

export default function Header() {
  return (
    <header className="border-b border-gray-300 text-[#244D3A]">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 md:h-22 md:px-10 xl:px-0">
        <Link href="/" className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Image src="/logo/logo.svg" alt="logo" width={50} height={50} className="size-5 sm:size-6" />
          <div className="whitespace-nowrap">
            <span className="text-xl font-bold sm:text-2xl md:text-[30px]">Green</span>
            <span className="text-xl sm:text-2xl md:text-[30px]">Home</span>
          </div>
        </Link>

        <AuthNav />
      </div>
    </header>
  );
}
