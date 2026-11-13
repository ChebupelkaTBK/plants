"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  getLocalAuthErrorMessage,
  LocalAuthError,
  signInLocalAccount,
} from "@/lib/local-auth";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    setIsPending(true);
    try {
      await signInLocalAccount(email, password);
      router.replace("/");
      router.refresh();
    } catch (cause) {
      if (!(cause instanceof LocalAuthError)) {
        console.error("Local sign-in failed.", cause);
      }
      setError(getLocalAuthErrorMessage(cause));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-[#244D3A]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-12 rounded-lg border border-[#727A70]/25 px-4 text-[#303630] outline-none transition focus:border-[#244D3A] focus:ring-2 focus:ring-[#244D3A]/10"
          placeholder="name@example.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-[#244D3A]">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          maxLength={128}
          required
          className="h-12 rounded-lg border border-[#727A70]/25 px-4 text-[#303630] outline-none transition focus:border-[#244D3A] focus:ring-2 focus:ring-[#244D3A]/10"
          placeholder="Не менее 8 символов"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="h-12 rounded-lg bg-[#244D3A] font-medium text-white transition hover:bg-[#1B3C2C] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Входим..." : "Войти"}
      </button>

      <p className="text-center text-sm text-[#727A70]">
        Впервые в GreenHome?{" "}
        <Link href="/register" className="font-semibold text-[#244D3A] hover:underline">
          Создать аккаунт
        </Link>
      </p>
    </form>
  );
}
