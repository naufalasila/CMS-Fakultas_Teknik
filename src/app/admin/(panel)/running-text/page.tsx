"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Alert, Button, Card, EmptyRow, Field, Input, Modal, PageHeader, Textarea, Toggle, td, th } from "@/components/admin/ui";
import { useToast } from "@/components/admin/useToast";
import { apiFetch, errorMessage } from "@/lib/api";
import type { RunningText } from "@/lib/types";

const emptyForm = { teks: "", urutan: 0, aktif: true };

export default function RunningTextPage() {
  const [list, setList] = useState<RunningText[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<RunningText | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setList(await apiFetch<RunningText[]>("/api/admin/running-text", { withAuth: true }));
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(load);
    return () => clearTimeout(t);
  }, [load]);

  const close = useCallback(() => setOpen(false), []);

  const openForm = (t: RunningText | null) => {
    setEditing(t);
    setForm(t ? { teks: t.teks, urutan: t.urutan, aktif: t.aktif } : { ...emptyForm, urutan: list.length + 1 });
    setFormError("");
    setOpen(true);
  };

  const save = async (body: typeof emptyForm, id?: number) => {
    const path = id ? `/api/admin/running-text?id=${id}` : "/api/admin/running-text";
    await apiFetch(path, { method: id ? "PUT" : "POST", body, withAuth: true });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await save(form, editing?.id);
      toast.show(editing ? "Running text berhasil diperbarui" : "Running text berhasil ditambahkan");
      setOpen(false);
      load();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleAktif = async (t: RunningText) => {
    try {
      await save({ teks: t.teks, urutan: t.urutan, aktif: !t.aktif }, t.id);
      setList((prev) => prev.map((x) => (x.id === t.id ? { ...x, aktif: !t.aktif } : x)));
    } catch (err) {
      toast.show(errorMessage(err), "error");
    }
  };

  const remove = async (t: RunningText) => {
    if (!confirm("Hapus running text ini?")) return;
    try {
      await apiFetch(`/api/admin/running-text?id=${t.id}`, { method: "DELETE", withAuth: true });
      toast.show("Running text berhasil dihapus");
      load();
    } catch (err) {
      toast.show(errorMessage(err), "error");
    }
  };

  return (
    <>
      <PageHeader
        title="Running Text"
        description="Teks berjalan di bagian paling bawah layar TV."
        action={<Button onClick={() => openForm(null)}>+ Tambah Teks</Button>}
      />
      <Alert message={error} />
      <Card className="mt-4 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2 px-3 pb-2">
          <thead>
            <tr>
              <th className={th}>Urutan</th>
              <th className={th}>Teks</th>
              <th className={th}>Aktif</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={4} text="Memuat…" />
            ) : list.length === 0 ? (
              <EmptyRow colSpan={4} text="Belum ada running text." />
            ) : (
              list.map((t) => (
                <tr key={t.id} className="transition-shadow hover:neu-inset-sm [&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl">
                  <td className={td}>{t.urutan}</td>
                  <td className={`${td} max-w-2xl`}>{t.teks}</td>
                  <td className={td}>
                    <Toggle checked={t.aktif} onChange={() => toggleAktif(t)} />
                  </td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    <Button variant="ghost" onClick={() => openForm(t)}>
                      Edit
                    </Button>
                    <Button variant="ghost-danger" onClick={() => remove(t)}>
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Modal open={open} title={editing ? "Edit Running Text" : "Tambah Running Text"} onClose={close}>
        <form onSubmit={submit} className="space-y-4">
          <Alert message={formError} />
          <Field label="Teks" hint={`${form.teks.length}/500 karakter`}>
            <Textarea rows={3} value={form.teks} onChange={(e) => setForm({ ...form, teks: e.target.value })} required maxLength={500} />
          </Field>
          <Field label="Urutan">
            <Input type="number" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: Number(e.target.value) })} />
          </Field>
          <Toggle checked={form.aktif} onChange={(v) => setForm({ ...form, aktif: v })} label="Tampilkan di layar TV" />
          <div className="flex justify-end gap-2 pt-5">
            <Button type="button" variant="secondary" onClick={close}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan…" : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>
      {toast.node}
    </>
  );
}
