import type { ReactNode } from "react";
import Image from "next/image";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-[#F7F8F2] via-[#F7F8F2] to-[#E8EFE5] px-4 py-12 md:py-16">
      <section className="w-full max-w-md rounded-3xl border border-[#244D3A]/10 bg-white p-6 shadow-xl shadow-[#244D3A]/10 sm:p-9">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#F0F5EC]">
            <Image src="/icons/sprout.svg" alt="" width={28} height={28} />
          </div>
          <p className="mb-2 text-sm font-medium text-[#727A70]">GreenHome</p>
          <h1 className="text-2xl font-bold text-[#244D3A] sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-[#727A70]">{description}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
