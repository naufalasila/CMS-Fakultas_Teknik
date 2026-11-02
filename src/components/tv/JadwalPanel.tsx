"use client";

import { useState } from "react";
import { toMinutes } from "@/lib/format";
import type { Jadwal, JadwalProdi } from "@/lib/types";
import AutoScroll from "./AutoScroll";
import { HEADER_HEIGHT, SIDE_WIDTH, panelBox, sideHeight } from "./constants";

type Props = { jadwal: JadwalProdi[]; hari: string; now: Date | null; stageW: number; stageH: number };

function status(j: Jadwal, nowMin: number | null) {
  if (nowMin === null) return "upcoming";
  if (nowMin >= toMinutes(j.jam_selesai)) return "done";
  if (nowMin >= toMinutes(j.jam_mulai)) return "live";
  return "upcoming";
}

function JadwalItem({ j, nowMin }: { j: Jadwal; nowMin: number | null }) {
  const s = status(j, nowMin);
  return (
    <div
      className={`flex gap-[36px] rounded-[36px] bg-neu ${
        s === "live" ? "neu-tv-raised-sm outline-[6px] outline-accent-500" : "neu-tv-inset-sm"
      } ${s === "done" ? "opacity-45" : ""}`}
      style={{ padding: "28px 36px" }}
    >
      <div className="shrink-0 text-center font-extrabold tabular-nums" style={{ width: 230 }}>
        <p className="text-navy-900" style={{ fontSize: 46, lineHeight: 1.2 }}>{j.jam_mulai}</p>
        <p className="text-slate-500" style={{ fontSize: 34 }}>
          {j.jam_selesai}
        </p>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-[20px]">
          <p className="flex-1 font-bold text-navy-900" style={{ fontSize: 44, lineHeight: 1.2 }}>
            {j.mata_kuliah}
          </p>
          {s === "live" && (
            <span className="tv-pulse shrink-0 rounded-full bg-accent-500 font-extrabold text-white neu-tv-raised-sm" style={{ fontSize: 28, padding: "6px 22px" }}>
              BERLANGSUNG
            </span>
          )}
        </div>
        <p className="mt-[8px] text-slate-600" style={{ fontSize: 34, lineHeight: 1.35 }}>
          {[j.ruangan && `Ruang ${j.ruangan}`, j.kelas && `Kelas ${j.kelas}`, j.semester && `Smtr ${j.semester}`]
            .filter(Boolean)
            .join(" • ")}
        </p>
        {j.dosen && (
          <p className="truncate font-semibold text-accent-700 dark:text-ft-red" style={{ fontSize: 34, lineHeight: 1.35 }}>
            {j.dosen}
          </p>
        )}
      </div>
    </div>
  );
}

/** Lama tampil satu prodi bila jadwalnya muat tanpa perlu digulir (detik). */
const STATIC_DURATION = 10;
/** Kecepatan gulir kartu jadwal (px kanvas/detik); tiap kartu tetap terlihat ±20 detik saat melintas layar. */
const SCROLL_SPEED = 90;

function ProdiSlide({ prodi, nowMin, onDone }: { prodi: JadwalProdi; nowMin: number | null; onDone: () => void }) {
  const [scrollDuration, setScrollDuration] = useState<number | null>(null);
  const duration = scrollDuration ?? STATIC_DURATION;

  return (
    <div className="tv-fade-in mt-[40px] flex min-h-0 flex-1 flex-col">
      <div className="px-[30px]">
        <div className="flex items-baseline gap-[20px] pb-[14px]">
          <span className="font-extrabold text-accent-700 dark:text-ft-red" style={{ fontSize: 44 }}>
            {prodi.kode}
          </span>
          <span className="font-bold text-navy-900" style={{ fontSize: 44 }}>
            {prodi.nama}
          </span>
        </div>
        {/* garis merah = progress tampil prodi ini; saat penuh, berganti ke prodi berikutnya */}
        <div className="h-[6px] overflow-hidden rounded-full bg-accent-500/20">
          <div
            className="tv-progress h-full bg-accent-500"
            style={{ animationDuration: `${duration}s` }}
            onAnimationEnd={onDone}
          />
        </div>
      </div>
      <AutoScroll className="mt-[24px] min-h-0 flex-1" speed={SCROLL_SPEED} onCycleDuration={setScrollDuration}>
        <div className="flex flex-col gap-[28px] px-[30px] pt-[30px] pb-[28px]">
          {prodi.items.map((j) => (
            <JadwalItem key={j.id} j={j} nowMin={nowMin} />
          ))}
        </div>
      </AutoScroll>
    </div>
  );
}

export default function JadwalPanel({ jadwal, hari, now, stageW, stageH }: Props) {
  const nowMin = now ? now.getHours() * 60 + now.getMinutes() : null;
  const withItems = jadwal.filter((p) => p.items.length > 0);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [cycle, setCycle] = useState(0);

  const foundIndex = withItems.findIndex((p) => p.prodi_id === currentId);
  const currentIndex = foundIndex >= 0 ? foundIndex : 0;
  const current = withItems[currentIndex] ?? null;

  const next = () => {
    if (withItems.length === 0) return;
    setCurrentId(withItems[(currentIndex + 1) % withItems.length].prodi_id);
    setCycle((c) => c + 1);
  };

  return (
    <section
      className="absolute flex flex-col rounded-[70px] bg-neu text-navy-900 neu-tv-raised"
      style={{ ...panelBox(stageW - SIDE_WIDTH, HEADER_HEIGHT, SIDE_WIDTH, sideHeight(stageH)), padding: "80px 50px 50px" }}
    >
      <div className="flex items-center justify-between">
        <span
          className="rounded-full bg-accent-500 font-extrabold uppercase tracking-widest text-white neu-tv-raised-sm"
          style={{ fontSize: 38, padding: "14px 40px" }}
        >
          Jadwal Kuliah
        </span>
        <span className="rounded-full font-bold text-navy-800 neu-tv-inset-sm" style={{ fontSize: 42, padding: "8px 36px" }}>
          {hari}
        </span>
      </div>

      {current === null ? (
        <div className="flex flex-1 items-center justify-center text-center text-slate-500" style={{ fontSize: 52 }}>
          Tidak ada jadwal kuliah hari ini.
        </div>
      ) : (
        <ProdiSlide key={`${current.prodi_id}-${cycle}`} prodi={current} nowMin={nowMin} onDone={next} />
      )}
    </section>
  );
}
