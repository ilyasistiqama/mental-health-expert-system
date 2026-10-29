# Mesin Inferensi

Mesin inferensi berada di `src/lib/sistemPakar.js`. Semua fungsi inti bersifat murni: menerima objek
sesi dan basis pengetahuan, lalu mengembalikan sesi baru atau langkah berikutnya. Efek samping
(penyimpanan, navigasi, PDF) ditangani di komponen.

Untuk pseudocode lengkap, aturan pemilihan pertanyaan, trace contoh P2/P9, serta pembahasan
terminasi dan determinisme, lihat [algorithm.md](./algorithm.md).

Implementasi memakai **working memory eksplisit**: `tutupFakta()` menghitung closure fakta turunan
sampai stabil, `mesinMaju()` melakukan pencocokan dan firing aturan sampai fixed point, sedangkan
backward chaining memakai pembuktian rekursif tujuan → aturan → kriteria → subgoal gejala.

## 1. Model pengetahuan

Setiap gangguan diperlakukan sebagai **aturan produksi**:

```
IF   kriteria 1 terpenuhi
AND  kriteria 2 terpenuhi
...
THEN penyakit Pn
```

Satu kriteria adalah kumpulan gejala dengan batas minimal:

```json
{ "gejala": ["G19", "G20", "G21", "G22", "G23", "G68"], "minimal": 3 }
```

Kriteria dianggap terpenuhi jika jumlah gejala yang dijawab *Ya* mencapai `minimal`. Jika `minimal`
tidak ditulis, semua gejala pada kriteria itu wajib *Ya*.

Setelah semua kriteria sebuah gangguan terpenuhi, sistem menanyakan **durasi** keluhan. Durasi
menjadi penentu akhir: jika jawaban durasi mencapai `durasiMinimal`, gangguan disimpulkan; jika
belum, gangguan masuk daftar `belumCukup`.

## 2. Bentuk sesi

```js
{
  metode: "forward",          // "forward" | "backward"
  target: null,               // kode penyakit untuk backward, null untuk forward
  fakta: {                    // jawaban gejala; hanya gejala langsung (bukan fakta antara)
    G02: true, G18: true, G19: true, G20: true, G21: true, G49: true
  },
  durasi: { P2: 180 },        // kode penyakit -> hari (nilai OPSI_DURASI)
  urutan: [                   // urutan jawaban untuk tombol kembali dan daftar jawaban
    "G02", "G18", "G19", "G20", "G21", "G49", "durasi:P2"
  ],
  acak: ["G07", "G01", ...],  // urutan acak yang dibuat sekali per sesi
  usia: "dewasa"              // "dewasa" | "remaja"; opsional untuk sesi lama
}
```

Catatan:

- `urutan` hanya berisi kode gejala langsung atau `durasi:<kode>`. Fakta antara tidak pernah masuk.
- `acak` untuk forward berisi urutan acak **pertanyaan penyaring**; untuk backward berisi urutan
  acak **seluruh gejala hipotesis**, dengan gejala bertanda `akhir` dipindah ke belakang.
- Urutan acak dibuat sekali saat `sesiBaru()` dan disimpan, sehingga tetap sama setelah reload.
  Pengacakan memakai `crypto.getRandomValues` bila tersedia, dengan fallback `Math.random`, dan
  algoritme Fisher–Yates.

## 3. Fakta antara

Gejala bertanda `"dari"` tidak ditanyakan. Nilainya disimpulkan dari gejala asal:

```js
function nilai(kode, fakta, dilihat = new Set()) {
    const g = GEJALA[kode];
    if (!g || !g.dari) return fakta[kode];
    if (dilihat.has(kode)) return undefined;

    const berikut = new Set(dilihat).add(kode);
    const sumber = g.dari.map((k) => nilai(k, fakta, berikut));
    if (sumber.some((v) => v === true)) return true;
    if (sumber.every((v) => v === false)) return false;
    return undefined;
}
```

- *Ya* jika salah satu gejala asal *Ya*.
- *Tidak* jika semua gejala asal *Tidak*.
- Belum diketahui jika belum ada yang *Ya* dan masih ada yang belum dijawab.

Yang ditanyakan untuk fakta antara adalah gejala asalnya (`belumDijawab`). Fakta antara dihitung
sebagai **satu gejala** pada batas `minimal`.

