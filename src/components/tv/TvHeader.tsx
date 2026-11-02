import Image from "next/image";
import { formatJam, formatTanggalPanjang } from "@/lib/format";
import { HEADER_HEIGHT, panelBox } from "./constants";

/** Skala ukuran logo header terhadap ukuran aslinya di desain Figma. */
const LOGO_SCALE = 0.72;

type Logo = { src: string; alt: string; w: number; h: number; plate?: boolean };

const leftLogos: Logo[] = [
  { src: "/images/logos/unismuh.png", alt: "Logo Unismuh Makassar", w: 175, h: 174 },
  { src: "/images/logos/unismuh-baru.png", alt: "Logo Unismuh baru", w: 180, h: 181 },
  { src: "/images/logos/ft.png", alt: "Logo Fakultas Teknik", w: 160, h: 180 },
  { src: "/images/logos/unggul.png", alt: "Akreditasi Unggul", w: 235, h: 174 },
];

const rightLogos: Logo[] = [
  { src: "/images/logos/diktisaintek.png", alt: "Diktisaintek Berdampak", w: 174, h: 175 },
  { src: "/images/logos/igift.png", alt: "IGIFT", w: 189, h: 175 },
  { src: "/images/logos/iso21001.png", alt: "ISO 21001 TÜV Rheinland", w: 498, h: 176, plate: true },
  { src: "/images/logos/the-impact.png", alt: "THE Impact Rankings", w: 595, h: 180, plate: true },
];

function LogoRow({ logos, gap }: { logos: Logo[]; gap: number }) {
  return (
    <div className="relative z-10 flex items-end" style={{ gap: gap * LOGO_SCALE }}>
      {logos.map((l) => (
        <Image
          key={l.src}
          src={l.src}
          alt={l.alt}
          width={Math.round(l.w * LOGO_SCALE)}
          height={Math.round(l.h * LOGO_SCALE)}
          priority
          // logo bertulisan gelap diberi latar terang saat mode gelap agar tetap terbaca
          className={`object-contain ${l.plate ? "dark:rounded-[18px] dark:bg-white dark:p-[9px]" : ""}`}
        />
      ))}
    </div>
  );
}

export default function TvHeader({ now, stageW }: { now: Date | null; stageW: number }) {
  return (
    <header
      className="absolute flex items-center justify-between rounded-[60px] bg-neu neu-tv-raised"
      style={{ ...panelBox(0, 0, stageW, HEADER_HEIGHT), padding: "0 457px" }}
    >
      <LogoRow logos={leftLogos} gap={41} />

      {/* <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="font-bold text-ft-red tabular-nums" style={{ fontSize: 48 }}>
          {now ? `${formatTanggalPanjang(now)} • ${formatJam(now)} WITA` : "\u00a0"}
        </p>
      </div> */}

      <LogoRow logos={rightLogos} gap={46} />
    </header>
  );
}
