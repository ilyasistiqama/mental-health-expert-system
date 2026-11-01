# Panduan membaca kode dari nol

Algoritma memakai JavaScript biasa dan bisa diuji dengan `npm test` tanpa membuka Vue atau browser. Dataset sudah berupa JSON; JavaScript membaca data dan menghitung hasilnya.

Keluaran saat ini hanya skrining awal. `getResultTitle()` menggunakan judul netral, dan `ResultView.vue` mengutamakan langkah mencari bantuan. Kode kondisi serta durasi merupakan data internal untuk menyusun topik percakapan; bukan diagnosis klinis. Tidak ada fitur unduh atau ekspor hasil.

## 1. Mulai dari file yang mana?

| Kebutuhan | Berkas |
|---|---|
| Mengubah kalimat pertanyaan | `public/data/symptoms.json` |
| Memeriksa aturan dan durasi | `public/data/conditions.json` |
| Memeriksa referensi | `public/data/references.json` |
| Membaca dan memvalidasi JSON | `src/lib/knowledgeBase.js` |
| Mengikuti alur konsultasi | `src/lib/consultationSession.js` |
| Memahami fakta dan status kriteria | `src/lib/rules.js` |
| Memahami forward chaining | `src/lib/forwardChaining.js` |
| Memahami backward chaining | `src/lib/backwardChaining.js` |
| Menyimpan progres dan sinkronisasi tab | `src/lib/consultationProgress.js` |
| Menyimpan hasil di memori Vue | `src/lib/consultationResult.js` |
| Mengubah judul, label, format tanggal | `src/lib/consultationDisplay.js` |
| Mengubah kartu pertanyaan dan tombol | `src/components/ConsultationSession.vue` |

`expertSystem.js` menjadi pintu masuk gabungan untuk fungsi publik modul. Saat belajar, buka modul sesuai tabel. Operasi IndexedDB tetap ditangani `storage.js`.

## 2. Alur dari aplikasi dibuka sampai hasil

`src/main.js` menyiapkan penyimpanan, memuat JSON melalui `loadKnowledgeBase()`, memuat progres lama, lalu menampilkan aplikasi Vue. Dataset siap sebelum pertanyaan pertama muncul.

```text
Pilih metode → buat sesi atau lanjutkan progres
                         ↓
                getNextStep(session)
                         ↓
                 Tampilkan pertanyaan
                         ↓
                Pengguna klik jawaban
                         ↓
                   answerQuestion(session, value)
                         ↓
          Ulangi getNextStep(session)
                         ↓
         Jika selesai: createResult() → halaman hasil
```

`getNextStep(session)` mengembalikan salah satu bentuk berikut. Angka `remaining` hanya ilustrasi perkiraan jumlah pertanyaan.

```js
{ kind: "symptom", code: "G02", remaining: 12 }
{ kind: "duration", conditionCode: "P2", remaining: 1 }
{ kind: "complete", conditions: ["P2"], insufficientDuration: [], duration: { P2: 180 } }
```

## 3. Isi sesi itu apa?

Sesi adalah objek JavaScript yang membawa jawaban pengguna:

```js
{
    method: "backward", // forward = semua gangguan; backward = target pilihan
    target: "P2",       // null jika forward
    facts: { G02: true, G18: false },
    duration: {},         // setelah dijawab, contoh: { P2: 180 }
    order: ["G02", "G18"],
    questionOrder: [/* urutan pertanyaan yang dibuat saat sesi dimulai */],
    ageGroup: "adult"
}
```

`true` berarti Ya, `false` berarti Tidak. Gejala yang belum ada di `facts` belum diketahui. Fakta turunan seperti G68 dihitung dari gejala asal, bukan ditulis sebagai jawaban pengguna.

`answerQuestion(session, true)` mencatat Ya untuk pertanyaan saat ini. Untuk durasi, nilainya jumlah hari dari pilihan yang tersedia, misalnya `answerQuestion(session, 180)`. Fungsi ini mengembalikan sesi baru. `undoAnswer(session)` menghapus jawaban terakhir.

## 4. Bagaimana aturan bekerja?

Contoh satu kriteria P2 di `conditions.json`:

```json
{ "symptoms": ["G19", "G20", "G21", "G22", "G23", "G68"], "minimum": 3 }
```

Artinya minimal tiga dari enam gejala harus bernilai Ya. Semua kriteria lain P2 juga harus terpenuhi, kemudian durasi diperiksa.

Status kriteria di `rules.js`:

- `satisfied`: jumlah Ya sudah mencapai minimal.
- `rejected`: sekalipun semua sisanya Ya, jumlah minimal tidak mungkin tercapai.
- `open`: masih perlu jawaban.

Jika satu kriteria gugur, aturan gangguan itu gugur. Jika semua kriteria terpenuhi, durasi menjadi penentu akhir. Kriteria cocok tetapi durasi kurang masuk `insufficientDuration`.

## 5. Bedanya kedua metode

