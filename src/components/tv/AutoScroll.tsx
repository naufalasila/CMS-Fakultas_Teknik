"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** kecepatan gulir dalam px kanvas per detik */
  speed?: number;
  className?: string;
  /** dipanggil dengan durasi satu putaran gulir (detik), atau null bila konten tidak perlu digulir */
  onCycleDuration?: (seconds: number | null) => void;
};

/** Menggulir konten secara vertikal tanpa henti bila konten lebih tinggi dari wadahnya. */
export default function AutoScroll({ children, speed = 60, className = "", onCycleDuration }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [overflow, setOverflow] = useState(false);

  const cycleRef = useRef(onCycleDuration);
  useEffect(() => {
    cycleRef.current = onCycleDuration;
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    const content = contentRef.current;
    if (!wrap || !content) return;
    const measure = () => {
      const h = content.offsetHeight;
      setContentHeight(h);
      const isOverflow = h > wrap.clientHeight + 4;
      setOverflow(isOverflow);
      cycleRef.current?.(isOverflow ? Math.max(h / speed, 10) : null);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    ro.observe(content);
    return () => ro.disconnect();
  }, [speed]);

  const duration = Math.max(contentHeight / speed, 10);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      <div className={overflow ? "tv-scroll-y" : undefined} style={overflow ? { animationDuration: `${duration}s` } : undefined}>
        <div ref={contentRef}>{children}</div>
        {overflow && <div aria-hidden>{children}</div>}
      </div>
    </div>
  );
}
