
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Siswa = {
  id: number
  nisn: string
  nama_siswa: string
  jenis_kelamin: string
  tempat_lahir: string
  tanggal_lahir: string | null
  alamat: string
  nama_orang_tua: string
  nomor_hp_orang_tua: string
  kelas_id: number | null
  created_at: string
}

export default function DataSiswa() {
  const [siswa, setSiswa] = useState<Siswa[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [nisn, setNisn] = useState('')
  const [namaSiswa, setNamaSiswa] = useState('')
  const [jenisKelamin, setJenisKelamin] = useState('')
  const [tempatLahir, setTempatLahir] = useState('')
  const [tanggalLahir, setTanggalLahir] = useState('')
  const [alamat, setAlamat] = useState('')
  const [namaOrangTua, setNamaOrangTua] = useState('')
  const [nomorHpOrangTua, setNomorHpOrangTua] = useState('')

  async function loadSiswa() {
    setLoading(true)

    const { data, error } = await supabase
      .from('siswa')
      .select('*')
      .order('nama_siswa', { ascending: true })

    if (error) {
      console.error(error)
      alert('Gagal mengambil data siswa: ' + error.message)
    } else {
      setSiswa(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadSiswa()
  }, [])

  function resetForm() {
    setNisn('')
    setNamaSiswa('')
    setJenisKelamin('')
    setTempatLahir('')
    setTanggalLahir('')
    setAlamat('')
    setNamaOrangTua('')
    setNomorHpOrangTua('')
  }

  async function simpanSiswa(e: React.FormEvent) {
    e.preventDefault()

    if (!nisn || !namaSiswa || !jenisKelamin) {
      alert('NISN, Nama Siswa, dan Jenis Kelamin wajib diisi.')
      return
    }

    const { error } = await supabase
      .from('siswa')
      .insert([
        {
          nisn,
          nama_siswa: namaSiswa,
          jenis_kelamin: jenisKelamin,
          tempat_lahir: tempatLahir,
          tanggal_lahir: tanggalLahir || null,
          alamat,
          nama_orang_tua: namaOrangTua,
          nomor_hp_orang_tua: nomorHpOrangTua,
        },
      ])

    if (error) {
      console.error(error)
      alert('Gagal menyimpan data siswa: ' + error.message)
      return
    }

    alert('Data siswa berhasil disimpan.')

    resetForm()
    setShowForm(false)
    loadSiswa()
  }

  async function hapusSiswa(id: number) {
    const yakin = confirm(
      'Apakah Anda yakin ingin menghapus data siswa ini?'
    )

    if (!yakin) return

    const { error } = await supabase
      .from('siswa')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Gagal menghapus data: ' + error.message)
      return
    }

    alert('Data siswa berhasil dihapus.')
    loadSiswa()
  }

  return (
    <main className="page">
      <div className="container">

        {/* HEADER */}
        <div className="header">
          <div>
            <button
              type="button"
              className="backButton"
              onClick={() => {
                window.location.href = '/'
              }}
            >
              ← Kembali ke Dashboard
            </button>

            <h1>👨‍🎓 Data Siswa</h1>

            <p>
              Kelola data peserta didik Kelas X MP
            </p>
          </div>

          <button
            type="button"
            className="addButton"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Tutup Form' : '+ Tambah Siswa'}
          </button>
        </div>

        {/* FORM TAMBAH SISWA */}
        {showForm && (
          <section className="formCard">

            <div className="formTitle">
              <h2>Tambah Data Siswa</h2>
              <p>
                Lengkapi data peserta didik berikut.
              </p>
            </div>

            <form onSubmit={simpanSiswa}>

              <div className="formGrid">

                <div className="field">
                  <label>NISN *</label>

                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="Masukkan NISN"
                  />
                </div>

                <div className="field">
                  <label>Nama Siswa *</label>

                  <input
                    type="text"
                    value={namaSiswa}
                    onChange={(e) => setNamaSiswa(e.target.value)}
                    placeholder="Nama lengkap siswa"
                  />
                </div>

                <div className="field">
                  <label>Jenis Kelamin *</label>

                  <select
                    value={jenisKelamin}
                    onChange={(e) =>
                      setJenisKelamin(e.target.value)
                    }
                  >
                    <option value="">
                      Pilih jenis kelamin
                    </option>

                    <option value="L">
                      Laki-laki
                    </option>

                    <option value="P">
                      Perempuan
                    </option>
                  </select>
                </div>

                <div className="field">
                  <label>Tempat Lahir</label>

                  <input
                    type="text"
                    value={tempatLahir}
                    onChange={(e) =>
                      setTempatLahir(e.target.value)
                    }
                    placeholder="Tempat lahir"
                  />
                </div>

                <div className="field">
                  <label>Tanggal Lahir</label>

                  <input
                    type="date"
                    value={tanggalLahir}
                    onChange={(e) =>
                      setTanggalLahir(e.target.value)
                    }
                  />
                </div>

                <div className="field">
                  <label>Nama Orang Tua</label>

                  <input
                    type="text"
                    value={namaOrangTua}
                    onChange={(e) =>
                      setNamaOrangTua(e.target.value)
                    }
                    placeholder="Nama orang tua / wali"
                  />
                </div>

                <div className="field">
                  <label>Nomor HP Orang Tua</label>

                  <input
                    type="text"
                    value={nomorHpOrangTua}
                    onChange={(e) =>
                      setNomorHpOrangTua(e.target.value)
                    }
                    placeholder="Contoh: 08123456789"
                  />
                </div>

                <div className="field full">
                  <label>Alamat</label>

                  <textarea
                    value={alamat}
                    onChange={(e) =>
                      setAlamat(e.target.value)
                    }
                    placeholder="Alamat lengkap siswa"
                    rows={3}
                  />
                </div>

              </div>

              <div className="formActions">

                <button
                  type="button"
                  className="cancelButton"
                  onClick={() => {
                    resetForm()
                    setShowForm(false)
                  }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="saveButton"
                >
                  💾 Simpan Data
                </button>

              </div>

            </form>
          </section>
        )}

        {/* DAFTAR SISWA */}
        <section className="tableCard">

          <div className="tableHeader">
            <div>
              <h2>Daftar Siswa</h2>

              <p>
                Total {siswa.length} siswa
              </p>
            </div>
          </div>

          {loading ? (
            <div className="empty">
              Memuat data siswa...
            </div>
          ) : siswa.length === 0 ? (
            <div className="empty">

              <div className="emptyIcon">
                👨‍🎓
              </div>

              <h3>
                Belum ada data siswa
              </h3>

              <p>
                Klik <b>+ Tambah Siswa</b> untuk memasukkan data.
              </p>

            </div>
          ) : (
            <div className="tableWrapper">

              <table>

                <thead>
                  <tr>
                    <th>No</th>
                    <th>NISN</th>
                    <th>Nama Siswa</th>
                    <th>L/P</th>
                    <th>Tempat Lahir</th>
                    <th>Tanggal Lahir</th>
                    <th>Alamat</th>
                    <th>Orang Tua</th>
                    <th>No. HP</th>
                    <th>Aksi</th>
                  </tr>
                </thead>

                <tbody>

                  {siswa.map((item, index) => (
                    <tr key={item.id}>

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {item.nisn}
                      </td>

                      <td className="name">
                        {item.nama_siswa}
                      </td>

                      <td>
                        {item.jenis_kelamin}
                      </td>

                      <td>
                        {item.tempat_lahir || '-'}
                      </td>

                      <td>
                        {item.tanggal_lahir || '-'}
                      </td>

                      <td>
                        {item.alamat || '-'}
                      </td>

                      <td>
                        {item.nama_orang_tua || '-'}
                      </td>

                      <td>
                        {item.nomor_hp_orang_tua || '-'}
                      </td>

                      <td>

                        <button
                          type="button"
                          className="deleteButton"
                          onClick={() =>
                            hapusSiswa(item.id)
                          }
                        >
                          🗑️
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
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
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

        .addButton {
          border: none;
          background: #1f9d65;
          color: white;
          padding: 13px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .formCard {
          background: white;
          border-radius: 20px;
          padding: 27px;
          margin-bottom: 25px;
          box-shadow: 0 7px 25px rgba(0,0,0,.05);
          border: 1px solid #e8efeb;
        }

        .formTitle {
          margin-bottom: 22px;
        }

        .formTitle h2 {
          margin: 0;
          font-size: 19px;
          color: #193b2d;
        }

        .formTitle p {
          margin: 6px 0 0;
          font-size: 11px;
          color: #829088;
        }

        .formGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 17px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        label {
          font-size: 11px;
          font-weight: 700;
          color: #405047;
        }

        input,
        select,
        textarea {
          width: 100%;
          border: 1px solid #dce6e0;
          border-radius: 10px;
          padding: 12px;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          outline: none;
          background: #fbfdfc;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #4db383;
        }

        textarea {
          resize: vertical;
        }

        .formActions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 22px;
        }

        .cancelButton {
          border: 1px solid #dce6e0;
          background: white;
          color: #68766f;
          padding: 11px 18px;
          border-radius: 10px;
          cursor: pointer;
        }

        .saveButton {
          border: none;
          background: #1f9d65;
          color: white;
          padding: 11px 20px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .tableCard {
          background: white;
          border-radius: 20px;
          border: 1px solid #e8efeb;
          overflow: hidden;
          box-shadow: 0 7px 25px rgba(0,0,0,.04);
        }

        .tableHeader {
          padding: 22px 25px;
          border-bottom: 1px solid #edf1ee;
        }

        .tableHeader h2 {
          margin: 0;
          font-size: 19px;
        }

        .tableHeader p {
          margin: 5px 0 0;
          color: #849088;
          font-size: 11px;
        }

        .tableWrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1100px;
        }

        th {
          background: #f4f8f5;
          color: #64736b;
          font-size: 10px;
          text-align: left;
          padding: 13px 12px;
          white-space: nowrap;
        }

        td {
          padding: 13px 12px;
          border-top: 1px solid #edf1ee;
          font-size: 11px;
          color: #526159;
        }

        td.name {
          color: #1d392c;
          font-weight: 700;
          white-space: nowrap;
        }

        .deleteButton {
          border: none;
          background: #fff0f0;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          cursor: pointer;
        }

        .empty {
          text-align: center;
          padding: 70px 20px;
          color: #87938d;
        }

        .emptyIcon {
          font-size: 45px;
          margin-bottom: 10px;
        }

        .empty h3 {
          color: #415148;
          margin: 5px 0;
        }

        .empty p {
          font-size: 12px;
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

          .header {
            align-items: flex-start;
            flex-direction: column;
            gap: 20px;
          }

          .formGrid {
            grid-template-columns: 1fr;
          }

          .field.full {
            grid-column: auto;
          }

        }

      `}</style>

    </main>
  )
}
