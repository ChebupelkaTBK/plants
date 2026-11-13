"use client";

const ACCOUNTS_KEY = "greenhome-local-accounts-v1";
const SESSION_KEY = "greenhome-local-session-v1";
const SESSION_CHANGE_EVENT = "greenhome-local-auth-change";
const PBKDF2_ITERATIONS = 310_000;

let sessionSnapshot: LocalSession | null = null;
let sessionSnapshotInitialized = false;

export interface LocalSession {
  email: string;
  name: string;
}

interface LocalAccount extends LocalSession {
  salt: string;
  passwordHash: string;
}

type LocalAuthErrorCode =
  | "invalid-input"
  | "email-exists"
  | "invalid-credentials"
  | "storage-unavailable"
  | "storage-corrupt"
  | "crypto-unavailable";

export class LocalAuthError extends Error {
  constructor(readonly code: LocalAuthErrorCode) {
    super(code);
  }
}

function getStorage(): Storage {
  if (typeof window === "undefined") {
    throw new LocalAuthError("storage-unavailable");
  }

  try {
    return window.localStorage;
  } catch {
    throw new LocalAuthError("storage-unavailable");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLocalAccount(value: unknown): value is LocalAccount {
  if (!isRecord(value)) return false;

  return (
    typeof value.email === "string" &&
    typeof value.name === "string" &&
    typeof value.salt === "string" &&
    /^[\da-f]{32}$/i.test(value.salt) &&
    typeof value.passwordHash === "string" &&
    /^[\da-f]{64}$/i.test(value.passwordHash)
  );
}

function readAccounts(storage: Storage): LocalAccount[] {
  const savedAccounts = storage.getItem(ACCOUNTS_KEY);
  if (!savedAccounts) return [];

  let parsedAccounts: unknown;
  try {
    parsedAccounts = JSON.parse(savedAccounts);
  } catch {
    throw new LocalAuthError("storage-corrupt");
  }

  if (!Array.isArray(parsedAccounts) || !parsedAccounts.every(isLocalAccount)) {
    throw new LocalAuthError("storage-corrupt");
  }

  return parsedAccounts;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function fromHex(value: string): Uint8Array {
  return new Uint8Array(value.match(/.{2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? []);
}

async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new LocalAuthError("crypto-unavailable");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(new TextEncoder().encode(password)),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const hash = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: toArrayBuffer(salt), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256,
  );

  return toHex(new Uint8Array(hash));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function notifySessionChange() {
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

export async function registerLocalAccount(
  name: string,
  email: string,
  password: string,
): Promise<LocalSession> {
  const normalizedName = name.trim();
  const normalizedEmail = normalizeEmail(email);

  if (
    normalizedName.length < 2 ||
    normalizedName.length > 80 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
    password.length < 8 ||
    password.length > 128
  ) {
    throw new LocalAuthError("invalid-input");
  }

  const storage = getStorage();
  const accounts = readAccounts(storage);
  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new LocalAuthError("email-exists");
  }

  if (!globalThis.crypto?.getRandomValues) {
    throw new LocalAuthError("crypto-unavailable");
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const session = { email: normalizedEmail, name: normalizedName };
  const account: LocalAccount = {
    ...session,
    salt: toHex(salt),
    passwordHash: await hashPassword(password, salt),
  };

  try {
    storage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
    storage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    throw new LocalAuthError("storage-unavailable");
  }

  notifySessionChange();
  return session;
}

export async function signInLocalAccount(email: string, password: string): Promise<LocalSession> {
  const normalizedEmail = normalizeEmail(email);
  const account = readAccounts(getStorage()).find((saved) => saved.email === normalizedEmail);

  if (!account || password.length > 128) {
    throw new LocalAuthError("invalid-credentials");
  }

  const passwordHash = await hashPassword(password, fromHex(account.salt));
  if (passwordHash !== account.passwordHash) {
    throw new LocalAuthError("invalid-credentials");
  }

  const session = { email: account.email, name: account.name };
  try {
    getStorage().setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    throw new LocalAuthError("storage-unavailable");
  }

  notifySessionChange();
  return session;
}

export function readLocalSession(): LocalSession | null {
  const storage = getStorage();
  const savedSession = storage.getItem(SESSION_KEY);
  if (!savedSession) return null;

  try {
    const parsedSession: unknown = JSON.parse(savedSession);
    if (
      isRecord(parsedSession) &&
      typeof parsedSession.email === "string" &&
      typeof parsedSession.name === "string"
    ) {
      return { email: parsedSession.email, name: parsedSession.name };
    }
  } catch {
    storage.removeItem(SESSION_KEY);
    return null;
  }

  storage.removeItem(SESSION_KEY);
  return null;
}

function updateSessionSnapshot() {
  try {
    sessionSnapshot = readLocalSession();
  } catch (error) {
    console.error("Could not read the local auth session.", error);
    sessionSnapshot = null;
  }
  sessionSnapshotInitialized = true;
}

export function getLocalSessionSnapshot(): LocalSession | null {
  if (!sessionSnapshotInitialized) updateSessionSnapshot();
  return sessionSnapshot;
}

export function subscribeToLocalSession(onChange: () => void) {
  const update = () => {
    updateSessionSnapshot();
    onChange();
  };

  window.addEventListener("storage", update);
  window.addEventListener(SESSION_CHANGE_EVENT, update);

  return () => {
    window.removeEventListener("storage", update);
    window.removeEventListener(SESSION_CHANGE_EVENT, update);
  };
}

export function signOutLocalAccount() {
  getStorage().removeItem(SESSION_KEY);
  notifySessionChange();
}

export function getLocalAuthErrorMessage(error: unknown): string {
  if (!(error instanceof LocalAuthError)) {
    return "Не удалось выполнить операцию. Попробуйте ещё раз.";
  }

  switch (error.code) {
    case "invalid-input":
      return "Проверьте введённые данные.";
    case "email-exists":
      return "Аккаунт с таким email уже есть. Войдите или используйте другой адрес.";
    case "invalid-credentials":
      return "Не удалось войти. Проверьте email и пароль.";
    case "storage-unavailable":
      return "Браузер не разрешил сохранить данные. Проверьте настройки хранилища.";
    case "storage-corrupt":
      return "Локальные данные повреждены. Очистите данные сайта в браузере и попробуйте снова.";
    case "crypto-unavailable":
      return "Для локальной авторизации нужен современный браузер и защищённое соединение.";
  }
}
