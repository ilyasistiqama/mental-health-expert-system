# Panduan konsultasi, FAQ, dan jawaban belum pasti

Diperbarui 1 November 2026. Versi sesi/basis pengetahuan aplikasi: `2026-11-01-responses-2`.

## Fitur pengguna

1. **Panduan konsultasi pertama** ada di halaman hasil dan `/tentang#first-consultation`. Panduan umum membantu menyiapkan keluhan, awal/frekuensi, dampak, serta pertanyaan. Contoh pembuka bukan kesimpulan personal, surat rujukan, atau ekspor hasil. Referensi: [NIMH](https://www.nimh.nih.gov/health/publications/tips-for-talking-with-your-health-care-provider).
2. **Kurang yakin** dan **Lewati** tersedia pada gejala dan durasi. Keduanya mempertahankan informasi sebagai belum diketahui, tidak diubah menjadi Tidak atau nol hari. Pengguna dapat memakai Kembali untuk mengganti pilihan. Semua tombol Ya/Tidak tetap bergaya netral yang sama.
3. **FAQ** pada `/faq` membahas tujuan, hasil kosong, pilihan jawaban, informasi tidak lengkap, akses bantuan, metode, privasi, dan keadaan mendesak. Tersedia melalui footer, petunjuk pengisian, dan halaman Tentang. Navbar tetap ringkas.

Semua teks tersedia dalam Indonesia dan English. Panduan dan FAQ tidak membutuhkan login, backend, ataupun database server. Komponen panduan tidak mempunyai kolom input dan tidak menyimpan catatan pribadi baru.

## Model sesi

`facts` hanya menyimpan boolean untuk gejala langsung. `duration` hanya menyimpan angka dari pilihan durasi. Pilihan baru disimpan terpisah:

`deferredAnswers = { G02: "unsure", "duration:P3": "skipped" }`

`order` mencatat kode untuk keempat jenis respons. `listAnswers()` menghasilkan label Kurang yakin/Dilewati dan `yes: null` untuk pilihan yang belum diketahui. `undoAnswer()` menghapus entri dari map yang sesuai. `answerQuestion()` menolak input tidak valid; nilai selain boolean tidak lagi diam-diam menjadi false.

## Pemilihan pertanyaan dan terminasi

Status semantik aturan tetap tiga keadaan: terpenuhi, gugur, atau terbuka. Pilihan yang ditunda tidak masuk fakta turunan dan tidak memenuhi maupun menggugurkan syarat dengan sendirinya.

Pemilihan pertanyaan menyaring kode pada `deferredAnswers` agar tidak berulang. Forward melanjutkan pertanyaan penyaring/aturan lain lalu pertanyaan relevan yang masih bisa dijawab. Backward melanjutkan subgoal lain. Durasi yang dilewati juga tidak ditanyakan kembali otomatis.

Sesi selesai ketika tidak ada pertanyaan relevan yang masih dapat diajukan, durasi yang belum ditawarkan, atau pertanyaan keselamatan yang belum ditawarkan dalam cakupannya. **Aturan boleh tetap terbuka saat sesi selesai** jika ada informasi yang sengaja tidak diisi. Ini berbeda dari semua aturan gugur.

Hasil menambahkan:

- `incompleteConditions`: kode topik yang masih terbuka atau durasinya belum diketahui. Tidak ditampilkan sebagai daftar dugaan penyakit.
- `deferredAnswers`: pilihan belum pasti yang benar-benar dibuat dalam sesi.
- `hasUnansweredSafetyQuestion`: pertanyaan keselamatan dipilih Kurang yakin/Lewati.

`insufficientDuration` hanya untuk durasi angka yang diketahui tetapi belum mencapai ambang. Durasi belum diketahui tidak masuk kelompok ini. Gejala opsional yang belum diketahui tidak membatalkan topik bila jawaban pasti lainnya sudah cukup; hasil tetap menjelaskan adanya respons belum pasti.

## Keselamatan dan hasil

G58 tetap ditawarkan pada forward dan target depresi, termasuk ketika aturan depresi gugur. Pengguna boleh memilih Kurang yakin/Lewati; pertanyaan tidak dipaksakan atau diulang. Kontak bantuan dapat dibuka langsung dari pertanyaan tersebut.

Jawaban Ya tetap memunculkan panel bantuan seperti sebelumnya. Jawaban belum pasti tidak dianggap jawaban Ya, Tidak, atau bukti bahwa pengguna aman. Pada hasil ada pemberitahuan khusus beserta jalur bantuan jika pertanyaan keselamatan belum dijawab pasti. Aplikasi tidak menilai keadaan darurat atau risiko secara lengkap.

Jika belum ada topik dan masih ada aturan terbuka, judul menjelaskan bahwa informasi belum cukup. Jika ada topik lain yang dapat dirangkum, topik itu tetap tampil terlebih dahulu, disertai keterbatasan informasi. Panel krisis tetap di atas seluruh hasil bila diperlukan. Panduan konsultasi menyusul bagian bantuan profesional.

## Penyimpanan dan pembaruan

Progres menyimpan map pilihan baru di IndexedDB perangkat melalui format sesi yang sudah ada. Validasi menolak respons tidak dikenal, kode invalid, atau kode yang sekaligus berisi fakta pasti dan respons belum pasti. Perbandingan sinkronisasi mencakup `deferredAnswers` dan kelompok usia. Format penyimpanan tetap mempertahankan label internal English.

Versi diperbarui agar tab aplikasi lama tidak membaca/mengubah progres dengan model jawaban baru. Kunci versi audit sebelumnya dibersihkan saat startup, selain migrasi progres lama yang belum memiliki versi. Daftar namespace sebelumnya ada di `PREVIOUS_SESSION_KEYS`; pertahankan daftar ini saat memperbarui skema berikutnya. Pengguna mendapat pesan mulai ulang bila progres lama ditemukan. Hasil tetap hanya di memori, progres dihapus setelah hasil dibuat, dan tidak ada ekspor atau riwayat hasil.

## Berkas utama dan verifikasi

- `screeningHelp.js`, `ConsultationGuide.vue`, `FaqView.vue`: konten bersama dan tampilan.
- `consultationSession.js`, `rules.js`, `forwardChaining.js`, `backwardChaining.js`: respons baru, pemilihan pertanyaan, dan hasil parsial.
- `consultationProgress.js`, `consultationResult.js`, `consultationDisplay.js`: validasi progres dan penjelasan hasil.
- `router.js` dan `vite.config.js`: rute FAQ beserta salinan halaman untuk GitHub Pages.

Tes regresi meliputi semua pilihan belum pasti pada kedua metode, tidak ada pengulangan, gejala wajib/opsional, fakta turunan, durasi, Kembali, penyimpanan, pertanyaan keselamatan, penjelasan hasil, panduan, FAQ, dan dua bahasa. Tes perangkat lunak bukan validasi klinis.