`tutupFakta(fakta)` menghitung penutupan (closure) semua fakta turunan sampai tidak ada nilai baru.
Hasilnya menjadi working memory untuk forward chaining. Closure ini **tidak ditulis ke sesi**;
sesi tetap hanya berisi jawaban langsung pengguna.

Fakta antara saat ini:

| Fakta | Arti | Disimpulkan dari | Dipakai |
|---|---|---|---|
| `G68` | Gangguan tidur | `G60`, `G61`, `G62`, `G24` | `P2`, `P5` |
| `G69` | Sulit tidur atau tidur berlebihan | `G60`, `G61`, `G62`, `G53` | `P9` |

Gejala asal wajib berupa pertanyaan langsung. Fakta antara bertingkat ditolak saat validasi data.

## 4. Status kriteria dan aturan

```js
// ya     = gejala pada kriteria yang sudah dijawab Ya
// belum  = gejala pada kriteria yang belum diketahui
if (ya >= minimal)                 return "terpenuhi";
if (ya + belum < minimal)          return "gugur";     // tidak mungkin lagi terpenuhi
return "terbuka";
```

Status aturan:

- `gugur` jika ada minimal satu kriteria `gugur`.
- `terpenuhi` jika semua kriteria `terpenuhi`.
- `terbuka` selain itu.

Karena perhitungan hanya menghitung jawaban *Ya* dan memperlakukan yang belum dijawab sebagai
"mungkin *Ya*", aturan menjadi gugur secepat mungkin. Inilah yang membuat sistem dapat melewati
pertanyaan yang tidak lagi relevan tanpa mengubah hasil akhir.

`gejalaRelevan(aturan)` mengembalikan gejala yang belum dijawab pada kriteria yang masih `terbuka`
saja. Gejala pada kriteria yang sudah `terpenuhi` atau `gugur` tidak ditanyakan lagi.

Untuk forward chaining, `mesinMaju(fakta, durasi, aturan)` memakai working memory hasil
`tutupFakta`, mencocokkan semua aturan yang kandidat, dan menambahkan penyakit yang kriterianya
terpenuhi serta durasinya cukup. Proses diulang sampai tidak ada fakta baru (fixed point). Penyakit
yang sudah disimpulkan tidak di-fire ulang; aturan alternatif untuk penyakit yang sama tidak perlu
ditanya durasinya lagi.

## 5. Urutan langkah berikutnya

`langkahBerikutnya(sesi)` menentukan satu langkah dengan prioritas berikut:

```mermaid
flowchart TD
    A[Mulai] --> B{Ada aturan terpenuhi<br/>yang durasinya belum ditanya?}
    B -- Ya --> C[Tanya durasi]
    B -- Tidak --> D{Backward dan ada aturan terbuka?}
    D -- Ya --> E[Tanya gejala relevan sesuai urutan acak]
    D -- Tidak --> F{Forward dan ada aturan terbuka?}
    F -- Ya --> G{Ada aturan yang kriteria pertamanya terpenuhi?}
    G -- Ya --> H[Tuntaskan aturan itu dengan urutan tetap]
    G -- Tidak --> I[Tanya pertanyaan penyaring berikutnya sesuai urutan acak]
    F -- Tidak --> J{Ada gejala krisis belum ditanya?}
    J -- Ya --> K[Tanya gejala krisis]
    J -- Tidak --> L[Selesai: susun kesimpulan]
```

Detail prioritas:

1. **Durasi lebih dulu.** Aturan yang sudah `terpenuhi`, memiliki `durasiMinimal > 0`, durasinya
   belum dijawab, dan penyakitnya belum disimpulkan oleh aturan lain. Aturan pertama menurut urutan
   `ATURAN` dipilih. Durasi tidak menunggu aturan lain selesai.
2. **Backward chaining.** `buktikanTujuan(target)` mencoba semua aturan yang menyimpulkan target.
   Setiap aturan dibuktikan lewat kriteria-kriterianya; setiap kriteria membuktikan gejalanya, dan
   fakta antara dibuktikan sebagai subgoal OR dari gejala sumbernya. Pertanyaan diambil dari subgoal
   yang belum pasti menurut `sesi.acak`. Jika satu aturan gugur, aturan alternatif dicoba; jika ada
   aturan yang berhasil, tujuan terbukti.
