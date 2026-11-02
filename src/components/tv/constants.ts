// Ukuran kanvas mengikuti frame Figma "ukuran tv fakultas" (5079 x 2748 px).
export const STAGE_WIDTH = 5079;
export const STAGE_HEIGHT = 2748;
export const HEADER_HEIGHT = 220;
export const SIDE_WIDTH = 1256;
export const MAIN_HEIGHT = 1763;

export function mainHeight(stageHeight: number) {
  return stageHeight - HEADER_HEIGHT - QUEUE_HEIGHT - TICKER_HEIGHT;
}
/** Tinggi panel samping (caption & jadwal): dari header hingga running teks. */
export function sideHeight(stageHeight: number) {
  return stageHeight - HEADER_HEIGHT - TICKER_HEIGHT;
}
export const QUEUE_HEIGHT = 485;
export const TICKER_HEIGHT = 213;

export const POLL_INTERVAL_MS = 30_000;

// Celah antar panel neumorphism (px kanvas) agar bayangan lembut terlihat.
export const GAP = 22;
export function panelBox(left: number, top: number, width: number, height: number) {
  return { left: left + GAP, top: top + GAP, width: width - GAP * 2, height: height - GAP * 2 };
}
