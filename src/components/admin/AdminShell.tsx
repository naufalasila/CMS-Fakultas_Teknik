"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { ApiError, apiFetch, auth, errorMessage } from "@/lib/api";
import type { User } from "@/lib/types";

const nav = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/berita", label: "Berita", icon: "▤" },
  { href: "/admin/jadwal", label: "Jadwal Kuliah", icon: "◷" },
  { href: "/admin/prodi", label: "Program Studi", icon: "◈" },
  { href: "/admin/running-text", label: "Running Text", icon: "⇆" },
];

const noop = () => () => {};

export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const token = useSyncExternalStore(noop, auth.getToken, () => undefined);
  const user = useSyncExternalStore(noop, auth.getUserRaw, () => null);
  const parsedUser = user ? (JSON.parse(user) as User) : null;

  const [session, setSession] = useState<{ state: "checking" | "ok" | "offline"; message?: string }>({ state: "checking" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (token === null) router.replace("/admin/login");
  }, [token, router]);

  // Token di cookie belum tentu valid: verifikasi ke backend sebelum menampilkan panel.
  useEffect(() => {
    if (!token) return;
    let active = true;
    apiFetch("/api/admin/me", { withAuth: true })
      .then(() => active && setSession({ state: "ok" }))
      .catch((err) => {
        if (!active) return;
        // 401 sudah ditangani apiFetch (hapus token + redirect ke login)
        if (err instanceof ApiError && err.status === 401) return;
        setSession({ state: "offline", message: errorMessage(err) });
      });
    return () => {
      active = false;
    };
  }, [token, attempt]);

  // Logout otomatis tepat saat token kedaluwarsa (1 jam setelah login).
  useEffect(() => {
    if (session.state !== "ok") return;
    const expiry = auth.getExpiry();
    if (!expiry) return;
    const id = setTimeout(() => {
      auth.clear();
      router.replace("/admin/login?expired=1");
    }, Math.max(expiry - Date.now(), 0));
    return () => clearTimeout(id);
  }, [session.state, router]);

  if (!token || session.state === "checking") {
    return <div className="flex min-h-screen items-center justify-center bg-neu text-sm text-slate-500">Memeriksa sesi…</div>;
  }

  if (session.state === "offline") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neu p-4">
        <div className="w-full max-w-sm rounded-3xl bg-neu p-8 text-center neu-raised">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full text-2xl text-ft-red neu-inset-sm">!</div>
          <h1 className="text-lg font-extrabold text-navy-900">Server tidak dapat dihubungi</h1>
          <p className="mt-2 text-sm text-slate-500">{session.message}. Pastikan backend sudah berjalan, lalu coba lagi.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => {
                auth.clear();
                router.replace("/admin/login");
              }}
              className="rounded-xl bg-neu px-4 py-2 text-sm font-semibold text-navy-800 neu-raised-sm active:neu-inset-sm"
            >
              Ke halaman login
            </button>
            <button
              onClick={() => {
                setSession({ state: "checking" });
                setAttempt((a) => a + 1);
              }}
              className="rounded-xl bg-navy-800 px-4 py-2 text-sm font-semibold text-white neu-raised-sm active:neu-inset-sm dark:bg-accent-500"
            >
              Coba lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const logout = () => {
    auth.clear();
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-neu">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-neu text-navy-900 transition-transform lg:m-4 lg:rounded-3xl lg:neu-raised lg:translate-x-0 ${
          menuOpen ? "translate-x-0 neu-raised" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-6">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-neu neu-raised-sm"><Image src="/images/logos/ft.png" alt="FT" width={28} height={31} /></span>
          <div>
            <p className="text-sm font-extrabold leading-tight text-navy-900">TV Fakultas Teknik</p>
            <p className="text-xs text-slate-500">Unismuh Makassar</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2 px-4 py-2">
          {nav.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  active ? "neu-inset-sm text-navy-800" : "text-slate-600 hover:neu-raised-sm hover:text-navy-800"
                }`}
              >
                <span className={`grid h-7 w-7 place-items-center rounded-lg ${active ? "bg-accent-500 text-white neu-raised-sm" : ""}`}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-3 p-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:text-navy-800 hover:neu-raised-sm"
          >
            <span className="grid h-7 w-7 place-items-center">▶</span>
            Buka Tampilan TV
          </a>
          <div className="flex items-center justify-between rounded-2xl px-3 py-2.5 neu-inset-sm">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-navy-900">{parsedUser?.full_name ?? "Admin"}</p>
              <p className="truncate text-xs text-slate-500">@{parsedUser?.username ?? "-"}</p>
            </div>
            <button onClick={logout} className="rounded-lg bg-neu px-2.5 py-1.5 text-xs font-bold text-ft-red neu-raised-sm active:neu-inset-sm">
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {menuOpen && <div className="fixed inset-0 z-30 bg-navy-950/30 lg:hidden" onClick={() => setMenuOpen(false)} />}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex items-center gap-3 bg-neu px-4 py-3 neu-raised-sm lg:hidden">
          <button onClick={() => setMenuOpen(true)} className="grid h-9 w-9 place-items-center rounded-xl bg-neu text-lg text-navy-800 neu-raised-sm active:neu-inset-sm" aria-label="Menu">
            ☰
          </button>
          <span className="font-bold text-navy-900">TV Fakultas Teknik</span>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
