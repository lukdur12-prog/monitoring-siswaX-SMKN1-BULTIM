"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Kepuasan = {
  id: number;
  tanggal: string;
  mata_pelajaran: string;
  kepuasan: string;
  created_at: string;
};

const mataPelajaran = [
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

const pilihanKepuasan = [
  "Sangat Memuaskan",
  "Memuaskan",
  "Kurang Memuaskan",
  "Sangat Kurang Memuaskan",
];

export default function KepuasanBelajarPage() {
  const router = useRouter();

  const [tanggal, setTanggal] = useState("");
  const [mataPelajaranValue, setMataPelajaranValue] = useState("");
  const [kepuasan, setKepuasan] = useState("");

  const [dataKepuasan, setDataKepuasan] = useState<Kepuasan[]>([]);
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");

  async function ambilData() {
    const { data, error } = await supabase
      .from("kepuasan_belajar")
      .select("*")
      .order("tanggal", { ascending: false })
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setPesan("Gagal mengambil data kepuasan belajar.");
      return;
    }

    setDataKepuasan(data || []);
  }

  useEffect(() => {
    ambilData();
  }, []);

  async function simpanData(e: React.FormEvent) {
    e.preventDefault();

    if (!tanggal || !mataPelajaranValue || !kepuasan) {
      setPesan("Silakan lengkapi semua data terlebih dahulu.");
      return;
    }

    setLoading(true);
    setPesan("");

    const { error } = await supabase
      .from("kepuasan_belajar")
      .insert([
        {
          tanggal,
          mata_pelajaran: mataPelajaranValue,
          kepuasan,
        },
      ]);

    setLoading(false);

    if (error) {
      console.error(error);
      setPesan("Data kepuasan belajar gagal disimpan.");
      return;
    }

    setTanggal("");
    setMataPelajaranValue("");
    setKepuasan("");

    setPesan("Data kepuasan belajar berhasil disimpan.");

    await ambilData();
  }

  async function hapusData(id: number) {
    const yakin = window.confirm(
      "Apakah Anda yakin ingin menghapus data ini?"
    );

    if (!yakin) return;

    const { error } = await supabase
      .from("kepuasan_belajar")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setPesan("Data gagal dihapus.");
      return;
    }

    setPesan("Data berhasil dihapus.");

    await ambilData();
  }

  function formatTanggal(tanggalValue: string) {
    if (!tanggalValue) return "-";

    const tanggal = new Date(`${tanggalValue}T00:00:00`);

    return tanggal.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
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
        {/* KEMBALI */}
        <button
          type="button"
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
            Dashboard / Kepuasan Belajar
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              color: "#111",
            }}
          >
            Kepuasan Belajar
          </h1>

          <p
            style={{
              color: "#555",
              marginTop: "8px",
              marginBottom: 0,
            }}
          >
            Catatan kepuasan siswa terhadap kegiatan pembelajaran kelas X MP
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={simpanData}
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            marginBottom: "30px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "20px",
              color: "#111",
              fontSize: "20px",
            }}
          >
            Input Kepuasan Belajar
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "18px",
            }}
          >
            {/* TANGGAL */}
            <div>
              <label style={labelStyle}>
                Hari dan Tanggal
              </label>

              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* MATA PELAJARAN */}
            <div>
              <label style={labelStyle}>
                Mata Pelajaran
              </label>

              <select
                value={mataPelajaranValue}
                onChange={(e) =>
                  setMataPelajaranValue(e.target.value)
                }
                style={inputStyle}
              >
                <option value="">
                  Pilih Mata Pelajaran
                </option>

                {mataPelajaran.map((mapel) => (
                  <option key={mapel} value={mapel}>
                    {mapel}
                  </option>
                ))}
              </select>
            </div>

            {/* KEPUASAN */}
            <div>
              <label style={labelStyle}>
                Kepuasan Belajar
              </label>

              <select
                value={kepuasan}
                onChange={(e) => setKepuasan(e.target.value)}
                style={inputStyle}
              >
                <option value="">
                  Pilih Tingkat Kepuasan
                </option>

                {pilihanKepuasan.map((pilihan) => (
                  <option key={pilihan} value={pilihan}>
                    {pilihan}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SIMPAN */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "22px",
              background: loading ? "#777" : "#111",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "11px 20px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>

          {pesan && (
            <div
              style={{
                marginTop: "15px",
                padding: "11px 14px",
                borderRadius: "8px",
                background: "#f0f0f0",
                color: "#111",
                fontSize: "14px",
              }}
            >
              {pesan}
            </div>
          )}
        </form>

        {/* REKAP */}
        <section
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "20px",
              color: "#111",
              fontSize: "20px",
            }}
          >
            Rekap Kepuasan Belajar
          </h2>

          {dataKepuasan.length === 0 ? (
            <div
              style={{
                padding: "25px",
                textAlign: "center",
                color: "#666",
                border: "1px dashed #ccc",
                borderRadius: "8px",
              }}
            >
              Belum ada data kepuasan belajar.
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "700px",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>No.</th>
                    <th style={thStyle}>Hari dan Tanggal</th>
                    <th style={thStyle}>Mata Pelajaran</th>
                    <th style={thStyle}>Kepuasan Belajar</th>
                    <th style={thStyle}>Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {dataKepuasan.map((item, index) => (
                    <tr key={item.id}>
                      <td style={tdStyle}>
                        {index + 1}
                      </td>

                      <td style={tdStyle}>
                        {formatTanggal(item.tanggal)}
                      </td>

                      <td style={tdStyle}>
                        {item.mata_pelajaran}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            background: "#f1f1f1",
                            color: "#111",
                            fontWeight: 600,
                            fontSize: "13px",
                          }}
                        >
                          {item.kepuasan}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <button
                          type="button"
                          onClick={() => hapusData(item.id)}
                          style={{
                            background: "#111",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "7px 12px",
                            cursor: "pointer",
                            fontSize: "13px",
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
        </section>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "7px",
  color: "#111",
  fontSize: "14px",
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #bbb",
  borderRadius: "8px",
  background: "#fff",
  color: "#111",
  fontSize: "15px",
  outline: "none",
};

const thStyle: React.CSSProperties = {
  borderBottom: "2px solid #ddd",
  padding: "12px 10px",
  textAlign: "left",
  color: "#111",
  fontSize: "14px",
  background: "#f5f5f5",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #e5e5e5",
  padding: "12px 10px",
  color: "#111",
  fontSize: "14px",
  verticalAlign: "middle",
};