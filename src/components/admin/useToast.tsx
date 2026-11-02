"use client";

import { useCallback, useRef, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, tone: "success" | "error" = "success") => {
    setToast({ message, tone });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const node = toast ? (
    <div
      className={`fixed bottom-6 right-6 z-[60] rounded-2xl bg-neu px-5 py-3.5 text-sm font-semibold neu-raised ${
        toast.tone === "success" ? "text-emerald-700" : "text-red-700"
      }`}
    >
      {toast.message}
    </div>
  ) : null;

  return { show, node };
}
