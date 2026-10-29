# Algoritma Forward Chaining dan Backward Chaining

Dokumen ini menjelaskan **alur algoritme** kedua metode pemeriksaan langkah demi langkah, berdasarkan
implementasi di `src/lib/sistemPakar.js`. Fokusnya adalah pseudocode, aturan pemilihan pertanyaan,
titik berhenti, dan trace contoh. Penjelasan konsep dan API ada di
[mesin-inferensi.md](./mesin-inferensi.md); referensi data ada di
[basis-pengetahuan.md](./basis-pengetahuan.md).

Kedua metode memakai basis aturan, fungsi status, dan gerbang durasi yang sama. Perbedaannya hanya
pada **himpunan aturan kandidat** dan **cara memilih pertanyaan berikutnya**.

## 1. Notasi

| Notasi | Arti |
|---|---|
| `S` | Sesi konsultasi: `metode`, `target`, `fakta`, `durasi`, `urutan`, `acak`, `usia` |
| `F` | `S.fakta`, peta kode gejala → `true`/`false` |
| `D` | `S.durasi`, peta kode penyakit → hari |
| `U` | `S.urutan`, daftar jawaban berurutan; berisi kode gejala atau `durasi:<kode>` |
| `A` | `S.acak`, urutan acak yang dibuat sekali per sesi |
| `R` | Aturan produksi: `{ penyakit, kriteria, durasiMinimal }` |
| `C` | Kriteria: `{ gejala, minimal }` |
| `g` | Kode gejala |
| `r` | Jumlah aturan yang diperiksa (11) |
| `n` | Jumlah gejala langsung yang ditanyakan (67) |

## 2. Representasi aturan

```text
ATURAN P2:
  penyakit       = "P2"
  durasiMinimal  = 180
  kriteria[0]    = { gejala: [G02], minimal: 1 }
  kriteria[1]    = { gejala: [G18], minimal: 1 }
  kriteria[2]    = { gejala: [G19,G20,G21,G22,G23,G68], minimal: 3 }
  kriteria[3]    = { gejala: [G49], minimal: 1 }
```

- Aturan berasal dari `penyakit.json`, kecuali `P0` dan penyakit tanpa kriteria valid.
- `minimal` default = jumlah gejala pada kriteria (semua wajib *Ya*).
- Gejala bertanda `dari` adalah **fakta antara**; nilainya dihitung, bukan ditanyakan.
- Gejala bertanda `krisis` memicu protokol bantuan segera.
- Gejala bertanda `akhir` dipindah ke belakang pada urutan acak backward chaining.

## 3. Fungsi bantu

### 3.1 `NILAI(g, F)`

```text
ALGORITMA NILAI(g, F, dilihat)
  jika g bukan fakta antara:
      kembali F[g]                     // true, false, atau undefined
  jika g sudah ada di dilihat:         // pengaman siklus data
      kembali undefined
  sumber ← [ NILAI(s, F, dilihat ∪ {g}) untuk setiap s ∈ g.dari ]
  jika ada sumber = true:
      kembali true
  jika semua sumber = false:
      kembali false
  kembali undefined
```

Fakta antara menjadi *Ya* secepat salah satu sumbernya *Ya*, dan *Tidak* hanya jika semua sumbernya
*Tidak*. Contoh:

```text
G68 = G60 ∨ G61 ∨ G62 ∨ G24     // gangguan tidur
G69 = G60 ∨ G61 ∨ G62 ∨ G53     // sulit tidur atau tidur berlebihan
```

`BELUM_DIJawab(g, F)` mengembalikan gejala sumber yang belum ada di `F` selama `NILAI(g,F)` masih
`undefined`. Untuk gejala langsung, hasilnya `[g]` bila belum dijawab.

### 3.2 `STATUS_KRITERIA(C, F)`

```text
ALGORITMA STATUS_KRITERIA(C, F)
  ya    ← jumlah g ∈ C.gejala dengan NILAI(g,F) = true
  belum ← jumlah g ∈ C.gejala dengan NILAI(g,F) = undefined

  jika ya ≥ C.minimal:
      kembali TERPENUHI
  jika ya + belum < C.minimal:
      kembali GUGUR                  // bahkan semua sisa jawaban Ya tidak cukup
  kembali TERBUKA
```

### 3.3 `STATUS_ATURAN(R, F)`