**Forward chaining:** mengambil semua aturan, menghitung fakta turunan, lalu menyimpulkan gangguan yang memenuhi kriteria dan durasi. Pertanyaan dipilih dengan menuntaskan aturan yang penyaringnya sudah cocok, kemudian melanjutkan penyaring lain. Baca `runForwardInference()` dan `selectForwardQuestion()`.

**Backward chaining:** mengambil aturan gangguan target. Pembuktian berjalan dari tujuan gangguan → aturan → kriteria → gejala. Jika nilai gejala belum diketahui, gejala itu menjadi pertanyaan. Baca `selectBackwardQuestion()` beserta fungsi pembuktiannya.

Keduanya memakai aturan JSON dan pemeriksaan durasi yang sama. Dalam implementasi ini, `getNextStep()` juga memakai `runForwardInference()` untuk merangkum kesimpulan kandidat pada kedua metode. Pemilihan pertanyaan backward berasal dari pembuktian tujuan.

Pertanyaan krisis tetap diperiksa sebelum selesai bila masuk cakupan aturan. Topik penyesuaian dapat muncul bersama topik lain; mesin tidak melakukan diagnosis banding.

## 6. Vue yang perlu dipahami dulu

| Istilah | Arti dalam aplikasi |
|---|---|
| `<script setup>` | Kode yang menyiapkan data dan fungsi halaman |
| `<template>` | Tampilan HTML yang membaca data tadi |
| `props` | Metode dan target yang diterima komponen dari halaman |
| `ref(...)` | Data yang perubahannya memperbarui tampilan; di JavaScript diakses lewat `.value` |
| `computed(...)` | Nilai turunan yang otomatis dihitung ulang, misalnya langkah berikutnya |
| `watch(...)` | Tindakan saat data berubah, misalnya menyimpan progres |
| `@click` | Memanggil fungsi saat tombol diklik |
| `v-if` | Menampilkan bagian hanya jika syaratnya benar |
| `v-for` | Menampilkan daftar dengan perulangan |
| `{{ ... }}` | Menampilkan nilai sebagai teks |

Jejak satu klik: tombol Ya → `selectAnswer(true)` → `answerQuestion(session, true)` → `session.value` diganti → `computed` menghitung langkah berikutnya → Vue memperbarui pertanyaan. Watcher menyimpan progres; saat selesai, watcher membuat hasil dan berpindah halaman.

## 7. Urutan belajar dan mengecek perubahan

1. Buka JSON satu gangguan, misalnya P2, beserta gejala yang dirujuk.
2. Baca `createSession()`, `answerQuestion()`, dan `getNextStep()` di `consultationSession.js`.
3. Ikuti fungsi algoritma sesuai metode, lalu pemeriksaan di `rules.js`.
4. Baca `selectAnswer()`, `computed`, dan watcher di komponen Vue sebagai penghubung ke layar.
5. Jalankan `npm test` untuk aturan, `npm run build` untuk integrasi frontend, dan `npm run dev` untuk mencoba antarmuka.

Tes otomatis meliputi semua target backward, jawaban Tidak, ambang gejala, batas durasi, fakta turunan, pertanyaan krisis, pemisahan dampak antar-topik, dan tombol kembali. Tes ini memeriksa perilaku program. Status validasi klinis dataset tetap mengikuti halaman Tentang dan Sumber.

## Kompatibilitas progres lama

Identifier kode dan field dataset memakai bahasa Inggris; pertanyaan, label, dan hasil mengikuti bahasa pilihan. URL halaman tetap memakai alamat yang sudah ada. `sessionCompatibility.js` mengonversi sesi ke/dari format penyimpanan lama, sehingga progres yang sudah ada dan tab versi sebelumnya tetap bisa dibaca. Kunci IndexedDB dan string field lama di batas konversi sengaja dipertahankan.

## Bahasa antarmuka

`LanguageSwitcher.vue` memanggil `setLanguage()` dari `i18n.js`. Fungsi `t(teks, nilai)` membaca bahasa aktif dan mencari terjemahan di `src/locales/en.json`; Bahasa Indonesia menggunakan teks sumber. Contoh: `t("Minimal {0} dari {1} gejala", [3, 6])`. Parameter mencegah kalimat dinamis dipecah menjadi potongan yang sulit diterjemahkan.

Saat menambah pertanyaan atau informasi gangguan, tambahkan juga terjemahan teksnya ke katalog English. Jangan menerjemahkan kode gejala, kode gangguan, field JSON, atau aturan. `consultationDisplay.js` menyusun ulang teks hasil dari kode yang tetap, sehingga mengganti bahasa tidak membuat ulang hasil atau mengubah jawaban. Preferensi bahasa disimpan terpisah dari progres pada `sispak.language`; katalog ikut build dan cache offline.

Pengujian bahasa ada di `tests/i18n.test.js`; kontrak keluaran skrining tanpa ekspor dan dengan dorongan mencari bantuan diuji di `tests/screening.test.js`.
