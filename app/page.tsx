
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [jumlahSiswa, setJumlahSiswa] = useState(0)
  const [jumlahKelas, setJumlahKelas] = useState(0)
  const router = useRouter()

  useEffect(() => {
    async function logoutAndRedirect() {
      await supabase.auth.signOut()
      router.replace('/admin')
    }

    logoutAndRedirect()
  }, [router])
  useEffect(() => {
    async function loadData() {
      const { count: siswaCount } = await supabase
        .from('siswa')
        .select('*', {
          count: 'exact',
          head: true,
        })

      const { count: kelasCount } = await supabase
        .from('kelas')
        .select('*', {
          count: 'exact',
          head: true,
        })

      setJumlahSiswa(siswaCount || 0)
      setJumlahKelas(kelasCount || 0)
    }

    loadData()
  }, [])

  const menus = [
    {
      icon: '👨‍🎓',
      title: 'Data Siswa',
      desc: 'Kelola data peserta didik',
      link: '/siswa',
    },
    {
      icon: '📅',
      title: 'Kehadiran',
      desc: 'Pantau kehadiran siswa',
    },
    {
      icon: '📚',
      title: 'Perkembangan Belajar',
      desc: 'Catat perkembangan akademik',
    },
    {
      icon: '⭐',
      title: 'Karakter',
      desc: 'Pantau perkembangan karakter',
    },
    {
      icon: '🌱',
      title: 'Potensi & Minat',
      desc: 'Kenali potensi siswa',
    },
    {
      icon: '📖',
      title: 'Jurnal Kelas',
      desc: 'Catatan kegiatan pembelajaran',
    },
    {
      icon: '😊',
      title: 'Kepuasan Belajar',
      desc: 'Suara dan pengalaman siswa',
    },
    {
      icon: '📊',
      title: 'Laporan',
      desc: 'Laporan monitoring siswa',
    },
  ]

  function bukaMenu(link?: string) {
    if (link) {
      window.location.href = link
    }
  }

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">

          <div className="brandIcon">
            🎓
          </div>

          <div>
            <div className="brandTitle">
              MONITORING
            </div>

            <div className="brandSub">
              SISWA
            </div>
          </div>

        </div>

        <div className="classBox">

          <div className="classLabel">
            KELAS YANG DIMONITOR
          </div>

          <div className="className">
            X MP
          </div>

          <div className="classMajor">
            Manajemen Perkantoran
          </div>

        </div>

        <nav className="navigation">

          <div className="navTitle">
            MENU UTAMA
          </div>

          <button
            type="button"
            className="navItem active"
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            type="button"
            className="navItem"
            onClick={() => bukaMenu('/siswa')}
          >
            <span>👨‍🎓</span>
            Data Siswa
          </button>

          <button
            type="button"
            className="navItem"
          >
            <span>📅</span>
            Kehadiran
          </button>

          <button
            type="button"
            className="navItem"
          >
            <span>📚</span>
            Perkembangan
          </button>

          <button
            type="button"
            className="navItem"
          >
            <span>⭐</span>
            Karakter
          </button>

          <button
            type="button"
            className="navItem"
          >
            <span>🌱</span>
            Potensi & Minat
          </button>

          <div className="navTitle second">
            ADMINISTRASI
          </div>

          <button
            type="button"
            className="navItem"
          >
            <span>📖</span>
            Jurnal Kelas
          </button>

          <button
            type="button"
            className="navItem"
          >
            <span>📊</span>
            Laporan
          </button>

        </nav>

        <div className="sidebarBottom">

          <div className="schoolIcon">
            🏫
          </div>

          <div>

            <div className="schoolTitle">
              Monitoring Siswa
            </div>

            <div className="schoolSub">
              Tahun Ajaran 2026/2027
            </div>

          </div>

        </div>

      </aside>


      {/* MAIN */}
      <main className="main">

        {/* TOPBAR */}
        <header className="topbar">

          <div>

            <div className="breadcrumb">
              Dashboard / Kelas X MP
            </div>

            <h1>
              Selamat Datang 👋
            </h1>

            <p>
              Pantau perkembangan siswa secara menyeluruh dalam satu tempat.
            </p>

          </div>

          <div className="profile">

            <div className="profileAvatar">
              S
            </div>

            <div>

              <strong>
                Wali Kelas
              </strong>

              <small>
                Kelas X MP
              </small>

            </div>

          </div>

        </header>


        {/* HERO */}
        <section className="hero">

          <div>

            <div className="heroSmall">
              MONITORING SISWA
            </div>

            <h2>
              Kelas X MP
            </h2>

            <p>
              Manajemen Perkantoran · Tahun Ajaran 2026/2027
            </p>

          </div>

          <div className="heroDecoration">

            <div className="circle c1"></div>

            <div className="circle c2"></div>

            <div className="heroEmoji">
              🎓
            </div>

          </div>

        </section>


        {/* STATISTICS */}
        <section className="stats">

          <StatCard
            icon="👨‍🎓"
            title="Total Siswa"
            value={jumlahSiswa.toString()}
            note="Peserta didik aktif"
          />

          <StatCard
            icon="🏫"
            title="Kelas"
            value={jumlahKelas.toString()}
            note="Kelas yang dimonitor"
          />

          <StatCard
            icon="📅"
            title="Kehadiran"
            value="0%"
            note="Data belum tersedia"
          />

          <StatCard
            icon="📈"
            title="Perkembangan"
            value="0"
            note="Data belum tersedia"
          />

        </section>


        {/* MENU SECTION */}
        <section className="menuSection">

          <div className="sectionHeader">

            <div>

              <h2>
                Menu Monitoring
              </h2>

              <p>
                Kelola dan pantau berbagai aspek perkembangan siswa.
              </p>

            </div>

            <span className="menuCount">
              8 Modul
            </span>

          </div>


          <div className="menuGrid">

            {menus.map((menu) => (

              <button
                type="button"
                className="menuCard"
                key={menu.title}
                onClick={() => bukaMenu(menu.link)}
              >

                <div className="menuIcon">
                  {menu.icon}
                </div>

                <div className="menuText">

                  <h3>
                    {menu.title}
                  </h3>

                  <p>
                    {menu.desc}
                  </p>

                </div>

                <div className="arrow">
                  →
                </div>

              </button>

            ))}

          </div>

        </section>


        {/* FOOTER */}
        <footer>
          Sistem Monitoring Siswa · Kelas X MP · 2026/2027
        </footer>

      </main>


      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .app {
          min-height: 100vh;
          background: #f5f7f6;
          color: #17221d;
          font-family: Arial, Helvetica, sans-serif;
          display: flex;
        }

        .sidebar {
          width: 270px;
          min-height: 100vh;
          background: #10251c;
          color: white;
          padding: 25px 18px;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 5px 10px 25px;
        }

        .brandIcon {
          width: 45px;
          height: 45px;
          background: #24a36a;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 23px;
          box-shadow: 0 8px 20px rgba(0,0,0,.2);
        }

        .brandTitle {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .brandSub {
          font-size: 12px;
          color: #79c9a2;
          letter-spacing: 3px;
          margin-top: 2px;
        }

        .classBox {
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.08);
          padding: 17px;
          border-radius: 15px;
          margin-bottom: 24px;
        }

        .classLabel {
          font-size: 9px;
          color: #88a999;
          letter-spacing: 1px;
        }

        .className {
          font-size: 25px;
          font-weight: 800;
          margin-top: 7px;
        }

        .classMajor {
          color: #a8c2b5;
          font-size: 11px;
          margin-top: 4px;
        }

        .navigation {
          flex: 1;
        }

        .navTitle {
          font-size: 9px;
          color: #6f8d7d;
          letter-spacing: 1.5px;
          padding: 0 12px 10px;
        }

        .navTitle.second {
          margin-top: 24px;
        }

        .navItem {
          width: 100%;
          border: none;
          background: transparent;
          color: #b7c9c0;
          padding: 12px 13px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          text-align: left;
          cursor: pointer;
          margin-bottom: 4px;
          transition: .2s;
        }

        .navItem span {
          width: 22px;
          text-align: center;
          font-size: 16px;
        }

        .navItem:hover {
          background: rgba(255,255,255,.07);
          color: white;
          transform: translateX(3px);
        }

        .navItem.active {
          background: #1f9d65;
          color: white;
          box-shadow: 0 7px 18px rgba(31,157,101,.22);
        }

        .sidebarBottom {
          border-top: 1px solid rgba(255,255,255,.08);
          padding: 18px 8px 0;
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .schoolIcon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: rgba(255,255,255,.08);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .schoolTitle {
          font-size: 11px;
          font-weight: 700;
        }

        .schoolSub {
          font-size: 9px;
          color: #789184;
          margin-top: 3px;
        }

        .main {
          margin-left: 270px;
          width: calc(100% - 270px);
          padding: 35px 45px;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .breadcrumb {
          font-size: 11px;
          color: #789184;
          margin-bottom: 9px;
        }

        .topbar h1 {
          font-size: 27px;
          margin: 0;
          color: #15231c;
        }

        .topbar p {
          color: #718178;
          font-size: 13px;
          margin-top: 7px;
        }

        .profile {
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          padding: 8px 14px 8px 8px;
          border-radius: 40px;
          box-shadow: 0 4px 18px rgba(0,0,0,.05);
        }

        .profileAvatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #1f9d65;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }

        .profile strong {
          display: block;
          font-size: 11px;
        }

        .profile small {
          display: block;
          color: #829088;
          font-size: 9px;
          margin-top: 3px;
        }

        .hero {
          background: linear-gradient(110deg, #176b48, #1e9a67);
          border-radius: 22px;
          padding: 30px 35px;
          color: white;
          position: relative;
          overflow: hidden;
          min-height: 155px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 12px 30px rgba(20,100,67,.18);
        }

        .heroSmall {
          font-size: 10px;
          letter-spacing: 2px;
          opacity: .75;
        }

        .hero h2 {
          font-size: 35px;
          margin: 7px 0;
        }

        .hero p {
          margin: 0;
          font-size: 12px;
          opacity: .82;
        }

        .heroDecoration {
          position: relative;
          width: 170px;
          height: 130px;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,.08);
        }

        .c1 {
          width: 150px;
          height: 150px;
          right: -30px;
          top: -10px;
        }

        .c2 {
          width: 80px;
          height: 80px;
          right: 50px;
          top: 35px;
          background: rgba(255,255,255,.12);
        }

        .heroEmoji {
          position: absolute;
          right: 30px;
          top: 35px;
          font-size: 55px;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 17px;
          margin-top: 22px;
        }

        .statCard {
          background: white;
          border-radius: 17px;
          padding: 20px;
          box-shadow: 0 5px 20px rgba(0,0,0,.045);
          border: 1px solid #edf1ee;
          transition: .2s;
        }

        .statCard:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0,0,0,.08);
        }

        .statTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .statIcon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #e8f6ef;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .statTitle {
          font-size: 11px;
          color: #718178;
        }

        .statValue {
          font-size: 27px;
          font-weight: 800;
          color: #173d2c;
          margin-top: 12px;
        }

        .statNote {
          color: #9aa69f;
          font-size: 9px;
          margin-top: 5px;
        }

        .menuSection {
          margin-top: 35px;
        }

        .sectionHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 17px;
        }

        .sectionHeader h2 {
          margin: 0;
          font-size: 20px;
        }

        .sectionHeader p {
          margin: 5px 0 0;
          color: #7b8881;
          font-size: 11px;
        }

        .menuCount {
          background: #e7f4ed;
          color: #16714a;
          font-size: 10px;
          padding: 7px 12px;
          border-radius: 20px;
          font-weight: 700;
        }

        .menuGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .menuCard {
          position: relative;
          background: white;
          border: 1px solid #e9eeeb;
          border-radius: 17px;
          padding: 19px;
          display: flex;
          align-items: center;
          gap: 13px;
          text-align: left;
          cursor: pointer;
          transition: .25s;
          min-height: 95px;
        }

        .menuCard:hover {
          transform: translateY(-4px);
          border-color: #a7d9bf;
          box-shadow: 0 12px 25px rgba(0,0,0,.07);
        }

        .menuIcon {
          min-width: 47px;
          height: 47px;
          border-radius: 14px;
          background: #edf8f2;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 23px;
        }

        .menuText h3 {
          margin: 0;
          font-size: 12px;
          color: #20362b;
        }

        .menuText p {
          margin: 5px 0 0;
          color: #8a968f;
          font-size: 9px;
          line-height: 1.4;
        }

        .arrow {
          margin-left: auto;
          color: #a0ada6;
          font-size: 17px;
        }

        footer {
          text-align: center;
          color: #9ba59f;
          font-size: 9px;
          margin: 40px 0 10px;
        }

        @media (max-width: 1100px) {

          .stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .menuGrid {
            grid-template-columns: repeat(2, 1fr);
          }

        }

        @media (max-width: 800px) {

          .sidebar {
            display: none;
          }

          .main {
            margin-left: 0;
            width: 100%;
            padding: 25px 18px;
          }

          .topbar {
            align-items: flex-start;
          }

          .profile {
            display: none;
          }

          .heroDecoration {
            display: none;
          }

        }

        @media (max-width: 550px) {

          .stats,
          .menuGrid {
            grid-template-columns: 1fr;
          }

          .hero h2 {
            font-size: 28px;
          }

        }

      `}</style>

    </div>
  )
}

function StatCard({
  icon,
  title,
  value,
  note,
}: {
  icon: string
  title: string
  value: string
  note: string
}) {
  return (
    <div className="statCard">

      <div className="statTop">

        <div className="statTitle">
          {title}
        </div>

        <div className="statIcon">
          {icon}
        </div>

      </div>

      <div className="statValue">
        {value}
      </div>

      <div className="statNote">
        {note}
      </div>

    </div>
  )
}
