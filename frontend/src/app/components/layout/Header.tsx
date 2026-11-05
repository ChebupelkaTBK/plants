import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-300 text-[#244D3A]">
      <div className="flex items-center justify-between mx-auto w-full max-w-7xl h-20 md:h-22 px-4 md:px-10 xl:px-0">
        <Link href="/" className="flex gap-2 items-center">
          <Image src="/logo/logo.svg" alt="logo" width={50} height={50} className="size-6" />
          <div>
            <span className="font-bold text-2xl md:text-[30px]">Green</span>
            <span className="text-2xl md:text-[30px]">Home</span>
          </div>
        </Link>

        <div>
          <Link href="/login" className="flex items-center gap-1">
            Войти
            <Image
              src="/icons/arrow-up-right.svg"
              alt="GreenHome"
              width={24}
              height={24}
              className="size-6"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
