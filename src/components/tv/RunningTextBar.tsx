import type { RunningText } from "@/lib/types";
import { TICKER_HEIGHT, panelBox } from "./constants";

const DEFAULT_TEXT = "Selamat datang di Fakultas Teknik Universitas Muhammadiyah Makassar";

export default function RunningTextBar({ items, stageW, stageH }: { items: RunningText[]; stageW: number; stageH: number }) {
  const texts = items.length > 0 ? items.map((t) => t.teks) : [DEFAULT_TEXT];
  const line = texts.join("     ◆     ");
  // durasi sebanding panjang teks agar kecepatan gulir konsisten
  const duration = Math.max(line.length * 0.22, 20);

  return (
    <section className="absolute flex items-center gap-[40px] rounded-full bg-neu text-navy-900 neu-tv-raised"
      style={{ ...panelBox(0, stageH - TICKER_HEIGHT, stageW, TICKER_HEIGHT), padding: "0 24px" }}>
      {/* <div className="z-10 flex shrink-0 items-center rounded-full bg-ft-red font-extrabold text-white neu-tv-raised-sm" style={{ fontSize: 64, padding: "10px 70px" }}>
        INFO
      </div> */}
      <div className="relative h-[125px] flex-1 overflow-hidden rounded-full neu-tv-inset-sm">
        <div className="tv-marquee absolute inset-y-0 flex w-max items-center whitespace-nowrap" style={{ animationDuration: `${duration}s` }}>
          {[0, 1].map((k) => (
            <span key={k} aria-hidden={k === 1} className="font-bold" style={{ fontSize: 72, paddingRight: 200, paddingLeft: 100 }}>
              {line}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
