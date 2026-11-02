"use client";

/* eslint-disable @next/next/no-img-element -- media dari backend (URL dinamis) */
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Alert, Badge, Button, Card, EmptyRow, Field, Input, Modal, PageHeader, Textarea, Toggle, td, th } from "@/components/admin/ui";
import { useToast } from "@/components/admin/useToast";
import { apiFetch, errorMessage, mediaUrl } from "@/lib/api";
import { formatTanggalPendek } from "@/lib/format";
import type { Berita } from "@/lib/types";

type FormState = {
  judul: string;
  caption: string;
  durasi_detik: number;
  urutan: number;
  aktif: boolean;
  tanggal_mulai: string;
  tanggal_selesai: string;
  file: File | null;
  hapus_media: boolean;
};

const emptyForm: FormState = {
  judul: "",
  caption: "",
  durasi_detik: 15,
  urutan: 0,
  aktif: true,
  tanggal_mulai: "",
  tanggal_selesai: "",
  file: null,
  hapus_media: false,
};

function toFormData(f: FormState) {
  const fd = new FormData();
  fd.set("judul", f.judul);
  fd.set("caption", f.caption);
  fd.set("durasi_detik", String(f.durasi_detik));
  fd.set("urutan", String(f.urutan));
  fd.set("aktif", String(f.aktif));
  fd.set("tanggal_mulai", f.tanggal_mulai);
  fd.set("tanggal_selesai", f.tanggal_selesai);
  if (f.file) fd.set("media", f.file);
  if (f.hapus_media) fd.set("hapus_media", "true");
  return fd;
}

function fromBerita(b: Berita): FormState {
  return { ...emptyForm, ...b, file: null, hapus_media: false };
}

function MediaPreview({ src, video, className }: { src: string; video: boolean; className: string }) {
  if (!src) return <div className={`flex items-center justify-center bg-neu text-xs text-slate-400 neu-inset-sm ${className}`}>Tanpa media</div>;
  return video ? <video src={src} muted className={`bg-black object-cover ${className}`} /> : <img src={src} alt="" className={`object-cover ${className}`} />;
}

