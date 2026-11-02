import { apiFetch } from "./api";

export type Theme = "light" | "dark";

/** Cache lokal tema terakhir agar halaman langsung tampil dengan tema yang benar (tanpa kedip). */
export const THEME_KEY = "tv_admin_theme";
const EVENT = "tv-theme-change";
/** Interval pengecekan tema dari server (dipilih admin, berlaku untuk semua layar). */
export const THEME_POLL_MS = 3_000;

/** Skrip inline yang memasang tema sebelum render. */
export const themeInitScript = `try{if(localStorage.getItem("${THEME_KEY}")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export function storedTheme(): Theme {
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (root.classList.contains("dark") === (theme === "dark")) return;
  // matikan transisi sesaat agar warna & bayangan langsung berganti, tidak memudar
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(style);
  root.classList.toggle("dark", theme === "dark");
  void getComputedStyle(root).color;
  setTimeout(() => style.remove(), 0);
}

/** Terapkan tema di browser ini saja (cache lokal + <html>). */
export function setTheme(theme: Theme) {
  if (localStorage.getItem(THEME_KEY) !== theme) localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeTheme(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

let pendingSaves = 0;

/** Ambil tema dari server; null bila server tidak terjangkau atau sedang ada penyimpanan. */
export async function fetchServerTheme(): Promise<Theme | null> {
  if (pendingSaves > 0) return null;
  try {
    const res = await apiFetch<{ tema: string }>("/api/tema");
    if (pendingSaves > 0) return null;
    return res.tema === "dark" ? "dark" : "light";
  } catch {
    return null;
  }
}

/** Simpan tema pilihan admin ke server agar layar TV ikut berubah. */
export async function saveServerTheme(theme: Theme) {
  pendingSaves++;
  try {
    await apiFetch("/api/admin/tema", { method: "PUT", body: { tema: theme }, withAuth: true });
  } finally {
    pendingSaves--;
  }
}
