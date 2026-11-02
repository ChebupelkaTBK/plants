import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex justify-between items-center p-5 md:px-8 xl:px-12 border-b text-[#244D3A] border-gray-300 h-20 md:h-22">
      <Link href="/" className="flex gap-2 items-center">
        <Image src="/header/logo.svg" alt="logo" width={50} height={50} className="size-6" />
        <div>
          <span className="font-bold text-2xl md:text-[30px]">Green</span>
          <span className="text-2xl md:text-[30px]">Home</span>
        </div>
      </Link>

      <div>
        <Link href="/login" className="flex items-center gap-1">
          Войти
          <Image
            src="/header/arrow-up-right.svg"
            alt="GreenHome"
            width={24}
            height={24}
            className="size-6"
          />
        </Link>
      </div>
    </header>
  );
}