export default function BeritaPage() {
  const [list, setList] = useState<Berita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Berita | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setList(await apiFetch<Berita[]>("/api/admin/berita", { withAuth: true }));
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

  const setPreviewUrl = (url: string) => {
    setPreview((prev) => {
      if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setPreviewUrl("");
    setFormError("");
    setOpen(true);
  };

  const openEdit = (b: Berita) => {
    setEditing(b);
    setForm(fromBerita(b));
    setPreviewUrl(mediaUrl(b.media));
    setFormError("");
    setOpen(true);
  };

  const close = useCallback(() => setOpen(false), []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        await apiFetch(`/api/admin/berita?id=${editing.id}`, { method: "PUT", body: toFormData(form), withAuth: true });
        toast.show("Berita berhasil diperbarui");
      } else {
        await apiFetch("/api/admin/berita", { method: "POST", body: toFormData(form), withAuth: true });
        toast.show("Berita berhasil ditambahkan");
      }
      setOpen(false);
      load();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleAktif = async (b: Berita) => {
    try {
      await apiFetch(`/api/admin/berita?id=${b.id}`, {
        method: "PUT",
        body: toFormData({ ...fromBerita(b), aktif: !b.aktif }),
        withAuth: true,
      });
      setList((prev) => prev.map((x) => (x.id === b.id ? { ...x, aktif: !b.aktif } : x)));
    } catch (err) {
      toast.show(errorMessage(err), "error");
    }
  };

  const remove = async (b: Berita) => {
    if (!confirm(`Hapus berita "${b.judul}"?`)) return;
    try {
      await apiFetch(`/api/admin/berita?id=${b.id}`, { method: "DELETE", withAuth: true });
      toast.show("Berita berhasil dihapus");
      load();
    } catch (err) {
      toast.show(errorMessage(err), "error");
    }
  };

  const isVideo = form.file ? form.file.type.startsWith("video") : editing?.tipe_media === "video";
  const shownPreview = form.hapus_media && !form.file ? "" : preview;

  return (
    <>
      <PageHeader
        title="Berita"
        description="Berita beserta caption yang tampil bergantian di layar utama TV."
        action={<Button onClick={openCreate}>+ Tambah Berita</Button>}
      />
      <Alert message={error} />

      <Card className="mt-4 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2 px-3 pb-2">
          <thead>
            <tr>
              <th className={th}>Media</th>
              <th className={th}>Judul &amp; Caption</th>
              <th className={th}>Urutan</th>
              <th className={th}>Durasi</th>
              <th className={th}>Periode Tayang</th>
              <th className={th}>Aktif</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={7} text="Memuat…" />
            ) : list.length === 0 ? (
              <EmptyRow colSpan={7} text="Belum ada berita." />
            ) : (
              list.map((b) => (
                <tr key={b.id} className="transition-shadow hover:neu-inset-sm [&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl">
                  <td className={td}>
                    <div className="relative">
                      <MediaPreview src={mediaUrl(b.media)} video={b.tipe_media === "video"} className="h-16 w-28 rounded-md" />
                      {b.media && (
                        <span className="absolute bottom-1 left-1">
                          <Badge tone={b.tipe_media === "video" ? "red" : "blue"}>{b.tipe_media === "video" ? "Video" : "Gambar"}</Badge>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`${td} max-w-md`}>
                    <p className="font-semibold text-navy-900">{b.judul}</p>
                    <p className="mt-1 line-clamp-2 text-slate-500">{b.caption}</p>
                  </td>
                  <td className={td}>{b.urutan}</td>
                  <td className={td}>{b.tipe_media === "video" && b.media ? "Sampai selesai" : `${b.durasi_detik} dtk`}</td>
                  <td className={`${td} whitespace-nowrap`}>
                    {b.tanggal_mulai || b.tanggal_selesai
                      ? `${formatTanggalPendek(b.tanggal_mulai)} – ${formatTanggalPendek(b.tanggal_selesai)}`
                      : "Selalu"}
                  </td>
                  <td className={td}>
                    <Toggle checked={b.aktif} onChange={() => toggleAktif(b)} />
                  </td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    <Button variant="ghost" onClick={() => openEdit(b)}>
                      Edit
                    </Button>
                    <Button variant="ghost-danger" onClick={() => remove(b)}>
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Modal open={open} title={editing ? "Edit Berita" : "Tambah Berita"} onClose={close} wide>
        <form onSubmit={submit} className="space-y-4">
          <Alert message={formError} />
          <Field label="Judul">
            <Input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} required maxLength={255} />
          </Field>
          <Field label="Caption" hint="Ditampilkan di kolom kiri layar TV.">
            <Textarea rows={5} value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} required />
          </Field>
          <Field label="Media (gambar / video)" hint="Format: JPG, PNG, WEBP, GIF, MP4, WEBM, MOV. Maks 200MB.">
            <Input
              type="file"
              accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setForm({ ...form, file, hapus_media: false });
                setPreviewUrl(file ? URL.createObjectURL(file) : editing ? mediaUrl(editing.media) : "");
              }}
            />
          </Field>
          {shownPreview && (
            <div className="flex items-end gap-3">
              <MediaPreview src={shownPreview} video={!!isVideo} className="h-40 w-72 rounded-lg" />
              {editing?.media && !form.file && (
                <Button type="button" variant="secondary" onClick={() => setForm({ ...form, hapus_media: true })}>
                  Hapus media
                </Button>
              )}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Durasi tayang (detik)" hint="Untuk gambar. Video diputar sampai selesai.">
              <Input type="number" min={3} value={form.durasi_detik} onChange={(e) => setForm({ ...form, durasi_detik: Number(e.target.value) })} />
            </Field>
            <Field label="Urutan" hint="Angka kecil tampil lebih dulu.">
              <Input type="number" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: Number(e.target.value) })} />
            </Field>
            <Field label="Tanggal mulai tayang (opsional)">
              <Input type="date" value={form.tanggal_mulai} onChange={(e) => setForm({ ...form, tanggal_mulai: e.target.value })} />
            </Field>
            <Field label="Tanggal selesai tayang (opsional)">
              <Input type="date" value={form.tanggal_selesai} onChange={(e) => setForm({ ...form, tanggal_selesai: e.target.value })} />
            </Field>
          </div>
          <Toggle checked={form.aktif} onChange={(v) => setForm({ ...form, aktif: v })} label="Tayangkan di layar TV" />
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
