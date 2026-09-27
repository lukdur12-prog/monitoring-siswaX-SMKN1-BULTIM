"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Siswa = {
  id: number;
  nisn: string;
  nama_siswa: string;
};

type Literasi = {
  id: number;
  tanggal: string;
  semester: string;
  siswa_id: number;
  judul_buku: string;
  nomor_halaman: number;
  resume: string;
  created_at: string;
};

export default function LiterasiSiswaPage() {
  const router = useRouter();

  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [dataLiterasi, setDataLiterasi] = useState<Literasi[]>([]);

  const [tanggal, setTanggal] = useState("");
  const [semester, setSemester] = useState("Ganjil");
  const [siswaId, setSiswaId] = useState("");
  const [judulBuku, setJudulBuku] = useState("");
  const [nomorHalaman, setNomorHalaman] = useState("");
  const [resume, setResume] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadSiswa();
    loadLiterasi();
  }, []);

  async function loadSiswa() {
    const { data, error } = await supabase
      .from("siswa")
      .select("id, nisn, nama_siswa")
      .order("nama_siswa", { ascending: true });

    if (error) {
      console.error("Gagal mengambil data siswa:", error);
      return;
    }

    setSiswa(data || []);
  }

  async function loadLiterasi() {
    setLoadingData(true);

    const { data, error } = await supabase
      .from("literasi_siswa")
      .select(
        "id, tanggal, semester, siswa_id, judul_buku, nomor_halaman, resume, created_at"
      )
      .order("tanggal", { ascending: false });

    if (error) {
      console.error("GAGAL LOAD LITERASI:", JSON.stringify(error, null, 2));

      alert(
        `Gagal mengambil data literasi.\n\n${error.message}\n\nKode: ${
          error.code || "-"
        }`
      );

      setLoadingData(false);
      return;
    }

    setDataLiterasi(data || []);
    setLoadingData(false);
  }

  function resetForm() {
    setTanggal("");
    setSemester("Ganjil");
    setSiswaId("");
    setJudulBuku("");
    setNomorHalaman("");
    setResume("");
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !tanggal ||
      !semester ||
      !siswaId ||
      !judulBuku ||
      !nomorHalaman ||
      !resume
    ) {
      alert("Semua data wajib diisi.");
      return;
    }

    setLoading(true);

    const payload = {
      tanggal,
      semester,
      siswa_id: Number(siswaId),
      judul_buku: judulBuku,
      nomor_halaman: Number(nomorHalaman),
      resume,
    };

    if (editingId !== null) {
      const { error } = await supabase
        .from("literasi_siswa")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        console.error("ERROR UPDATE:", error);

        alert(
          `Gagal memperbarui data.\n\n${error.message}\n\nKode: ${
            error.code || "-"
          }`
        );

        setLoading(false);
        return;
      }

      alert("Data literasi berhasil diperbarui.");
    } else {
      const { error } = await supabase
        .from("literasi_siswa")
        .insert([payload]);

      if (error) {
        console.error("ERROR INSERT:", error);

        alert(
          `Gagal menyimpan data.\n\n${error.message}\n\nKode: ${
            error.code || "-"
          }`
        );

        setLoading(false);
        return;
      }

      alert("Data literasi berhasil disimpan.");
    }

    resetForm();
    await loadLiterasi();

    setLoading(false);
  }

  function handleEdit(item: Literasi) {
    setEditingId(item.id);
    setTanggal(item.tanggal);
    setSemester(item.semester);
    setSiswaId(String(item.siswa_id));
    setJudulBuku(item.judul_buku);
    setNomorHalaman(String(item.nomor_halaman));
    setResume(item.resume);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id: number) {
    const yakin = confirm(
      "Apakah Anda yakin ingin menghapus data literasi ini?"
    );

    if (!yakin) return;

    const { error } = await supabase
      .from("literasi_siswa")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("ERROR DELETE:", error);

      alert(
        `Gagal menghapus data.\n\n${error.message}\n\nKode: ${
          error.code || "-"
        }`
      );

      return;
    }

    alert("Data literasi berhasil dihapus.");

    await loadLiterasi();
  }

  function namaSiswa(id: number) {
    const ditemukan = siswa.find((item) => item.id === id);

    return ditemukan?.nama_siswa || "-";
  }

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900">
      {/* HEADER */}
      <header className="bg-green-700 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">
              Literasi Siswa
            </h1>

            <p className="text-sm text-green-100">
              Monitoring kegiatan literasi siswa kelas X MP
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="whitespace-nowrap rounded-lg bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow hover:bg-green-50"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* FORM */}
        <section className="mb-6 rounded-xl bg-white p-5 shadow">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">
                {editingId !== null
                  ? "Edit Data Literasi"
                  : "Tambah Data Literasi"}
              </h2>

              <p className="text-sm text-gray-500">
                Isi kegiatan membaca dan resume siswa.
              </p>
            </div>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100"
              >
                Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Tanggal */}
              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Tanggal
                </label>

                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-black outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                />
              </div>

              {/* Semester */}
              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Semester
                </label>

                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-black outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>

              {/* Siswa */}
              <div className="lg:col-span-2">
                <label className="mb-1 block text-sm font-semibold">
                  Nama Siswa
                </label>

                <select
                  value={siswaId}
                  onChange={(e) => setSiswaId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-black outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                >
                  <option value="">-- Pilih Siswa --</option>

                  {siswa.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama_siswa} - {item.nisn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Judul Buku */}
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold">
                  Judul Buku
                </label>

                <input
                  type="text"
                  value={judulBuku}
                  onChange={(e) => setJudulBuku(e.target.value)}
                  placeholder="Masukkan judul buku"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-black placeholder-gray-500 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                />
              </div>

              {/* Halaman */}
              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Nomor Halaman
                </label>

                <input
                  type="number"
                  min="1"
                  value={nomorHalaman}
                  onChange={(e) => setNomorHalaman(e.target.value)}
                  placeholder="Contoh: 25"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-black placeholder-gray-500 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
                />
              </div>
            </div>

            {/* Resume */}
            <div>
              <label className="mb-1 block text-sm font-semibold">
                Resume / Ringkasan Bacaan
              </label>

              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                rows={5}
                placeholder="Tuliskan ringkasan isi buku yang dibaca..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-black placeholder-gray-500 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white shadow hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Menyimpan..."
                  : editingId !== null
                  ? "Simpan Perubahan"
                  : "Simpan Data"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-100"
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        {/* DAFTAR DATA */}
        <section className="rounded-xl bg-white shadow">
          <div className="border-b px-5 py-4">
            <h2 className="text-lg font-bold">
              Daftar Literasi Siswa
            </h2>

            <p className="text-sm text-gray-500">
              Data kegiatan literasi yang sudah tersimpan.
            </p>
          </div>

          {loadingData ? (
            <div className="p-8 text-center text-gray-500">
              Memuat data...
            </div>
          ) : dataLiterasi.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Belum ada data literasi siswa.
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Siswa</th>
                      <th className="px-4 py-3">Semester</th>
                      <th className="px-4 py-3">Judul Buku</th>
                      <th className="px-4 py-3">Halaman</th>
                      <th className="px-4 py-3">Resume</th>
                      <th className="px-4 py-3">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {dataLiterasi.map((item, index) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          {index + 1}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3">
                          {item.tanggal}
                        </td>

                        <td className="px-4 py-3 font-semibold">
                          {namaSiswa(item.siswa_id)}
                        </td>

                        <td className="px-4 py-3">
                          {item.semester}
                        </td>

                        <td className="px-4 py-3">
                          {item.judul_buku}
                        </td>

                        <td className="px-4 py-3">
                          {item.nomor_halaman}
                        </td>

                        <td className="max-w-xs px-4 py-3">
                          <div className="line-clamp-3">
                            {item.resume}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="space-y-4 p-4 md:hidden">
                {dataLiterasi.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          Literasi #{index + 1}
                        </p>

                        <h3 className="font-bold text-gray-900">
                          {namaSiswa(item.siswa_id)}
                        </h3>
                      </div>

                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                        {item.semester}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold">
                          Tanggal:
                        </span>{" "}
                        {item.tanggal}
                      </div>

                      <div>
                        <span className="font-semibold">
                          Buku:
                        </span>{" "}
                        {item.judul_buku}
                      </div>

                      <div>
                        <span className="font-semibold">
                          Halaman:
                        </span>{" "}
                        {item.nomor_halaman}
                      </div>

                      <div>
                        <p className="mb-1 font-semibold">
                          Resume:
                        </p>

                        <p className="leading-relaxed text-gray-700">
                          {item.resume}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}