```text
ALGORITMA STATUS_ATURAN(R, F)
  status ← [ STATUS_KRITERIA(C, F) untuk setiap C ∈ R.kriteria ]

  jika ada status = GUGUR:
      kembali GUGUR
  jika semua status = TERPENUHI:
      kembali TERPENUHI
  kembali TERBUKA
```

Sifat monoton:

- `TERPENUHI` tidak bisa kembali menjadi `TERBUKA` atau `GUGUR`, karena jumlah *Ya* tidak berkurang.
- `GUGUR` tidak bisa kembali menjadi `TERBUKA`, karena `ya + belum` tidak pernah bertambah.
- Satu-satunya transisi adalah `TERBUKA → TERPENUHI` atau `TERBUKA → GUGUR`.

Sifat ini menjadi dasar jaminan terminasi dan determinisme (bagian 9).

### 3.4 `RELEVAN(R, F)`

```text
ALGORITMA RELEVAN(R, F)
  hasil ← daftar kosong
  untuk setiap C ∈ R.kriteria dengan STATUS_KRITERIA(C,F) = TERBUKA:
      untuk setiap g ∈ C.gejala:
          tambahkan BELUM_DIJawab(g, F) ke akhir hasil
  kembali hasil
```

Urutan daftar mengikuti urutan kriteria lalu urutan gejala di JSON. Implementasi tidak melakukan
deduplikasi, tetapi `LANGKAH` hanya mengambil elemen pertama dan pengecekan keanggotaan tetap aman
untuk gejala yang muncul di beberapa kriteria.

### 3.5 `WAKTU_AKTIF(R, S)`

Dipakai forward chaining untuk memilih aturan mana yang dituntaskan lebih dulu:

```text
WAKTU_AKTIF(R, S)
  sumber ← semua gejala asal pada R.kriteria[0]
  posisi ← [ indeks g di S.urutan | g ∈ sumber dan F[g] = true ]
  kembali min(posisi)
```

Nilai lebih kecil berarti pertanyaan penyaringnya dijawab lebih awal.

### 3.6 `PENYARING_BERIKUTNYA(S, terbuka)`

```text
ALGORITMA PENYARING_BERIKUTNYA(S, terbuka)
  relevan ← himpunan kosong
  untuk setiap R ∈ terbuka dengan STATUS_KRITERIA(R.kriteria[0],F) = TERBUKA:
      untuk setiap g ∈ R.kriteria[0].gejala:
          tambahkan BELUM_DIJawab(g, F) ke relevan

  urutan ← S.acak ++ semua kode gejala     // fallback untuk data yang ditambah setelah sesi dibuat
  kembali elemen pertama urutan yang ada di relevan
```

### 3.7 `KRISIS_BELUM_DITANYA(kandidat, F)`

```text
ALGORITMA KRISIS_BELUM_DITANYA(kandidat, F)
  hasil ← himpunan kosong
  untuk setiap R ∈ kandidat:
      untuk setiap C ∈ R.kriteria:
          untuk setiap g ∈ C.gejala:
              tambahkan semua gejala asal g yang bertanda krisis dan belum ada di F
  kembali hasil
```

Perhatikan: fungsi ini mengambil **seluruh aturan kandidat**, bukan hanya aturan `TERBUKA`. Karena
itu `G58` tetap ditanyakan pada Cek Menyeluruh walaupun P9 sudah `GUGUR`.

### 3.8 `TUTUP_FAKTA(F)`

```text
ALGORITMA TUTUP_FAKTA(F)
  WM ← salinan fakta langsung dari F          // fakta turunan dihitung ulang
  ulangi:
      berubah ← false
      untuk setiap fakta antara g:
          jika g ∈ WM: lanjut
          sumber ← [ WM[s] untuk setiap s ∈ g.dari ]
          jika ada sumber = true:
              WM[g] ← true; berubah ← true
          selain itu jika semua sumber = false:
              WM[g] ← false; berubah ← true
  sampai bukan berubah
  kembali WM
```

Closure ini adalah working memory awal untuk forward chaining. Fakta turunan tidak pernah ditulis
ke sesi pengguna; hanya dipakai selama inferensi.

### 3.9 `MESIN_MAJU(F, D, aturan)`