3. **Forward chaining.**
   - Jika ada aturan `terbuka` yang **kriteria pertamanya sudah terpenuhi** ("pertanyaan penyaring"
     dijawab *Ya*), aturan itu dituntaskan lebih dulu. Jika ada beberapa, dipilih yang pertanyaan
     penyaringnya dijawab paling awal (`waktuAktif`). Gejala lanjutannya ditanyakan menurut urutan
     tetap pada definisi kriteria, bukan acak, agar alur tetap runtut.
   - Jika tidak ada, tanyakan pertanyaan penyaring berikutnya menurut `sesi.acak`. Pertanyaan
     penyaring adalah gejala pada kriteria pertama setiap aturan.
4. **Protokol krisis.** Gejala bertanda `krisis` yang belum ditanyakan selalu ditanyakan sebelum
   kesimpulan, walaupun status aturannya tidak lagi membutuhkan jawaban itu.
5. **Selesai.** Hitung kesimpulan.

Nilai `sisa` yang dikembalikan dipakai untuk progress bar:

```js
new Set([...gejala relevan semua aturan terbuka, ...gejala krisis]).size
  + jumlah durasi yang tertunda
  + jumlah aturan terbuka
```

Ini adalah **perkiraan**, bukan jumlah pertanyaan tersisa yang pasti, karena aturan bisa gugur dan
mengurangi jumlah pertanyaan di tengah jalan. Karena itu progress bar dapat melompat maju, bukan
menunjukkan jumlah pertanyaan yang tersisa secara tepat.

## 6. Forward chaining (Cek Menyeluruh)

Karakteristik:

- Kandidat aturan = **semua** aturan.
- Working memory dimulai dari jawaban gejala, lalu `tutupFakta()` menambahkan fakta turunan seperti
  `G68`/`G69`. `mesinMaju()` mencocokkan semua aturan dan menambahkan penyakit yang kriterianya
  terpenuhi serta durasinya cukup, lalu mengulang sampai tidak ada fakta baru.
- Dimulai dari pertanyaan penyaring yang diacak. Tujuannya menemukan gangguan tanpa pengguna harus
  tahu nama gangguannya.
- Begitu satu penyaring dijawab *Ya*, sistem menuntaskan aturan tersebut sampai semua kriterianya
  terpenuhi atau salah satu kriteria gugur, lalu bertanya durasi bila perlu.
- Setelah aturan itu selesai/gugur, sistem kembali ke pertanyaan penyaring berikutnya.
- Bisa menyimpulkan lebih dari satu gangguan. Tidak ada conflict resolution karena beberapa
  gangguan memang dapat muncul bersamaan (multi-label), bukan saling meniadakan.
- Gejala yang sudah tidak dapat mengubah status aturan mana pun tidak ditanyakan.

Contoh untuk `P2` Gangguan Kecemasan Menyeluruh:

1. `G02` (khawatir berlebihan) dijawab *Ya* → P2 difokuskan.
2. `G18` (sulit mengendalikan khawatir) ditanyakan.
3. `G19`–`G23` dan `G68` ditanyakan sampai minimal 3 dijawab *Ya*.
4. `G49` (mengganggu kehidupan sehari-hari) ditanyakan.
5. Semua kriteria terpenuhi → `mesinMaju` menandai P2 terpenuhi; sistem menanyakan durasi P2.
6. Jawaban ≥ 180 hari → P2 di-fire ke working memory dan disimpulkan. Jawaban < 180 hari → P2 masuk
   `belumCukup`.

## 7. Backward chaining (Cek Gangguan Tertentu)

Karakteristik:

- Kandidat aturan = hanya aturan dengan `penyakit === sesi.target`.
- Pengguna memilih hipotesis lebih dulu.
- `buktikanTujuan(target)` mencoba setiap aturan yang menyimpulkan target. Jika satu aturan gugur,
  aturan alternatif dicoba; jika salah satu berhasil, tujuan terbukti.
- `buktikanAturan` membuktikan semua kriteria (AND). `buktikanKriteria` membuktikan ambang minimal
  gejala. `buktikanGejala` membuktikan gejala langsung sebagai daun, atau fakta antara sebagai
  subgoal OR yang sumbernya dibuktikan rekursif.
- Pertanyaan diambil dari subgoal yang belum pasti, menurut urutan acak sesi. Gejala bertanda
  `"akhir": true` (saat ini `G49`) selalu berada di akhir urutan acak.
- Jika satu kriteria tidak mungkin terpenuhi, aturan langsung `gugur` dan tidak ada pertanyaan
  lanjutan untuk aturan itu. Sistem selesai dengan hasil "belum sesuai kriteria".
