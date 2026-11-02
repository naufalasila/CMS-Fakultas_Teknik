import type { ApiResponse } from "./types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5012").replace(/\/$/, "");

const TOKEN_KEY = "tv_admin_token";
const USER_KEY = "tv_admin_user";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function mediaUrl(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${API_URL}/uploads/${path}`;
}

// Batas maksimal sesi login; sama dengan utils.TokenTTL di backend.
const SESSION_TTL_MS = 60 * 60 * 1000;
const EXPIRY_KEY = "tv_admin_exp";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const found = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : null;
}

function writeCookie(name: string, value: string, expires: Date) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict${secure}`;
}

/** Waktu kedaluwarsa token (ms epoch) dari klaim `exp` JWT. */
function tokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export const auth = {
  getToken: () => readCookie(TOKEN_KEY),
  getUserRaw: () => readCookie(USER_KEY),
  getUser: <T,>(): T | null => {
    const raw = readCookie(USER_KEY);
    try {
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  /** Waktu kedaluwarsa sesi saat ini (ms epoch), atau null jika belum login. */
  getExpiry: () => {
    const value = Number(readCookie(EXPIRY_KEY));
    return readCookie(TOKEN_KEY) && value > 0 ? value : null;
  },
  save: (token: string, user: unknown) => {
    const maxExpiry = Date.now() + SESSION_TTL_MS;
    const expiry = Math.min(tokenExpiry(token) ?? maxExpiry, maxExpiry);
    const expires = new Date(expiry);
    writeCookie(TOKEN_KEY, token, expires);
    writeCookie(USER_KEY, JSON.stringify(user), expires);
    writeCookie(EXPIRY_KEY, String(expiry), expires);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  clear: () => {
    writeCookie(TOKEN_KEY, "", new Date(0));
    writeCookie(USER_KEY, "", new Date(0));
    writeCookie(EXPIRY_KEY, "", new Date(0));
    // bersihkan sisa penyimpanan versi lama
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  withAuth?: boolean;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, withAuth = false, headers, ...rest } = options;
  const finalHeaders = new Headers(headers);

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
    payload = JSON.stringify(body);
  }

  if (withAuth) {
    const token = auth.getToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...rest, headers: finalHeaders, body: payload, cache: "no-store" });
  } catch {
    throw new ApiError("Tidak dapat terhubung ke server backend", 0);
  }

  let json: ApiResponse<T> | null = null;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    // response tanpa body JSON
  }

  if (!res.ok || !json?.success) {
    if (withAuth && res.status === 401 && typeof window !== "undefined") {
      auth.clear();
      window.location.replace("/admin/login");
    }
    throw new ApiError(json?.message ?? `Permintaan gagal (${res.status})`, res.status);
  }

  return json.data as T;
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Terjadi kesalahan";
}