```text
ALGORITMA MESIN_MAJU(F, D, aturan)
  WM ← TUTUP_FAKTA(F)
  disimpulkan ← himpunan kosong
  belumCukup ← himpunan kosong
  ulangi:
      berubah ← false
      untuk setiap R ∈ aturan:
          jika R.penyakit ∈ disimpulkan: lanjut
          jika STATUS_ATURAN(R, WM) ≠ TERPENUHI: lanjut
          jika CUKUP_DURASI(R, D):
              WM[R.penyakit] ← true
              disimpulkan ← disimpulkan ∪ {R.penyakit}
              belumCukup ← belumCukup \ {R.penyakit}
              berubah ← true
          selain itu jika durasi R sudah diketahui:
              belumCukup ← belumCukup ∪ {R.penyakit}
  sampai bukan berubah
  kembali { WM, disimpulkan, belumCukup }
```

Ini adalah inti forward chaining: cocokkan aturan, fire kesimpulan ke working memory, ulangi sampai
tidak ada fakta baru. Durasi adalah gerbang akhir; aturan yang kriterianya terpenuhi tetapi durasinya
belum cukup tidak di-fire.

## 4. Algoritme inti `LANGKAH(S)`

`LANGKAH` adalah implementasi `langkahBerikutnya(sesi)`. Ia mengembalikan salah satu dari
`("gejala", kode)`, `("durasi", penyakit)`, atau `("selesai", kesimpulan)`.

```text
ALGORITMA LANGKAH(S)
  kandidat  ← SEMUA_ATURAN jika S.metode = "forward"
              { aturan dengan penyakit = S.target } jika S.metode = "backward"
  F         ← TUTUP_FAKTA(S.fakta)              // working memory fakta turunan
  MAJU      ← MESIN_MAJU(S.fakta, S.durasi, kandidat)
  sudah     ← MAJU.disimpulkan

  status    ← peta R → STATUS_ATURAN(R, F)
  terbuka   ← [ R ∈ kandidat | status[R] = TERBUKA dan R.penyakit ∉ sudah ]
  terpenuhi ← [ R ∈ kandidat | status[R] = TERPENUHI ]

  tertunda  ← [ R ∈ terpenuhi | R.durasiMinimal > 0 dan R.penyakit ∉ D dan R.penyakit ∉ sudah ]
  krisis    ← KRISIS_BELUM_DITANYA(kandidat, F)

  // Prioritas 1: durasi sebagai penentu akhir
  jika tertunda ≠ ∅:
      kembali ("durasi", tertunda[0].penyakit)

  // Prioritas 2: backward chaining — pembuktian tujuan
  jika S.metode = "backward" dan terbuka ≠ ∅:
      kode ← pertanyaan dari BUKTIKAN_TUJUAN(S.target, F, S.acak)
      jika kode tidak ada:
          kode ← pertanyaan dari aturan terbuka (fallback RELEVAN)
      kembali ("gejala", kode)

  // Prioritas 3: forward chaining — data-driven
  jika S.metode = "forward" dan terbuka ≠ ∅:
      fokus ← [ R ∈ terbuka | STATUS_KRITERIA(R.kriteria[0], F) = TERPENUHI ]
      jika fokus ≠ ∅:
          urutkan fokus berdasarkan WAKTU_AKTIF menaik
          R ← fokus[0]
          kembali ("gejala", elemen pertama RELEVAN(R, F))
      kode ← PENYARING_BERIKUTNYA(S, terbuka, F)
      kembali ("gejala", kode)

  // Prioritas 4: krisis sebelum kesimpulan
  jika krisis ≠ ∅:
      kembali ("gejala", krisis[0])

  // Prioritas 5: selesai — pakai hasil firing forward chaining
  kembali ("selesai", SUSUN_KESIMPULAN(MAJU))
```

BUKTIKAN_TUJUAN mencoba semua aturan target; jika satu aturan gugur, aturan alternatif dicoba.
BUKTIKAN_ATURAN membuktikan semua kriteria; BUKTIKAN_KRITERIA membuktikan ambang minimal; dan
BUKTIKAN_GEJALA membuktikan gejala langsung atau fakta antara secara rekursif.

Ringkasan prioritas:

| Urutan | Kondisi | Aksi |
|---|---|---|
| 1 | Ada aturan terpenuhi yang durasinya belum ditanya | Tanya durasi |
| 2 | Backward dan masih ada aturan terbuka | Tanya subgoal dari `BUKTIKAN_TUJUAN` menurut `S.acak` |
| 3 | Forward dan masih ada aturan terbuka | Tuntaskan aturan yang penyaringnya sudah *Ya*; jika tidak ada, tanya penyaring berikutnya |
| 4 | Masih ada gejala krisis yang belum ditanya | Tanya gejala krisis |
| 5 | Selain itu | Selesai |

