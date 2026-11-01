# Alur aplikasi: skrining untuk mendorong bantuan profesional

## Tujuan dan halaman

Sistem membantu refleksi keluhan, tidak menetapkan diagnosis atau memberikan penanganan personal. Mencari bantuan tidak bergantung pada hasil skrining.

| Rute | Isi |
|---|---|
| `/` | Pengantar tujuan skrining, tombol mulai, dan jalur mencari bantuan |
| `/artikel` | Informasi edukasi dan referensi; bukan saran personal |
| `/konsultasi` | Pilihan metode, lanjutkan progres, cari bantuan tanpa skrining |
| `/cek-menyeluruh` | Pertanyaan lintas topik dengan forward chaining |
| `/cek-gangguan?id=Pn` | Pertanyaan satu topik dengan backward chaining |
| `/hasil` | Ringkasan sementara, topik percakapan, langkah bantuan, jawaban |
| `/tentang#professional-help` | Cara mengakses puskesmas, klinik psikologi, atau layanan psikiatri |
| `/sumber` | Sumber pustaka |
| `/faq` | Pertanyaan umum tentang tujuan, pilihan jawaban, hasil, privasi dan bantuan |
| `/tentang#first-consultation` | Panduan konsultasi pertama tanpa perlu skrining |

URL lama `/forward` dan `/backward` tetap dialihkan ke rute pemeriksaan yang sesuai. Nama rute dipertahankan untuk kompatibilitas; label antarmuka memakai istilah skrining.

## Sesi

1. Sebelum mulai, pengguna membaca tujuan, batasan, status belum tervalidasi, privasi, dan memilih usia.
2. Pengguna di bawah 18 tahun mendapat pesan pendampingan.
3. `ConsultationSession.vue` mengambil progres yang cocok atau membuat sesi baru.
4. Klik jawaban memanggil `answerQuestion()`. `getNextStep()` menentukan pertanyaan gejala, durasi, atau selesai.
5. Progres disimpan sementara di IndexedDB, disinkronkan antar-tab, dan dapat dibatalkan atau dihapus.
6. Jawaban Ya pada gejala krisis segera menampilkan `CrisisPanel`.
7. Ketika selesai, `createResult()` membuat hasil di memori dan progres dihapus. Router membuka `/hasil`.

Pergantian bahasa hanya mengubah penyajian. Jawaban, kode, urutan, durasi, dan aturan tetap sama.

## Hasil

Urutan halaman hasil:

1. Kontak bantuan krisis jika diperlukan, sebelum bagian hasil apa pun.
2. Judul netral, lalu daftar topik percakapan di kartu hasil paling atas. Nama topik langsung terlihat, disertai penjelasan bahwa ini bukan daftar penyakit pengguna.
3. Catatan durasi bila diperlukan, penjelasan batasan skrining, dan tombol **Cara mencari bantuan**.
4. `SupportMessage`: tujuan skrining, status belum tervalidasi, dan langkah mengakses pemeriksaan profesional tanpa perlu membawa hasil.
5. Panduan konsultasi pertama dengan contoh pembuka percakapan.
6. Pesan pendampingan untuk remaja.
7. Daftar jawaban, tertutup secara bawaan, serta catatan hasil sementara.

Tidak ada daftar diagnosis, skor keparahan, klaim kriteria diagnosis terpenuhi, rekomendasi terapi personal, atau fitur ekspor. Informasi edukasi umum berada pada halaman artikel.

Untuk jawaban tanpa pola yang ditandai, kartu ringkasan tetap menjelaskan bahwa skrining selesai dan belum merangkum topik khusus. Pada skrining satu topik, cakupan sesi disebutkan agar tidak terbaca sebagai pemeriksaan semua masalah kesehatan mental. Tiga bahan percakapan tetap diberikan: keluhan/pertanyaan, awal serta dampaknya, dan dukungan yang dibutuhkan. Ini tidak menyatakan pengguna sehat atau bebas gangguan. Jika jawaban krisis bernilai Ya, judul mengutamakan dukungan dan kontak bantuan tetap di paling atas.

## Kehilangan hasil dan privasi

`latestResult` hanya berada di memori. Perpindahan rute dari hasil meminta konfirmasi lalu menghapus hasil. Event `pagehide` juga menghapus hasil agar tidak kembali muncul dari cache navigasi browser. Muat ulang atau membuka `/hasil` langsung menampilkan hasil tidak tersedia.

Tidak ada peringatan browser yang mendorong pengguna mengunduh dokumen. Aplikasi tidak menyediakan unduhan hasil dan tidak mengendalikan tangkapan layar atau pencetakan bawaan browser.

## Batasan

Aturan telah ditinjau terhadap sumber dan diperbaiki; rincian ada di [audit riset](./research-audit.md). Aturan dan terjemahan tetap belum divalidasi secara klinis. Perubahan penyajian memperjelas tujuan penggunaan, bukan membuktikan efektivitas skrining, keamanan klinis, atau kepatuhan hukum.

## Respons belum pasti

Kurang yakin/Lewati tersedia untuk gejala maupun durasi. Keduanya tidak dianggap Tidak/nol hari, tidak diulang otomatis, dan bisa diubah dengan Kembali. Jika masih ada topik terbuka, hasil menyebut informasi belum cukup. Pertanyaan keselamatan yang ditunda menampilkan keterbatasan dan jalur bantuan tanpa memberi kesimpulan aman. FAQ juga dapat dibuka dari petunjuk pengisian serta footer. Rincian ada di [screening-help.md](./screening-help.md).
