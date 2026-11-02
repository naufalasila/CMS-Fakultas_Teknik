"use client";

import { useEffect } from "react";
import { THEME_POLL_MS, applyTheme, fetchServerTheme, setTheme, storedTheme, subscribeTheme } from "@/lib/theme";

/** Menyelaraskan tema <html> dengan tema pilihan admin (server) di semua halaman, termasuk layar TV. */
export default function ThemeSync() {
  useEffect(() => {
    let active = true;
    const sync = () => applyTheme(storedTheme());
    const pull = async () => {
      const theme = await fetchServerTheme();
      if (active && theme) setTheme(theme);
    };
    sync();
    pull();
    const unsubscribe = subscribeTheme(sync);
    const id = setInterval(pull, THEME_POLL_MS);
    return () => {
      active = false;
      unsubscribe();
      clearInterval(id);
    };
  }, []);
  return null;
}
