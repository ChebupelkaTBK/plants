"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { Plant } from "@/app/types/plantsType";
import { useRouter } from "next/navigation";
import {
  getNextWateringAt,
  markWateringReminderSent,
  useLocalFavorites,
} from "@/lib/local-plants";
import { getLocalSessionSnapshot, subscribeToLocalSession } from "@/lib/local-auth";
import {
  getLocalNotificationPermission,
  subscribeToLocalNotificationPermission,
} from "@/lib/local-notifications";

interface WateringReminderSchedulerProps {
  plants: Plant[];
}

interface DueWateringReminder {
  plant: Plant;
  dueAt: string;
}

export default function WateringReminderScheduler({ plants }: WateringReminderSchedulerProps) {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToLocalSession, getLocalSessionSnapshot, () => null);
  const favoriteState = useLocalFavorites(session?.email ?? null);
  const permission = useSyncExternalStore(
    subscribeToLocalNotificationPermission,
    getLocalNotificationPermission,
    () => "default",
  );

  useEffect(() => {
    const email = session?.email;
    if (!email || favoriteState.error) return;

    let isChecking = false;
    let retryAt = 0;

    const showBrowserFallback = (duePlants: DueWateringReminder[]) => {
      if (
        permission !== "granted" ||
        typeof Notification === "undefined" ||
        Notification.permission !== "granted"
      ) {
        return;
      }

      for (const { plant, dueAt } of duePlants) {
        try {
          const notification = new Notification(`Пора полить: ${plant.name}`, {
            body: `Полив нужен раз в ${plant.wateringIntervalDays} дн. Следующий срок наступил.`,
            icon: "/icon.svg",
            tag: `watering-${plant.id}`,
          });
          notification.onclick = () => {
            window.focus();
            router.push("/profile");
            notification.close();
          };
          markWateringReminderSent(email, plant.id, dueAt);
        } catch (cause) {
          console.error("Could not show a browser watering reminder.", cause);
        }
      }
    };

    const checkWateringSchedule = async () => {
      if (isChecking || Date.now() < retryAt) return;

      const now = Date.now();
      const duePlants: DueWateringReminder[] = [];
      for (const favorite of favoriteState.favorites) {
        const plant = plants.find((item) => item.id === favorite.plantId);
        if (!plant) continue;

        const dueAt = getNextWateringAt(favorite, plant.wateringIntervalDays).toISOString();
        if (Date.parse(dueAt) > now || favorite.notifiedFor === dueAt) continue;

        duePlants.push({ plant, dueAt });
      }

      if (duePlants.length === 0) return;

      isChecking = true;
      try {
        const response = await fetch("/api/telegram/plant-reminder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "watering-reminder",
            plantIds: duePlants.map(({ plant }) => plant.id),
          }),
        });

        if (response.status === 429) {
          retryAt = Date.now() + 60_000;
          return;
        }

        if (!response.ok) {
          console.error("Could not send Telegram watering reminders.", { status: response.status });
          retryAt = Date.now() + 5 * 60_000;
          showBrowserFallback(duePlants);
          return;
        }

        for (const { plant, dueAt } of duePlants) {
          markWateringReminderSent(email, plant.id, dueAt);
        }
      } catch (cause) {
        console.error("Could not check the watering schedule.", cause);
        retryAt = Date.now() + 5 * 60_000;
        showBrowserFallback(duePlants);
      } finally {
        isChecking = false;
      }
    };

    void checkWateringSchedule();
    const timerId = window.setInterval(() => void checkWateringSchedule(), 60_000);
    return () => window.clearInterval(timerId);
  }, [favoriteState.error, favoriteState.favorites, permission, plants, router, session?.email]);

  return null;
}
