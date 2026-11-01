# Skrining Awal Kesehatan Mental

Aplikasi edukasi dan skrining awal untuk membantu pengguna merefleksikan keluhan dan mencari bantuan psikolog klinis, psikiater, atau puskesmas. Aplikasi tidak menyediakan diagnosis, resep, konsultasi profesional, maupun surat rujukan medis.

Pertanyaan, aturan, dan terjemahan belum divalidasi secara klinis. Rujukan DSM-5-TR, ICD-11, PPDGJ-III, atau pedoman lain tidak menjadikan implementasi ini instrumen klinis yang tervalidasi. Hasil tidak memastikan ada/tidaknya gangguan atau tingkat keparahannya. Tidak ada jaminan bahwa perubahan tujuan aplikasi dengan sendirinya menentukan status hukumnya.

## Perilaku pengguna

- **Skrining Menyeluruh** menggunakan forward chaining untuk mengarahkan pertanyaan lintas topik.
- **Skrining Topik Tertentu** menggunakan backward chaining untuk mengarahkan pertanyaan pada satu topik.
- Cakupan 13 topik: 11 topik sebelumnya ditinjau ulang, ditambah mimpi buruk berulang dan pola tidur-bangun terlambat sebagai topik edukasi.
- Hasil menampilkan topik untuk dibahas, diikuti langkah mencari bantuan. Kode kondisi internal dipakai untuk topik percakapan, bukan diagnosis.
- Halaman hasil tidak menampilkan daftar diagnosis, klaim kriteria diagnosis terpenuhi, atau rekomendasi penanganan personal.
- Pengguna dapat membuka **Cara mencari bantuan** tanpa memulai atau menyelesaikan skrining.
- Tidak ada fitur unduh atau ekspor hasil. Hasil hanya ada di memori halaman.
- Tidak adanya topik yang ditandai atau durasi yang belum memenuhi aturan tidak berarti pengguna sehat, keluhannya ringan, atau perlu menunggu sebelum mencari bantuan.

## Bahasa

Navbar menyediakan bendera 🇮🇩 / 🇬🇧 untuk Bahasa Indonesia dan English. Pergantian bahasa tidak memuat ulang halaman atau mengubah jawaban. Preferensi disimpan pada `sispak.language` di localStorage; jika akses diblokir, pergantian bahasa tetap bekerja selama halaman terbuka.

Teks sumber Indonesia ada di komponen, modul, dan JSON. Terjemahan English ada di `src/locales/en.json`. Judul pustaka dan nama resmi sumber dipertahankan.

## Data dan privasi

- Tidak ada backend, akun, atau database server. Jawaban dan hasil tidak dikirim ke server.
- Progres belum selesai disimpan di IndexedDB perangkat pengguna agar dapat dilanjutkan; progres dihapus ketika hasil dibuat.
- Progres disinkronkan antar-tab melalui BroadcastChannel. Field format lama dinormalisasi melalui `sessionCompatibility.js`, tetapi progres dengan versi pertanyaan lama tidak dilanjutkan.
- Hasil tersimpan sementara di `latestResult` dan dihapus ketika pengguna meninggalkan halaman hasil atau dokumen masuk `pagehide`. Muat ulang juga menghilangkan hasil.
- **Hapus jawaban saya** menghapus progres dan keluar dari skrining. Daftar jawaban tertutup secara bawaan untuk perangkat bersama.
- Tidak ada pelacak atau analitik. Font dibundel bersama aplikasi.
- Aplikasi tidak menyediakan ekspor, tetapi tidak mengendalikan fitur tangkapan layar atau cetak bawaan perangkat pengguna.

## Bantuan krisis dan pengguna di bawah 18 tahun

Gejala `G58` tetap selalu ditanyakan dalam cakupan skrining menyeluruh dan topik depresi, sekalipun aturan lain sudah gugur. Jika dijawab Ya, kontak bantuan tampil segera dan tetap di paling atas hasil. Pesan krisis tidak diganti dengan kesimpulan bahwa pengguna aman.

Pengguna di bawah 18 tahun mendapat pesan pendampingan orang tua/wali/guru BK sebelum pertanyaan dan pada hasil. Sistem memakai dasar pertanyaan untuk dewasa dan tidak mengklaim validitas untuk anak atau remaja.

