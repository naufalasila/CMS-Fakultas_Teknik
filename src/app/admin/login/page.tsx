"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Alert, Button, Field, Input } from "@/components/admin/ui";
import { apiFetch, auth, errorMessage } from "@/lib/api";
import type { User } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");

  useEffect(() => {
    const id = setTimeout(() => {
      if (new URLSearchParams(window.location.search).has("expired")) {
        setInfo("Sesi Anda telah berakhir (1 jam). Silakan login kembali.");
      }
    });
    return () => clearTimeout(id);
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch<{ token: string; user: User }>("/api/login", {
        method: "POST",
        body: { username, password },
      });
      auth.save(res.user);
      router.replace("/admin");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neu p-4">
      <div className="w-full max-w-sm rounded-3xl bg-neu p-8 neu-raised">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-4 rounded-2xl px-5 py-3 neu-inset-sm">
            <Image src="/images/logos/unismuh.png" alt="Unismuh" width={52} height={52} />
            <Image src="/images/logos/ft.png" alt="Fakultas Teknik" width={46} height={52} />
          </div>
          <h1 className="text-xl font-extrabold text-navy-900">Dashboard Admin</h1>
          <p className="text-sm text-slate-500">TV Fakultas Teknik Unismuh Makassar</p>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <Alert message={error} />
          {!error && <Alert message={info} tone="success" />}
          <Field label="Username">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required autoFocus />
          </Field>
          <Field label="Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </Field>
          <Button type="submit" className="w-full py-2.5" disabled={loading}>
            {loading ? "Memproses…" : "Masuk"}
          </Button>
        </form>
      </div>
    </div>
  );
}
