"use client";

import { useSyncExternalStore } from "react";
import { STAGE_HEIGHT, STAGE_WIDTH } from "./constants";

export type Stage = { scale: number; width: number; height: number };

const EMPTY: Stage = { scale: 0, width: STAGE_WIDTH, height: STAGE_HEIGHT };
let cache: Stage = EMPTY;

function subscribe(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}

function getStage() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(vw / STAGE_WIDTH, vh / STAGE_HEIGHT);
  const width = Math.round(vw / scale);
  const height = Math.round(vh / scale);
  if (cache.scale !== scale || cache.width !== width || cache.height !== height) {
    cache = { scale, width, height };
  }
  return cache;
}

/**
 * Kanvas desain 5079x2748 diperluas mengikuti rasio layar sehingga selalu
 * memenuhi layar (tanpa letterbox). Sisi yang lebih panjang ikut melebar.
 */
export function useStageScale() {
  return useSyncExternalStore(subscribe, getStage, () => EMPTY);
}
