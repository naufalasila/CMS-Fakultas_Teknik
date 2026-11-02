"use client";

import { useState, type FormEvent } from "react";
import { Alert, Button, Card, Field, Input, PageHeader } from "@/components/admin/ui";
import { useToast } from "@/components/admin/useToast";
import { apiFetch, errorMessage } from "@/lib/api";

const MIN_LENGTH = 8;
const empty = { lama: "", baru: "", konfirmasi: "" };

export default function GantiPasswordPage() {
  const [form, setForm] = useState(empty);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const set = (key: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.baru.length < MIN_LENGTH) return setError(`Password baru minimal ${MIN_LENGTH} karakter`);
    if (form.baru !== form.konfirmasi) return setError("Konfirmasi password baru tidak cocok");
    if (form.baru === form.lama) return setError("Password baru tidak boleh sama dengan password lama");

    setSaving(true);
    try {
      await apiFetch("/api/admin/password", {
        method: "PUT",
        withAuth: true,
        body: { password_lama: form.lama, password_baru: form.baru },
      });
      setForm(empty);
      toast.show("Password berhasil diganti. Gunakan password baru saat login berikutnya.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const type = show ? "text" : "password";

  return (
    <>
      <PageHeader title="Ganti Password" description="Ubah password akun admin yang sedang login." />
      <Card className="max-w-lg p-6">
        <form onSubmit={submit} className="space-y-4">
          <Alert message={error} />
          <Field label="Password lama">
            <Input type={type} value={form.lama} onChange={set("lama")} autoComplete="current-password" required />
          </Field>
          <Field label="Password baru" hint={`Minimal ${MIN_LENGTH} karakter.`}>
            <Input type={type} value={form.baru} onChange={set("baru")} autoComplete="new-password" minLength={MIN_LENGTH} maxLength={72} required />
          </Field>
          <Field label="Konfirmasi password baru">
            <Input type={type} value={form.konfirmasi} onChange={set("konfirmasi")} autoComplete="new-password" required />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="accent-accent-500" />
            Tampilkan password
          </label>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan…" : "Simpan Password"}
            </Button>
          </div>
        </form>
      </Card>
      {toast.node}
    </>
  );
}