`sisa` yang ikut dikembalikan implementasi hanya dipakai untuk progress bar:

```text
SISA(S) = |RELEVAN(semua aturan terbuka) ∪ krisis| + |durasi tertunda| + |aturan terbuka|
```

Ini perkiraan, bukan jumlah pertanyaan yang pasti.

### 4.1 `JAWAB(S, nilai)`

```text
ALGORITMA JAWAB(S, nilai)
  L ← LANGKAH(S)
  jika L.jenis = "gejala":
      F' ← F ∪ { L.kode: (nilai = true) }
      U' ← U ++ [L.kode]
  jika L.jenis = "durasi":
      D' ← D ∪ { L.penyakit: nilai }
      U' ← U ++ ["durasi:" + L.penyakit]
  kembali S dengan F', D', U' yang baru
```

`JAWAB` selalu menghitung ulang langkah berikutnya, sehingga jawaban dicatat pada pertanyaan yang
sedang aktif.

### 4.2 `BATAL(S)`

```text
ALGORITMA BATAL(S)
  x ← elemen terakhir U
  jika x = "durasi:<penyakit>":
      hapus D[penyakit]
  selain itu:
      hapus F[x]
  hapus x dari U
  kembali S
```

Tidak ada riwayat inferensi yang disimpan; membatalkan satu jawaban cukup menghapus fakta terakhir,
lalu `LANGKAH` dihitung ulang.

## 5. Forward Chaining — Cek Menyeluruh

### 5.1 Gagasan

Forward chaining bersifat **data-driven**:

1. Mulai tanpa hipotesis; working memory berisi fakta jawaban dan closure fakta turunan
   (`TUTUP_FAKTA`).
2. Cocokkan semua aturan terhadap working memory. Aturan yang kriterianya terpenuhi dan durasinya
   cukup di-fire: penyakitnya masuk working memory (`MESIN_MAJU`). Ulangi sampai fixed point.
3. Tanyakan pertanyaan penyaring (kriteria pertama setiap aturan) dalam urutan acak.
4. Jika satu penyaring dijawab *Ya*, fokus ke aturan itu dan tuntaskan kriterianya dengan urutan
   tetap.
5. Setelah aturan selesai atau gugur, kembali ke pertanyaan penyaring berikutnya.
6. Semua penyakit yang berhasil di-fire disimpulkan; bisa lebih dari satu.

### 5.2 Pseudocode loop

```text
ALGORITMA CEK_MENYELURUH
  S ← SESI_BARU("forward")
  selama LANGKAH(S).jenis ≠ "selesai":
      L ← LANGKAH(S)
      tampilkan pertanyaan L
      nilai ← jawaban pengguna
      S ← JAWAB(S, nilai)
      jika L adalah gejala krisis dan nilai = true:
          tampilkan panel bantuan
  buat hasil dari LANGKAH(S)
  hapus progres dari penyimpanan
```

### 5.3 Aturan pemilihan pertanyaan

Pada mode forward, `LANGKAH` melakukan:

1. **Durasi lebih dulu.** Jika ada aturan `TERPENUHI` dengan `durasiMinimal > 0` dan durasinya belum
   dijawab, tanyakan durasi aturan pertama menurut urutan `ATURAN`. Aturan lain tetap menunggu.
   `MESIN_MAJU` sudah menandai penyakit yang durasinya cukup; aturan untuk penyakit yang sudah
   disimpulkan tidak ditanya lagi durasinya.
2. **Aturan yang penyaringnya sudah *Ya* dituntaskan.** Di antara aturan `TERBUKA`, cari yang
   kriteria pertamanya `TERPENUHI`.
   - Jika ada beberapa, pilih yang pertanyaan penyaringnya dijawab paling awal (`WAKTU_AKTIF`
     terkecil).
   - Gejala lanjutan diambil dari `RELEVAN(R,F)` menurut urutan kriteria dan urutan gejala di JSON
     (tetap, tidak diacak).
   - `G49` berada di kriteria terakhir setiap aturan, sehingga wajar ditanyakan paling akhir.
     Penanda `akhir` sendiri hanya memengaruhi urutan acak backward, bukan forward.
