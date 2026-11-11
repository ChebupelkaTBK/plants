import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-7xl text-[#244D3A] px-4 md:px-10 xl:px-0">
      <div className="flex flex-wrap gap-5 justify-between items-center border-t border-gray-300 py-5">
        {/* Footer logo */}

        <Link href="/" className="flex gap-2 items-center">
          <Image
            src="/logo/logo.svg"
            alt="logo"
            width={50}
            height={50}
            className="size-6"
          />
          <div>
            <span className="font-bold text-2xl md:text-[30px]">Green</span>
            <span className="text-2xl md:text-[30px]">Home</span>
          </div>
        </Link>

        <nav className="flex flex-wrap gap-5 text-[12px] xl:text-[15px]">
          <Link href="/">Каталог растений</Link>
          <Link href="/profile">Личный кабинет</Link>
          <Link href="mailto:hello@greenhome.ru">hello@greenhome.ru</Link>
        </nav>
      </div>

      <div className="flex flex-wrap gap-3 justify-between text-[10px] xl:text-[14px] border-t border-gray-300 py-5">
        <span>© 2026 GreenHome. Создано с заботой о природе.</span>
        <span>Конфиденциальность и демо-режим</span>
      </div>
    </footer>
  );
}
