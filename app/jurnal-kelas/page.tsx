"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Jurnal = {
  id: number;
  hari: string;
  mata_pelajaran: string;
  keterangan: string;
  created_at: string;
};

const hariList = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jum'at",
];

const mataPelajaran = [
  "Agama",
  "PKN",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "Matematika",
  "Projek IPAS",
  "Informatika",
  "Seni Budaya",
  "Sejarah",
  "PJOK",
  "DMPLB",
  "KOKURIKULER",
];

const keteranganList = [
  "Kegiatan Belajar Mengajar oleh Guru",
  "Diberi Tugas",
  "Jam Kosong",
];

export default function JurnalKelasPage() {
  const router = useRouter();

  const [hari, setHari] = useState("");
  const [mataPelajaranValue, setMataPelajaranValue] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [jurnal, setJurnal] = useState<Jurnal[]>([]);
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");

  async function ambilJurnal() {
    const { data, error } = await supabase
      .from("jurnal_kelas")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setPesan("Gagal mengambil data jurnal.");
      return;
    }

    setJurnal(data || []);
  }

  useEffect(() => {
    ambilJurnal();
  }, []);

  async function simpanJurnal(e: React.FormEvent) {
    e.preventDefault();

    if (!hari || !mataPelajaranValue || !keterangan) {
      setPesan("Silakan lengkapi semua data.");
      return;
    }

    setLoading(true);
    setPesan("");

    const { error } = await supabase
      .from("jurnal_kelas")
      .insert([
        {
          hari,
          mata_pelajaran: mataPelajaranValue,
          keterangan,
        },
      ]);

    setLoading(false);

    if (error) {
      console.error(error);
      setPesan("Jurnal gagal disimpan.");
      return;
    }

    setHari("");
    setMataPelajaranValue("");
    setKeterangan("");
    setPesan("Jurnal berhasil disimpan.");

    await ambilJurnal();
  }

  async function hapusJurnal(id: number) {
    const yakin = window.confirm("Hapus jurnal ini?");

    if (!yakin) return;

    const { error } = await supabase
      .from("jurnal_kelas")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setPesan("Jurnal gagal dihapus.");
      return;
    }

    setPesan("Jurnal berhasil dihapus.");
    await ambilJurnal();
  }

  return (
  <main
    style={{
      minHeight: "100vh",
      background: "#f5f7fa",
      padding: "30px 20px",
    }}
  >
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >

      {/* TOMBOL KEMBALI */}
      <button
        onClick={() => router.push("/")}
        style={{
          background: "#111",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "10px 16px",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        ← Kembali ke Dashboard
      </button>

      {/* HEADER */}
      <div style={{ marginBottom: "25px" }}>
        <div
          style={{
            fontSize: "14px",
            color: "#555",
            marginBottom: "8px",
          }}
        >
          Dashboard / Jurnal Kelas
        </div>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              color: "#111",
            }}
          >
            Jurnal Kelas
          </h1>

          <p
            style={{
              color: "#555",
              marginTop: "8px",
            }}
          >
            Catatan kegiatan pembelajaran kelas X MP
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={simpanJurnal}
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "14px",
            boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
            marginBottom: "30px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#111",
              fontSize: "21px",
            }}
          >
            Input Jurnal Kelas
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "18px",
            }}
          >
            {/* HARI */}
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  color: "#111",
                  marginBottom: "7px",
                }}
              >
                Hari
              </label>

              <select
                value={hari}
                onChange={(e) => setHari(e.target.value)}
                style={inputStyle}
              >
                <option value="">Pilih Hari</option>

                {hariList.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* MATA PELAJARAN */}
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  color: "#111",
                  marginBottom: "7px",
                }}
              >
                Mata Pelajaran
              </label>

              <select
                value={mataPelajaranValue}
                onChange={(e) =>
                  setMataPelajaranValue(e.target.value)
                }
                style={inputStyle}
              >
                <option value="">Pilih Mata Pelajaran</option>

                {mataPelajaran.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* KETERANGAN */}
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  color: "#111",
                  marginBottom: "7px",
                }}
              >
                Keterangan
              </label>

              <select
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                style={inputStyle}
              >
                <option value="">Pilih Keterangan</option>

                {keteranganList.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "22px",
              background: loading ? "#999" : "#111",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "12px 25px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Menyimpan..." : "Simpan Jurnal"}
          </button>

          {pesan && (
            <p
              style={{
                marginTop: "15px",
                color: "#111",
                fontWeight: 600,
              }}
            >
              {pesan}
            </p>
          )}
        </form>

        {/* DAFTAR JURNAL */}
        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "14px",
            boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#111",
              fontSize: "21px",
            }}
          >
            Daftar Input Jurnal Kelas
          </h2>

          {jurnal.length === 0 ? (
            <p style={{ color: "#555" }}>
              Belum ada jurnal kelas.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "700px",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>No</th>
                    <th style={thStyle}>Hari</th>
                    <th style={thStyle}>Mata Pelajaran</th>
                    <th style={thStyle}>Keterangan</th>
                    <th style={thStyle}>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {jurnal.map((item, index) => (
                    <tr key={item.id}>
                      <td style={tdStyle}>{index + 1}</td>
                      <td style={tdStyle}>{item.hari}</td>
                      <td style={tdStyle}>
                        {item.mata_pelajaran}
                      </td>
                      <td style={tdStyle}>{item.keterangan}</td>

                      <td style={tdStyle}>
                        <button
                          onClick={() => hapusJurnal(item.id)}
                          style={{
                            background: "#c62828",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "7px 12px",
                            cursor: "pointer",
                          }}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #bbb",
  borderRadius: "8px",
  background: "#fff",
  color: "#111",
  fontSize: "15px",
};

const thStyle: React.CSSProperties = {
  borderBottom: "2px solid #ddd",
  padding: "12px 10px",
  textAlign: "left",
  color: "#111",
  fontSize: "14px",
  background: "#f5f5f5",
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #e5e5e5",
  padding: "12px 10px",
  color: "#111",
  fontSize: "14px",
};