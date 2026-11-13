"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  getLocalSessionSnapshot,
  subscribeToLocalSession,
  signOutLocalAccount,
} from "@/lib/local-auth";

export default function AuthNav() {
  const session = useSyncExternalStore(
    subscribeToLocalSession,
    getLocalSessionSnapshot,
    () => null,
  );

  if (!session) {
    return (
      <Link href="/login" className="flex shrink-0 items-center gap-1 text-sm sm:text-base">
        Войти
        <Image
          src="/icons/arrow-up-right.svg"
          alt=""
          width={24}
          height={24}
          className="size-5 sm:size-6"
        />
      </Link>
    );
  }

  function handleSignOut() {
    try {
      signOutLocalAccount();
    } catch (error) {
      console.error("Could not clear the local auth session.", error);
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-3 sm:gap-4">
      <Link href="/profile" className="text-sm hover:underline">
        <span className="sm:hidden">Кабинет</span>
        <span className="hidden sm:inline">Личный кабинет</span>
      </Link>
      <span className="hidden max-w-36 truncate text-sm md:block" title={session.name}>
        {session.name}
      </span>
      <button type="button" onClick={handleSignOut} className="text-sm hover:underline">
        Выйти
      </button>
    </div>
  );
}
