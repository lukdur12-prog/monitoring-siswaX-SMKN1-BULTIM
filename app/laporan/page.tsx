
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

type Kepuasan = {
  tanggal: string;
  mata_pelajaran: string | null;
  kepuasan: string | null;
};

type Jurnal = {
  id: number;
  tanggal: string | null;
  hari: string | null;
  mata_pelajaran: string | null;
  keterangan: string | null;
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
  return daftarBulan.find((item) => item.nilai === bulan)?.nama || "-";
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

  const [tahunPelajaran, setTahunPelajaran] = useState("2026/2027");
  const [tanggalLaporan, setTanggalLaporan] = useState(
  new Date().toISOString().split("T")[0]
);
  const [semester, setSemester] = useState("GANJIL");
  const [bulan, setBulan] = useState(sekarang.getMonth() + 1);

  const [dataSiswa, setDataSiswa] = useState<Siswa | null>(null);
  const [kehadiran, setKehadiran] = useState<Kehadiran | null>(null);
  const [perkembangan, setPerkembangan] = useState<Perkembangan[]>([]);
  const [karakter, setKarakter] = useState<Karakter[]>([]);
  const [potensiMinat, setPotensiMinat] = useState<PotensiMinat | null>(null);
  const [kepuasan, setKepuasan] = useState<Kepuasan[]>([]);
  const [jurnal, setJurnal] = useState<Jurnal[]>([]);

  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");
    const downloadPDF = async () => {
    const element = document.querySelector(".laporan-kertas");

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

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;

      const margin = 10;
      const contentWidth = pageWidth - margin * 2;

      const imgWidth = contentWidth;
      const imgHeight =
        (canvas.height * imgWidth) / canvas.width;

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

      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;

        pdf.addPage();

        pdf.addImage(
          imgData,
          "PNG",
          margin,
          position,
          imgWidth,
          imgHeight
        );

        heightLeft -= pageHeight - margin * 2;
      }

      const namaFile = dataSiswa.nama_siswa
        .replace(/[^a-z0-9]/gi, "_")
        .replace(/_+/g, "_");

      pdf.save(`Laporan_Monitoring_${namaFile}.pdf`);
    } catch (error) {
      console.error("Gagal membuat PDF:", error);
      alert("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ambilSiswa();
  }, []);

  async function ambilSiswa() {
    const { data, error } = await supabase
      .from("siswa")
      .select(
        "id, nisn, nama_siswa, jenis_kelamin, tempat_lahir, tanggal_lahir, nama_orang_tua, kelas_id"
      )
      .eq("kelas_id", 2)
      .order("nama_siswa", { ascending: true });

    if (error) {
      console.error(error);
      setPesan("Gagal mengambil data siswa.");
      return;
    }

    setSiswa(data || []);
  }

  async function tampilkanLaporan() {
    if (!siswaId) {
      setPesan("Silakan pilih siswa terlebih dahulu.");
      return;
    }

    setLoading(true);
    setPesan("");

    const idSiswa = Number(siswaId);

    const siswaTerpilih =
      siswa.find((item) => item.id === idSiswa) || null;

    setDataSiswa(siswaTerpilih);

    const [
      hasilKehadiran,
      hasilPerkembangan,
      hasilKarakter,
      hasilPotensi,
      hasilKepuasan,
      hasilJurnal,
    ] = await Promise.all([
      supabase
        .from("kehadiran")
        .select("sakit, izin, alpha")
        .eq("siswa_id", idSiswa)
        .eq("bulan", bulan)
        .eq("tahun", Number(tahunPelajaran.substring(0, 4)))
        .maybeSingle(),

      supabase
        .from("perkembangan_belajar")
        .select("id, bulan, tahun, nilai, catatan")
        .eq("siswa_id", idSiswa)
        .eq("bulan", bulan)
        .eq("tahun", Number(tahunPelajaran.substring(0, 4)))
        .order("id", { ascending: true }),

      supabase
        .from("karakter_siswa")
        .select("id, karakter, deskripsi, status_karakter")
        .eq("siswa_id", idSiswa)
        .eq("bulan", bulan)
        .eq("tahun", Number(tahunPelajaran.substring(0, 4)))
        .order("id", { ascending: true }),

      supabase
        .from("potensi_minat")
        .select("deskripsi_potensi, deskripsi_minat")
        .eq("siswa_id", idSiswa)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from("kepuasan_belajar")
        .select("tanggal, mata_pelajaran, kepuasan")
        .eq("tanggal", `${tahunPelajaran.substring(0, 4)}-${String(bulan).padStart(2, "0")}-01`)
        .order("tanggal", { ascending: true }),

      supabase
        .from("jurnal_kelas")
        .select("id, tanggal, hari, mata_pelajaran, keterangan")
        .gte(
          "tanggal",
          `${tahunPelajaran.substring(0, 4)}-${String(bulan).padStart(2, "0")}-01`
        )
        .lt(
          "tanggal",
          `${tahunPelajaran.substring(0, 4)}-${String(bulan + 1).padStart(2, "0")}-01`
        )
        .order("tanggal", { ascending: true }),
    ]);

    if (hasilKehadiran.error) {
      console.error("Kehadiran:", hasilKehadiran.error);
    }

    if (hasilPerkembangan.error) {
      console.error("Perkembangan:", hasilPerkembangan.error);
    }

    if (hasilKarakter.error) {
      console.error("Karakter:", hasilKarakter.error);
    }

    if (hasilPotensi.error) {
      console.error("Potensi:", hasilPotensi.error);
    }

    if (hasilKepuasan.error) {
      console.error("Kepuasan:", hasilKepuasan.error);
    }

    if (hasilJurnal.error) {
      console.error("Jurnal:", hasilJurnal.error);
    }

    setKehadiran(hasilKehadiran.data || null);
    setPerkembangan(hasilPerkembangan.data || []);
    setKarakter(hasilKarakter.data || []);
    setPotensiMinat(hasilPotensi.data || null);
    setKepuasan(hasilKepuasan.data || []);
    setJurnal(hasilJurnal.data || []);

    setLoading(false);
  }

  const karakterSudahMembudaya = karakter.filter(
    (item) => item.status_karakter === "Sudah Membudaya"
  );

  const karakterBelumMembudaya = karakter.filter(
    (item) => item.status_karakter === "Belum Membudaya"
  );

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

  /* KERTAS LAPORAN */
  .laporan-kertas {
    background: white;
    max-width: 900px;
    margin: 0 auto;
    padding: 42px;
    box-shadow: 0 8px 30px rgba(15, 23, 42, 0.12);
    border-radius: 12px;
    color: #111827;
  }

  /* JUDUL / HEAD BLOCK */
  .laporan-kertas > h1,
  .laporan-kertas > div:first-child {
    background: #1d4ed8;
    color: white;
    border-radius: 10px;
    padding: 20px;
  }

  /* JUDUL SECTION */
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

  /* SUB JUDUL */
  .laporan-kertas h4 {
    margin-top: 20px;
    margin-bottom: 10px;
    padding: 10px 13px;
    background: #dcfce7;
    color: #166534;
    border-left: 5px solid #16a34a;
    border-radius: 6px;
  }

  /* TABEL */
  .laporan-kertas table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 20px;
  }

  /* HEADER TABEL HIJAU */
  .laporan-kertas th {
    background: #16a34a;
    color: white;
    font-weight: 700;
    padding: 11px;
    border-right: 1px solid #86efac;
    border-bottom: 2px solid #15803d;
    text-align: left;
  }

  /* ISI TABEL */
  .laporan-kertas td {
    background: white;
    color: #111827;
    padding: 9px 10px;
    border-right: 1px solid #d1fae5;
    border-bottom: 1px solid #d1fae5;
    vertical-align: top;
  }

  /* BARIS SELANG-SELING */
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

  /* CETAK / PDF */
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
        <div
  style={{
    background: "#dbeafe",
    color: "#111827",
    padding: "30px",
    borderRadius: "14px",
    marginBottom: "20px",
    border: "1px solid #93c5fd",
    boxShadow: "0 4px 12px rgba(30, 64, 175, 0.10)",
  }}