3. **Penyaring berikutnya.** Jika tidak ada aturan yang sedang difokuskan, tanyakan pertanyaan
   penyaring berikutnya menurut `S.acak`.
4. **Krisis.** Setelah tidak ada aturan terbuka dan tidak ada durasi tertunda, tanyakan `G58` bila
   belum.
5. **Selesai.**

Konsekuensi: aturan yang sudah `GUGUR` tidak lagi menyumbang pertanyaan; gejala yang tidak dapat
mengubah status aturan mana pun dilewati.

### 5.4 Trace contoh — P2

Asumsi: pertanyaan penyaring pertama yang dijawab *Ya* adalah `G02`, sehingga P2 difokuskan.
Urutan di bawah adalah urutan tetap kriteria P2, bukan urutan acak.

| Langkah | Pertanyaan | Jawaban | Efek |
|---|---|---|---|
| 1 | `G02` khawatir berlebihan | Ya | K1 P2 terpenuhi → P2 difokuskan |
| 2 | `G18` sulit mengendalikan khawatir | Ya | K2 terpenuhi |
| 3 | `G19` gelisah/tegang | Ya | K3: 1 *Ya* |
| 4 | `G20` mudah lelah | Ya | K3: 2 *Ya* |
| 5 | `G21` sulit konsentrasi | Tidak | K3: 2 *Ya*, 3 belum → masih terbuka |
| 6 | `G22` mudah marah | Ya | K3: 3 *Ya* → terpenuhi |
| 7 | `G49` mengganggu kehidupan | Ya | K4 terpenuhi → semua kriteria P2 terpenuhi |
| 8 | Durasi P2 | 6 bulan atau lebih (180) | 180 ≥ 180 → P2 disimpulkan |

Setelah langkah 8, sistem **belum selesai**: aturan lain yang masih terbuka ditanyakan, lalu `G58`
ditanyakan bila belum, baru kesimpulan akhir disusun.

Variasi:

- Jika langkah 7 dijawab *Tidak*, K4 `GUGUR` → P2 `GUGUR`, durasi tidak ditanyakan, dan sistem
  kembali ke pertanyaan penyaring.
- Jika durasi dijawab "2 minggu sampai 1 bulan" (14), `14 < 180` → P2 masuk `belumCukup`, bukan
  disimpulkan.
- Jika `G58` dijawab *Ya* pada langkah krisis, panel bantuan muncul dan hasil menandai `krisis`.

### 5.5 Kapan forward berhenti

Forward berhenti ketika:

```text
tidak ada aturan TERBUKA
dan tidak ada durasi tertunda
dan tidak ada gejala krisis yang belum ditanya
```

Aturan `TERPENUHI` tidak lagi menghasilkan pertanyaan (selain durasi), dan aturan `GUGUR` diabaikan.

## 6. Backward Chaining — Cek Gangguan Tertentu

### 6.1 Gagasan

Backward chaining bersifat **goal-driven**:

1. Pengguna memilih satu hipotesis (`target`).
2. `BUKTIKAN_TUJUAN(target)` mencoba semua aturan yang menyimpulkan target. Jika satu aturan gugur,
   aturan alternatif dicoba.
3. `BUKTIKAN_ATURAN` membuktikan semua kriteria (AND). `BUKTIKAN_KRITERIA` membuktikan ambang
   minimal gejala.
4. `BUKTIKAN_GEJALA` membuktikan gejala langsung sebagai daun, atau fakta antara sebagai subgoal OR
   yang sumbernya dibuktikan rekursif.
5. Pertanyaan diambil dari subgoal yang belum pasti, menurut urutan acak sesi.
6. Jika semua kriteria terpenuhi, durasi menjadi penentu akhir.

### 6.2 Urutan acak backward

```text
ALGORITMA URUTAN_ACAK_ATURAN(target)
  R ← semua aturan dengan penyakit = target
  sumber ← himpunan semua gejala asal dari semua C ∈ R.kriteria
  acak ← FISHER_YATES(sumber)
  kembali [ g ∈ acak | bukan g.akhir ] ++ [ g ∈ acak | g.akhir ]
```

Karena `G49` bertanda `akhir`, ia selalu berada di posisi terakhir urutan gejala. Fakta antara
seperti `G69` tidak masuk urutan; yang masuk adalah gejala sumbernya (`G60`, `G61`, `G62`, `G53`).

