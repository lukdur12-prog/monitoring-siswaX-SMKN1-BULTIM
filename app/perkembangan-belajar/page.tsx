"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Siswa = {
  id: number;
  nisn: string | null;
  nama_siswa: string;
};

type Perkembangan = {
  id: number;
  siswa_id: number;
  bulan: number;
  tahun: number;
  mata_pelajaran: string;
  nilai: number | null;
  catatan: string | null;
};

const daftarMataPelajaran = [
  "PAI",
  "PKN",
  "SEJARAH",
  "BAHASA INDONESIA",
  "BAHASA INGGRIS",
  "PJOK",
  "SENI BUDAYA",
  "PROJEK IPAS",
  "INFORMATIKA",
  "DMPLB",
  "MATEMATIKA",
  "KOKURIKULER",
];

const daftarBulan = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function PerkembanganBelajarPage() {
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [dataPerkembangan, setDataPerkembangan] = useState<Perkembangan[]>(
    []
  );

  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  const [siswaId, setSiswaId] = useState("");
  const [mataPelajaran, setMataPelajaran] = useState("");
  const [nilai, setNilai] = useState("");
  const [catatan, setCatatan] = useState("");

  const [editId, setEditId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ambilSiswa();
  }, []);

  useEffect(() => {
    ambilPerkembangan();
  }, [bulan, tahun]);

  async function ambilSiswa() {
    setLoading(true);

    const { data, error } = await supabase
      .from("siswa")
      .select("id, nisn, nama_siswa")
      .eq("kelas_id", 2)
      .order("nama_siswa", { ascending: true });

    if (error) {
      console.error(error);
      alert("Gagal mengambil data siswa: " + error.message);
      setLoading(false);
      return;
    }

    setSiswa(data || []);
    setLoading(false);
  }

  async function ambilPerkembangan() {
    const { data, error } = await supabase
      .from("perkembangan_belajar")
      .select(
        "id, siswa_id, bulan, tahun, mata_pelajaran, nilai, catatan"
      )
      .eq("bulan", bulan)
      .eq("tahun", tahun)
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      alert(
        "Gagal mengambil data perkembangan belajar: " + error.message
      );
      return;
    }

    setDataPerkembangan(data || []);
  }

  function resetForm() {
    setSiswaId("");
    setMataPelajaran("");
    setNilai("");
    setCatatan("");
    setEditId(null);
  }

  async function simpanData() {
    if (!siswaId) {
      alert("Silakan pilih nama siswa.");
      return;
    }

    if (!mataPelajaran) {
      alert("Silakan pilih mata pelajaran unggulan.");
      return;
    }

    if (nilai === "") {
      alert("Silakan masukkan nilai.");
      return;
    }

    const nilaiAngka = Number(nilai);

    if (nilaiAngka < 0 || nilaiAngka > 100) {
      alert("Nilai harus antara 0 sampai 100.");
      return;
    }

    setSaving(true);

    try {
      if (editId !== null) {
        const { error } = await supabase
          .from("perkembangan_belajar")
          .update({
            siswa_id: Number(siswaId),
            bulan,
            tahun,
            mata_pelajaran: mataPelajaran,
            nilai: nilaiAngka,
            catatan: catatan || null,
          })
          .eq("id", editId);

        if (error) {
          throw error;
        }

        alert("Data berhasil diperbarui.");
      } else {
        const { error } = await supabase
          .from("perkembangan_belajar")
          .upsert(
            {
              siswa_id: Number(siswaId),
              bulan,
              tahun,
              mata_pelajaran: mataPelajaran,
              nilai: nilaiAngka,
              catatan: catatan || null,
            },
            {
              onConflict: "siswa_id,bulan,tahun,mata_pelajaran",
            }
          );

        if (error) {
          throw error;
        }

        alert("Perkembangan siswa berhasil disimpan.");
      }

      resetForm();
      await ambilPerkembangan();
    } catch (error: any) {
      console.error(error);

      if (error.code === "23505") {
        alert(
          "Data siswa dengan mata pelajaran tersebut sudah ada pada bulan ini."
        );
      } else {
        alert(
          "Gagal menyimpan data: " +
            (error.message || "Terjadi kesalahan")
        );
      }
    } finally {
      setSaving(false);
    }
  }

  function editData(data: Perkembangan) {
    setEditId(data.id);
    setSiswaId(String(data.siswa_id));
    setMataPelajaran(data.mata_pelajaran);
    setNilai(data.nilai !== null ? String(data.nilai) : "");
    setCatatan(data.catatan || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function hapusData(id: number) {
    const yakin = confirm(
      "Apakah Anda yakin ingin menghapus data perkembangan ini?"
    );

    if (!yakin) return;

    const { error } = await supabase
      .from("perkembangan_belajar")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Gagal menghapus data: " + error.message);
      return;
    }

    alert("Data berhasil dihapus.");

    if (editId === id) {
      resetForm();
    }

    await ambilPerkembangan();
  }

  function namaSiswa(siswaId: number) {
    const data = siswa.find((item) => item.id === siswaId);
    return data?.nama_siswa || "-";
  }

  function nisnSiswa(siswaId: number) {
    const data = siswa.find((item) => item.id === siswaId);
    return data?.nisn || "-";
  }

  return (
    <main className="halaman">
      <div className="container">
        {/* HEADER */}
        <div className="header">
          <div>
            <h1>Perkembangan Belajar</h1>
            <p>
              Kelas X Manajemen Perkantoran (MP)
            </p>
          </div>

          <button
            className="tombol-dashboard"
            onClick={() => (window.location.href = "/")}
          >
            ← Dashboard
          </button>
        </div>

        {/* PERIODE */}
        <section className="kartu">
          <h2>Periode Penilaian</h2>

          <div className="periode-grid">
            <div className="field">
              <label>Bulan</label>

              <select
                value={bulan}
                onChange={(e) => setBulan(Number(e.target.value))}
              >
                {daftarBulan.map((nama, index) => (
                  <option key={index + 1} value={index + 1}>
                    {nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Tahun</label>

              <select
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
              >
                {Array.from({ length: 7 }, (_, index) => {
                  const tahunPilihan =
                    new Date().getFullYear() - 3 + index;

                  return (
                    <option
                      key={tahunPilihan}
                      value={tahunPilihan}
                    >
                      {tahunPilihan}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </section>

        {/* FORM INPUT */}
        <section className="kartu">
          <div className="judul-form">
            <div>
              <h2>
                {editId !== null
                  ? "Edit Perkembangan Siswa"
                  : "Input Perkembangan Siswa"}
              </h2>

              <p>
                Pilih siswa dan mata pelajaran yang menjadi
                unggulannya.
              </p>
            </div>
          </div>

          <div className="form-grid">
            {/* NAMA SISWA */}
            <div className="field">
              <label>Nama Siswa</label>

              <select
                value={siswaId}
                onChange={(e) => setSiswaId(e.target.value)}
              >
                <option value="">-- Pilih Nama Siswa --</option>

                {siswa.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama_siswa}
                  </option>
                ))}
              </select>
            </div>

            {/* MAPEL */}
            <div className="field">
              <label>Mata Pelajaran Unggul</label>

              <select
                value={mataPelajaran}
                onChange={(e) =>
                  setMataPelajaran(e.target.value)
                }
              >
                <option value="">
                  -- Pilih Mata Pelajaran --
                </option>

                {daftarMataPelajaran.map((mapel) => (
                  <option key={mapel} value={mapel}>
                    {mapel}
                  </option>
                ))}
              </select>
            </div>

            {/* NILAI */}
            <div className="field">
              <label>Nilai</label>

              <input
                type="number"
                min="0"
                max="100"
                value={nilai}
                onChange={(e) => setNilai(e.target.value)}
                placeholder="0 - 100"
              />
            </div>

            {/* CATATAN */}
            <div className="field catatan-field">
              <label>Catatan</label>

              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Sangat menguasai materi"
              />
            </div>
          </div>

          <div className="form-actions">
            {editId !== null && (
              <button
                className="tombol-batal"
                onClick={resetForm}
              >
                Batal
              </button>
            )}

            <button
              className="tombol-simpan"
              onClick={simpanData}
              disabled={saving}
            >
              {saving
                ? "Menyimpan..."
                : editId !== null
                ? "💾 Update Data"
                : "💾 Simpan"}
            </button>
          </div>
        </section>

        {/* DAFTAR DATA */}
        <section className="kartu">
          <div className="judul-daftar">
            <div>
              <h2>Data Perkembangan Siswa</h2>

              <p>
                {daftarBulan[bulan - 1]} {tahun}
              </p>
            </div>

            <div className="jumlah-data">
              {dataPerkembangan.length} Data
            </div>
          </div>

          {loading ? (
            <div className="kosong">
              Memuat data siswa...
            </div>
          ) : dataPerkembangan.length === 0 ? (
            <div className="kosong">
              Belum ada data perkembangan yang disimpan
              untuk bulan ini.
            </div>
          ) : (
            <div className="tabel-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>NISN</th>
                    <th>Nama Siswa</th>
                    <th>Mata Pelajaran Unggul</th>
                    <th>Nilai</th>
                    <th>Catatan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {dataPerkembangan.map((data, index) => (
                    <tr key={data.id}>
                      <td>{index + 1}</td>

                      <td>{nisnSiswa(data.siswa_id)}</td>

                      <td className="nama">
                        {namaSiswa(data.siswa_id)}
                      </td>

                      <td>
                        <span className="mapel">
                          {data.mata_pelajaran}
                        </span>
                      </td>

                      <td className="nilai">
                        {data.nilai ?? "-"}
                      </td>

                      <td>
                        {data.catatan || "-"}
                      </td>

                      <td>
                        <div className="aksi">
                          <button
                            className="tombol-edit"
                            onClick={() => editData(data)}
                          >
                            Edit
                          </button>

                          <button
                            className="tombol-hapus"
                            onClick={() => hapusData(data.id)}
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
          )}
        </section>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .halaman {
          min-height: 100vh;
          background: #f3f4f6;
          padding: 30px 20px;
          color: #111111;
        }

        .container {
          max-width: 1250px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
        }

        .header h1 {
          margin: 0;
          font-size: 30px;
          color: #111111;
          font-weight: 800;
        }

        .header p {
          margin: 6px 0 0;
          color: #111111;
          font-size: 16px;
          font-weight: 500;
        }

        .tombol-dashboard {
          border: none;
          background: #111827;
          color: #ffffff;
          padding: 11px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          font-size: 14px;
        }

        .kartu {
          background: #ffffff;
          border-radius: 12px;
          padding: 22px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .kartu h2 {
          margin: 0 0 18px;
          font-size: 20px;
          color: #111111;
          font-weight: 800;
        }

        .judul-form,
        .judul-daftar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .judul-form p,
        .judul-daftar p {
          margin: -10px 0 0;
          color: #111111;
          font-size: 14px;
        }

        .periode-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field label {
          color: #111111;
          font-weight: 800;
          font-size: 14px;
        }

        .field select,
        .field input {
          width: 100%;
          padding: 12px;
          border: 1px solid #9ca3af;
          border-radius: 8px;
          background: #ffffff;
          color: #111111;
          font-size: 15px;
          font-weight: 500;
          outline: none;
        }

        .field select:focus,
        .field input:focus {
          border: 2px solid #111111;
        }

        .catatan-field {
          grid-column: span 1;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .tombol-simpan {
          border: none;
          background: #15803d;
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 800;
        }

        .tombol-simpan:disabled {
          background: #6b7280;
          cursor: not-allowed;
        }

        .tombol-batal {
          border: 1px solid #111111;
          background: #ffffff;
          color: #111111;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
        }

        .jumlah-data {
          background: #111827;
          color: #ffffff;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 800;
        }

        .kosong {
          text-align: center;
          padding: 45px 20px;
          color: #111111;
          font-weight: 600;
        }

        .tabel-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1000px;
        }

        th {
          background: #e5e7eb;
          color: #111111;
          padding: 13px 10px;
          text-align: left;
          border-bottom: 2px solid #111111;
          font-size: 14px;
          font-weight: 800;
        }

        td {
          padding: 12px 10px;
          border-bottom: 1px solid #d1d5db;
          color: #111111;
          font-size: 14px;
          font-weight: 500;
          vertical-align: middle;
        }

        tr:hover td {
          background: #f9fafb;
        }

        td.nama {
          font-weight: 800;
        }

        .mapel {
          font-weight: 800;
          color: #111111;
        }

        .nilai {
          font-size: 18px;
          font-weight: 900;
          color: #111111;
        }

        .aksi {
          display: flex;
          gap: 7px;
        }

        .tombol-edit,
        .tombol-hapus {
          border: none;
          padding: 7px 11px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
        }

        .tombol-edit {
          background: #e5e7eb;
          color: #111111;
        }

        .tombol-hapus {
          background: #dc2626;
          color: #ffffff;
        }

        @media (max-width: 700px) {
          .halaman {
            padding: 20px 12px;
          }

          .header {
            align-items: flex-start;
            flex-direction: column;
          }

          .periode-grid,
          .form-grid {
            grid-template-columns: 1fr;
          }

          .catatan-field {
            grid-column: span 1;
          }

          .judul-daftar {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}