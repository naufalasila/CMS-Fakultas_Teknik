"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { TVData } from "@/lib/types";
import BeritaQueue from "./BeritaQueue";
import CaptionPanel from "./CaptionPanel";
import JadwalPanel from "./JadwalPanel";
import MediaPanel from "./MediaPanel";
import RunningTextBar from "./RunningTextBar";
import TvHeader from "./TvHeader";
import { POLL_INTERVAL_MS } from "./constants";
import { useNow } from "./useNow";
import { useStageScale } from "./useStageScale";

const HARI_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function TvScreen() {
  const { scale, width: stageW, height: stageH } = useStageScale();
  const now = useNow();
  const [data, setData] = useState<TVData | null>(null);
  const [offline, setOffline] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [rotationKey, setRotationKey] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await apiFetch<TVData>("/api/tv");
        if (!active) return;
        setData(res);
        setOffline(false);
      } catch {
        if (active) setOffline(true);
      }
    };
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const berita = useMemo(() => data?.berita ?? [], [data]);
  const foundIndex = berita.findIndex((b) => b.id === currentId);
  const currentIndex = foundIndex >= 0 ? foundIndex : 0;
  const current = berita[currentIndex] ?? null;

  const next = useCallback(() => {
    if (berita.length === 0) return;
    setCurrentId(berita[(currentIndex + 1) % berita.length].id);
    setRotationKey((k) => k + 1);
  }, [berita, currentIndex]);

  const isSingleVideo = berita.length === 1 && current?.tipe_media === "video";

  // Gambar berganti berdasarkan durasi; video berganti saat selesai diputar.
  useEffect(() => {
    if (!current || berita.length < 2) return;
    if (current.tipe_media === "video" && current.media) return;
    const id = setTimeout(next, Math.max(current.durasi_detik, 3) * 1000);
    return () => clearTimeout(id);
  }, [current, berita.length, next, rotationKey]);

  const hari = data?.hari ?? (now ? HARI_ID[now.getDay()] : "");

  return (
    <main className="fixed inset-0 flex items-center justify-center overflow-hidden bg-neu">
      <div
        className="relative shrink-0 overflow-hidden bg-neu"
        style={{
          width: stageW,
          height: stageH,
          transform: `scale(${scale})`,
          visibility: scale ? "visible" : "hidden",
        }}
      >
        <TvHeader now={now} stageW={stageW} />
        <CaptionPanel stageH={stageH} berita={current} index={currentIndex} total={berita.length} />
        <MediaPanel stageW={stageW} stageH={stageH} berita={current} rotationKey={rotationKey} loopVideo={isSingleVideo} onVideoEnded={next} />
        <JadwalPanel stageW={stageW} stageH={stageH} jadwal={data?.jadwal ?? []} hari={hari} now={now} />
        <BeritaQueue stageW={stageW} stageH={stageH} berita={berita} currentIndex={currentIndex} />
        <RunningTextBar stageW={stageW} stageH={stageH} items={data?.running_text ?? []} />

        {offline && (
          <div className="absolute right-[40px] top-[310px] rounded-full bg-ft-red font-bold text-white neu-tv-raised-sm" style={{ fontSize: 30, padding: "10px 30px" }}>
            Koneksi ke server terputus — menampilkan data terakhir
          </div>
        )}
      </div>
    </main>
  );
}