### 6.3 Pseudocode loop

```text
ALGORITMA CEK_GANGGUAN(target)
  S ← SESI_BARU("backward", target)
  selama LANGKAH(S).jenis ≠ "selesai":
      L ← LANGKAH(S)
      tampilkan pertanyaan L
      nilai ← jawaban pengguna
      S ← JAWAB(S, nilai)
      jika L adalah gejala krisis dan nilai = true:
          tampilkan panel bantuan
  buat hasil dari LANGKAH(S)
  hapus progres dari penyimpanan
```

Pemilihan pertanyaan pada mode backward:

1. Durasi, jika aturan sudah `TERPENUHI` dan `durasiMinimal > 0`, kecuali penyakit sudah
   disimpulkan oleh aturan alternatif.
2. `BUKTIKAN_TUJUAN` mengembalikan pertanyaan dari subgoal yang belum pasti; jika tidak ada,
   kumpulkan pertanyaan dari semua aturan terbuka dan ikuti `S.acak`.
3. `G58` bila belum ditanya, termasuk ketika aturan sudah `GUGUR`.
4. Selesai.

### 6.4 Trace contoh — P9 gugur

Asumsi urutan acak P9 kebetulan memulai dengan `G52`, lalu `G60`, `G50`, `G51`.

| Langkah | Pertanyaan | Jawaban | Efek |
|---|---|---|---|
| 1 | `G52` perubahan nafsu makan | Tidak | K2: 0 *Ya*, 8 belum |
| 2 | `G60` sulit memulai tidur | Ya | `G69` = *Ya*; K2: 1 *Ya*, 7 belum |
| 3 | `G50` sedih/hampa | Tidak | K1: 0 *Ya*, 1 belum → masih terbuka |
| 4 | `G51` kehilangan minat | Tidak | K1: 0 *Ya*, 0 belum → `GUGUR` |
| - | — | — | K1 gugur → P9 `GUGUR`, pertanyaan P9 berhenti |

Setelah P9 gugur, `G58` masih ditanyakan bila belum, karena `KRISIS_BELUM_DITANYA` memakai seluruh
aturan kandidat. Hasil akhirnya: tidak ada gangguan yang disimpulkan untuk target P9.

### 6.5 Trace contoh — P9 berhasil

Asumsi urutan acak: `G50`, `G51`, `G60`, `G52`, `G55`, `G49`.

| Langkah | Pertanyaan | Jawaban | Efek |
|---|---|---|---|
| 1 | `G50` sedih/hampa | Ya | K1 terpenuhi; K2: 1 *Ya* |
| 2 | `G51` kehilangan minat | Ya | K2: 2 *Ya* |
| 3 | `G60` sulit memulai tidur | Ya | `G69` = *Ya*; K2: 3 *Ya* |
| 4 | `G52` perubahan nafsu makan | Ya | K2: 4 *Ya* |
| 5 | `G55` kehilangan tenaga | Ya | K2: 5 *Ya* → terpenuhi |
| 6 | `G49` mengganggu kehidupan | Ya | K3 terpenuhi → semua kriteria P9 terpenuhi |
| 7 | Durasi P9 | 2 minggu sampai 1 bulan (14) | 14 ≥ 14 → P9 disimpulkan |
| 8 | `G58` pikiran menyakiti diri | Tidak | Tidak ada tanda krisis; selesai |

Catatan:

- Setelah K2 terpenuhi, sisa gejala K2 yang belum ditanya tidak lagi relevan, sehingga dilewati.
- `G49` diletakkan paling akhir dalam urutan acak gejala karena bertanda `akhir`.
- Durasi dan pertanyaan krisis `G58` dapat menyusul setelah `G49`.
- Jika `G58` dijawab *Ya*, P9 tetap disimpulkan dan `krisis: true` ditambahkan ke hasil.

## 7. Gerbang durasi

```text
ALGORITMA CUKUP(R, S)
  jika R.durasiMinimal = 0:
      kembali true
  kembali D[R.penyakit] ≥ R.durasiMinimal
```

```text
ALGORITMA SUSUN_KESIMPULAN(MAJU)
  semua       ← MAJU.disimpulkan
  belumCukup  ← MAJU.belumCukup
  utama       ← [ k ∈ semua | bukan PENYAKIT[k].residual ]

  penyakit ← utama jika utama ≠ ∅, selain itu semua
  kembali { penyakit, belumCukup, durasi: D }
```

