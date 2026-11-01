# Dokumentasi Skrining Awal Kesehatan Mental

Dokumentasi teknis dan operasional untuk aplikasi sistem pakar berbasis web ini. Isinya menjelaskan
cara aplikasi bekerja, mesin inferensi, basis pengetahuan, alur pengguna, perlakuan data, serta cara
mengembangkan dan men-deploy aplikasi.

Dokumentasi ini mencerminkan kode pada branch `main` per 1 November 2026.

Hasil hanya bahan refleksi dan topik percakapan dengan profesional, tidak menetapkan atau menyingkirkan gangguan. Tidak ada fitur ekspor hasil.

## Ringkasan sistem

| Aspek | Keterangan |
|---|---|
| Jenis aplikasi | SPA statis (satu halaman, tanpa server aplikasi) |
| Framework | Vue 3 (`<script setup>`, Composition API) |
| Build tool | Vite 8 + `@vitejs/plugin-vue` |
| Styling | Tailwind CSS 4 lewat `@tailwindcss/vite` |
| Routing | `vue-router` mode history, alamat bersih (`/artikel`) |
| Ikon/font | Plus Jakarta Sans dari `@fontsource-variable/plus-jakarta-sans` (disimpan lokal) |
| Offline | PWA/service worker dari `vite-plugin-pwa` (Workbox) |
| Basis data | Tidak ada. Tidak ada login. Tidak ada API. |
| Basis pengetahuan | Tiga berkas JSON statis di `public/data/` |
| Metode inferensi | Forward chaining dan backward chaining |
| Jumlah gangguan | 13 topik dalam skrining + `P0` untuk keluaran tanpa pola yang ditandai |
| Jumlah gejala | 109 entri: 105 pertanyaan aktif + 2 fakta antara + 2 edukasi saja |
| Jumlah sumber | 39 rujukan di `public/data/references.json` |
| Penyimpanan | Progres di IndexedDB, bahasa di localStorage, hasil hanya di memori |
| Target hosting | Hosting statis apa pun, GitHub Pages, atau nginx |

## Peta dokumentasi

| Dokumen | Isi |
|---|---|
| [code-guide.md](./code-guide.md) | Mulai dari nol: peta file, contoh sesi, alur fungsi, dan dasar Vue yang dipakai |
| [architecture.md](./architecture.md) | Teknologi, urutan startup, peta modul, aliran data, routing, plugin build, pola UI |
| [inference-engine.md](./inference-engine.md) | Model aturan, status kriteria, urutan pertanyaan, forward/backward chaining, fakta antara, durasi, protokol krisis, API mesin |
| [algorithm.md](./algorithm.md) | Pseudocode `LANGKAH`, aturan pemilihan pertanyaan, trace contoh P2 dan P9, terminasi, determinisme, perbandingan dua metode |
| [screening-help.md](./screening-help.md) | Panduan konsultasi, FAQ, pilihan Kurang yakin/Lewati, hasil parsial dan penyimpanan |
| [color-design.md](./color-design.md) | Alasan palet, sumber riset desain, mode gelap, serta pemeriksaan kontras |
| [research-audit.md](./research-audit.md) | Audit sumber, keputusan per topik, alasan perubahan dan penambahan, batasan klinis |
| [knowledge-base.md](./knowledge-base.md) | Skema `symptoms.json`, `conditions.json`, `references.json`, tabel lengkap aturan dan gejala, validasi data, cara menambah gangguan |
| [application-flow.md](./application-flow.md) | Daftar rute, alur konsultasi, sinkronisasi tab, halaman hasil, langkah bantuan, protokol krisis dan pengguna remaja |
| [data-and-privacy.md](./data-and-privacy.md) | Apa yang disimpan dan tidak, IndexedDB, migrasi localStorage, service worker, perilaku offline, batasan privasi |
| [development-and-deployment.md](./development-and-deployment.md) | Persyaratan, perintah npm, struktur folder, build, GitHub Pages, nginx, pemeliharaan berkala, checklist QA |

Dokumen ringkas untuk pengguna dan kontributor juga tersedia di [README utama](../README.md).

## Alur besar aplikasi

```mermaid
flowchart LR
    A[Pengguna] --> B{Pilih pemeriksaan}
    B -->|Belum tahu| C[Skrining Menyeluruh<br/>forward chaining]
    B -->|Sudah menduga| D[Skrining Topik Tertentu<br/>backward chaining]
    C --> E[Pertanyaan symptoms]
    D --> E
    E --> F{Kriteria satisfiedRules?}
    F -->|Belum| E
    F -->|Ya| G[Pertanyaan duration]
    G --> H[Hasil di memori halaman]
    H --> I[Langkah mencari bantuan profesional]
    H --> J[Hapus saat halaman ditinggalkan]
```

## Mulai cepat

```bash
npm install
npm run dev      # development, biasanya http://localhost:5173
npm run build    # result statis di dist/
npm run preview  # mencoba result build
```

Untuk menjalankan sistem, tidak diperlukan PHP, MySQL, login, maupun konfigurasi server tambahan.
Rincian build dan publikasi ada di [development-and-deployment.md](./development-and-deployment.md).

## Catatan penting

Sistem ini adalah alat edukasi dan skrining mandiri, **bukan alat diagnosis**. Pertanyaan dan aturan
disusun dari DSM-5-TR, ICD-11, PPDGJ-III, dan pedoman klinis, tetapi belum divalidasi oleh psikolog
klinis atau psikiater. Rincian batasan ini juga ditampilkan kepada pengguna pada halaman `/tentang`.
