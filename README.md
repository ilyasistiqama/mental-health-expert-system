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

## Keamanan isi dan privasi

- Tidak ada permintaan ke server pihak ketiga: font (Plus Jakarta Sans, lisensi OFL) disimpan bersama
  aplikasi lewat `@fontsource-variable/plus-jakarta-sans`, tanpa analitik maupun pelacak.
- Hasil tanpa kecenderungan tidak ditulis sebagai "tidak terdeteksi", melainkan "tidak menunjukkan
  kecenderungan", disertai penjelasan bahwa hasil skrining tidak menjamin bebas dari gangguan.
- Saran penanganan tidak menyebut nama obat; obat selalu dirujuk ke resep dan pengawasan dokter/psikiater.
- Sebelum pertanyaan pertama, pengguna diberi petunjuk untuk menjawab sejujurnya agar hasil akurat
  (dilewati jika melanjutkan konsultasi).
- Halaman **Tentang & batasan** (`/tentang`) menjelaskan tujuan, batasan (bukan diagnosis, gangguan yang
  diperiksa, bukan untuk keadaan darurat, pengguna di bawah 18 tahun didampingi), dan perlakuan data.

## Disclaimer dan pesan dukungan

Setiap hasil (halaman dan PDF) menampilkan pesan bahwa hasil **bukan diagnosis dan bukan rujukan ke
dokter**, melainkan dorongan untuk berbicara dengan psikolog klinis, psikiater, atau puskesmas, disertai
langkah yang bisa diambil dan nomor darurat 119 ext 8. Kalimatnya ada di satu tempat,
`src/lib/pesanDukungan.js`, agar halaman dan PDF selalu sama.

Konfirmasi memakai dialog sendiri (`src/components/DialogKonfirmasi.vue`), bukan `alert`/`confirm`
bawaan browser. Satu-satunya pengecualian adalah konfirmasi saat menutup tab atau memuat ulang halaman
hasil: browser tidak mengizinkan situs mengganti tampilan dialog tersebut.

## Mode offline

Setelah dibuka sekali saat online, sistem bisa dipakai **tanpa internet** (konsultasi, hasil, PDF,
artikel). Service worker dibuat oleh `vite-plugin-pwa` saat `npm run build`.

- Tampilan aplikasi disimpan penuh di cache browser.
- Data `data/*.json` memakai strategi *network-first*: saat online selalu mengambil versi terbaru dari
  server (jadi edit JSON di hosting tetap langsung terlihat), saat offline memakai salinan terakhir.
- Saat versi baru di-deploy, muncul banner **"Versi baru sistem tersedia"** dengan tombol Perbarui.
  Halaman tidak dimuat ulang otomatis, dan banner tidak tampil di halaman hasil, karena hasil hanya
  ada di memori dan akan hilang jika halaman dimuat ulang. Progres jawaban tetap aman.
- Cache hanya berisi file aplikasi (termasuk font) dan basis pengetahuan, tidak ada data pengguna.
- Service worker hanya aktif di **HTTPS** (misalnya GitHub Pages) atau `localhost`. Di HTTP biasa sistem
  tetap jalan, hanya saja tanpa mode offline.

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

> `index.html` di root project adalah **file sumber** Vite, bukan aplikasi jadi. Jika folder project
> dibuka langsung lewat web server, halaman itu otomatis mengarahkan ke `dist/`.

### Publikasi ke GitHub Pages

Repo ini sudah berisi workflow `.github/workflows/deploy.yml` yang otomatis mem-build dan
mempublikasikan aplikasi setiap ada push ke `main`, dengan alamat bersih tanpa `/dist/` dan `#`:
`https://<username>.github.io/<nama-repo>/artikel`.

Cukup sekali: di GitHub buka **Settings → Pages → Build and deployment → Source**, pilih
**GitHub Actions**. Progres deploy bisa dilihat di tab **Actions**.

Catatan teknis:
- Router memakai alamat bersih (mode history). Saat build, setiap halaman dibuatkan salinan
  `index.html` (`artikel.html`, `konsultasi.html`, dst.) agar GitHub Pages melayaninya dengan status 200;
  `404.html` menjadi cadangan. Jika menambah halaman baru, tambahkan juga namanya di `HALAMAN`
  pada `vite.config.js`.
- Tautan lama berformat `#/artikel` otomatis diubah ke `/artikel`.

### Publikasi ke VPS (nginx)

1. Jalankan `npm run build`, lalu salin **isi** folder `dist/` ke server, misalnya `/var/www/sispak/dist`.
2. Pakai contoh konfigurasi di [`deploy/nginx.conf`](deploy/nginx.conf): sesuaikan `server_name` dan
   `root`, aktifkan, lalu `nginx -t && systemctl reload nginx`.
3. Pasang HTTPS (misalnya `certbot --nginx`), karena mode offline hanya aktif di HTTPS.

Inti konfigurasinya adalah `try_files $uri $uri.html $uri/ /index.html;` agar alamat seperti `/artikel`
tetap bisa dibuka langsung dan di-refresh. Jika aplikasi ditaruh di subfolder (misalnya
`domain.com/sispak/`), build dengan `BASE_PATH=/sispak/ npm run build` dan sesuaikan `location`-nya.

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
  lib/offline.js         pendaftaran service worker (mode offline) + banner versi baru
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
memenuhi batas minimal DSM-5-TR. Seluruh isi basis pengetahuan merujuk pada sumber di `public/data/sumber.json`.

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
  membuktikan kriterianya dan berhenti begitu satu kriteria tidak mungkin terpenuhi. Gejala hipotesis
  ditanyakan dalam **urutan acak** yang dibuat sekali per sesi; gejala bertanda `"akhir": true`
  (pertanyaan dampak ke kehidupan sehari-hari) selalu ditanyakan paling akhir.

Karena urutannya acak, setiap pertanyaan ditulis agar bisa berdiri sendiri (tidak merujuk ke
pertanyaan sebelumnya seperti "serangan tersebut").

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
- Tulis setiap pertanyaan agar bisa berdiri sendiri, karena urutan tanya diacak.
- Tambahkan `"akhir": true` pada gejala yang harus selalu ditanyakan paling akhir (seperti G49).
- Kode harus unik. Satu gejala boleh dipakai oleh beberapa gangguan (misalnya G49 dipakai semua).
- `P0` wajib ada: isinya ditampilkan jika tidak ada gangguan yang terdeteksi (biarkan `kriteria` kosong).
- Kesalahan data (kode gejala salah ketik, durasi tidak valid) muncul sebagai peringatan di console browser (F12).

## Data yang disimpan di browser

| IndexedDB `sispak` → store `sesi` | Isi |
|-----------------------------------|-----|
| `sispak.sesi.forward`  | Jawaban Cek Menyeluruh yang belum selesai (dihapus saat hasil keluar) |
| `sispak.sesi.backward` | Jawaban Cek Gangguan Tertentu yang belum selesai (dihapus saat hasil keluar) |

Data versi lama di localStorage (termasuk riwayat hasil) dihapus otomatis saat aplikasi dibuka.