`MESIN_MAJU` sudah memisahkan penyakit yang durasinya cukup (`disimpulkan`) dari yang belum
(`belumCukup`), jadi penyusunan kesimpulan tinggal menyaring gangguan residual.

- `durasiMinimal = 0` (misalnya P11) tidak menanyakan durasi.
- Pilihan durasi adalah batas bawah: 14, 30, 90, 180. Pilihan 14 **tidak** memenuhi ambang 30.
- Gangguan residual hanya disimpulkan jika tidak ada gangguan non-residual yang cukup.
- Aturan yang kriteria terpenuhi tetapi durasinya kurang masuk `belumCukup`, bukan `penyakit`.

## 8. Protokol krisis dan residual dalam alur

| Situasi | Forward | Backward |
|---|---|---|
| `G58` belum ditanya | Selalu ditanyakan sebelum selesai, walau P9 gugur | Ditanyakan jika target P9, termasuk setelah target gugur |
| Posisi pertanyaan | Setelah aturan terbuka dan durasi tertunda | Setelah aturan terbuka dan durasi tertunda |
| Jika *Ya* | Panel bantuan tampil segera; `krisis: true` di hasil | Sama |
| Residual | P11 disaring jika ada gangguan lain | Hanya P11 yang diperiksa; tidak ada penyaringan lain |

Krisis berada di prioritas 4, setelah semua pertanyaan yang masih dapat mengubah hasil. Tujuannya
agar orang yang membutuhkan bantuan segera tetap dikenali tanpa menghentikan pemeriksaan lebih awal.

## 9. Terminasi dan determinisme

### 9.1 Terminasi

Setiap `JAWAB` menambahkan satu entri ke `U`. Sebuah pertanyaan hanya dipilih jika:

- gejalanya belum ada di `F`, atau
- durasinya belum ada di `D`, atau
- gejalanya krisis dan belum ada di `F`.

Karena jumlah gejala langsung dan aturan berhingga, jumlah pertanyaan maksimum adalah
`n + r` (67 + 11 = 78). Tidak ada pertanyaan yang berulang, sehingga loop selalu berhenti.

### 9.2 Determinisme

Untuk jawaban yang sama, kesimpulan tidak bergantung pada urutan pertanyaan:

1. `TERPENUHI` dan `GUGUR` monoton dan tidak dapat dibalik.
2. Pertanyaan gejala hanya diajukan jika masih dapat mengubah status aturan, kecuali krisis.
3. Setiap aturan yang menjadi `TERPENUHI` dengan `durasiMinimal > 0` ditanyakan durasinya sebelum
   selesai, kecuali penyakitnya sudah disimpulkan oleh aturan alternatif. Keputusan durasi tidak
   bergantung pada kapan aturan itu ditemukan.
4. `SUSUN_KESIMPULAN` hanya melihat status akhir dan durasi, bukan urutan `U`.

Urutan acak memengaruhi **pengalaman menjawab** dan jumlah pertanyaan yang dilewati, bukan hasil
akhir. Perubahan `penyakit.json`/`gejala.json` di tengah sesi dapat mengubah hasil karena aturan dan
gejala baru ikut dipertimbangkan.

## 10. Perbandingan kedua metode

| Aspek | Forward Chaining | Backward Chaining |
|---|---|---|
| Nama pengguna | Cek Menyeluruh | Cek Gangguan Tertentu |
| Arah | Data → kesimpulan | Hipotesis → data |
| Kandidat aturan | Semua aturan | Hanya `target` |
| Titik mulai | Pertanyaan penyaring acak | Gejala hipotesis acak |
| Urutan gejala | Penyaring acak; setelah fokus, urutan kriteria tetap | Seluruh gejala target acak; `akhir` di belakang |
| Berhenti | Tidak ada aturan terbuka, durasi tertunda, atau krisis | Aturan gugur/terpenuhi, durasi, krisis |
| Jumlah hasil | Bisa lebih dari satu gangguan | Paling banyak satu target |
| Pertanyaan yang dilewati | Ya, jika tidak dapat mengubah status | Ya, segera setelah kriteria mustahil |
| Kapan cocok | Pengguna belum tahu gangguannya | Pengguna sudah menduga satu gangguan |
| Biaya komputasi per langkah | Semua aturan kandidat | Satu aturan target |

