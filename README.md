# Sistem Pakar Gangguan Kecemasan

Sistem pakar berbasis web untuk mengenali kecenderungan gangguan kecemasan dengan metode
**Forward Chaining** dan **Backward Chaining**. Dibuat dengan [Vue 3](https://vuejs.org) + [Vite](https://vite.dev).

Tidak memakai database dan tidak perlu login. Progres konsultasi dan riwayat hasil disimpan
di **localStorage** browser masing-masing pengguna.

> Versi lama (PHP + MySQL + login) ada di branch `sispak-v1`.

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

Hasilnya ada di folder `dist/`. Upload **isi** folder `dist/` ke hosting (public_html, htdocs,
atau subfolder mana pun). Tidak butuh PHP, MySQL, ataupun konfigurasi server tambahan.

Untuk mencoba hasil build di komputer sendiri: `npm run preview`.

## Struktur folder

```
index.html               halaman HTML utama (Vite)
public/
  favicon.svg
  data/penyakit.json     daftar penyakit + aturan (gejala apa saja) + penanganan
  data/gejala.json       daftar gejala + pertanyaannya
src/
  main.js                titik masuk aplikasi
  App.vue                layout: navigasi + footer
  router.js              daftar halaman (URL)
  assets/main.css        seluruh tampilan
  lib/sistemPakar.js     mesin inferensi forward/backward chaining + riwayat
  components/SesiKonsultasi.vue  tampilan tanya-jawab (dipakai forward & backward)
  lib/penyimpanan.js     pembungkus localStorage
  components/            komponen kecil yang dipakai ulang
  views/                 satu file per halaman
```

## Metode inferensi

Basis pengetahuan berbentuk **aturan produksi**:

```
IF G02 AND G03 AND G04 AND G05 AND G06 THEN P2 (Gangguan Kecemasan Menyeluruh)
```

Setelah semua gejala sebuah aturan terpenuhi, sistem menanyakan apakah gejala sudah dialami
**2 minggu atau lebih**. Jawaban ini menjadi akhir diagnosa: *Ya* berarti penyakit disimpulkan,
*Tidak* berarti belum dapat disimpulkan.

- **Forward chaining** (data-driven): sistem mengumpulkan fakta gejala dari pengguna lalu
  menjalankan semua aturan yang premisnya terpenuhi, sehingga bisa menghasilkan lebih dari satu
  penyakit. Gejala yang hanya dimiliki aturan yang sudah gugur (ada premis dijawab *Tidak*) tidak
  ditanyakan lagi; hasilnya tetap sama dengan menanyakan semua gejala, hanya lebih singkat.
- **Backward chaining** (goal-driven): pengguna memilih satu penyakit sebagai hipotesis, lalu sistem
  membuktikan premisnya satu per satu dan berhenti begitu satu premis tidak terpenuhi.

## Menambah atau mengubah penyakit dan gejala

Cukup edit file JSON di `public/data/` (atau `data/` di folder hasil build/hosting).
**Tidak perlu build ulang**, cukup refresh browser.

1. Tambahkan gejala baru di `gejala.json`:

   ```json
   { "kode": "G12", "nama": "Jantung berdebar", "pertanyaan": "Apakah jantung anda sering berdebar tanpa sebab?" }
   ```

2. Tambahkan penyakit baru di `penyakit.json`, isi `gejala` dengan kode-kode gejalanya (aturannya):

   ```json
   {
       "kode": "P6",
       "nama": "Nama Gangguan",
       "deskripsi": "Penjelasan singkat.",
       "gejala": ["G12", "G05"],
       "pengobatan": ["Saran penanganan 1.", "Saran penanganan 2."]
   }
   ```

Catatan:
- Kode harus unik. Satu gejala boleh dipakai oleh beberapa penyakit.
- Gejala ditanyakan sesuai urutan di `gejala.json`.
- `P0` wajib ada: isinya ditampilkan jika tidak ada penyakit yang terdeteksi (biarkan `gejala` kosong).
- Jika ada kode gejala yang salah ketik, peringatannya muncul di console browser (F12).

## Data yang disimpan di browser

| Key localStorage  | Isi                                             |
|-------------------|-------------------------------------------------|
| `sispak.sesi.forward`  | Progres forward chaining yang belum selesai  |
| `sispak.sesi.backward` | Progres backward chaining yang belum selesai |
| `sispak.riwayat`  | 20 hasil konsultasi terakhir                    |
