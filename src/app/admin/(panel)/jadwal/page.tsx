"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Alert, Badge, Button, Card, EmptyRow, Field, Input, Modal, PageHeader, Select, td, th } from "@/components/admin/ui";
import { useToast } from "@/components/admin/useToast";
import { apiFetch, errorMessage } from "@/lib/api";
import { HARI, type Hari, type Jadwal, type Prodi } from "@/lib/types";

type FormState = Omit<Jadwal, "id" | "prodi_nama" | "prodi_kode">;

const emptyForm: FormState = {
  prodi_id: 0,
  hari: "Senin",
  jam_mulai: "08:00",
  jam_selesai: "09:40",
  mata_kuliah: "",
  dosen: "",
  ruangan: "",
  kelas: "",
  semester: "",
};

export default function JadwalPage() {
  const [prodi, setProdi] = useState<Prodi[]>([]);
  const [list, setList] = useState<Jadwal[]>([]);
  const [filterProdi, setFilterProdi] = useState(0);
  const [filterHari, setFilterHari] = useState<Hari | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Jadwal | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    apiFetch<Prodi[]>("/api/admin/prodi", { withAuth: true })
      .then(setProdi)
      .catch((e) => setError(errorMessage(e)));
  }, []);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterProdi) params.set("prodi_id", String(filterProdi));
    if (filterHari) params.set("hari", filterHari);
    try {
      setList(await apiFetch<Jadwal[]>(`/api/admin/jadwal?${params}`, { withAuth: true }));
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [filterProdi, filterHari]);

  useEffect(() => {
    const t = setTimeout(load);
    return () => clearTimeout(t);
  }, [load]);

  const close = useCallback(() => setOpen(false), []);

  const openForm = (j: Jadwal | null) => {
    setEditing(j);
    if (j) {
      setForm({
        prodi_id: j.prodi_id,
        hari: j.hari,
        jam_mulai: j.jam_mulai,
        jam_selesai: j.jam_selesai,
        mata_kuliah: j.mata_kuliah,
        dosen: j.dosen,
        ruangan: j.ruangan,
        kelas: j.kelas,
        semester: j.semester,
      });
    } else {
      setForm({ ...emptyForm, prodi_id: filterProdi || prodi[0]?.id || 0, hari: filterHari || "Senin" });
    }
    setFormError("");
    setOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.prodi_id) {
      setFormError("Pilih program studi terlebih dahulu");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const path = editing ? `/api/admin/jadwal?id=${editing.id}` : "/api/admin/jadwal";
      await apiFetch(path, { method: editing ? "PUT" : "POST", body: form, withAuth: true });
      toast.show(editing ? "Jadwal berhasil diperbarui" : "Jadwal berhasil ditambahkan");
      setOpen(false);
      load();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (j: Jadwal) => {
    if (!confirm(`Hapus jadwal "${j.mata_kuliah}" (${j.hari} ${j.jam_mulai})?`)) return;
    try {
      await apiFetch(`/api/admin/jadwal?id=${j.id}`, { method: "DELETE", withAuth: true });
      toast.show("Jadwal berhasil dihapus");
      load();
    } catch (err) {
      toast.show(errorMessage(err), "error");
    }
  };

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <PageHeader
        title="Jadwal Kuliah"
        description="Jadwal per prodi. Layar TV menampilkan jadwal sesuai hari ini."
        action={
          <Button onClick={() => openForm(null)} disabled={prodi.length === 0}>
            + Tambah Jadwal
          </Button>
        }
      />
      <Alert message={error} />
      {prodi.length === 0 && !error && <Alert message="Tambahkan program studi terlebih dahulu di menu Program Studi." />}

      <div className="mt-4 flex flex-wrap gap-3">
        <Select className="!w-auto" value={filterProdi} onChange={(e) => setFilterProdi(Number(e.target.value))}>
          <option value={0}>Semua prodi</option>
          {prodi.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama}
            </option>
          ))}
        </Select>
        <Select className="!w-auto" value={filterHari} onChange={(e) => setFilterHari(e.target.value as Hari | "")}>
          <option value="">Semua hari</option>
          {HARI.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </Select>
      </div>

      <Card className="mt-4 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2 px-3 pb-2">
          <thead>
            <tr>
              <th className={th}>Prodi</th>
              <th className={th}>Hari</th>
              <th className={th}>Jam</th>
              <th className={th}>Mata Kuliah</th>
              <th className={th}>Dosen</th>
              <th className={th}>Ruang / Kelas / Smt</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={7} text="Memuat…" />
            ) : list.length === 0 ? (
              <EmptyRow colSpan={7} text="Belum ada jadwal." />
            ) : (
              list.map((j) => (
                <tr key={j.id} className="transition-shadow hover:neu-inset-sm [&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl">
                  <td className={td}>
                    <Badge tone="blue">{j.prodi_kode}</Badge>
                  </td>
                  <td className={td}>{j.hari}</td>
                  <td className={`${td} whitespace-nowrap tabular-nums`}>
                    {j.jam_mulai} – {j.jam_selesai}
                  </td>
                  <td className={`${td} font-semibold text-navy-900`}>{j.mata_kuliah}</td>
                  <td className={td}>{j.dosen || "-"}</td>
                  <td className={td}>{[j.ruangan, j.kelas, j.semester].map((v) => v || "-").join(" / ")}</td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    <Button variant="ghost" onClick={() => openForm(j)}>
                      Edit
                    </Button>
                    <Button variant="ghost-danger" onClick={() => remove(j)}>
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Modal open={open} title={editing ? "Edit Jadwal" : "Tambah Jadwal"} onClose={close} wide>
        <form onSubmit={submit} className="space-y-4">
          <Alert message={formError} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Program Studi">
              <Select value={form.prodi_id} onChange={(e) => set("prodi_id", Number(e.target.value))} required>
                <option value={0} disabled>
                  Pilih prodi
                </option>
                {prodi.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Hari">
              <Select value={form.hari} onChange={(e) => set("hari", e.target.value as Hari)}>
                {HARI.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Jam mulai">
              <Input type="time" value={form.jam_mulai} onChange={(e) => set("jam_mulai", e.target.value)} required />
            </Field>
            <Field label="Jam selesai">
              <Input type="time" value={form.jam_selesai} onChange={(e) => set("jam_selesai", e.target.value)} required />
            </Field>
          </div>
          <Field label="Mata kuliah">
            <Input value={form.mata_kuliah} onChange={(e) => set("mata_kuliah", e.target.value)} required maxLength={150} />
          </Field>
          <Field label="Dosen">
            <Input value={form.dosen} onChange={(e) => set("dosen", e.target.value)} maxLength={150} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Ruangan">
              <Input value={form.ruangan} onChange={(e) => set("ruangan", e.target.value)} maxLength={50} />
            </Field>
            <Field label="Kelas">
              <Input value={form.kelas} onChange={(e) => set("kelas", e.target.value)} maxLength={20} />
            </Field>
            <Field label="Semester">
              <Input value={form.semester} onChange={(e) => set("semester", e.target.value)} maxLength={20} />
            </Field>
          </div>
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