## 11. Kompleksitas

Dengan `m` = jumlah referensi gejala di seluruh kriteria kandidat, `q` = jumlah pertanyaan yang
diajukan, dan `r` = jumlah aturan kandidat:

- Setiap `LANGKAH` menghitung closure fakta turunan, menjalankan `MESIN_MAJU`, lalu menghitung status
  semua aturan kandidat: `O(m)`, dengan konstanta kecil untuk basis data saat ini.
- Forward juga mengurutkan aturan fokus: `O(r log r)`, dan mencari posisi di `U`: `O(n)` per
  aturan fokus.
- Total forward: `O(q · (m + r log r + n))`, dengan `q ≤ n + r`.
- Backward: kandidat hanya aturan target (biasanya satu), sehingga `O(q · m_target)`.
- Memori: `O(m + n + r)` untuk basis pengetahuan dan `O(n + r)` untuk sesi.

Untuk data saat ini (`n = 67`, `r = 11`, 69 entri gejala termasuk 2 fakta antara), biaya ini sangat
kecil dan tidak terasa di browser.

## 12. Kasus tepi

| Kasus | Perilaku |
|---|---|
| Target tidak valid | Tidak ada aturan kandidat → langsung `selesai` dengan `penyakit: []`. UI mencegah lewat `daftarPenyakit()`. |
| Beberapa aturan terpenuhi | Durasi ditanyakan satu per satu menurut urutan `ATURAN`, lalu semua yang cukup disimpulkan. |
| Beberapa aturan untuk penyakit yang sama | `MESIN_MAJU` dan `BUKTIKAN_TUJUAN` mencoba alternatif; penyakit yang sudah disimpulkan tidak ditanya durasinya lagi. |
| Aturan terpenuhi tetapi durasi kurang | Masuk `belumCukup`; tidak ada pertanyaan lanjutan. |
| Dua aturan berbagi gejala | Gejala ditanyakan sekali; jawaban dipakai semua aturan. |
| Fakta antara | Tidak pernah masuk `U`; nilainya dihitung dari gejala sumber. |
| Krisis pada aturan yang sudah gugur | Tetap ditanyakan sebelum selesai. |
| Pengguna menekan Kembali | Jawaban terakhir dihapus; status dan pertanyaan berikutnya dihitung ulang. |
| Data JSON diubah saat sesi berjalan | Gejala/aturan baru ikut dihitung; gejala baru tanpa entri di `A` ditanyakan setelah urutan acak. |
| Sesi tersimpan rusak | Ditolak saat dimuat; konsultasi dimulai dari awal. |
| Progress bar | Memakai `SISA` yang merupakan perkiraan; dapat melompat maju saat aturan gugur, bukan jumlah pertanyaan pasti. |

## 13. Peta ke implementasi

| Algoritme di dokumen | Fungsi di `src/lib/sistemPakar.js` |
|---|---|
| `NILAI` | `nilai` |
| `BELUM_DIJawab` | `belumDijawab` |
| `TUTUP_FAKTA` | `tutupFakta` |
| `MESIN_MAJU` | `mesinMaju` |
| `STATUS_KRITERIA` | `statusKriteria` |
| `STATUS_ATURAN` | `statusAturan` |
| `RELEVAN` | `gejalaRelevan` |
| `WAKTU_AKTIF` | `waktuAktif` |
| `PENYARING_BERIKUTNYA` | `penyaringBerikutnya` |
| `KRISIS_BELUM_DITANYA` | `krisisBelumDitanya` |
| `BUKTIKAN_GEJALA` | `buktikanGejala` |
| `BUKTIKAN_KRITERIA` | `buktikanKriteria` |
| `BUKTIKAN_ATURAN` | `buktikanAturan` |
| `BUKTIKAN_TUJUAN` | `buktikanTujuan` |
| `LANGKAH` | `langkahBerikutnya` |
| `JAWAB` | `jawab` |
| `BATAL` | `batalkan` |
| `CUKUP` | `cukupDurasi` |
| `SUSUN_KESIMPULAN` | bagian akhir `langkahBerikutnya` |
| `URUTAN_ACAK_ATURAN` | `urutanAcakAturan` |

Alur tampilan yang memakai algoritme ini dijelaskan di [alur-aplikasi.md](./alur-aplikasi.md).