- Jika semua kriteria terpenuhi, durasi ditanyakan seperti pada forward.

Contoh untuk `P9` Gangguan Depresi Mayor:

- Kriteria 1: minimal 1 dari `G50`/`G51`.
- Kriteria 2: minimal 5 dari 9 gejala (`G50`, `G51`, `G52`, `G69`, `G54`–`G58`).
- Kriteria 3: `G49`.
- `G69` dibuktikan sebagai subgoal OR dari `G60`, `G61`, `G62`, atau `G53`.
- Bila lima jawaban *Tidak* membuat kriteria 2 mustahil, aturan gugur dan pertanyaan berhenti.
- Bila semua terpenuhi, durasi ≥ 14 hari menyimpulkan P9.

## 8. Durasi

Pilihan durasi (batas bawah tiap pilihan):

| Label | Nilai `hari` |
|---|---|
| Kurang dari 2 minggu | 0 |
| 2 minggu sampai 1 bulan | 14 |
| 1 sampai 3 bulan | 30 |
| 3 sampai 6 bulan | 90 |
| 6 bulan atau lebih | 180 |

Aturan kelulusan: `durasiMinimal === 0` selalu cukup; selain itu `jawaban >= durasiMinimal`.
Konsekuensinya, pilihan "2 minggu sampai 1 bulan" bernilai **14 hari** dan **tidak** memenuhi
`durasiMinimal` 30 hari. Ini disengaja: nilai pilihan adalah batas bawah, sehingga keputusan dibuat
konservatif.

| `durasiMinimal` | Pilihan minimum yang lolos |
|---|---|
| 14 | 2 minggu sampai 1 bulan |
| 30 | 1 sampai 3 bulan |
| 90 | 3 sampai 6 bulan |
| 180 | 6 bulan atau lebih |

`durasiMinimal` 0 (misalnya `P11`) tidak menampilkan pertanyaan durasi.

## 9. Protokol krisis

Gejala dengan `"krisis": true` (saat ini `G58`, pikiran tentang kematian atau menyakiti diri)
diperlakukan khusus:

- Daftar kandidat krisis diambil dari **semua aturan kandidat**, bukan hanya aturan yang masih
  terbuka. Pada Cek Menyeluruh, `G58` selalu ditanyakan sebelum kesimpulan, walaupun P9 sudah gugur.
  Pada Cek Gangguan Tertentu, hanya jika targetnya memuat gejala tersebut (P9).
- Pertanyaan krisis berada di prioritas 4, sehingga ditanyakan setelah aturan terbuka dan durasi
  tertunda selesai.
- Jika dijawab *Ya*, `SesiKonsultasi.vue` langsung menampilkan `PanelKrisis` sebelum pertanyaan
  berikutnya.
- `jawabanKrisis(fakta)` mengembalikan kode gejala krisis yang dijawab *Ya*. Hasil menyimpan
  `krisis: true`, dan panel krisis ditempatkan paling atas di halaman hasil dan PDF.

## 10. Gangguan residual

Aturan dengan `"residual": true` (saat ini `P11` Gangguan Penyesuaian) hanya disimpulkan jika tidak
ada gangguan lain yang disimpulkan:

```js
const maju = mesinMaju(fakta, durasi, kandidat);
const utama = maju.penyakit.filter((k) => !PENYAKIT[k].residual);
penyakit = utama.length > 0 ? utama : maju.penyakit;
```

`mesinMaju` sudah menyaring penyakit yang durasinya belum cukup ke `belumCukup`, sehingga
kesimpulan akhir tidak mencampur keduanya.

Ini mengikuti kriteria C DSM-5-TR: gejala tidak lebih tepat dijelaskan oleh gangguan lain. Pada
Cek Gangguan Tertentu, hanya `P11` yang diperiksa, sehingga aturan residual tidak menyaring apa pun.

## 11. Kesimpulan dan determinisme

```js
{
  jenis: "selesai",
  penyakit: ["P2"],          // utama, atau residual bila tidak ada utama
  belumCukup: ["P9"],        // kriteria terpenuhi tetapi durasi belum mencapai batas
  durasi: { P2: 180 }
}
```

Kesimpulan **selalu sama untuk jawaban yang sama**, apa pun urutan pertanyaannya, karena:

