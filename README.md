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
public/                  file statis (favicon)
src/
  main.js                titik masuk aplikasi
  App.vue                layout: navigasi + footer
  router.js              daftar halaman (URL)
  assets/main.css        seluruh tampilan
  data/pengetahuan.js    basis pengetahuan: penyakit, gejala, pohon keputusan
  lib/sistemPakar.js     logika forward/backward chaining + riwayat
  lib/penyimpanan.js     pembungkus localStorage
  components/            komponen kecil yang dipakai ulang
  views/                 satu file per halaman
```

## Mengubah basis pengetahuan

Semua pertanyaan, gejala, dan saran penanganan ada di `src/data/pengetahuan.js`.

- `PENYAKIT`: nama, deskripsi, dan daftar penanganan tiap penyakit (P0 = tidak terdeteksi).
- `GEJALA`: pohon keputusan forward chaining. Kolom `ya` / `tidak` berisi nomor pertanyaan
  berikutnya, `"f"` berarti selesai. Pertanyaan 12 = tidak terdeteksi, 13 = konfirmasi 2 minggu.

## Data yang disimpan di browser

| Key localStorage  | Isi                                             |
|-------------------|-------------------------------------------------|
| `sispak.sesi`     | Progres forward chaining yang belum selesai     |
| `sispak.riwayat`  | 20 hasil konsultasi terakhir                    |
