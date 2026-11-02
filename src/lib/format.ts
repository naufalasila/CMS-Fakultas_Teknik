const tanggalFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const jamFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export const formatTanggalPanjang = (d: Date) => tanggalFormatter.format(d);
export const formatJam = (d: Date) => jamFormatter.format(d).replace(/\./g, ":");

export function formatTanggalPendek(iso: string): string {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(y, m - 1, d),
  );
}

/** "HH:MM" -> menit sejak tengah malam */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
