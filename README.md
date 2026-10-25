# Sistem Pakar Gangguan Kecemasan (PHP + MySQL)

Versi PHP + MySQL dengan login. Versi tanpa database (Vue + localStorage) ada di branch `main`,
dan kode asli sebelum perbaikan disimpan pada tag `backup-asli`.

## Instalasi

1. Butuh PHP **8.2+** (memakai `mysqli_execute_query`) dan MySQL 5.7+/8 atau MariaDB 10.5+.
2. Buat database `sispak`, lalu impor `spakar.sql` (phpMyAdmin → Import).
   File ini **menghapus dan membuat ulang** semua tabel.
3. Letakkan folder project di `htdocs`/`www`, lalu buka `index.php` di browser.
4. Akun contoh: username `ilyas`, password `ilyas`. Akun baru bisa dibuat di halaman Daftar.

Koneksi database default `localhost`, user `root`, tanpa password. Jika berbeda, ubah
`database/koneksi.php` atau atur environment variable `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`.

## Basis pengetahuan

Kriteria disusun dari DSM-5-TR, ICD-11, dan PPDGJ-III (daftar lengkap di tabel `sumber` dan
halaman Sumber). Isinya identik dengan `public/data/*.json` di branch `main`.

| Tabel | Isi |
|-------|-----|
| `penyakit` | 8 gangguan + P0 (tidak terdeteksi), durasi minimal, rujukan klasifikasi |
| `gejala` | 49 gejala beserta pertanyaannya; kolom `urutan` menentukan urutan tanya |
| `kriteria`, `kriteria_gejala` | aturan: penyakit terbukti jika semua kriteria terpenuhi, kriteria terpenuhi jika minimal `minimal` gejalanya dijawab Ya |
| `pengobatan` | saran penanganan tiap penyakit |
| `sumber`, `penyakit_sumber` | daftar pustaka dan rujukan tiap penyakit |
| `riwayat` | hasil konsultasi tiap user |

## Metode inferensi

Mesin inferensi ada di `lib/SistemPakar.php` (sama persis dengan `src/lib/sistemPakar.js` di branch `main`).

- **Forward chaining**: pertanyaan penyaring (kriteria pertama tiap gangguan) ditanyakan dalam urutan
  acak yang dibuat sekali per sesi. Jika penyaring sebuah gangguan dijawab *Ya*, gejala lanjutannya
  ditanyakan sampai tuntas dengan urutan tetap, lalu durasi keluhan ditanyakan sebagai akhir diagnosa.
  Gejala yang tidak bisa lagi mengubah hasil tidak ditanyakan, sehingga kesimpulan selalu sama untuk
  jawaban yang sama, apa pun urutan acaknya. Bisa menghasilkan lebih dari satu gangguan.
- **Backward chaining**: pilih satu gangguan sebagai hipotesis, sistem membuktikan kriterianya
  satu per satu (tidak diacak) dan berhenti begitu satu kriteria tidak mungkin terpenuhi.
