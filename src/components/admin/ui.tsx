"use client";

import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

type Variant = "primary" | "secondary" | "danger" | "ghost" | "ghost-danger";
const variants: Record<Variant, string> = {
  primary: "bg-navy-800 text-white neu-raised-sm hover:bg-navy-700 active:neu-inset-sm active:bg-navy-900 dark:bg-accent-500 dark:hover:bg-accent-400 dark:active:bg-accent-700",
  secondary: "bg-neu text-navy-800 neu-raised-sm hover:text-navy-700 active:neu-inset-sm",
  danger: "bg-ft-red text-white neu-raised-sm hover:bg-red-700 active:neu-inset-sm dark:hover:bg-accent-500",
  ghost: "bg-neu text-slate-600 hover:neu-raised-sm active:neu-inset-sm",
  "ghost-danger": "bg-neu text-ft-red hover:neu-raised-sm active:neu-inset-sm",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-navy-900/80">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border-0 bg-neu px-3.5 py-2.5 text-sm text-navy-900 neu-inset-sm outline-none transition placeholder:text-slate-400 focus:outline-2 focus:outline-accent-500/60";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-sm text-slate-700"
    >
      <span className="relative h-7 w-12 rounded-full bg-neu neu-inset-sm transition">
        <span
          className={`absolute top-1 h-5 w-5 rounded-full neu-raised-sm transition-all ${checked ? "left-6 bg-emerald-500" : "left-1 bg-neu"}`}
        />
      </span>
      {label}
    </button>
  );
}

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "green" | "slate" | "red" | "blue" }) {
  const tones = {
    green: "text-emerald-700",
    slate: "text-slate-500",
    red: "text-ft-red",
    blue: "text-blue-700",
  };
  return <span className={`inline-flex rounded-full bg-neu px-2.5 py-1 text-xs font-bold neu-inset-sm ${tones[tone]}`}>{children}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-neu neu-raised ${className}`}>{children}</div>;
}

export function Modal({ open, title, onClose, children, wide }: { open: boolean; title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neu/70 p-4 backdrop-blur-md sm:items-center" onMouseDown={onClose}>
      <div
        className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} rounded-3xl bg-neu neu-raised`}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <h2 className="text-lg font-bold text-navy-900">{title}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-neu text-slate-500 neu-raised-sm active:neu-inset-sm" aria-label="Tutup">
            ✕
          </button>
        </div>
        <div className="px-6 pt-3 pb-6">{children}</div>
      </div>
    </div>
  );
}

export function Alert({ message, tone = "error" }: { message: string; tone?: "error" | "success" }) {
  if (!message) return null;
  return (
    <div className={`rounded-xl bg-neu px-4 py-3 text-sm font-medium neu-inset-sm ${tone === "error" ? "text-red-700" : "text-emerald-700"}`}>
      {message}
    </div>
  );
}

export function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-slate-500">
        {text}
      </td>
    </tr>
  );
}

export const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-navy-800/60";
export const td = "px-4 py-3 text-sm text-navy-900/85 align-top";
