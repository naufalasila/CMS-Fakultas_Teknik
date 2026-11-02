import type { Berita } from "@/lib/types";
import AutoScroll from "./AutoScroll";
import { HEADER_HEIGHT, SIDE_WIDTH, panelBox, sideHeight } from "./constants";

type Props = { berita: Berita | null; index: number; total: number; stageH: number };

export default function CaptionPanel({ berita, index, total, stageH }: Props) {
  return (
    <section
      className="absolute flex flex-col rounded-[70px] bg-neu text-navy-900 neu-tv-raised"
      style={{ ...panelBox(0, HEADER_HEIGHT, SIDE_WIDTH, sideHeight(stageH)), padding: "80px 80px 64px" }}
    >
      <span
        className="self-start rounded-full bg-accent-500 font-extrabold uppercase tracking-widest text-white neu-tv-raised-sm"
        style={{ fontSize: 38, padding: "14px 40px" }}         
      >
        Berita Terkini
      </span>


      {berita ? (
        <div key={berita.id} className="tv-fade-in mt-[60px] flex min-h-0 min-w-0 flex-1 flex-col">
          <h2 className="font-extrabold text-navy-900 [overflow-wrap:anywhere]" style={{ fontSize: 86, lineHeight: 1.12 }}>
            {berita.judul}
          </h2>
          <div className="my-[50px] h-[14px] w-[220px] rounded-full bg-accent-500 neu-tv-inset-sm" />
          <AutoScroll className="min-h-0 flex-1 rounded-[44px] neu-tv-inset" speed={40}>
            <p className="whitespace-pre-line text-navy-900/85 [overflow-wrap:anywhere]" style={{ fontSize: 48, lineHeight: 1.45, padding: "44px 50px" }}>
              {berita.caption}
            </p>
          </AutoScroll>
        </div>
      ) : (
        <div className="mt-[60px] flex flex-1 items-center text-slate-500" style={{ fontSize: 56 }}>
          Belum ada berita yang ditayangkan.
        </div>
      )}

      {total > 1 && (
        <div className="mt-[40px] flex items-center gap-[20px]">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-[22px] rounded-full transition-all ${i === index ? "w-[90px] bg-accent-500 neu-tv-raised-sm" : "w-[22px] neu-tv-inset-sm"}`}
            />
          ))}
          <span className="ml-auto font-bold tabular-nums text-navy-800/70" style={{ fontSize: 40 }}>
            {index + 1} / {total}
          </span>
        </div>
      )}
    </section>
  );
}
