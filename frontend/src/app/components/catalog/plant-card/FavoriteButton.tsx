"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  addLocalFavorite,
  getFavoriteStorageErrorMessage,
  removeLocalFavorite,
  useLocalFavorites,
} from "@/lib/local-plants";
import { getLocalSessionSnapshot, subscribeToLocalSession } from "@/lib/local-auth";

interface FavoriteButtonProps {
  plantId: string;
  plantName: string;
}

function getApiErrorMessage(value: unknown): string | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }

  return null;
}

export default function FavoriteButton({ plantId, plantName }: FavoriteButtonProps) {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToLocalSession, getLocalSessionSnapshot, () => null);
  const favoriteState = useLocalFavorites(session?.email ?? null);
  const isFavorite = favoriteState.favorites.some((favorite) => favorite.plantId === plantId);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setError("");
    setNotice("");

    if (!session) {
      router.push("/login");
      return;
    }

    if (favoriteState.error) {
      setError(favoriteState.error);
      return;
    }

    let addedToFavorites = false;
    try {
      if (isFavorite) {
        removeLocalFavorite(session.email, plantId);
      } else {
        addLocalFavorite(session.email, plantId);

        if (plantName === "Монстера") {
          addedToFavorites = true;
          setIsPending(true);

          const response = await fetch("/api/telegram/plant-reminder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event: "monstera-added", plantIds: [plantId] }),
          });

          if (response.status === 429) {
            setError("Монстера добавлена, но сообщения можно отправлять не чаще раза в минуту.");
          } else if (!response.ok) {
            const result: unknown = await response.json();
            const apiError = getApiErrorMessage(result);
            setError(
              apiError
                ? `Монстера добавлена, но ${apiError}`
                : "Монстера добавлена, но сообщение в Telegram отправить не удалось.",
            );
          } else {
            setNotice("Монстера добавлена. Сообщение отправлено в Telegram.");
          }
        }
      }
    } catch (cause) {
      if (addedToFavorites) {
        console.error("Could not send the Monstera Telegram notification.", cause);
        setError("Монстера добавлена, но Telegram-сервис недоступен.");
      } else {
        setError(getFavoriteStorageErrorMessage(cause));
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
        aria-pressed={isFavorite}
        className={`flex rounded-md p-1.5 shadow-sm transition-colors disabled:cursor-wait ${
          isFavorite ? "bg-[#FCE9E8]" : "bg-white"
        }`}
      >
        <Image src="/icons/heart.svg" alt="" width={24} height={24} className="size-6" />
      </button>
      {error && (
        <span
          role="alert"
          className="absolute right-0 top-full mt-2 w-56 rounded-md bg-white p-2 text-xs text-red-700 shadow-lg"
        >
          {error}
        </span>
      )}
      {notice && (
        <span
          role="status"
          className="absolute right-0 top-full mt-2 w-56 rounded-md bg-white p-2 text-xs text-[#244D3A] shadow-lg"
        >
          {notice}
        </span>
      )}
    </div>
  );
}
