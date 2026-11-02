"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/admin/ThemeToggle";
import { Alert, Card, PageHeader } from "@/components/admin/ui";
import { apiFetch, errorMessage } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";

const cards: { key: keyof DashboardStats; label: string; href: string; accent: string }[] = [
  { key: "berita_aktif", label: "Berita Aktif", href: "/admin/berita", accent: "bg-accent-500" },
  { key: "total_berita", label: "Total Berita", href: "/admin/berita", accent: "bg-navy-700" },
  { key: "jadwal_hari_ini", label: "Jadwal Hari Ini", href: "/admin/jadwal", accent: "bg-emerald-500" },
  { key: "total_jadwal", label: "Total Jadwal", href: "/admin/jadwal", accent: "bg-sky-500" },
  { key: "total_prodi", label: "Program Studi", href: "/admin/prodi", accent: "bg-violet-500" },
  { key: "running_text_aktif", label: "Running Text Aktif", href: "/admin/running-text", accent: "bg-ft-red" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<DashboardStats>("/api/admin/stats", { withAuth: true })
      .then(setStats)
      .catch((e) => setError(errorMessage(e)));
  }, []);

  return (
    <>
      <PageHeader title="Dashboard" description="Ringkasan konten yang tampil di layar TV fakultas." action={<ThemeToggle />} />
      <Alert message={error} />
      <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.key} href={c.href}>
            <Card className="flex items-center gap-4 p-5 transition-shadow hover:neu-inset">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl neu-inset-sm">
                <span className={`h-4 w-4 rounded-full neu-raised-sm ${c.accent}`} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-500">{c.label}</p>
                <p className="mt-1 text-3xl font-extrabold text-navy-900">{stats ? stats[c.key] : "–"}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-8 p-6">
        <h2 className="font-bold text-navy-900">Panduan singkat</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-600">
          <li>Tambahkan <b>Program Studi</b> terlebih dahulu.</li>
          <li>Isi <b>Jadwal Kuliah</b> per prodi. Layar TV otomatis menampilkan jadwal hari ini.</li>
          <li>Unggah <b>Berita</b> (gambar/video) beserta caption. Atur urutan &amp; durasi tayang.</li>
          <li>Isi <b>Running Text</b> untuk pengumuman di bagian bawah layar.</li>
          <li>
            Buka{" "}
            <a href="/" target="_blank" rel="noreferrer" className="font-semibold text-navy-700 underline">
              tampilan TV
            </a>{" "}
            di browser layar TV (mode layar penuh / F11). Data diperbarui otomatis tiap 30 detik.
          </li>
        </ol>
      </Card>
    </>
  );
}
