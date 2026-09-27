"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Siswa = {
  id: number;
  nisn: string | null;
  nama_siswa: string;
  jenis_kelamin: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  nama_orang_tua: string | null;
  kelas_id: number | null;
};

type Kehadiran = {
  sakit: number;
  izin: number;
  alpha: number;
};

type Perkembangan = {
  id: number;
  bulan: number;
  tahun: number;
  nilai: number | null;
  catatan: string | null;
};

type Karakter = {
  id: number;
  karakter: string;
  deskripsi: string | null;
  status_karakter: string | null;
};

type PotensiMinat = {
  deskripsi_potensi: string | null;
  deskripsi_minat: string | null;
};

type Literasi = {
  id: number;
  tanggal: string;
  semester: string;
  judul_buku: string;
  nomor_halaman: number;
  resume: string;
};

const daftarBulan = [
  { nilai: 1, nama: "Januari" },
  { nilai: 2, nama: "Februari" },
  { nilai: 3, nama: "Maret" },
  { nilai: 4, nama: "April" },
  { nilai: 5, nama: "Mei" },
  { nilai: 6, nama: "Juni" },
  { nilai: 7, nama: "Juli" },
  { nilai: 8, nama: "Agustus" },
  { nilai: 9, nama: "September" },
  { nilai: 10, nama: "Oktober" },
  { nilai: 11, nama: "November" },
  { nilai: 12, nama: "Desember" },
];

const namaBulan = (bulan: number) => {
  return (
    daftarBulan.find((item) => item.nilai === bulan)?.nama || "-"
  );
};

