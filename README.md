# Sistem Pakar Gangguan Kecemasan

Sistem pakar berbasis web untuk mengenali kecenderungan gangguan kecemasan dengan metode
**Forward Chaining** dan **Backward Chaining**. Dibuat dengan [Vue 3](https://vuejs.org),
[Vite](https://vite.dev), dan [Tailwind CSS 4](https://tailwindcss.com).

Tidak memakai database dan tidak perlu login. Untuk pengguna, kedua metode diberi nama awam:
**Cek Menyeluruh** (forward chaining) dan **Cek Gangguan Tertentu** (backward chaining).

## Privasi dan penyimpanan

- **Hasil diagnosa tidak pernah disimpan**, baik di browser maupun di server. Hasil hanya ada di
  memori halaman dan hilang saat halaman ditutup atau dimuat ulang; pengguna bisa mengunduh PDF.
- **Jawaban yang belum selesai** disimpan sementara di IndexedDB perangkat pengguna agar konsultasi
  bisa dilanjutkan jika browser tertutup, lalu **dihapus otomatis begitu hasil keluar**. IndexedDB
  dipakai dengan `durability: "strict"` karena localStorage ditulis ke disk secara tertunda dan
  progres bisa hilang jika browser ditutup paksa (misalnya aplikasi browser di HP di-swipe).
- Jika penyimpanan browser diblokir, sistem tidak dijalankan dan pengguna diberi petunjuk.
- Tab lain yang masih terbuka ikut tersinkron, sehingga progres tidak tertimpa versi lama.

> Versi PHP + MySQL + login ada di branch `sispak-v1`. Kode asli sebelum perbaikan disimpan
> pada tag `backup-asli`.

## Persiapan (sekali saja)

1. Install [Node.js](https://nodejs.org) versi **20.19+** atau **22.12+** (pilih versi LTS).
2. Buka terminal di folder project ini, lalu jalankan:

   ```bash
   npm install
   ```

## Menjalankan saat development

```bash
npm run dev
```

Buka alamat yang muncul di terminal (biasanya http://localhost:5173). Setiap file disimpan,
halaman otomatis ter-update.

## Build untuk di-upload ke hosting

```bash
npm run build
```

Hasilnya ada di folder `dist/` (sudah ikut di-commit di branch `main`). Upload **isi** folder
`dist/` ke hosting (public_html, htdocs, GitHub Pages, atau subfolder mana pun). Tidak butuh PHP,
MySQL, ataupun konfigurasi server tambahan.

Untuk mencoba hasil build di komputer sendiri: `npm run preview`.

## Struktur folder

```
index.html               halaman HTML utama (Vite)
public/
  favicon.svg
  data/penyakit.json     daftar penyakit + aturan (gejala apa saja) + penanganan
  data/gejala.json       daftar gejala + pertanyaannya
  data/sumber.json       daftar pustaka; nomor [n] di halaman mengikuti urutan file ini
src/
  main.js                titik masuk aplikasi
  App.vue                layout: navigasi + footer
  router.js              daftar halaman (URL)
  assets/main.css        seluruh tampilan
  lib/sistemPakar.js     mesin inferensi forward/backward chaining + riwayat
  components/SesiKonsultasi.vue  tampilan tanya-jawab (dipakai forward & backward)
  lib/penyimpanan.js     penyimpanan progres di IndexedDB + pengecekan aktif/tidaknya
  lib/pdf.js             pembuat PDF hasil konsultasi (jsPDF)
  components/            komponen kecil yang dipakai ulang
  views/                 satu file per halaman
```

## Rujukan klinis

Basis pengetahuan disusun dari kriteria **DSM-5-TR** (APA, 2022), **ICD-11** (WHO, versi 2026-01),
dan **PPDGJ-III** (pedoman yang masih dipakai klinisi di Indonesia). Hingga 2026 belum ada edisi DSM
baru; APA baru merilis rencana revisinya (roadmap Januari 2026).

| Kode | Gangguan | Kategori DSM-5-TR | Durasi minimal |
|------|----------|-------------------|----------------|
| P1 | Gangguan Panik | Gangguan Kecemasan | 1 bulan |
| P2 | Gangguan Kecemasan Menyeluruh | Gangguan Kecemasan | 6 bulan |
| P3 | Fobia Spesifik | Gangguan Kecemasan | 6 bulan |
| P4 | Gangguan Obsesif-Kompulsif | Obsesif-Kompulsif dan Terkait | 2 minggu (PPDGJ-III F42) |
| P5 | Gangguan Stres Pascatrauma (PTSD) | Terkait Trauma dan Stresor | 1 bulan |
| P6 | Gangguan Kecemasan Sosial | Gangguan Kecemasan | 6 bulan |
| P7 | Agorafobia | Gangguan Kecemasan | 6 bulan |
| P8 | Gangguan Kecemasan Perpisahan | Gangguan Kecemasan | 6 bulan (dewasa) |

Pertanyaan merupakan penyederhanaan kriteria untuk skrining mandiri. Pada kriteria yang beberapa
gejalanya digabung (misalnya "berkeringat atau gemetar"), batas minimalnya dipilih sehingga tetap
memenuhi batas minimal DSM-5-TR. Isi basis pengetahuan sebaiknya divalidasi oleh pakar (psikolog/psikiater).

## Metode inferensi

Setiap gangguan adalah **aturan produksi** yang terdiri dari beberapa kriteria. Sebuah kriteria
terpenuhi jika minimal sejumlah gejalanya dijawab *Ya*:

```
IF  G02                                   (khawatir berlebihan)
AND G18                                   (sulit dikendalikan)
AND minimal 3 dari G19, G20, G21, G22, G23, G24
AND G49                                   (mengganggu kehidupan sehari-hari)
THEN P2 Gangguan Kecemasan Menyeluruh
```

Setelah semua kriteria sebuah gangguan terpenuhi, sistem menanyakan **sudah berapa lama** keluhan
dialami. Durasi menjadi akhir diagnosa: jika mencapai `durasiMinimal` gangguan tersebut, gangguan
disimpulkan; jika belum, hasilnya "belum dapat disimpulkan".

- **Forward chaining** (data-driven): sistem mengumpulkan fakta gejala lalu menjalankan semua aturan
  yang terpenuhi, sehingga bisa menghasilkan lebih dari satu gangguan. Urutan pertanyaan:
  1. jika semua kriteria sebuah gangguan sudah terpenuhi, durasinya langsung ditanyakan;
  2. jika pertanyaan penyaring sebuah gangguan dijawab *Ya*, gejala lanjutannya ditanyakan sampai
     tuntas dengan urutan tetap (tidak diacak) agar alur pertanyaan tetap runtut;
  3. selain itu, pertanyaan penyaring (kriteria pertama tiap gangguan) ditanyakan dalam **urutan acak**
     yang dibuat sekali di awal sesi dan disimpan, sehingga tetap sama walaupun halaman dimuat ulang.

  Gejala yang tidak bisa lagi mengubah hasil (aturannya sudah gugur atau kriterianya sudah terpenuhi)
  tidak ditanyakan. Karena itu kesimpulan **selalu sama** untuk jawaban yang sama, apa pun urutan acaknya,
  dan sama dengan menanyakan semua gejala.
- **Backward chaining** (goal-driven): pengguna memilih satu gangguan sebagai hipotesis, lalu sistem
  membuktikan kriterianya satu per satu dan berhenti begitu satu kriteria tidak mungkin terpenuhi.

## Menambah atau mengubah gangguan dan gejala

Cukup edit file JSON di `public/data/` (atau `data/` di folder hasil build/hosting).
**Tidak perlu build ulang**, cukup refresh browser.

1. Tambahkan gejala baru di `gejala.json`:

   ```json
   { "kode": "G50", "nama": "Jantung berdebar", "pertanyaan": "Apakah jantung anda sering berdebar tanpa sebab?" }
   ```

2. Tambahkan gangguan baru di `penyakit.json`:

   ```json
   {
       "kode": "P9",
       "nama": "Nama Gangguan",
       "kategori": "Gangguan Kecemasan",
       "deskripsi": "Penjelasan singkat.",
       "kriteria": [
           { "gejala": ["G50"] },
           { "gejala": ["G19", "G20", "G24"], "minimal": 2 },
           { "gejala": ["G49"] }
       ],
       "durasiMinimal": 30,
       "catatanDurasi": "Opsional, ditampilkan jika durasi belum terpenuhi.",
       "pengobatan": ["Saran penanganan 1.", "Saran penanganan 2."],
       "rujukan": "DSM-5-TR: ... · ICD-11: ... · PPDGJ-III: ..."
   }
   ```

Catatan:
- `minimal` boleh dihapus, artinya semua gejala pada kriteria itu wajib *Ya*.
- `durasiMinimal` dalam hari dan sebaiknya salah satu dari `0`, `14`, `30`, atau `180`, sesuai
  pilihan jawaban durasi (kurang dari 2 minggu, 2 minggu–1 bulan, 1–6 bulan, 6 bulan atau lebih).
  Jika pakar menghendaki batas 2 minggu untuk semua gangguan, ubah semuanya menjadi `14`.
- Gejala ditanyakan sesuai urutan di `gejala.json`, jadi letakkan pertanyaan penyaring di awal.
- Kode harus unik. Satu gejala boleh dipakai oleh beberapa gangguan (misalnya G49 dipakai semua).
- `P0` wajib ada: isinya ditampilkan jika tidak ada gangguan yang terdeteksi (biarkan `kriteria` kosong).
- Kesalahan data (kode gejala salah ketik, durasi tidak valid) muncul sebagai peringatan di console browser (F12).

## Data yang disimpan di browser

| IndexedDB `sispak` → store `sesi` | Isi |
|-----------------------------------|-----|
| `sispak.sesi.forward`  | Jawaban Cek Menyeluruh yang belum selesai (dihapus saat hasil keluar) |
| `sispak.sesi.backward` | Jawaban Cek Gangguan Tertentu yang belum selesai (dihapus saat hasil keluar) |

Data versi lama di localStorage (termasuk riwayat hasil) dihapus otomatis saat aplikasi dibuka.
