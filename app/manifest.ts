import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Monitoring Siswa",
    short_name: "Monitoring Siswa",
    description:
      "Sistem Monitoring Siswa Kelas X MP SMKN 1 Bulik Timur",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#14532d",
    icons: [
      {
        src: "/monitoring-siswa-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/monitoring-siswa-icon-512.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}