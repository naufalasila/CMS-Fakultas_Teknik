/* eslint-disable @next/next/no-img-element -- thumbnail berasal dari backend (URL dinamis) */
import { mediaUrl } from "@/lib/api";
import type { Berita } from "@/lib/types";
import { QUEUE_HEIGHT, SIDE_WIDTH, TICKER_HEIGHT, panelBox } from "./constants";

type Props = { berita: Berita[]; currentIndex: number; stageW: number; stageH: number };

function Thumb({ b }: { b: Berita }) {
  if (!b.media) {
    return <div className="flex h-full w-full items-center justify-center bg-neu text-slate-400 neu-tv-inset-sm" style={{ fontSize: 34 }}>Tanpa media</div>;
  }
  if (b.tipe_media === "video") {
    return <video src={`${mediaUrl(b.media)}#t=1`} muted preload="metadata" className="h-full w-full object-cover" />;
  }
  return <img src={mediaUrl(b.media)} alt="" className="h-full w-full object-cover" />;
}

export default function BeritaQueue({ berita, currentIndex, stageW, stageH }: Props) {
  // Urutkan mulai dari berita yang sedang tayang agar terlihat sebagai antrian.
  const ordered = berita.map((_, i) => berita[(currentIndex + i) % berita.length]);

  return (
    <section
      className="absolute flex items-center gap-[50px] overflow-hidden rounded-[60px] bg-neu neu-tv-raised"
      style={{ ...panelBox(SIDE_WIDTH, stageH - TICKER_HEIGHT - QUEUE_HEIGHT, stageW - SIDE_WIDTH * 2, QUEUE_HEIGHT), padding: "0 60px" }}
    >
      {ordered.length === 0 ? (
        <p className="text-slate-500" style={{ fontSize: 48 }}>
          Belum ada berita. Tambahkan melalui dashboard admin.
        </p>
      ) : (
        <div className="flex gap-[48px] px-[10px] py-[30px]">
          {ordered.map((b, i) => (
            <article
              key={b.id}
              className={`shrink-0 overflow-hidden rounded-[36px] bg-neu ${
                i === 0 ? "neu-tv-inset-sm outline-[6px] outline-accent-500" : "neu-tv-raised-sm"
              }`}
              style={{ width: 600, padding: 14 }}
            >
              <div className="relative h-[230px] w-full overflow-hidden rounded-[26px] bg-navy-950">
                <Thumb b={b} />
                {i === 0 && (
                  <span
                    className="absolute left-[20px] top-[20px] rounded-full bg-accent-500 font-extrabold text-white"
                    style={{ fontSize: 26, padding: "6px 20px" }}
                  >
                    SEDANG TAYANG
                  </span>
                )}
              </div>
              <p className="line-clamp-2 font-bold text-navy-900" style={{ fontSize: 34, lineHeight: 1.3, padding: "14px 14px 4px" }}>
                {b.judul}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
