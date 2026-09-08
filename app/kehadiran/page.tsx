"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Siswa = {
  id: number;
  nisn: string;
  nama_siswa: string;
};

type Kehadiran = {
  siswa_id: number;
  sakit: number;
  izin: number;
  alpha: number;
};

export default function KehadiranPage() {
  const router = useRouter();

  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [kehadiran, setKehadiran] = useState<Record<number, Kehadiran>>({});
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const namaBulan = [
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

  useEffect(() => {
    async function checkLogin() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/admin");
        return;
      }

      loadData();
    }

    checkLogin();
  }, [router, bulan, tahun]);

  async function loadData() {
    setLoading(true);

    const { data: siswaData, error: siswaError } = await supabase
      .from("siswa")
      .select("id, nisn, nama_siswa")
      .eq("kelas_id", 2)
      .order("nama_siswa", { ascending: true });

    if (siswaError) {
      alert("Gagal mengambil data siswa: " + siswaError.message);
      setLoading(false);
      return;
    }

    setSiswa(siswaData || []);

    const { data: kehadiranData, error: kehadiranError } = await supabase
      .from("kehadiran")
      .select("siswa_id, sakit, izin, alpha")
      .eq("bulan", bulan)
      .eq("tahun", tahun);

    if (kehadiranError) {
      alert("Gagal mengambil data kehadiran: " + kehadiranError.message);
      setLoading(false);
      return;
    }

    const dataMap: Record<number, Kehadiran> = {};

    (siswaData || []).forEach((item) => {
      dataMap[item.id] = {
        siswa_id: item.id,
        sakit: 0,
        izin: 0,
        alpha: 0,
      };
    });

    (kehadiranData || []).forEach((item) => {
      dataMap[item.siswa_id] = {
        siswa_id: item.siswa_id,
        sakit: item.sakit || 0,
        izin: item.izin || 0,
        alpha: item.alpha || 0,
      };
    });

    setKehadiran(dataMap);
    setLoading(false);
  }

  function ubahJumlah(
    siswaId: number,
    field: "sakit" | "izin" | "alpha",
    value: string
  ) {
    const jumlah = Math.max(0, Number(value) || 0);

    setKehadiran((prev) => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        siswa_id: siswaId,
        [field]: jumlah,
      },
    }));
  }

  async function simpanSemua() {
    setSaving(true);

    const dataSimpan = siswa.map((item) => {
      const data = kehadiran[item.id] || {
        siswa_id: item.id,
        sakit: 0,
        izin: 0,
        alpha: 0,
      };

      return {
        siswa_id: item.id,
        bulan,
        tahun,
        sakit: data.sakit,
        izin: data.izin,
        alpha: data.alpha,
      };
    });

    const { error } = await supabase
      .from("kehadiran")
      .upsert(dataSimpan, {
        onConflict: "siswa_id,bulan,tahun",
      });

    if (error) {
      alert("Gagal menyimpan data kehadiran: " + error.message);
      setSaving(false);
      return;
    }

    alert("Rekap kehadiran berhasil disimpan.");
    setSaving(false);
    loadData();
  }

  return (
    <main className="page">
      <div className="container">
        <div className="header">
          <div>
            <button
              className="backButton"
              onClick={() => router.push("/")}
            >
              ← Kembali ke Dashboard
            </button>

            <h1>📋 Kehadiran Siswa</h1>

            <p>
              Rekap ketidakhadiran Kelas X Manajemen Perkantoran (MP)
            </p>
          </div>
        </div>

        <section className="filterCard">
          <div>
            <label>Bulan</label>

            <select
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
            >
              {namaBulan.map((nama, index) => (
                <option key={index + 1} value={index + 1}>
                  {nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Tahun</label>

            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
            >
              {[2026, 2027, 2028, 2029, 2030].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="periode">
            Periode: <b>{namaBulan[bulan - 1]} {tahun}</b>
          </div>
        </section>

        <section className="tableCard">
          {loading ? (
            <div className="loading">Memuat data kehadiran...</div>
          ) : siswa.length === 0 ? (
            <div className="empty">
              Belum ada data siswa.
            </div>
          ) : (
            <>
              <div className="tableWrapper">
                <table>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>NISN</th>
                      <th>Nama Siswa</th>
                      <th>Sakit</th>
                      <th>Izin</th>
                      <th>Alpha</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {siswa.map((item, index) => {
                      const data = kehadiran[item.id] || {
                        siswa_id: item.id,
                        sakit: 0,
                        izin: 0,
                        alpha: 0,
                      };

                      const total =
                        data.sakit + data.izin + data.alpha;

                      return (
                        <tr key={item.id}>
                          <td>{index + 1}</td>

                          <td>{item.nisn}</td>

                          <td className="name">
                            {item.nama_siswa}
                          </td>

                          <td>
                            <input
                              type="number"
                              min="0"
                              value={data.sakit}
                              onChange={(e) =>
                                ubahJumlah(
                                  item.id,
                                  "sakit",
                                  e.target.value
                                )
                              }
                            />
                          </td>

                          <td>
                            <input
                              type="number"
                              min="0"
                              value={data.izin}
                              onChange={(e) =>
                                ubahJumlah(
                                  item.id,
                                  "izin",
                                  e.target.value
                                )
                              }
                            />
                          </td>

                          <td>
                            <input
                              type="number"
                              min="0"
                              value={data.alpha}
                              onChange={(e) =>
                                ubahJumlah(
                                  item.id,
                                  "alpha",
                                  e.target.value
                                )
                              }
                            />
                          </td>

                          <td className="total">
                            {total}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="actions">
                <button
                  className="saveButton"
                  onClick={simpanSemua}
                  disabled={saving}
                >
                  {saving
                    ? "Menyimpan..."
                    : "💾 Simpan Rekap Kehadiran"}
                </button>
              </div>
            </>
          )}
        </section>

        <footer>
          Sistem Monitoring Siswa · Kelas X MP · 2026/2027
        </footer>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background: #f4f7f5;
          font-family: Arial, Helvetica, sans-serif;
          color: #17221d;
          padding: 35px;
        }

        .container {
          max-width: 1450px;
          margin: auto;
        }

        .header {
          margin-bottom: 25px;
        }

        .backButton {
          border: none;
          background: transparent;
          color: #23845a;
          font-size: 12px;
          cursor: pointer;
          padding: 0;
          margin-bottom: 12px;
        }

        .backButton:hover {
          text-decoration: underline;
        }

        h1 {
          margin: 0;
          font-size: 30px;
          color: #173d2c;
        }

        .header p {
          margin: 7px 0 0;
          color: #75827b;
          font-size: 13px;
        }

        .filterCard {
          background: white;
          border: 1px solid #e8efeb;
          border-radius: 18px;
          padding: 22px;
          margin-bottom: 20px;
          display: flex;
          align-items: flex-end;
          gap: 18px;
          box-shadow: 0 7px 25px rgba(0, 0, 0, 0.04);
        }

        label {
          display: block;
          margin-bottom: 7px;
          font-size: 11px;
          font-weight: 700;
          color: #405047;
        }

        select {
          border: 1px solid #dce6e0;
          border-radius: 9px;
          padding: 11px 14px;
          background: #fbfdfc;
          font-size: 13px;
          color: #17221d;
        }

        .periode {
          margin-left: auto;
          font-size: 12px;
          color: #68766f;
        }

        .tableCard {
          background: white;
          border-radius: 20px;
          border: 1px solid #e8efeb;
          overflow: hidden;
          box-shadow: 0 7px 25px rgba(0, 0, 0, 0.04);
        }

        .tableWrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 850px;
        }

        th {
          background: #f4f8f5;
          color: #64736b;
          font-size: 10px;
          text-align: left;
          padding: 14px 12px;
          white-space: nowrap;
        }

        td {
          padding: 12px;
          border-top: 1px solid #edf1ee;
          font-size: 11px;
          color: #526159;
        }

        td.name {
          color: #1d392c;
          font-weight: 700;
          white-space: nowrap;
        }

        td input {
          width: 70px;
          border: 1px solid #dce6e0;
          border-radius: 8px;
          padding: 9px;
          text-align: center;
          font-size: 12px;
          color: #000000;
          background: white;
        }

        td input:focus {
          outline: none;
          border-color: #4db383;
        }

        .total {
          font-weight: 700;
          color: #1f9d65;
          font-size: 13px;
        }

        .actions {
          padding: 18px 20px;
          border-top: 1px solid #edf1ee;
          display: flex;
          justify-content: flex-end;
        }

        .saveButton {
          border: none;
          background: #1f9d65;
          color: white;
          padding: 12px 20px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .saveButton:hover {
          background: #188653;
        }

        .saveButton:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading,
        .empty {
          text-align: center;
          padding: 70px 20px;
          color: #87938d;
          font-size: 13px;
        }

        footer {
          text-align: center;
          color: #9ba59f;
          font-size: 10px;
          margin: 35px 0 10px;
        }

        @media (max-width: 700px) {
          .page {
            padding: 20px;
          }

          .filterCard {
            flex-direction: column;
            align-items: stretch;
          }

          .periode {
            margin-left: 0;
          }
        }
      `}</style>
    </main>
  );
}