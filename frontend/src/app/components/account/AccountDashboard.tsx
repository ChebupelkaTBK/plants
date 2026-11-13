"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Plant } from "@/app/types/plantsType";
import {
  getFavoriteStorageErrorMessage,
  getNextWateringAt,
  markPlantWatered,
  removeLocalFavorite,
  useLocalFavorites,
  type FavoritePlant,
} from "@/lib/local-plants";
import { getLocalSessionSnapshot, subscribeToLocalSession } from "@/lib/local-auth";
import {
  getLocalNotificationPermission,
  requestLocalNotificationPermission,
  subscribeToLocalNotificationPermission,
} from "@/lib/local-notifications";

interface AccountDashboardProps {
  plants: Plant[];
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function FavoritePlantCard({
  email,
  favorite,
  plant,
}: {
  email: string;
  favorite: FavoritePlant;
  plant: Plant;
}) {
  const [error, setError] = useState("");
  const nextWateringAt = getNextWateringAt(favorite, plant.wateringIntervalDays);

  function handleWatered() {
    setError("");
    try {
      markPlantWatered(email, plant.id);
    } catch (cause) {
      setError(getFavoriteStorageErrorMessage(cause));
    }
  }

  function handleRemove() {
    setError("");
    try {
      removeLocalFavorite(email, plant.id);
    } catch (cause) {
      setError(getFavoriteStorageErrorMessage(cause));
    }
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="relative aspect-[4/3]">
        <Image src={plant.image} alt={plant.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h2 className="text-xl font-semibold text-[#244D3A]">{plant.name}</h2>
          <p className="text-sm text-[#727A70]">{plant.latinName}</p>
        </div>

        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[#727A70]">В избранном с</dt>
            <dd className="text-right text-[#303630]">{formatDate(favorite.addedAt)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#727A70]">Последний полив</dt>
            <dd className="text-right text-[#303630]">
              {favorite.lastWateredAt ? formatDate(favorite.lastWateredAt) : "Отсчёт от добавления"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#727A70]">Следующий полив</dt>
            <dd className="text-right font-medium text-[#244D3A]">{formatDate(nextWateringAt.toISOString())}</dd>
          </div>
        </dl>

        <p className="rounded-lg bg-[#F0F5EC] px-3 py-2 text-sm text-[#244D3A]">
          Интервал полива — раз в {plant.wateringIntervalDays} дн.
        </p>

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <button
            type="button"
            onClick={handleWatered}
            className="min-h-11 rounded-lg bg-[#244D3A] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1B3C2C]"
          >
            Отметить политым
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="min-h-10 rounded-lg border border-[#727A70]/25 px-4 py-2 text-sm text-[#727A70] transition hover:bg-[#F7F8F2]"
          >
            Убрать из избранного
          </button>
        </div>
      </div>
    </article>
  );
}

export default function AccountDashboard({ plants }: AccountDashboardProps) {
  const session = useSyncExternalStore(subscribeToLocalSession, getLocalSessionSnapshot, () => null);
  const favoriteState = useLocalFavorites(session?.email ?? null);
  const notificationPermission = useSyncExternalStore(
    subscribeToLocalNotificationPermission,
    getLocalNotificationPermission,
    () => "default",
  );
  const [notificationError, setNotificationError] = useState("");

  async function enableNotifications() {
    setNotificationError("");

    try {
      await requestLocalNotificationPermission();
    } catch (cause) {
      console.error("Could not request notification permission.", cause);
      setNotificationError("Не удалось запросить разрешение на уведомления.");
    }
  }

  if (!session) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <section className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-md">
          <h1 className="text-2xl font-bold text-[#244D3A]">Личный кабинет</h1>
          <p className="mt-3 text-[#727A70]">Войдите, чтобы просматривать избранные растения и график полива.</p>
          <Link
            href="/login"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#244D3A] px-6 text-sm font-medium text-white hover:bg-[#1B3C2C]"
          >
            Войти
          </Link>
        </section>
      </main>
    );
  }

  const permissionMessage =
    notificationPermission === "granted"
      ? "Браузерные уведомления включены и могут сработать как запасной вариант для Telegram."
      : notificationPermission === "denied"
        ? "Браузерные уведомления отключены; Telegram работает независимо от этого разрешения."
        : notificationPermission === "unsupported"
          ? "Браузер не поддерживает запасные системные уведомления; для Telegram это не требуется."
          : "Разрешите браузерные уведомления, чтобы использовать их как запасной вариант для Telegram.";

  return (
    <main className="mx-auto w-full max-w-[1270px] flex-1 px-4 py-8 md:px-10 xl:px-0">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#244D3A]">Личный кабинет</h1>
        <p className="text-[#727A70]">Здравствуйте, {session.name}. Здесь собраны ваши растения и уход за ними.</p>
      </div>

      <section className="mb-8 flex flex-col gap-4 rounded-2xl border border-[#244D3A]/10 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-[#244D3A]">Напоминания о поливе</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#727A70]">
            Сообщения о наступившем поливе отправляются в Telegram, пока сайт открыт.
          </p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#727A70]">{permissionMessage}</p>
          <p className="mt-1 text-xs text-[#727A70]">
            Браузерные уведомления работают как запасной вариант. SMS-расписание не срабатывает после закрытия сайта; на iPhone для браузерных уведомлений может потребоваться добавить сайт на экран «Домой».
          </p>
          {notificationError && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {notificationError}
            </p>
          )}
        </div>
        {notificationPermission !== "granted" && notificationPermission !== "unsupported" && (
          <button
            type="button"
            onClick={enableNotifications}
            className="min-h-11 shrink-0 rounded-lg bg-[#244D3A] px-5 text-sm font-medium text-white hover:bg-[#1B3C2C]"
          >
            Включить уведомления браузера
          </button>
        )}
      </section>

      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#244D3A]">Избранные растения</h2>
          <p className="mt-1 text-sm text-[#727A70]">
            {favoriteState.favorites.length}{" "}
            {favoriteState.favorites.length === 1
              ? "растение"
              : favoriteState.favorites.length < 5
                ? "растения"
                : "растений"}
          </p>
        </div>
        <Link href="/" className="text-sm font-medium text-[#244D3A] hover:underline">
          В каталог
        </Link>
      </div>

      {favoriteState.error ? (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {favoriteState.error}
        </p>
      ) : favoriteState.favorites.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-[#727A70]/30 bg-white p-8 text-center">
          <p className="text-[#727A70]">Пока нет избранных растений.</p>
          <Link href="/" className="mt-3 inline-block font-medium text-[#244D3A] hover:underline">
            Открыть каталог
          </Link>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {favoriteState.favorites.map((favorite) => {
            const plant = plants.find((item) => item.id === favorite.plantId);
            if (!plant) return null;

            return (
              <FavoritePlantCard
                key={favorite.plantId}
                email={session.email}
                favorite={favorite}
                plant={plant}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