>
  <h1
    style={{
      margin: 0,
      fontFamily: "Arial Black, Arial, sans-serif",
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
      fontFamily: "Arial, sans-serif",
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
      fontFamily: "Arial, sans-serif",
      fontSize: "16px",
      fontWeight: 600,
      color: "#111827",
    }}
  >
    SMK NEGERI 1 BULIK TIMUR
  </p>
</div>

        <section
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "14px",
            marginBottom: "20px",
            border: "1px solid #d1d5db",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Pengaturan Laporan</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "15px",
            }}
          >
            <div>
              <label>
                <strong>Nama Siswa</strong>
              </label>
              <select
                value={siswaId}
                onChange={(e) => setSiswaId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px",
                  marginTop: "6px",
                  color: "#111827",
                  background: "white",
                  border: "1px solid #9ca3af",
                  borderRadius: "8px",
                }}
              >
                <option value="">-- Pilih Siswa --</option>
                {siswa.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama_siswa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>
                <strong>Tahun Pelajaran</strong>
              </label>
              <div>
  <label>
    <strong>Tanggal Laporan</strong>
  </label>

  <input
    type="date"
    value={tanggalLaporan}
    onChange={(e) => setTanggalLaporan(e.target.value)}
    style={{
      width: "100%",
      padding: "11px",
      marginTop: "6px",
      color: "#111827",
      background: "white",
      border: "1px solid #9ca3af",
      borderRadius: "8px",
      boxSizing: "border-box",
    }}
  />
</div>
              <input
                type="text"
                value={tahunPelajaran}
                onChange={(e) => setTahunPelajaran(e.target.value)}
                placeholder="Contoh: 2026/2027"
                style={{
                  width: "100%",
                  padding: "11px",
                  marginTop: "6px",
                  color: "#111827",
                  background: "white",
                  border: "1px solid #9ca3af",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label>
                <strong>Semester</strong>
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px",
                  marginTop: "6px",
                  color: "#111827",
                  background: "white",
                  border: "1px solid #9ca3af",
                  borderRadius: "8px",
                }}
              >
                <option value="GANJIL">GANJIL</option>
                <option value="GENAP">GENAP</option>
              </select>
            </div>

            <div>
              <label>
                <strong>Bulan</strong>
              </label>
              <select
                value={bulan}
                onChange={(e) => setBulan(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "11px",
                  marginTop: "6px",
                  color: "#111827",
                  background: "white",
                  border: "1px solid #9ca3af",
                  borderRadius: "8px",
                }}
              >
                {daftarBulan.map((item) => (
                  <option key={item.nilai} value={item.nilai}>
                    {item.nama}
                  </option>
                ))}
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
            {loading ? "Memuat..." : "Tampilkan Laporan"}
          </button>

          {pesan && (
            <p style={{ color: "#b91c1c", fontWeight: "bold" }}>
              {pesan}
            </p>
          )}
        </section>

    {dataSiswa && (
  <>
    <div className="no-print download-area">
      <button
        onClick={downloadPDF}
        className="download-button"
      >
        ⬇ Download PDF
      </button>
    </div>

   <div className="laporan-kertas">
  <div
    style={{
      textAlign: "center",
      marginBottom: "25px",
      background: "#dbeafe",
      padding: "28px 20px",
      borderRadius: "12px",
      border: "1px solid #93c5fd",
    }}
  >
    <h2
      style={{
        margin: "0 0 10px 0",
        fontFamily: "Arial Black, Arial, sans-serif",
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
        fontFamily: "Arial, sans-serif",
        fontSize: "17px",
        lineHeight: "1.7",
        color: "#111827",
      }}
    >
      <strong>WALI KELAS X MANAJEMEN PERKANTORAN</strong>
      <br />
      <strong>SMK NEGERI 1 BULIK TIMUR</strong>
      <br />
      <strong>TAHUN PELAJARAN {tahunPelajaran}</strong>
    </div>
  </div>

  <hr
    style={{
      border: "none",
      borderTop: "2px solid #16a34a",
      margin: "0 0 25px 0",
    }}
  />

            <div style={{ marginTop: "20px" }}>
              <h3>IDENTITAS SISWA</h3>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "7px", width: "220px" }}>
                      Nama
                    </td>
                    <td style={{ padding: "7px" }}>
                      : {dataSiswa.nama_siswa}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "7px" }}>NISN</td>
                    <td style={{ padding: "7px" }}>
                      : {dataSiswa.nisn || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "7px" }}>
                      Jenis Kelamin
                    </td>
                    <td style={{ padding: "7px" }}>
                      : {dataSiswa.jenis_kelamin || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "7px" }}>
                      Tempat/Tanggal Lahir
                    </td>
                    <td style={{ padding: "7px" }}>
                      : {dataSiswa.tempat_lahir || "-"},{" "}
                      {formatTanggal(dataSiswa.tanggal_lahir)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "7px" }}>
                      Nama Orang Tua
                    </td>
                    <td style={{ padding: "7px" }}>
                      : {dataSiswa.nama_orang_tua || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "7px" }}>Kelas</td>
                    <td style={{ padding: "7px" }}>
                      : X Manajemen Perkantoran
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "30px" }}>
              <h3>
                KEHADIRAN — {namaBulan(bulan)}{" "}
                {tahunPelajaran.substring(0, 4)}
              </h3>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #9ca3af",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                      Sakit
                    </th>
                    <th style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                      Izin
                    </th>
                    <th style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                      Alpha
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: "1px solid #9ca3af", padding: "8px", textAlign: "center" }}>
                      {kehadiran?.sakit ?? 0}
                    </td>
                    <td style={{ border: "1px solid #9ca3af", padding: "8px", textAlign: "center" }}>
                      {kehadiran?.izin ?? 0}
                    </td>
                    <td style={{ border: "1px solid #9ca3af", padding: "8px", textAlign: "center" }}>
                      {kehadiran?.alpha ?? 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "30px" }}>
              <h3>PERKEMBANGAN BELAJAR</h3>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #9ca3af",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                      No
                    </th>
                    <th style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                      Mata Pelajaran
                    </th>
                    <th style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                      Nilai
                    </th>
                    <th style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                      Catatan Wali Kelas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {perkembangan.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          border: "1px solid #9ca3af",
                          padding: "10px",
                          textAlign: "center",
                        }}
                      >
                        Belum ada data perkembangan belajar.
                      </td>
                    </tr>
                  ) : (
                    perkembangan.map((item, index) => (
                      <tr key={item.id}>
                        <td style={{ border: "1px solid #9ca3af", padding: "8px", textAlign: "center" }}>
                          {index + 1}
                        </td>
                        <td style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                          Data mata pelajaran
                        </td>
                        <td style={{ border: "1px solid #9ca3af", padding: "8px", textAlign: "center" }}>
                          {item.nilai ?? "-"}
                        </td>
                        <td style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                          {item.catatan || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "30px" }}>
              <h3>KARAKTER</h3>

              <h4>Karakter yang Sudah Membudaya</h4>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #9ca3af",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                      Karakter
                    </th>
                    <th style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                      Deskripsi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {karakterSudahMembudaya.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        style={{
                          border: "1px solid #9ca3af",
                          padding: "10px",
                          textAlign: "center",
                        }}
                      >
                        Belum ada data.
                      </td>
                    </tr>
                  ) : (
                    karakterSudahMembudaya.map((item) => (
                      <tr key={item.id}>
                        <td style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                          {item.karakter}
                        </td>
                        <td style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                          {item.deskripsi || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <h4 style={{ marginTop: "20px" }}>
                Karakter yang Belum Membudaya
              </h4>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #9ca3af",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                      Karakter
                    </th>
                    <th style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                      Deskripsi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {karakterBelumMembudaya.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        style={{
                          border: "1px solid #9ca3af",
                          padding: "10px",
                          textAlign: "center",
                        }}
                      >
                        Belum ada data.
                      </td>
                    </tr>
                  ) : (
                    karakterBelumMembudaya.map((item) => (
                      <tr key={item.id}>
                        <td style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                          {item.karakter}
                        </td>
                        <td style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                          {item.deskripsi || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "30px" }}>
              <h3>POTENSI & MINAT</h3>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #9ca3af",
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        border: "1px solid #9ca3af",
                        padding: "10px",
                        width: "220px",
                        fontWeight: "bold",
                      }}
                    >
                      Potensi Diri Siswa
                    </td>
                    <td style={{ border: "1px solid #9ca3af", padding: "10px" }}>
                      {potensiMinat?.deskripsi_potensi || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        border: "1px solid #9ca3af",
                        padding: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      Minat Siswa
                    </td>
                    <td style={{ border: "1px solid #9ca3af", padding: "10px" }}>
                      {potensiMinat?.deskripsi_minat || "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "30px" }}>
              <h3>KEPUASAN BELAJAR</h3>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #9ca3af",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                      Tanggal
                    </th>
                    <th style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                      Mata Pelajaran
                    </th>
                    <th style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                      Kepuasan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {kepuasan.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        style={{
                          border: "1px solid #9ca3af",
                          padding: "10px",
                          textAlign: "center",
                        }}
                      >
                        Belum ada data.
                      </td>
                    </tr>
                  ) : (
                    kepuasan.map((item, index) => (
                      <tr key={`${item.tanggal}-${index}`}>
                        <td style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                          {formatTanggal(item.tanggal)}
                        </td>
                        <td style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                          {item.mata_pelajaran || "-"}
                        </td>
                        <td style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                          {item.kepuasan || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "30px" }}>
              <h3>JURNAL KELAS</h3>

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #9ca3af",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                      Tanggal
                    </th>
                    <th style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                      Hari
                    </th>
                    <th style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                      Mata Pelajaran
                    </th>
                    <th style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jurnal.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          border: "1px solid #9ca3af",
                          padding: "10px",
                          textAlign: "center",
                        }}
                      >
                        Belum ada jurnal kelas.
                      </td>
                    </tr>
                  ) : (
                    jurnal.map((item) => (
                      <tr key={item.id}>
                        <td style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                          {formatTanggal(item.tanggal)}
                        </td>
                        <td style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                          {item.hari || "-"}
                        </td>
                        <td style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                          {item.mata_pelajaran || "-"}
                        </td>
                        <td style={{ border: "1px solid #9ca3af", padding: "8px" }}>
                          {item.keterangan || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div
              style={{
                marginTop: "60px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <div style={{ textAlign: "center", width: "300px" }}>
                <p>
  Bukit Jaya,{" "}
  {tanggalLaporan
    ? new Date(`${tanggalLaporan}T00:00:00`).toLocaleDateString(
        "id-ID",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : "__________________"}
</p>
                <p>Wali Kelas</p>

                <div style={{ height: "80px" }} />

                <strong>Sumarno, S.Pd.I</strong>
                <br />
<span>NIP. 19831806202221009</span>
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