Teks bersama terdapat di `src/lib/supportMessages.js`. Kontak yang tercantum adalah IGD, 112, 119, dan Healing119. Periksa ulang akses layanan serta pedoman secara berkala; jangan mengubah `CONTACTS_REVIEWED_AT` tanpa pemeriksaan.

## Menjalankan project

Gunakan Node.js 20.19+ atau 22.12+ dan npm.

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
```

`npm run build` menghasilkan aplikasi statis di `dist/`. Folder ini juga digunakan pengalih pada `index.html` sumber ketika project dibuka langsung lewat web server.

## Deploy

GitHub Pages memakai `.github/workflows/deploy.yml` untuk build setiap push ke `main`. Aktifkan **Settings → Pages → Source: GitHub Actions**. Workflow memasukkan `BASE_PATH=/<nama-repo>/` sebelum build. Tidak ada backend yang perlu di-deploy.

Untuk hosting statis lain, unggah isi `dist/`. Untuk subfolder yang tetap:

```bash
BASE_PATH=/mental-health-expert-system/ npm run build
```

Router mempertahankan URL Indonesia, termasuk `/konsultasi`, `/cek-menyeluruh`, `/cek-gangguan`, dan `/hasil`, agar tautan lama tetap bekerja. Plugin build menyalin halaman HTML untuk GitHub Pages; nginx dapat memakai konfigurasi di `deploy/nginx.conf`.

Service worker meng-cache aplikasi, font, dan basis pengetahuan setelah kunjungan online. Katalog bahasa dibundel sehingga ikut tersedia offline. Pembaruan ditawarkan melalui banner tanpa memuat ulang hasil secara otomatis. Cache Workbox versi lama dibersihkan ketika versi baru aktif.

## Peta kode

| Berkas | Tanggung jawab |
|---|---|
| `public/data/symptoms.json` | Gejala, pertanyaan, tanda krisis, fakta turunan |
| `public/data/conditions.json` | Cakupan topik, aturan, durasi, informasi edukasi |
| `public/data/references.json` | Sumber pustaka |
| `src/lib/knowledgeBase.js` | Membaca dan memvalidasi JSON |
| `src/lib/rules.js` | Fakta turunan dan pemeriksaan aturan |
| `src/lib/forwardChaining.js` | Inferensi maju dan pemilihan pertanyaan |
| `src/lib/backwardChaining.js` | Pembuktian target dan pemilihan pertanyaan |
| `src/lib/consultationSession.js` | Buat sesi, jawab, kembali, langkah berikutnya |
| `src/lib/consultationProgress.js` | Progres dan sinkronisasi tab |
| `src/lib/consultationResult.js` | Ringkasan hasil dalam memori |
| `src/lib/consultationDisplay.js` | Penyajian bahasa, judul hasil netral, label |
| `src/components/ConsultationSession.vue` | Tampilan tanya-jawab |
| `src/views/ResultView.vue` | Ringkasan skrining dan dorongan mencari bantuan |
| `src/components/SupportMessage.vue` | Batasan dan langkah mengakses profesional |
| `src/lib/i18n.js` | Pilihan bahasa dan preferensi |

Mulai belajar dari [panduan kode](docs/code-guide.md). Dokumentasi lengkap ada di [docs/README.md](docs/README.md).

## Pengujian

`npm test` memeriksa mesin inferensi, batas durasi, fakta turunan, pertanyaan krisis, tombol kembali, kompatibilitas sesi, bahasa, dan keluaran skrining. Tes perangkat lunak tidak membuktikan validitas klinis pertanyaan atau aturan.

Versi PHP/MySQL lama berada pada branch `sispak-v1`; tag `backup-asli` menyimpan kode awal.

## Audit sumber gejala

[Hasil riset dan keputusan per topik](docs/research-audit.md) mencatat koreksi aturan, sumber setiap gejala, batasan, dan alasan dua tambahan. Setiap pertanyaan aktif mempunyai tautan sumber. Validasi data menolak aturan rusak; sesi lama dimulai ulang setelah perubahan makna pertanyaan. Riset pustaka dan tes program tidak membuktikan validitas klinis.

## Bantuan pengisian dan konsultasi

Panduan konsultasi pertama tersedia di hasil dan Tentang. Pilihan Kurang yakin/Lewati tetap dianggap belum diketahui dan tidak diulang otomatis; hasil menjelaskan bila informasi belum cukup. FAQ dapat dibuka tanpa menyelesaikan skrining. Lihat [rincian fitur dan model jawaban](docs/screening-help.md).
