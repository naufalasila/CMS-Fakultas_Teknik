"use client";

import { useEffect, useState } from "react";

/** Waktu sekarang, diperbarui setiap detik (null sebelum mount untuk menghindari hydration mismatch). */
export function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return now;
}
