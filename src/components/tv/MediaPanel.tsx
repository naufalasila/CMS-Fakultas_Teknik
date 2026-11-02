/* eslint-disable @next/next/no-img-element -- media berasal dari backend (URL dinamis) */
import Image from "next/image";
import { mediaUrl } from "@/lib/api";
import type { Berita } from "@/lib/types";
import { HEADER_HEIGHT, SIDE_WIDTH, mainHeight, panelBox } from "./constants";

type Props = {
  berita: Berita | null;
  rotationKey: number;
  loopVideo: boolean;
  onVideoEnded: () => void;
  stageW: number;
  stageH: number;
};

export default function MediaPanel({ berita, rotationKey, loopVideo, onVideoEnded, stageW, stageH }: Props) {
  const width = stageW - SIDE_WIDTH * 2;
  const src = berita?.media ? mediaUrl(berita.media) : "";

  return (
    <section
      className="absolute rounded-[70px] bg-neu neu-tv-raised"
      style={{ ...panelBox(SIDE_WIDTH, HEADER_HEIGHT, width, mainHeight(stageH)), padding: 40 }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[44px] bg-navy-950 neu-tv-inset">
      {berita && src ? (
        <div key={`${berita.id}-${rotationKey}`} className="tv-fade-in absolute inset-0">
          {berita.tipe_media === "video" ? (
            <video
              src={src}
              className="h-full w-full object-contain"
              autoPlay
              muted
              playsInline
              loop={loopVideo}
              onEnded={onVideoEnded}
              onError={onVideoEnded}
            />
          ) : (
            <>
              <img src={src} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-[60px]" />
              <img src={src} alt={berita.judul} className="relative h-full w-full object-contain" />
            </>
          )}
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-[60px] bg-neu neu-tv-inset">
          <Image src="/images/logos/ft.png" alt="Fakultas Teknik" width={320} height={360} className="opacity-90" />
          <p className="font-bold text-navy-800/80" style={{ fontSize: 72 }}>
            {berita ? berita.judul : "Fakultas Teknik Unismuh Makassar"}
          </p>
        </div>
      )}

      {berita && berita.tipe_media === "image" && !loopVideo && (
        <div className="absolute inset-x-0 bottom-0 h-[14px] bg-white/15">
          <div
            key={`${berita.id}-${rotationKey}`}
            className="tv-progress h-full bg-accent-500"
            style={{ animationDuration: `${berita.durasi_detik}s` }}
          />
        </div>
      )}
      </div>
    </section>
  );
}