const formatTanggal = (tanggal: string | null) => {
  if (!tanggal) return "-";

  const date = new Date(tanggal);

  if (Number.isNaN(date.getTime())) return tanggal;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function LaporanPage() {
  const sekarang = new Date();

  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [siswaId, setSiswaId] = useState("");

  const [tahunPelajaran, setTahunPelajaran] =
    useState("2026/2027");

  const [tanggalLaporan, setTanggalLaporan] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [semester, setSemester] = useState("GANJIL");
  const [bulan, setBulan] = useState(
    sekarang.getMonth() + 1
  );

  const [dataSiswa, setDataSiswa] =
    useState<Siswa | null>(null);

  const [kehadiran, setKehadiran] =
    useState<Kehadiran | null>(null);

  const [perkembangan, setPerkembangan] =
    useState<Perkembangan[]>([]);

  const [karakter, setKarakter] =
    useState<Karakter[]>([]);

  const [potensiMinat, setPotensiMinat] =
    useState<PotensiMinat | null>(null);

  const [literasi, setLiterasi] =
    useState<Literasi[]>([]);

  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");

  // =====================================================
  // DOWNLOAD PDF
  // =====================================================

  const downloadPDF = async () => {
    const element =
      document.querySelector(".laporan-kertas");

    if (!element) {
      alert("Laporan belum tersedia.");
      return;
    }

    if (!dataSiswa) {
      alert("Silakan pilih siswa terlebih dahulu.");
      return;
    }

    try {
      setLoading(true);

      const html2canvas =
        (await import("html2canvas")).default;

      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(
        element as HTMLElement,
        {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        }
      );

      const imgData =
        canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;

      const margin = 10;
      const contentWidth =
        pageWidth - margin * 2;

      const imgWidth = contentWidth;

      const imgHeight =
        (canvas.height * imgWidth) /
        canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -=
        pageHeight - margin * 2;

      while (heightLeft > 0) {
        position =
          heightLeft -
          imgHeight +
          margin;

        pdf.addPage();

        pdf.addImage(
          imgData,
          "PNG",
          margin,
          position,
          imgWidth,
          imgHeight
        );

        heightLeft -=
          pageHeight - margin * 2;
      }

      const namaFile =
        dataSiswa.nama_siswa
          .replace(/[^a-z0-9]/gi, "_")
          .replace(/_+/g, "_");

      pdf.save(
        `Laporan_Monitoring_${namaFile}.pdf`
      );
    } catch (error) {
      console.error(
        "Gagal membuat PDF:",
        error
      );

      alert(
        "Gagal membuat PDF. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // AMBIL DATA SISWA
  // =====================================================

  useEffect(() => {
    ambilSiswa();
  }, []);

  async function ambilSiswa() {
    const { data, error } =
      await supabase
        .from("siswa")
        .select(
          "id, nisn, nama_siswa, jenis_kelamin, tempat_lahir, tanggal_lahir, nama_orang_tua, kelas_id"
        )
        .eq("kelas_id", 2)
        .order("nama_siswa", {
          ascending: true,
        });

    if (error) {
      console.error(error);
      setPesan(
        "Gagal mengambil data siswa."
      );
      return;
    }

    setSiswa(data || []);
  }

  // =====================================================
  // TAMPILKAN LAPORAN
  // =====================================================

  async function tampilkanLaporan() {
    if (!siswaId) {
      setPesan(
        "Silakan pilih siswa terlebih dahulu."
      );
      return;
    }

    setLoading(true);
    setPesan("");

    const idSiswa = Number(siswaId);

    const tahun =
      Number(
        tahunPelajaran.substring(0, 4)
      );

    const siswaTerpilih =
      siswa.find(
        (item) => item.id === idSiswa
      ) || null;

    setDataSiswa(siswaTerpilih);

    // Awal bulan
    const tanggalAwal =
      `${tahun}-${String(bulan).padStart(
        2,
        "0"
      )}-01`;

    // Awal bulan berikutnya
    const tanggalAkhirDate =
      new Date(
        tahun,
        bulan,
        1
      );

    const tanggalAkhir =
      `${tanggalAkhirDate.getFullYear()}-${String(
        tanggalAkhirDate.getMonth() + 1
      ).padStart(2, "0")}-01`;

    const [
      hasilKehadiran,
      hasilPerkembangan,
      hasilKarakter,
      hasilPotensi,
      hasilLiterasi,
    ] = await Promise.all([
      // =================================================
      // KEHADIRAN
      // =================================================

      supabase
        .from("kehadiran")
        .select(
          "sakit, izin, alpha"
        )
        .eq(
          "siswa_id",
          idSiswa
        )
        .eq(
          "bulan",
          bulan
        )
        .eq(
          "tahun",
          tahun
        )
        .maybeSingle(),

      // =================================================
      // PERKEMBANGAN BELAJAR
      // =================================================

      supabase
        .from("perkembangan_belajar")
        .select(
          "id, bulan, tahun, nilai, catatan"
        )
        .eq(
          "siswa_id",
          idSiswa
        )
        .eq(
          "bulan",
          bulan
        )
        .eq(
          "tahun",
          tahun
        )
        .order("id", {
          ascending: true,
        }),

      // =================================================
      // KARAKTER
      // =================================================

      supabase
        .from("karakter_siswa")
        .select(
          "id, karakter, deskripsi, status_karakter"
        )
        .eq(
          "siswa_id",
          idSiswa
        )
        .eq(
          "bulan",
          bulan
        )
        .eq(
          "tahun",
          tahun
        )
        .order("id", {
          ascending: true,
        }),

      // =================================================
      // POTENSI & MINAT
      // =================================================

      supabase
        .from("potensi_minat")
        .select(
          "deskripsi_potensi, deskripsi_minat"
        )
        .eq(
          "siswa_id",
          idSiswa
        )
        .order("id", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle(),

      // =================================================
      // LITERASI SISWA
      // =================================================

      supabase
        .from("literasi_siswa")
        .select(
          "id, tanggal, semester, judul_buku, nomor_halaman, resume"
        )
        .eq(
          "siswa_id",
          idSiswa
        )
        .gte(
          "tanggal",
          tanggalAwal
        )
        .lt(
          "tanggal",
          tanggalAkhir
        )
        .order("tanggal", {
          ascending: true,
        }),
    ]);

    // =====================================================
    // ERROR CHECK
    // =====================================================

    if (hasilKehadiran.error) {
      console.error(
        "Kehadiran:",
        hasilKehadiran.error
      );
    }

    if (hasilPerkembangan.error) {
      console.error(
        "Perkembangan:",
        hasilPerkembangan.error
      );
    }

    if (hasilKarakter.error) {
      console.error(
        "Karakter:",
        hasilKarakter.error
      );
    }

    if (hasilPotensi.error) {
      console.error(
        "Potensi:",
        hasilPotensi.error
      );
    }

    if (hasilLiterasi.error) {
      console.error(
        "Literasi:",
        hasilLiterasi.error
      );
    }

    // =====================================================
    // SIMPAN DATA
    // =====================================================

    setKehadiran(
      hasilKehadiran.data || null
    );

    setPerkembangan(
      hasilPerkembangan.data || []
    );

    setKarakter(
      hasilKarakter.data || []
    );

    setPotensiMinat(
      hasilPotensi.data || null
    );

    setLiterasi(
      hasilLiterasi.data || []
    );

    setLoading(false);
  }

  // =====================================================
  // DATA KARAKTER
  // =====================================================

  const karakterSudahMembudaya =
    karakter.filter(
      (item) =>
        item.status_karakter ===
        "Sudah Membudaya"
    );

  const karakterBelumMembudaya =
    karakter.filter(
      (item) =>
        item.status_karakter ===
        "Belum Membudaya"
    );

  // =====================================================
  // TAMPILAN
  // =====================================================

  return (
    <>
      <style jsx global>{`
        body {
          background: #eef3f8;
        }

        .download-area {
          max-width: 900px;
          margin: 0 auto 20px auto;
        }

        .download-button {
          background: #1d4ed8;
          color: white;
          border: none;
          padding: 12px 22px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
          font-size: 15px;
        }

        .download-button:hover {
          background: #1e40af;
        }

        .laporan-kertas {
          background: white;
          max-width: 900px;
          margin: 0 auto;
          padding: 42px;
          box-shadow: 0 8px 30px
            rgba(15, 23, 42, 0.12);
          border-radius: 12px;
          color: #111827;
        }

        .laporan-kertas > h1,
        .laporan-kertas > div:first-child {
          background: #1d4ed8;
          color: white;
          border-radius: 10px;
          padding: 20px;
        }

        .laporan-kertas h3 {
          margin-top: 28px;
          margin-bottom: 15px;
          padding: 12px 16px;
          background: #1d4ed8;
          color: white;
          border-left: 6px solid #facc15;
          border-radius: 7px;
          font-size: 17px;
          font-weight: 700;
        }

        .laporan-kertas h4 {
          margin-top: 20px;
          margin-bottom: 10px;
          padding: 10px 13px;
          background: #dcfce7;
          color: #166534;
          border-left: 5px solid #16a34a;
          border-radius: 6px;
        }

        .laporan-kertas table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .laporan-kertas th {
          background: #16a34a;
          color: white;
          font-weight: 700;
          padding: 11px;
          border-right: 1px solid #86efac;
          border-bottom: 2px solid #15803d;
          text-align: left;
        }

        .laporan-kertas td {
          background: white;
          color: #111827;
          padding: 9px 10px;
          border-right: 1px solid #d1fae5;
          border-bottom: 1px solid #d1fae5;
          vertical-align: top;
        }

        .laporan-kertas tbody tr:nth-child(even) td {
          background: #f0fdf4;
        }

        .laporan-kertas tbody tr:hover td {
          background: #dcfce7;
        }

        .laporan-kertas tr:last-child td {
          border-bottom: none;
        }

        .laporan-kertas th:last-child,
        .laporan-kertas td:last-child {
          border-right: none;
        }

        .laporan-kertas p {
          color: #111827;
        }

        .laporan-kertas strong {
          color: #111827;
        }

        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }

          body {
            background: white;
          }

          .no-print {
            display: none !important;
          }

          .laporan-kertas {
            max-width: none;
            margin: 0;
            padding: 0;
            box-shadow: none;
            border-radius: 0;
          }

          .laporan-kertas h3,
          .laporan-kertas h4,
          .laporan-kertas th {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .laporan-kertas tbody tr:nth-child(even) td {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <main
        style={{
          minHeight: "100vh",
          background: "#f5f6f8",
          padding: "30px",
          color: "#111827",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div
            style={{
              background: "#dbeafe",
              color: "#111827",
              padding: "30px",
              borderRadius: "14px",
              marginBottom: "20px",
              border: "1px solid #93c5fd",
              boxShadow:
                "0 4px 12px rgba(30, 64, 175, 0.10)",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontFamily:
                  "Arial Black, Arial, sans-serif",
                fontSize: "32px",
                fontWeight: 900,
                letterSpacing: "1px",
                color: "#000000",
                lineHeight: 1.2,
              }}
            >
              LAPORAN MONITORING
            </h1>

            <p
              style={{
                margin: "12px 0 0",
                fontFamily:
                  "Arial, sans-serif",
                fontSize: "17px",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              WALI KELAS X MANAJEMEN PERKANTORAN
            </p>

            <p
              style={{
                margin: "5px 0 0",
                fontFamily:
                  "Arial, sans-serif",
                fontSize: "16px",
                fontWeight: 600,
                color: "#111827",
              }}
            >
              SMK NEGERI 1 BULIK TIMUR
            </p>
          </div>

          {/* =====================================================
              PENGATURAN LAPORAN
          ===================================================== */}

          <section
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "14px",
              marginBottom: "20px",
              border: "1px solid #d1d5db",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              Pengaturan Laporan
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "15px",
              }}
            >

              {/* SISWA */}

              <div>
                <label>
                  <strong>Nama Siswa</strong>
                </label>

                <select
                  value={siswaId}
                  onChange={(e) =>
                    setSiswaId(e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "11px",
                    marginTop: "6px",
                    color: "#111827",
                    background: "white",
                    border:
                      "1px solid #9ca3af",
                    borderRadius: "8px",
                  }}
                >
                  <option value="">
                    -- Pilih Siswa --
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

              {/* TANGGAL LAPORAN */}

              <div>
                <label>
                  <strong>
                    Tanggal Laporan
                  </strong>
                </label>

                <input
                  type="date"
                  value={tanggalLaporan}
                  onChange={(e) =>
                    setTanggalLaporan(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "11px",
                    marginTop: "6px",
                    color: "#111827",
                    background: "white",
                    border:
                      "1px solid #9ca3af",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* TAHUN */}

              <div>
                <label>
                  <strong>
                    Tahun Pelajaran
                  </strong>
                </label>

                <input
                  type="text"
                  value={tahunPelajaran}
                  onChange={(e) =>
                    setTahunPelajaran(
                      e.target.value
                    )
                  }
                  placeholder="Contoh: 2026/2027"
                  style={{
                    width: "100%",
                    padding: "11px",
                    marginTop: "6px",
                    color: "#111827",
                    background: "white",
                    border:
                      "1px solid #9ca3af",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* SEMESTER */}

              <div>
                <label>
                  <strong>Semester</strong>
                </label>

                <select
                  value={semester}
                  onChange={(e) =>
                    setSemester(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "11px",
                    marginTop: "6px",
                    color: "#111827",
                    background: "white",
                    border:
                      "1px solid #9ca3af",
                    borderRadius: "8px",
                  }}
                >
                  <option value="GANJIL">
                    GANJIL
                  </option>

                  <option value="GENAP">
                    GENAP
                  </option>
                </select>
              </div>

              {/* BULAN */}

              <div>
                <label>
                  <strong>Bulan</strong>
                </label>

                <select
                  value={bulan}
                  onChange={(e) =>
                    setBulan(
                      Number(e.target.value)
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "11px",
                    marginTop: "6px",
                    color: "#111827",
                    background: "white",
                    border:
                      "1px solid #9ca3af",
                    borderRadius: "8px",
                  }}
                >
                  {daftarBulan.map(
                    (item) => (
                      <option
                        key={item.nilai}
                        value={item.nilai}
                      >
                        {item.nama}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <button
              onClick={tampilkanLaporan}
              disabled={loading}
              style={{
                marginTop: "20px",
                padding: "12px 22px",
                background: "#111827",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {loading
                ? "Memuat..."
                : "Tampilkan Laporan"}
            </button>

            {pesan && (
              <p
                style={{
                  color: "#b91c1c",
                  fontWeight: "bold",
                }}
              >
                {pesan}
              </p>
            )}
          </section>

          {/* =====================================================
              LAPORAN
          ===================================================== */}

          {dataSiswa && (
            <>
              <div
                className="no-print download-area"
              >
                <button
                  onClick={downloadPDF}
                  className="download-button"
                >
                  ⬇ Download PDF
                </button>
              </div>

              <div className="laporan-kertas">

                {/* HEADER PDF */}

                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "25px",
                    background: "#dbeafe",
                    padding:
                      "28px 20px",
                    borderRadius: "12px",
                    border:
                      "1px solid #93c5fd",
                  }}
                >
                  <h2
                    style={{
                      margin:
                        "0 0 10px 0",
                      fontFamily:
                        "Arial Black, Arial, sans-serif",
                      fontSize: "32px",
                      fontWeight: 900,
                      color: "#000000",
                      letterSpacing: "1px",
                    }}
                  >
                    LAPORAN MONITORING
                  </h2>

                  <div
                    style={{
                      fontFamily:
                        "Arial, sans-serif",
                      fontSize: "17px",
                      lineHeight: "1.7",
                      color: "#111827",
                    }}
                  >
                    <strong>
                      WALI KELAS X MANAJEMEN PERKANTORAN
                    </strong>

                    <br />

                    <strong>
                      SMK NEGERI 1 BULIK TIMUR
                    </strong>

                    <br />

                    <strong>
                      TAHUN PELAJARAN{" "}
                      {tahunPelajaran}
                    </strong>
                  </div>
                </div>

                <hr
                  style={{
                    border: "none",
                    borderTop:
                      "2px solid #16a34a",
                    margin:
                      "0 0 25px 0",
                  }}
                />

                {/* =================================================
                    IDENTITAS SISWA
                ================================================= */}

                <div
                  style={{
                    marginTop: "20px",
                  }}
                >
                  <h3>
                    IDENTITAS SISWA
                  </h3>

                  <table>
                    <tbody>
                      <tr>
                        <td
                          style={{
                            padding: "7px",
                            width: "220px",
                          }}
                        >
                          Nama
                        </td>

                        <td
                          style={{
                            padding: "7px",
                          }}
                        >
                          :{" "}
                          {dataSiswa.nama_siswa}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style={{
                            padding: "7px",
                          }}
                        >
                          NISN
                        </td>

                        <td
                          style={{
                            padding: "7px",
                          }}
                        >
                          :{" "}
                          {dataSiswa.nisn ||
                            "-"}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style={{
                            padding: "7px",
                          }}
                        >
                          Jenis Kelamin
                        </td>

                        <td
                          style={{
                            padding: "7px",
                          }}
                        >
                          :{" "}
                          {dataSiswa.jenis_kelamin ||
                            "-"}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style={{
                            padding: "7px",
                          }}
                        >
                          Tempat/Tanggal Lahir
                        </td>

                        <td
                          style={{
                            padding: "7px",
                          }}
                        >
                          :{" "}
                          {dataSiswa.tempat_lahir ||
                            "-"}
                          ,{" "}
                          {formatTanggal(
                            dataSiswa.tanggal_lahir
                          )}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style={{
                            padding: "7px",
                          }}
                        >
                          Nama Orang Tua
                        </td>

                        <td
                          style={{
                            padding: "7px",
                          }}
                        >
                          :{" "}
                          {dataSiswa.nama_orang_tua ||
                            "-"}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style={{
                            padding: "7px",
                          }}
                        >
                          Kelas
                        </td>

                        <td
                          style={{
                            padding: "7px",
                          }}
                        >
                          : X Manajemen
                          Perkantoran
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* =================================================
                    KEHADIRAN
                ================================================= */}

                <div
                  style={{
                    marginTop: "30px",
                  }}
                >
                  <h3>
                    KEHADIRAN —{" "}
                    {namaBulan(
                      bulan
                    )}{" "}
                    {tahunPelajaran.substring(
                      0,
                      4
                    )}
                  </h3>

                  <table>
                    <thead>
                      <tr>
                        <th>Sakit</th>
                        <th>Izin</th>
                        <th>Alpha</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td
                          style={{
                            textAlign:
                              "center",
                          }}
                        >
                          {kehadiran?.sakit ??
                            0}
                        </td>

                        <td
                          style={{
                            textAlign:
                              "center",
                          }}
                        >
                          {kehadiran?.izin ??
                            0}
                        </td>

                        <td
                          style={{
                            textAlign:
                              "center",
                          }}
                        >
                          {kehadiran?.alpha ??
                            0}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* =================================================
                    PERKEMBANGAN BELAJAR
                ================================================= */}

                <div
                  style={{
                    marginTop: "30px",
                  }}
                >
                  <h3>
                    PERKEMBANGAN BELAJAR
                  </h3>

                  <table>
                    <thead>
                      <tr>
                        <th>No</th>

                        <th>
                          Mata Pelajaran
                        </th>

                        <th>
                          Nilai
                        </th>

                        <th>
                          Catatan Wali Kelas
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {perkembangan.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            style={{
                              textAlign:
                                "center",
                            }}
                          >
                            Belum ada data
                            perkembangan
                            belajar.
                          </td>
                        </tr>
                      ) : (
                        perkembangan.map(
                          (
                            item,
                            index
                          ) => (
                            <tr
                              key={
                                item.id
                              }
                            >
                              <td
                                style={{
                                  textAlign:
                                    "center",
                                }}
                              >
                                {index + 1}
                              </td>

                              <td>
                                Data mata
                                pelajaran
                              </td>

                              <td
                                style={{
                                  textAlign:
                                    "center",
                                }}
                              >
                                {item.nilai ??
                                  "-"}
                              </td>

                              <td>
                                {item.catatan ||
                                  "-"}
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* =================================================
                    LITERASI SISWA
                ================================================= */}

                <div
                  style={{
                    marginTop: "30px",
                  }}
                >
                  <h3>
                    LITERASI SISWA
                  </h3>

                  <table>
                    <thead>
                      <tr>
                        <th
                          style={{
                            width: "45px",
                            textAlign:
                              "center",
                          }}
                        >
                          No
                        </th>

                        <th
                          style={{
                            width: "115px",
                          }}
                        >
                          Tanggal
                        </th>

                        <th
                          style={{
                            width: "80px",
                          }}
                        >
                          Semester
                        </th>

                        <th>
                          Judul Buku
                        </th>

                        <th
                          style={{
                            width: "80px",
                            textAlign:
                              "center",
                          }}
                        >
                          Halaman
                        </th>

                        <th>
                          Resume
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {literasi.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            style={{
                              textAlign:
                                "center",
                            }}
                          >
                            Belum ada data
                            literasi siswa
                            pada bulan ini.
                          </td>
                        </tr>
                      ) : (
                        literasi.map(
                          (
                            item,
                            index
                          ) => (
                            <tr
                              key={
                                item.id
                              }
                            >
                              <td
                                style={{
                                  textAlign:
                                    "center",
                                }}
                              >
                                {index + 1}
                              </td>

                              <td>
                                {formatTanggal(
                                  item.tanggal
                                )}
                              </td>

                              <td>
                                {item.semester ||
                                  "-"}
                              </td>

                              <td>
                                <strong>
                                  {
                                    item.judul_buku
                                  }
                                </strong>
                              </td>

                              <td
                                style={{
                                  textAlign:
                                    "center",
                                }}
                              >
                                {
                                  item.nomor_halaman
                                }
                              </td>

                              <td
                                style={{
                                  whiteSpace:
                                    "pre-wrap",
                                  lineHeight:
                                    "1.5",
                                }}
                              >
                                {item.resume ||
                                  "-"}
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* =================================================
                    KARAKTER
                ================================================= */}

                <div
                  style={{
                    marginTop: "30px",
                  }}
                >
                  <h3>
                    KARAKTER
                  </h3>

                  <h4>
                    Karakter yang
                    Sudah Membudaya
                  </h4>

                  <table>
                    <thead>
                      <tr>
                        <th>
                          Karakter
                        </th>

                        <th>
                          Deskripsi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {karakterSudahMembudaya.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan={2}
                            style={{
                              textAlign:
                                "center",
                            }}
                          >
                            Belum ada data.
                          </td>
                        </tr>
                      ) : (
                        karakterSudahMembudaya.map(
                          (item) => (
                            <tr
                              key={
                                item.id
                              }
                            >
                              <td>
                                {
                                  item.karakter
                                }
                              </td>

                              <td>
                                {item.deskripsi ||
                                  "-"}
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>

                  <h4
                    style={{
                      marginTop:
                        "20px",
                    }}
                  >
                    Karakter yang
                    Belum Membudaya
                  </h4>

                  <table>
                    <thead>
                      <tr>
                        <th>
                          Karakter
                        </th>

                        <th>
                          Deskripsi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {karakterBelumMembudaya.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan={2}
                            style={{
                              textAlign:
                                "center",
                            }}
                          >
                            Belum ada data.
                          </td>
                        </tr>
                      ) : (
                        karakterBelumMembudaya.map(
                          (item) => (
                            <tr
                              key={
                                item.id
                              }
                            >
                              <td>
                                {
                                  item.karakter
                                }
                              </td>

                              <td>
                                {item.deskripsi ||
                                  "-"}
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* =================================================
                    POTENSI & MINAT
                ================================================= */}

                <div
                  style={{
                    marginTop: "30px",
                  }}
                >
                  <h3>
                    POTENSI & MINAT
                  </h3>

                  <table>
                    <tbody>
                      <tr>
                        <td
                          style={{
                            width: "220px",
                            fontWeight:
                              "bold",
                          }}
                        >
                          Potensi Diri Siswa
                        </td>

                        <td>
                          {potensiMinat?.deskripsi_potensi ||
                            "-"}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style={{
                            fontWeight:
                              "bold",
                          }}
                        >
                          Minat Siswa
                        </td>

                        <td>
                          {potensiMinat?.deskripsi_minat ||
                            "-"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* =================================================
                    TANDA TANGAN
                ================================================= */}

                <div
                  style={{
                    marginTop: "60px",
                    display: "flex",
                    justifyContent:
                      "flex-end",
                  }}
                >
                  <div
                    style={{
                      textAlign:
                        "center",
                      width: "300px",
                    }}
                  >
                    <p>
                      Bukit Jaya,{" "}
                      {tanggalLaporan
                        ? new Date(
                            `${tanggalLaporan}T00:00:00`
                          ).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "__________________"}
                    </p>

                    <p>
                      Wali Kelas
                    </p>

                    <div
                      style={{
                        height: "80px",
                      }}
                    />

                    <strong>
                      Sumarno, S.Pd.I
                    </strong>

                    <br />

                    <span>
                      NIP.
                      19831806202221009
                    </span>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}