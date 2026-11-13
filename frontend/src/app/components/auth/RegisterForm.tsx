"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  getLocalAuthErrorMessage,
  LocalAuthError,
  registerLocalAccount,
} from "@/lib/local-auth";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");

    if (password !== passwordConfirmation) {
      setError("Пароли не совпадают.");
      return;
    }

    setIsPending(true);
    try {
      await registerLocalAccount(name, email, password);
      router.replace("/");
      router.refresh();
    } catch (cause) {
      if (!(cause instanceof LocalAuthError)) {
        console.error("Local account registration failed.", cause);
      }
      setError(getLocalAuthErrorMessage(cause));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-[#244D3A]">
          Ваше имя
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          minLength={2}
          maxLength={80}
          required
          className="h-12 rounded-lg border border-[#727A70]/25 px-4 text-[#303630] outline-none transition focus:border-[#244D3A] focus:ring-2 focus:ring-[#244D3A]/10"
          placeholder="Как к вам обращаться?"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-[#244D3A]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
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
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
          className="h-12 rounded-lg border border-[#727A70]/25 px-4 text-[#303630] outline-none transition focus:border-[#244D3A] focus:ring-2 focus:ring-[#244D3A]/10"
          placeholder="Не менее 8 символов"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="passwordConfirmation" className="text-sm font-medium text-[#244D3A]">
          Повторите пароль
        </label>
        <input
          id="passwordConfirmation"
          name="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
          className="h-12 rounded-lg border border-[#727A70]/25 px-4 text-[#303630] outline-none transition focus:border-[#244D3A] focus:ring-2 focus:ring-[#244D3A]/10"
          placeholder="Введите пароль ещё раз"
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
        className="mt-1 h-12 rounded-lg bg-[#244D3A] font-medium text-white transition hover:bg-[#1B3C2C] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Создаём аккаунт..." : "Зарегистрироваться"}
      </button>

      <p className="text-center text-sm text-[#727A70]">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-semibold text-[#244D3A] hover:underline">
          Войти
        </Link>
      </p>
    </form>
  );
}
