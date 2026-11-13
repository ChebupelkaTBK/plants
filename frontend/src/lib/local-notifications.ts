"use client";

const PERMISSION_CHANGE_EVENT = "greenhome-notification-permission-change";

export type LocalNotificationPermission = NotificationPermission | "unsupported";

export function getLocalNotificationPermission(): LocalNotificationPermission {
  return typeof Notification === "undefined" ? "unsupported" : Notification.permission;
}

export function subscribeToLocalNotificationPermission(onChange: () => void) {
  window.addEventListener(PERMISSION_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(PERMISSION_CHANGE_EVENT, onChange);
}

export async function requestLocalNotificationPermission(): Promise<LocalNotificationPermission> {
  if (typeof Notification === "undefined") {
    window.dispatchEvent(new Event(PERMISSION_CHANGE_EVENT));
    return "unsupported";
  }

  const permission = await Notification.requestPermission();
  window.dispatchEvent(new Event(PERMISSION_CHANGE_EVENT));
  return permission;
}
