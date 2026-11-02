export type ApiResponse<T> = {
  success: boolean;
  status: number;
  message: string;
  data?: T;
};

export type TipeMedia = "image" | "video";

export type Berita = {
  id: number;
  judul: string;
  caption: string;
  media: string;
  tipe_media: TipeMedia;
  durasi_detik: number;
  urutan: number;
  aktif: boolean;
  tanggal_mulai: string;
  tanggal_selesai: string;
  created_at?: string;
  updated_at?: string;
};

export type Prodi = {
  id: number;
  kode: string;
  nama: string;
  urutan: number;
};

export const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"] as const;
export type Hari = (typeof HARI)[number];

export type Jadwal = {
  id: number;
  prodi_id: number;
  prodi_nama?: string;
  prodi_kode?: string;
  hari: Hari;
  jam_mulai: string;
  jam_selesai: string;
  mata_kuliah: string;
  dosen: string;
  ruangan: string;
  kelas: string;
  semester: string;
};

export type RunningText = {
  id: number;
  teks: string;
  urutan: number;
  aktif: boolean;
};

export type JadwalProdi = {
  prodi_id: number;
  kode: string;
  nama: string;
  items: Jadwal[];
};

export type TVData = {
  hari: string;
  tanggal: string;
  berita: Berita[];
  jadwal: JadwalProdi[];
  running_text: RunningText[];
  tema: "light" | "dark";
};

export type User = {
  id_user: number;
  username: string;
  full_name: string;
  role: string;
};

export type DashboardStats = {
  total_berita: number;
  berita_aktif: number;
  total_prodi: number;
  total_jadwal: number;
  jadwal_hari_ini: number;
  running_text_aktif: number;
};
