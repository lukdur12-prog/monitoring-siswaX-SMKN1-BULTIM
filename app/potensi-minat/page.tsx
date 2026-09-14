'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Siswa = {
  id: number
  nisn: string
  nama_siswa: string
}

type PotensiMinat = {
  id: number
  siswa_id: number
  deskripsi_potensi: string | null
  deskripsi_minat: string | null
  siswa: {
    nama_siswa: string
  }[] | null
}

export default function PotensiMinatPage() {
  const [siswa, setSiswa] = useState<Siswa[]>([])
  const [data, setData] = useState<PotensiMinat[]>([])

  const [siswaId, setSiswaId] = useState('')
  const [deskripsiPotensi, setDeskripsiPotensi] = useState('')
  const [deskripsiMinat, setDeskripsiMinat] = useState('')

  const [loading, setLoading] = useState(false)
  const [pesan, setPesan] = useState('')

  useEffect(() => {
    loadSiswa()
    loadData()
  }, [])

  async function loadSiswa() {
    const { data, error } = await supabase
      .from('siswa')
      .select('id, nisn, nama_siswa')
      .order('nama_siswa', { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    setSiswa(data || [])
  }

  async function loadData() {
    const { data, error } = await supabase
      .from('potensi_minat')
      .select(`
        id,
        siswa_id,
        deskripsi_potensi,
        deskripsi_minat,
        siswa (
          nama_siswa
        )
      `)
      .order('id', { ascending: false })

    if (error) {
      console.error(error)
      setPesan('Gagal mengambil data potensi dan minat.')
      return
    }

    setData((data as PotensiMinat[]) || [])
  }

  async function simpanData(e: React.FormEvent) {
    e.preventDefault()

    if (!siswaId) {
      setPesan('Silakan pilih nama siswa.')
      return
    }

    if (!deskripsiPotensi.trim()) {
      setPesan('Deskripsi potensi diri siswa belum diisi.')
      return
    }

    if (!deskripsiMinat.trim()) {
      setPesan('Deskripsi minat siswa belum diisi.')
      return
    }

    setLoading(true)
    setPesan('')

    const { error } = await supabase
      .from('potensi_minat')
      .insert({
        siswa_id: Number(siswaId),
        deskripsi_potensi: deskripsiPotensi.trim(),
        deskripsi_minat: deskripsiMinat.trim(),
      })

    if (error) {
      console.error(error)

      if (error.code === '23505') {
        setPesan('Data potensi dan minat siswa tersebut sudah ada.')
      } else {
        setPesan('Gagal menyimpan data.')
      }

      setLoading(false)
      return
    }

    setPesan('Data potensi dan minat berhasil disimpan.')

    setSiswaId('')
    setDeskripsiPotensi('')
    setDeskripsiMinat('')

    await loadData()

    setLoading(false)
  }

  async function hapusData(id: number) {
    const yakin = window.confirm(
      'Apakah data potensi dan minat ini ingin dihapus?'
    )

    if (!yakin) return

    const { error } = await supabase
      .from('potensi_minat')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(error)
      setPesan('Gagal menghapus data.')
      return
    }

    setPesan('Data berhasil dihapus.')
    await loadData()
  }

  return (
    <main className="page">

      <div className="container">

        <div className="header">
          <div>
            <div className="breadcrumb">
              Dashboard / Potensi & Minat
            </div>

            <h1>Potensi & Minat Siswa</h1>

            <p>
              Catat potensi diri dan minat setiap siswa secara deskriptif.
            </p>
          </div>

          <button
            type="button"
            className="backButton"
            onClick={() => window.location.href = '/'}
          >
            ← Dashboard
          </button>
        </div>

        <section className="card">

          <div className="cardHeader">
            <h2>Input Potensi & Minat</h2>
            <p>
              Lengkapi data potensi dan minat siswa berdasarkan pengamatan.
            </p>
          </div>

          <form onSubmit={simpanData}>

            <div className="formGroup">
              <label>Nama Siswa</label>

              <select
                value={siswaId}
                onChange={(e) => setSiswaId(e.target.value)}
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

            <div className="formGroup">

              <label>
                Deskripsi Potensi Diri Siswa
              </label>

              <textarea
                value={deskripsiPotensi}
                onChange={(e) =>
                  setDeskripsiPotensi(e.target.value)
                }
                placeholder="Contoh: Siswa memiliki kemampuan komunikasi yang baik, percaya diri saat menyampaikan pendapat, dan mampu bekerja sama dalam kelompok."
                rows={6}
              />

            </div>

            <div className="formGroup">

              <label>
                Deskripsi Minat Siswa
              </label>

              <textarea
                value={deskripsiMinat}
                onChange={(e) =>
                  setDeskripsiMinat(e.target.value)
                }
                placeholder="Contoh: Siswa menunjukkan minat yang tinggi pada bidang komputer, administrasi perkantoran, dan kegiatan organisasi."
                rows={6}
              />

            </div>

            <button
              type="submit"
              className="saveButton"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : '💾 Simpan Data'}
            </button>

          </form>

          {pesan && (
            <div className="message">
              {pesan}
            </div>
          )}

        </section>

        <section className="card listCard">

          <div className="cardHeader">
            <h2>Daftar Potensi & Minat Siswa</h2>

            <p>
              Data siswa yang sudah diinput.
            </p>
          </div>

          {data.length === 0 ? (

            <div className="empty">
              Belum ada data potensi dan minat siswa.
            </div>

          ) : (

            <div className="tableWrapper">

              <table>

                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Siswa</th>
                    <th>Deskripsi Potensi Diri</th>
                    <th>Deskripsi Minat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>

                  {data.map((item, index) => (

                    <tr key={item.id}>

                      <td>
                        {index + 1}
                      </td>

                      <td className="nama">
                       {item.siswa?.[0]?.nama_siswa || siswa.find((s) => s.id === item.siswa_id)?.nama_siswa || '-'}
                      </td>

                      <td>
                        {item.deskripsi_potensi || '-'}
                      </td>

                      <td>
                        {item.deskripsi_minat || '-'}
                      </td>

                      <td>

                        <button
                          type="button"
                          className="deleteButton"
                          onClick={() => hapusData(item.id)}
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

        <footer>
          Sistem Monitoring Siswa · Kelas X MP · Tahun Ajaran 2026/2027
        </footer>

      </div>

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background: #f5f7f6;
          color: #17221d;
          font-family: Arial, Helvetica, sans-serif;
          padding: 35px;
        }

        .container {
          max-width: 1250px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .breadcrumb {
          font-size: 11px;
          color: #718178;
          margin-bottom: 8px;
        }

        h1 {
          margin: 0;
          font-size: 28px;
          color: #15231c;
        }

        .header p {
          margin: 7px 0 0;
          color: #718178;
          font-size: 13px;
        }

        .backButton {
          border: none;
          background: #10251c;
          color: white;
          padding: 11px 18px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 700;
        }

        .backButton:hover {
          background: #1f9d65;
        }

        .card {
          background: white;
          border: 1px solid #e6ece8;
          border-radius: 18px;
          padding: 25px;
          margin-bottom: 22px;
          box-shadow: 0 5px 20px rgba(0,0,0,.04);
        }

        .cardHeader {
          margin-bottom: 22px;
        }

        .cardHeader h2 {
          margin: 0;
          font-size: 20px;
          color: #173d2c;
        }

        .cardHeader p {
          margin: 6px 0 0;
          color: #718178;
          font-size: 12px;
        }

        .formGroup {
          margin-bottom: 20px;
        }

        label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #17221d;
          margin-bottom: 8px;
        }

        select,
        textarea {
          width: 100%;
          border: 1px solid #cfd9d3;
          border-radius: 10px;
          padding: 12px;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 13px;
          color: #111;
          background: white;
          outline: none;
        }

        select:focus,
        textarea:focus {
          border-color: #1f9d65;
          box-shadow: 0 0 0 3px rgba(31,157,101,.10);
        }

        textarea {
          resize: vertical;
          line-height: 1.6;
        }

        .saveButton {
          border: none;
          background: #1f9d65;
          color: white;
          padding: 12px 22px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .saveButton:hover {
          background: #16714a;
        }

        .saveButton:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .message {
          margin-top: 17px;
          padding: 12px 15px;
          background: #edf8f2;
          color: #176b48;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
        }

        .empty {
          text-align: center;
          padding: 35px 10px;
          color: #7b8881;
          font-size: 12px;
        }

        .tableWrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 850px;
        }

        th {
          background: #10251c;
          color: white;
          padding: 12px;
          text-align: left;
          font-size: 11px;
        }

        td {
          padding: 13px 12px;
          border-bottom: 1px solid #edf1ee;
          vertical-align: top;
          font-size: 12px;
          line-height: 1.6;
          color: #222;
        }

        .nama {
          font-weight: 700;
          color: #173d2c;
          white-space: nowrap;
        }

        .deleteButton {
          border: none;
          background: #f8eaea;
          color: #a22;
          padding: 7px 11px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
        }

        .deleteButton:hover {
          background: #f2d5d5;
        }

        footer {
          text-align: center;
          color: #9ba59f;
          font-size: 9px;
          margin: 35px 0 10px;
        }

        @media (max-width: 700px) {

          .page {
            padding: 20px 15px;
          }

          .header {
            align-items: flex-start;
            gap: 15px;
          }

          h1 {
            font-size: 23px;
          }

          .backButton {
            white-space: nowrap;
          }

          .card {
            padding: 18px;
          }

        }

      `}</style>

    </main>
  )
}