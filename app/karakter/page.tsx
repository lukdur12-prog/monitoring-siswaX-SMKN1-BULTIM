"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Siswa = {
  id: number;
  nisn: string | null;
  nama_siswa: string;
};

type Karakter = {
  id: number;
  siswa_id: number;
  bulan: number;
  tahun: number;
  karakter: string;
  deskripsi: string | null;
};

const daftarKarakter = [
  "GOTONG ROYONG",
  "DISIPLIN",
  "TANGGUNG JAWAB",
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

export default function KarakterPage() {
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [dataKarakter, setDataKarakter] = useState<Karakter[]>([]);

  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  const [siswaId, setSiswaId] = useState("");
  const [karakter, setKarakter] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  const [editId, setEditId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ambilSiswa();
  }, []);

  useEffect(() => {
    ambilKarakter();
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

  async function ambilKarakter() {
    const { data, error } = await supabase
      .from("karakter_siswa")
      .select(
        "id, siswa_id, bulan, tahun, karakter, deskripsi"
      )
      .eq("bulan", bulan)
      .eq("tahun", tahun)
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      alert(
        "Gagal mengambil data karakter: " + error.message
      );
      return;
    }

    setDataKarakter(data || []);
  }

  function resetForm() {
    setSiswaId("");
    setKarakter("");
    setDeskripsi("");
    setEditId(null);
  }

  async function simpanData() {
    if (!siswaId) {
      alert("Silakan pilih nama siswa.");
      return;
    }

    if (!karakter) {
      alert("Silakan pilih karakter.");
      return;
    }

    if (!deskripsi.trim()) {
      alert("Silakan isi deskripsi penilaian.");
      return;
    }

    setSaving(true);

    try {
      if (editId !== null) {
        const { error } = await supabase
          .from("karakter_siswa")
          .update({
            siswa_id: Number(siswaId),
            bulan,
            tahun,
            karakter,
            deskripsi: deskripsi.trim(),
          })
          .eq("id", editId);

        if (error) {
          throw error;
        }

        alert("Data karakter berhasil diperbarui.");
      } else {
        const { error } = await supabase
          .from("karakter_siswa")
          .upsert(
            {
              siswa_id: Number(siswaId),
              bulan,
              tahun,
              karakter,
              deskripsi: deskripsi.trim(),
            },
            {
              onConflict:
                "siswa_id,bulan,tahun,karakter",
            }
          );

        if (error) {
          throw error;
        }

        alert("Data karakter berhasil disimpan.");
      }

      resetForm();
      await ambilKarakter();
    } catch (error: any) {
      console.error(error);

      if (error.code === "23505") {
        alert(
          "Karakter tersebut untuk siswa ini sudah ada pada bulan yang dipilih."
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

  function editData(data: Karakter) {
    setEditId(data.id);
    setSiswaId(String(data.siswa_id));
    setKarakter(data.karakter);
    setDeskripsi(data.deskripsi || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function hapusData(id: number) {
    const yakin = confirm(
      "Apakah Anda yakin ingin menghapus data karakter ini?"
    );

    if (!yakin) return;

    const { error } = await supabase
      .from("karakter_siswa")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Gagal menghapus data: " + error.message);
      return;
    }

    alert("Data karakter berhasil dihapus.");

    if (editId === id) {
      resetForm();
    }

    await ambilKarakter();
  }

  function namaSiswa(siswaId: number) {
    const data = siswa.find(
      (item) => item.id === siswaId
    );

    return data?.nama_siswa || "-";
  }

  /*
   * Membuat rekap:
   *
   * Nama Siswa | Gotong Royong | Disiplin | Tanggung Jawab
   *
   * Setiap karakter diambil dari data yang sudah disimpan.
   */
  const rekapSiswa = siswa.map((item) => {
    const dataSiswa = dataKarakter.filter(
      (data) => data.siswa_id === item.id
    );

    return {
      siswa: item,
      gotongRoyong:
        dataSiswa.find(
          (data) => data.karakter === "GOTONG ROYONG"
        )?.deskripsi || "-",

      disiplin:
        dataSiswa.find(
          (data) => data.karakter === "DISIPLIN"
        )?.deskripsi || "-",

      tanggungJawab:
        dataSiswa.find(
          (data) => data.karakter === "TANGGUNG JAWAB"
        )?.deskripsi || "-",
    };
  });

  return (
    <main className="halaman">
      <div className="container">

        {/* HEADER */}
        <div className="header">
          <div>
            <h1>Karakter Siswa</h1>

            <p>
              Kelas X Manajemen Perkantoran (MP)
            </p>
          </div>

          <button
            className="tombol-dashboard"
            onClick={() =>
              (window.location.href = "/")
            }
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
                onChange={(e) =>
                  setBulan(Number(e.target.value))
                }
              >
                {daftarBulan.map((nama, index) => (
                  <option
                    key={index + 1}
                    value={index + 1}
                  >
                    {nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Tahun</label>

              <select
                value={tahun}
                onChange={(e) =>
                  setTahun(Number(e.target.value))
                }
              >
                {Array.from(
                  { length: 7 },
                  (_, index) => {
                    const tahunPilihan =
                      new Date().getFullYear() -
                      3 +
                      index;

                    return (
                      <option
                        key={tahunPilihan}
                        value={tahunPilihan}
                      >
                        {tahunPilihan}
                      </option>
                    );
                  }
                )}
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
                  ? "Edit Karakter Siswa"
                  : "Input Karakter Siswa"}
              </h2>

              <p>
                Masukkan penilaian karakter siswa
                satu per satu.
              </p>
            </div>
          </div>

          <div className="form-grid">

            {/* SISWA */}
            <div className="field">
              <label>Nama Siswa</label>

              <select
                value={siswaId}
                onChange={(e) =>
                  setSiswaId(e.target.value)
                }
              >
                <option value="">
                  -- Pilih Nama Siswa --
                </option>

                {siswa.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.nama_siswa}
                  </option>
                ))}
              </select>
            </div>

            {/* KARAKTER */}
            <div className="field">
              <label>Karakter</label>

              <select
                value={karakter}
                onChange={(e) =>
                  setKarakter(e.target.value)
                }
              >
                <option value="">
                  -- Pilih Karakter --
                </option>

                {daftarKarakter.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* DESKRIPSI */}
            <div className="field deskripsi-field">
              <label>Deskripsi Penilaian</label>

              <textarea
                value={deskripsi}
                onChange={(e) =>
                  setDeskripsi(e.target.value)
                }
                placeholder="Contoh: Sangat baik dalam bekerja sama dengan teman."
                rows={4}
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

        {/* REKAP */}
        <section className="kartu">

          <div className="judul-daftar">
            <div>
              <h2>
                Rekap Karakter Siswa
              </h2>

              <p>
                {daftarBulan[bulan - 1]} {tahun}
              </p>
            </div>

            <div className="jumlah-data">
              {dataKarakter.length} Penilaian
            </div>
          </div>

          {loading ? (
            <div className="kosong">
              Memuat data siswa...
            </div>
          ) : siswa.length === 0 ? (
            <div className="kosong">
              Belum ada data siswa.
            </div>
          ) : (
            <>
              {/* TABEL REKAP */}
              <div className="tabel-wrapper">

                <table className="tabel-rekap">

                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama Siswa</th>
                      <th>Gotong Royong</th>
                      <th>Disiplin</th>
                      <th>Tanggung Jawab</th>
                    </tr>
                  </thead>

                  <tbody>

                    {rekapSiswa.map(
                      (item, index) => (
                        <tr key={item.siswa.id}>

                          <td>
                            {index + 1}
                          </td>

                          <td className="nama">
                            {item.siswa.nama_siswa}
                          </td>

                          <td>
                            {item.gotongRoyong}
                          </td>

                          <td>
                            {item.disiplin}
                          </td>

                          <td>
                            {item.tanggungJawab}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

              {/* DETAIL DATA */}
              <div className="detail-section">

                <h3>
                  Kelola Data Penilaian
                </h3>

                {dataKarakter.length === 0 ? (
                  <div className="kosong-kecil">
                    Belum ada penilaian yang
                    disimpan.
                  </div>
                ) : (
                  <div className="tabel-wrapper">

                    <table>

                      <thead>
                        <tr>
                          <th>No</th>
                          <th>Nama Siswa</th>
                          <th>Karakter</th>
                          <th>Deskripsi</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>

                      <tbody>

                        {dataKarakter.map(
                          (data, index) => (
                            <tr key={data.id}>

                              <td>
                                {index + 1}
                              </td>

                              <td className="nama">
                                {namaSiswa(
                                  data.siswa_id
                                )}
                              </td>

                              <td className="karakter">
                                {data.karakter}
                              </td>

                              <td>
                                {data.deskripsi ||
                                  "-"}
                              </td>

                              <td>
                                <div className="aksi">

                                  <button
                                    className="tombol-edit"
                                    onClick={() =>
                                      editData(
                                        data
                                      )
                                    }
                                  >
                                    Edit
                                  </button>

                                  <button
                                    className="tombol-hapus"
                                    onClick={() =>
                                      hapusData(
                                        data.id
                                      )
                                    }
                                  >
                                    Hapus
                                  </button>

                                </div>
                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                    </table>

                  </div>
                )}

              </div>
            </>
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
          font-weight: 600;
        }

        .tombol-dashboard {
          border: none;
          background: #111827;
          color: white;
          padding: 11px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
        }

        .kartu {
          background: white;
          border-radius: 12px;
          padding: 22px;
          margin-bottom: 20px;
          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .kartu h2 {
          margin: 0 0 18px;
          font-size: 20px;
          color: #111111;
          font-weight: 800;
        }

        .kartu h3 {
          color: #111111;
          font-size: 18px;
          margin: 0 0 15px;
        }

        .periode-grid {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);
          gap: 18px;
        }

        .form-grid {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);
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
        .field input,
        .field textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #9ca3af;
          border-radius: 8px;
          background: white;
          color: #111111;
          font-size: 15px;
          font-weight: 500;
          outline: none;
          font-family: inherit;
        }

        .field textarea {
          resize: vertical;
          min-height: 100px;
        }

        .field select:focus,
        .field input:focus,
        .field textarea:focus {
          border: 2px solid #111111;
        }

        .deskripsi-field {
          grid-column: span 2;
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
          font-weight: 500;
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
          color: white;
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
          background: white;
          color: #111111;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
        }

        .jumlah-data {
          background: #111827;
          color: white;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 800;
        }

        .tabel-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
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
          padding: 13px 10px;
          border-bottom: 1px solid #d1d5db;
          color: #111111;
          font-size: 14px;
          font-weight: 500;
          vertical-align: top;
        }

        tr:hover td {
          background: #f9fafb;
        }

        td.nama {
          font-weight: 800;
          white-space: nowrap;
        }

        td.karakter {
          font-weight: 800;
          white-space: nowrap;
        }

        .tabel-rekap {
          min-width: 1000px;
        }

        .tabel-rekap th {
          text-align: center;
        }

        .tabel-rekap th:nth-child(2) {
          text-align: left;
        }

        .tabel-rekap td {
          line-height: 1.5;
        }

        .detail-section {
          margin-top: 30px;
          padding-top: 25px;
          border-top: 2px solid #e5e7eb;
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
          color: white;
        }

        .kosong {
          text-align: center;
          padding: 45px 20px;
          color: #111111;
          font-weight: 600;
        }

        .kosong-kecil {
          padding: 20px;
          color: #111111;
          font-weight: 600;
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

          .deskripsi-field {
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