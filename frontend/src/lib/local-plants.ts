"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const FAVORITES_KEY_PREFIX = "greenhome-favorites-v1:";
const FAVORITES_CHANGE_EVENT = "greenhome-favorites-change";
const STORAGE_ERROR_SNAPSHOT = "__greenhome_storage_unavailable__";

export interface FavoritePlant {
  plantId: string;
  addedAt: string;
  lastWateredAt: string | null;
  notifiedFor: string | null;
}

interface FavoriteSnapshotState {
  favorites: FavoritePlant[];
  error: string | null;
  snapshot: string | null;
}

type FavoriteStorageErrorCode = "unavailable" | "corrupt";

export class FavoriteStorageError extends Error {
  constructor(readonly code: FavoriteStorageErrorCode) {
    super(code);
  }
}

function getFavoritesKey(email: string): string {
  return `${FAVORITES_KEY_PREFIX}${email.trim().toLowerCase()}`;
}

function getStorage(): Storage {
  if (typeof window === "undefined") {
    throw new FavoriteStorageError("unavailable");
  }

  try {
    return window.localStorage;
  } catch {
    throw new FavoriteStorageError("unavailable");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDateString(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isFavoritePlant(value: unknown): value is FavoritePlant {
  if (!isRecord(value)) return false;

  return (
    typeof value.plantId === "string" &&
    isDateString(value.addedAt) &&
    (value.lastWateredAt === null || isDateString(value.lastWateredAt)) &&
    (value.notifiedFor === null || isDateString(value.notifiedFor))
  );
}

function readFavorites(email: string): FavoritePlant[] {
  const savedFavorites = getStorage().getItem(getFavoritesKey(email));
  if (!savedFavorites) return [];

  let parsedFavorites: unknown;
  try {
    parsedFavorites = JSON.parse(savedFavorites);
  } catch {
    throw new FavoriteStorageError("corrupt");
  }

  if (!Array.isArray(parsedFavorites) || !parsedFavorites.every(isFavoritePlant)) {
    throw new FavoriteStorageError("corrupt");
  }

  return parsedFavorites;
}

function writeFavorites(email: string, favorites: FavoritePlant[]) {
  try {
    getStorage().setItem(getFavoritesKey(email), JSON.stringify(favorites));
  } catch {
    throw new FavoriteStorageError("unavailable");
  }

  window.dispatchEvent(new Event(FAVORITES_CHANGE_EVENT));
}

function parseSnapshot(snapshot: string | null): FavoriteSnapshotState {
  if (snapshot === STORAGE_ERROR_SNAPSHOT) {
    return {
      favorites: [],
      error: "Не удалось прочитать данные избранного из хранилища браузера.",
      snapshot,
    };
  }

  if (!snapshot) return { favorites: [], error: null, snapshot };

  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (!Array.isArray(parsed) || !parsed.every(isFavoritePlant)) {
      throw new FavoriteStorageError("corrupt");
    }

    return { favorites: parsed, error: null, snapshot };
  } catch {
    return {
      favorites: [],
      error: "Данные избранного повреждены. Очистите локальные данные сайта и добавьте растения заново.",
      snapshot,
    };
  }
}

export function getFavoritesSnapshot(email: string): string | null {
  try {
    return getStorage().getItem(getFavoritesKey(email));
  } catch {
    return STORAGE_ERROR_SNAPSHOT;
  }
}

export function subscribeToFavorites(email: string, onChange: () => void) {
  const updateForOtherTab = (event: StorageEvent) => {
    if (event.key === getFavoritesKey(email)) onChange();
  };

  window.addEventListener("storage", updateForOtherTab);
  window.addEventListener(FAVORITES_CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", updateForOtherTab);
    window.removeEventListener(FAVORITES_CHANGE_EVENT, onChange);
  };
}

export function useLocalFavorites(email: string | null): FavoriteSnapshotState {
  const subscribe = useCallback(
    (onChange: () => void) =>
      email ? subscribeToFavorites(email, onChange) : () => {},
    [email],
  );
  const getSnapshot = useCallback(
    () => (email ? getFavoritesSnapshot(email) : null),
    [email],
  );
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => null);

  return useMemo(() => parseSnapshot(snapshot), [snapshot]);
}

function commitFavorite(email: string, plantId: string, update: (favorite: FavoritePlant) => FavoritePlant) {
  const favorites = readFavorites(email);
  const favoriteIndex = favorites.findIndex((favorite) => favorite.plantId === plantId);

  if (favoriteIndex === -1) return;

  const updatedFavorites = [...favorites];
  updatedFavorites[favoriteIndex] = update(updatedFavorites[favoriteIndex]);
  writeFavorites(email, updatedFavorites);
}

export function addLocalFavorite(email: string, plantId: string) {
  const favorites = readFavorites(email);
  if (favorites.some((favorite) => favorite.plantId === plantId)) return;

  writeFavorites(email, [
    ...favorites,
    {
      plantId,
      addedAt: new Date().toISOString(),
      lastWateredAt: null,
      notifiedFor: null,
    },
  ]);
}

export function removeLocalFavorite(email: string, plantId: string) {
  const favorites = readFavorites(email);
  writeFavorites(
    email,
    favorites.filter((favorite) => favorite.plantId !== plantId),
  );
}

export function markPlantWatered(email: string, plantId: string) {
  const wateredAt = new Date().toISOString();
  commitFavorite(email, plantId, (favorite) => ({
    ...favorite,
    lastWateredAt: wateredAt,
    notifiedFor: null,
  }));
}

export function markWateringReminderSent(
  email: string,
  plantId: string,
  dueAt: string,
) {
  commitFavorite(email, plantId, (favorite) => ({
    ...favorite,
    notifiedFor: dueAt,
  }));
}

export function getNextWateringAt(
  favorite: FavoritePlant,
  wateringIntervalDays: number,
): Date {
  const lastWateredAt = favorite.lastWateredAt ?? favorite.addedAt;
  return new Date(Date.parse(lastWateredAt) + wateringIntervalDays * 24 * 60 * 60 * 1000);
}

export function getFavoriteStorageErrorMessage(error: unknown): string {
  if (!(error instanceof FavoriteStorageError)) {
    return "Не удалось обновить избранное. Попробуйте ещё раз.";
  }

  return error.code === "unavailable"
    ? "Браузер не разрешил сохранить избранное. Проверьте настройки хранилища."
    : "Данные избранного повреждены. Очистите локальные данные сайта и добавьте растения заново.";
}
