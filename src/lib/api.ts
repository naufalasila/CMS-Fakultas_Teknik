import type { ApiResponse } from "./types";

// Prioritas: NEXT_PUBLIC_API_URL (Vercel env) lalu fallback ke backend produksi.
// Untuk development lokal, set NEXT_PUBLIC_API_URL=http://localhost:5012 di .env.local.
const DEFAULT_API_URL = "https://129-225-1-48.sslip.io";
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/$/, "");

const USER_KEY = "tv_admin_user";
const EXPIRY_KEY = "tv_admin_exp";

// Batas maksimal sesi login; sama dengan utils.TokenTTL di backend.
const SESSION_TTL_MS = 60 * 60 * 1000;

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

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const found = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : null;
}

function writeCookie(name: string, value: string, expires: Date) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict${secure}`;
}

// Token JWT TIDAK disimpan di sisi klien: ia ada di cookie HttpOnly yang diset backend.
// Yang disimpan di sini hanya profil (bukan rahasia) dan waktu kedaluwarsa untuk auto-logout.
export const auth = {
  getUserRaw: () => readCookie(USER_KEY),
  getUser: <T,>(): T | null => {
    const raw = readCookie(USER_KEY);
    try {
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  getExpiry: () => {
    const value = Number(readCookie(EXPIRY_KEY));
    return value > 0 ? value : null;
  },
  save: (user: unknown) => {
    const expiry = Date.now() + SESSION_TTL_MS;
    const expires = new Date(expiry);
    writeCookie(USER_KEY, JSON.stringify(user), expires);
    writeCookie(EXPIRY_KEY, String(expiry), expires);
  },
  clear: () => {
    writeCookie(USER_KEY, "", new Date(0));
    writeCookie(EXPIRY_KEY, "", new Date(0));
    // bersihkan sisa penyimpanan versi lama
    localStorage.removeItem("tv_admin_token");
    localStorage.removeItem("tv_admin_user");
    // hapus cookie sesi HttpOnly di server
    void fetch(`${API_URL}/api/logout`, { method: "POST", credentials: "include" }).catch(() => {});
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

  let res: Response;
  try {
    // credentials: "include" mengirim cookie sesi HttpOnly ke backend lintas-situs
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: payload,
      cache: "no-store",
      credentials: "include",
    });
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
