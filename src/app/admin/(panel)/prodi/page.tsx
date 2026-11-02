"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Alert, Button, Card, EmptyRow, Field, Input, Modal, PageHeader, td, th } from "@/components/admin/ui";
import { useToast } from "@/components/admin/useToast";
import { apiFetch, errorMessage } from "@/lib/api";
import type { Prodi } from "@/lib/types";

const emptyForm = { kode: "", nama: "", urutan: 0 };

export default function ProdiPage() {
  const [list, setList] = useState<Prodi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Prodi | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setList(await apiFetch<Prodi[]>("/api/admin/prodi", { withAuth: true }));
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

  const openForm = (p: Prodi | null) => {
    setEditing(p);
    setForm(p ? { kode: p.kode, nama: p.nama, urutan: p.urutan } : { ...emptyForm, urutan: list.length + 1 });
    setFormError("");
    setOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const path = editing ? `/api/admin/prodi?id=${editing.id}` : "/api/admin/prodi";
      await apiFetch(path, { method: editing ? "PUT" : "POST", body: form, withAuth: true });
      toast.show(editing ? "Prodi berhasil diperbarui" : "Prodi berhasil ditambahkan");
      setOpen(false);
      load();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Prodi) => {
    if (!confirm(`Hapus prodi "${p.nama}"? Semua jadwal prodi ini juga akan terhapus.`)) return;
    try {
      await apiFetch(`/api/admin/prodi?id=${p.id}`, { method: "DELETE", withAuth: true });
      toast.show("Prodi berhasil dihapus");
      load();
    } catch (err) {
      toast.show(errorMessage(err), "error");
    }
  };

  return (
    <>
      <PageHeader
        title="Program Studi"
        description="Daftar prodi yang jadwalnya ditampilkan di layar TV."
        action={<Button onClick={() => openForm(null)}>+ Tambah Prodi</Button>}
      />
      <Alert message={error} />
      <Card className="mt-4 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2 px-3 pb-2">
          <thead>
            <tr>
              <th className={th}>Urutan</th>
              <th className={th}>Kode</th>
              <th className={th}>Nama Prodi</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={4} text="Memuat…" />
            ) : list.length === 0 ? (
              <EmptyRow colSpan={4} text="Belum ada prodi." />
            ) : (
              list.map((p) => (
                <tr key={p.id} className="transition-shadow hover:neu-inset-sm [&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl">
                  <td className={td}>{p.urutan}</td>
                  <td className={`${td} font-semibold`}>{p.kode}</td>
                  <td className={td}>{p.nama}</td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    <Button variant="ghost" onClick={() => openForm(p)}>
                      Edit
                    </Button>
                    <Button variant="ghost-danger" onClick={() => remove(p)}>
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Modal open={open} title={editing ? "Edit Prodi" : "Tambah Prodi"} onClose={close}>
        <form onSubmit={submit} className="space-y-4">
          <Alert message={formError} />
          <div className="grid grid-cols-3 gap-4">
            <Field label="Kode">
              <Input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} required maxLength={20} />
            </Field>
            <div className="col-span-2">
              <Field label="Urutan tampil">
                <Input type="number" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: Number(e.target.value) })} />
              </Field>
            </div>
          </div>
          <Field label="Nama Prodi">
            <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required maxLength={100} />
          </Field>
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