1. Status kriteria hanya bertambah *Ya*; jawaban *Tidak* tidak membatalkan *Ya* sebelumnya.
2. Aturan baru gugur jika bahkan seluruh jawaban *Ya* yang tersisa tidak cukup.
3. Pertanyaan hanya diajukan jika jawabannya masih dapat mengubah status aturan, kecuali gejala
   krisis yang memang selalu ditanyakan.
4. Durasi ditanyakan untuk setiap aturan yang terpenuhi dan penyakitnya belum disimpulkan, tanpa
   bergantung pada urutan.

Perubahan berkas JSON di tengah sesi dapat memengaruhi hasil, karena gejala baru ditambahkan ke
akhir urutan fallback dan aturan baru ikut dihitung. Sesi yang tersimpan divalidasi ulang saat
dimuat; bila strukturnya tidak cocok, sesi diabaikan.

## 12. Objek hasil

`buatHasil(sesi, kesimpulan)` menyimpan ke `hasilTerakhir` (sebuah `shallowRef`):

```js
{
  waktu: Date.now(),
  metode: "forward",
  target: null,
  penyakit: ["P2"],
  belumCukup: ["P9"],
  durasi: { P2: 180, P9: 14 },
  krisis: false,
  remaja: false,
  jawaban: [
    { kode: "G02", pertanyaan: "...", jawaban: "Ya", ya: true },
    { kode: "durasi:P2", pertanyaan: "Sudah berapa lama ...", jawaban: "6 bulan atau lebih", ya: null }
  ]
}
```

Objek ini tidak pernah diserialisasi ke penyimpanan. Lihat [data-dan-privasi.md](./data-dan-privasi.md).

## 13. API mesin

| Fungsi | Kegunaan |
|---|---|
| `muatBasisPengetahuan()` | Memuat, memvalidasi, dan mengindeks tiga JSON. |
| `penyakitValid(kode)` | Memeriksa kode penyakit untuk query string. |
| `daftarPenyakit()` | Daftar kode yang punya aturan (tanpa `P0`). |
| `sesiBaru(metode, target)` | Membuat sesi baru beserta urutan acak. |
| `tutupFakta(fakta)` | Menghitung closure fakta turunan (`dari`) sampai stabil. |
| `mesinMaju(fakta, durasi, aturan)` | Forward chaining: working memory + firing aturan sampai fixed point. |
| `langkahBerikutnya(sesi)` | Langkah berikutnya: `gejala`, `durasi`, atau `selesai`. |
| `jawab(sesi, nilai)` | Mencatat jawaban dan mengembalikan sesi baru. |
| `batalkan(sesi)` | Menghapus jawaban terakhir (gejala atau durasi). |
| `daftarJawaban(sesi)` | Jawaban siap tampil untuk UI dan PDF. |
| `teksDurasi(kode)` | Kalimat pertanyaan durasi. |
| `muatProgres()` | Migrasi data lama dan memuat sesi tersimpan. |
| `muatUlangSesi(metode)` | Membaca ulang sesi dari IndexedDB. |
| `ambilSesi(metode)` | Mengambil sesi dari cache memori. |
| `sesiSama(a, b)` | Membandingkan sesi untuk sinkronisasi UI. |
| `simpanSesi(sesi)` / `hapusSesi(metode)` | Menulis/menghapus progres. |
| `dengarPerubahanTabLain(fn)` | Berlangganan perubahan sesi dari tab lain. |
| `buatHasil(sesi, kesimpulan)` | Menyusun objek hasil di memori. |
| `namaMetode()`, `ruteMetode()` | Nama awam dan URL metode. |
| `judulHasil(entri)` | Judul hasil yang netral (bukan "anda mengalami ..."). |
| `formatTanggal()`, `labelDurasi()` | Format tampilan tanggal dan durasi. |

## 14. Keterbatasan mesin

- Penalaran hanya berbasis hitungan *Ya*; tidak ada bobot, certainty factor, atau penalaran negatif.
- Basis aturan saat ini **satu tingkat**: premis aturan berupa gejala/fakta antara, belum ada aturan
  yang memakai penyakit lain sebagai premis. Mesin sudah memiliki working memory dan fixed point,
  tetapi data belum membutuhkan rantai penyakit bertingkat.
- Tidak ada penjelasan rantai inferensi terperinci untuk pengguna; halaman hasil menampilkan
  kriteria yang terpenuhi, bukan jejak aturan langkah demi langkah.
- `sisa` hanyalah perkiraan untuk progress bar.
- Belum ada unit test yang di-commit untuk fungsi inferensi.
- Data dan aturan belum divalidasi secara klinis.
