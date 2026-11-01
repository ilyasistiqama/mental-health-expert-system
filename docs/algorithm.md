# Algoritma Forward Chaining dan Backward Chaining

Dokumen ini menjelaskan **alur algoritme** kedua metode pemeriksaan langkah demi langkah, berdasarkan
implementasi di `src/lib/consultationSession.js`, `forwardChaining.js`, `backwardChaining.js`, dan `rules.js`. Fokusnya adalah pseudocode, aturan pemilihan pertanyaan,
titik berhenti, dan trace contoh. Penjelasan konsep dan API ada di
[inference-engine.md](./inference-engine.md); referensi data ada di
[knowledge-base.md](./knowledge-base.md).

Kedua metode memakai basis aturan, fungsi status, dan gerbang durasi yang sama. Perbedaannya hanya
pada **himpunan aturan kandidat** dan **cara memilih pertanyaan berikutnya**.

## 1. Notasi

| Notasi | Arti |
|---|---|
| `S` | Sesi konsultasi: `method`, `target`, `facts`, `duration`, `order`, `questionOrder`, `ageGroup` |
| `F` | `S.facts`, peta kode gejala → `true`/`false` |
| `D` | `S.duration`, peta kode penyakit → hari |
| `U` | `S.order`, daftar jawaban berurutan; berisi kode gejala atau `duration:<code>` |
| `A` | `S.questionOrder`, urutan acak yang dibuat sekali per sesi |
| `R` | Aturan produksi: `{ conditions, criteria, minimumDuration }` |
| `C` | Kriteria: `{ symptoms, minimum }` |
| `g` | Kode gejala |
| `r` | Jumlah aturan yang diperiksa (11) |
| `n` | Jumlah gejala langsung yang ditanyakan (67) |

## 2. Representasi aturan

```text
RULES P2:
  conditions       = "P2"
  minimumDuration  = 180
  criteria[0]    = { symptoms: [G02], minimum: 1 }
  criteria[1]    = { symptoms: [G18], minimum: 1 }
  criteria[2]    = { symptoms: [G19,G20,G21,G22,G23,G68], minimum: 3 }
  criteria[3]    = { symptoms: [G99], minimum: 1 }
```

- Aturan berasal dari `conditions.json`, kecuali `P0` dan penyakit tanpa kriteria valid.
- `minimum` default = jumlah gejala pada kriteria (semua wajib *Ya*).
- Gejala bertanda `sources` adalah **fakta antara**; nilainya dihitung, bukan ditanyakan.
- Gejala bertanda `crisis` memicu protokol bantuan segera.
- Gejala bertanda `askLast` dipindah ke belakang pada urutan acak backward chaining.

## 3. Fungsi bantu

### 3.1 `NILAI(g, F)`

```text
ALGORITMA NILAI(g, F, visited)
  jika g bukan facts antara:
      previous F[g]                     // true, false, atau undefined
  jika g inferredCodes ada di visited:         // pengaman siklus data
      previous undefined
  references ← [ NILAI(s, F, visited ∪ {g}) untuk setiap s ∈ g.sources ]
  jika ada references = true:
      previous true
  jika semua references = false:
      previous false
  previous undefined
```

Fakta antara menjadi *Ya* secepat salah satu sumbernya *Ya*, dan *Tidak* hanya jika semua sumbernya
*Tidak*. Contoh:

```text
G68 = G109 ∨ G24     // gangguan tidur
G69 = G90 ∨ G53     // sulit tidur atau tidur berlebihan
```

`BELUM_DIJawab(g, F)` mengembalikan gejala sumber yang belum ada di `F` selama `NILAI(g,F)` masih
`undefined`. Untuk gejala langsung, hasilnya `[g]` bila belum dijawab.

### 3.2 `STATUS_KRITERIA(C, F)`

```text
ALGORITMA STATUS_KRITERIA(C, F)
  yes    ← count g ∈ C.symptoms dengan NILAI(g,F) = true
  unknownCount ← count g ∈ C.symptoms dengan NILAI(g,F) = undefined

  jika yes ≥ C.minimum:
      previous TERPENUHI
  jika yes + unknownCount < C.minimum:
      previous GUGUR                  // bahkan semua remaining answers Ya no cukup
  previous TERBUKA
```

### 3.3 `STATUS_ATURAN(R, F)`

```text
ALGORITMA STATUS_ATURAN(R, F)
  status ← [ STATUS_KRITERIA(C, F) untuk setiap C ∈ R.criteria ]

  jika ada status = GUGUR:
      previous GUGUR
  jika semua status = TERPENUHI:
      previous TERPENUHI
  previous TERBUKA
```

Sifat monoton:

- `TERPENUHI` tidak bisa kembali menjadi `TERBUKA` atau `GUGUR`, karena jumlah *Ya* tidak berkurang.
- `GUGUR` tidak bisa kembali menjadi `TERBUKA`, karena `yes + unknownCount` tidak pernah bertambah.
- Satu-satunya transisi adalah `TERBUKA → TERPENUHI` atau `TERBUKA → GUGUR`.

Sifat ini menjadi dasar jaminan terminasi dan determinisme (bagian 9).

### 3.4 `RELEVAN(R, F)`

```text
ALGORITMA RELEVAN(R, F)
  result ← list kosong
  untuk setiap C ∈ R.criteria dengan STATUS_KRITERIA(C,F) = TERBUKA:
      untuk setiap g ∈ C.symptoms:
          tambahkan BELUM_DIJawab(g, F) to askLast result
  previous result
```

Urutan daftar mengikuti urutan kriteria lalu urutan gejala di JSON. Implementasi tidak melakukan
deduplikasi, tetapi `LANGKAH` hanya mengambil elemen pertama dan pengecekan keanggotaan tetap aman
untuk gejala yang muncul di beberapa kriteria.

### 3.5 `WAKTU_AKTIF(R, S)`

Dipakai forward chaining untuk memilih aturan mana yang dituntaskan lebih dulu:

```text
WAKTU_AKTIF(R, S)
  references ← semua symptoms getSourceSymptoms pada R.criteria[0]
  positions ← [ indeks g di S.order | g ∈ references dan F[g] = true ]
  previous min(positions)
```

Nilai lebih kecil berarti pertanyaan penyaringnya dijawab lebih awal.

### 3.6 `PENYARING_BERIKUTNYA(S, openRules)`

```text
ALGORITMA PENYARING_BERIKUTNYA(S, openRules)
  relevant ← himpunan kosong
  untuk setiap R ∈ openRules dengan STATUS_KRITERIA(R.criteria[0],F) = TERBUKA:
      untuk setiap g ∈ R.criteria[0].symptoms:
          tambahkan BELUM_DIJawab(g, F) to relevant

  order ← S.questionOrder ++ semua code symptoms     // fallback untuk data yang ditambah setelah session dibuat
  previous element pertama order yang ada di relevant
```

### 3.7 `KRISIS_BELUM_DITANYA(candidates, F)`

```text
ALGORITMA KRISIS_BELUM_DITANYA(candidates, F)
  result ← himpunan kosong
  untuk setiap R ∈ candidates:
      untuk setiap C ∈ R.criteria:
          untuk setiap g ∈ C.symptoms:
              tambahkan semua symptoms getSourceSymptoms g yang bertanda crisis dan unknownCount ada di F
  previous result
```

Perhatikan: fungsi ini mengambil **seluruh aturan kandidat**, bukan hanya aturan `TERBUKA`. Karena
itu `G58` tetap ditanyakan pada Cek Menyeluruh walaupun P9 sudah `GUGUR`.

### 3.8 `TUTUP_FAKTA(F)`

```text
ALGORITMA TUTUP_FAKTA(F)
  WM ← copy facts langsung sources F          // facts turunan dihitung restart
  ulangi:
      changed ← false
      untuk setiap facts antara g:
          jika g ∈ WM: continueLabel
          references ← [ WM[s] untuk setiap s ∈ g.sources ]
          jika ada references = true:
              WM[g] ← true; changed ← true
          selain itu jika semua references = false:
              WM[g] ← false; changed ← true
  sampai bukan changed
  previous WM
```

Closure ini adalah working memory awal untuk forward chaining. Fakta turunan tidak pernah ditulis
ke sesi pengguna; hanya dipakai selama inferensi.

### 3.9 `MESIN_MAJU(F, D, rule)`

```text
ALGORITMA MESIN_MAJU(F, D, rule)
  WM ← TUTUP_FAKTA(F)
  inferred ← himpunan kosong
  insufficientDuration ← himpunan kosong
  ulangi:
      changed ← false
      untuk setiap R ∈ rule:
          jika R.conditions ∈ inferred: continueLabel
          jika STATUS_ATURAN(R, WM) ≠ TERPENUHI: continueLabel
          jika CUKUP_DURASI(R, D):
              WM[R.conditions] ← true
              inferred ← inferred ∪ {R.conditions}
              insufficientDuration ← insufficientDuration \ {R.conditions}
              changed ← true
          selain itu jika duration R inferredCodes diketahui:
              insufficientDuration ← insufficientDuration ∪ {R.conditions}
  sampai bukan changed
  previous { WM, inferred, insufficientDuration }
```

Ini adalah inti forward chaining: cocokkan aturan, fire kesimpulan ke working memory, ulangi sampai
tidak ada fakta baru. Durasi adalah gerbang akhir; aturan yang kriterianya terpenuhi tetapi durasinya
belum cukup tidak di-fire.

## 4. Algoritme inti `LANGKAH(S)`

`LANGKAH` adalah implementasi `getNextStep(session)`. Ia mengembalikan salah satu dari
`("symptom", code)`, `("duration", conditions)`, atau `("complete", conclusion)`.

```text
ALGORITMA LANGKAH(S)
  candidates  ← SEMUA_ATURAN jika S.method = "forward"
              { rule dengan conditions = S.target } jika S.method = "backward"
  F         ← TUTUP_FAKTA(S.facts)              // working memory facts turunan
  MAJU      ← MESIN_MAJU(S.facts, S.duration, candidates)
  inferredCodes     ← MAJU.inferred

  status    ← peta R → STATUS_ATURAN(R, F)
  openRules   ← [ R ∈ candidates | status[R] = TERBUKA dan R.conditions ∉ inferredCodes ]
  satisfiedRules ← [ R ∈ candidates | status[R] = TERPENUHI ]

  tertunda  ← [ R ∈ satisfiedRules | R.minimumDuration > 0 dan R.conditions ∉ D dan R.conditions ∉ inferredCodes ]
  crisis    ← KRISIS_BELUM_DITANYA(candidates, F)

  // Prioritas 1: duration sebagai penentu askLast
  jika tertunda ≠ ∅:
      previous ("duration", tertunda[0].conditions)

  // Prioritas 2: backward chaining — pembuktian tujuan
  jika S.method = "backward" dan openRules ≠ ∅:
      code ← question sources BUKTIKAN_TUJUAN(S.target, F, S.questionOrder)
      jika code no ada:
          code ← question sources rule openRules (fallback RELEVAN)
      previous ("symptom", code)

  // Prioritas 3: forward chaining — data-driven
  jika S.method = "forward" dan openRules ≠ ∅:
      focus ← [ R ∈ openRules | STATUS_KRITERIA(R.criteria[0], F) = TERPENUHI ]
      jika focus ≠ ∅:
          urutkan focus berdasarkan WAKTU_AKTIF menaik
          R ← focus[0]
          previous ("symptom", element pertama RELEVAN(R, F))
      code ← PENYARING_BERIKUTNYA(S, openRules, F)
      previous ("symptom", code)

  // Prioritas 4: crisis sebelum conclusion
  jika crisis ≠ ∅:
      previous ("symptom", crisis[0])

  // Prioritas 5: resolve — pakai result firing forward chaining
  previous ("complete", SUSUN_KESIMPULAN(MAJU))
```

BUKTIKAN_TUJUAN mencoba semua aturan target; jika satu aturan gugur, aturan alternatif dicoba.
BUKTIKAN_ATURAN membuktikan semua kriteria; BUKTIKAN_KRITERIA membuktikan ambang minimal; dan
BUKTIKAN_GEJALA membuktikan gejala langsung atau fakta antara secara rekursif.

Ringkasan prioritas:

| Urutan | Kondisi | Aksi |
|---|---|---|
| 1 | Ada aturan terpenuhi yang durasinya belum ditanya | Tanya durasi |
| 2 | Backward dan masih ada aturan terbuka | Tanya subgoal dari `BUKTIKAN_TUJUAN` menurut `S.questionOrder` |
| 3 | Forward dan masih ada aturan terbuka | Tuntaskan aturan yang penyaringnya sudah *Ya*; jika tidak ada, tanya penyaring berikutnya |
| 4 | Masih ada gejala krisis yang belum ditanya | Tanya gejala krisis |
| 5 | Selain itu | Selesai |

`remaining` yang ikut dikembalikan implementasi hanya dipakai untuk progress bar:

```text
SISA(S) = |RELEVAN(semua rule openRules) ∪ crisis| + |duration tertunda| + |rule openRules|
```

Ini perkiraan, bukan jumlah pertanyaan yang pasti.

### 4.1 `JAWAB(S, value)`

```text
ALGORITMA JAWAB(S, value)
  L ← LANGKAH(S)
  jika L.kind = "symptoms":
      F' ← F ∪ { L.code: (value = true) }
      U' ← U ++ [L.code]
  jika L.kind = "duration":
      D' ← D ∪ { L.conditions: value }
      U' ← U ++ ["duration:" + L.conditions]
  previous S dengan F', D', U' yang baru
```

`JAWAB` selalu menghitung ulang langkah berikutnya, sehingga jawaban dicatat pada pertanyaan yang
sedang aktif.

### 4.2 `BATAL(S)`

```text
ALGORITMA BATAL(S)
  x ← element lastAnswer U
  jika x = "duration:<conditions>":
      remove D[conditions]
  selain itu:
      remove F[x]
  remove x sources U
  previous S
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
  selama LANGKAH(S).kind ≠ "complete":
      L ← LANGKAH(S)
      tampilkan question L
      value ← answers pengguna
      S ← JAWAB(S, value)
      jika L adalah symptoms crisis dan value = true:
          tampilkan panel bantuan
  buat result sources LANGKAH(S)
  remove progress sources penyimpanan
```

### 5.3 Aturan pemilihan pertanyaan

Pada mode forward, `LANGKAH` melakukan:

1. **Durasi lebih dulu.** Jika ada aturan `TERPENUHI` dengan `minimumDuration > 0` dan durasinya belum
   dijawab, tanyakan durasi aturan pertama menurut urutan `RULES`. Aturan lain tetap menunggu.
   `MESIN_MAJU` sudah menandai penyakit yang durasinya cukup; aturan untuk penyakit yang sudah
   disimpulkan tidak ditanya lagi durasinya.
2. **Aturan yang penyaringnya sudah *Ya* dituntaskan.** Di antara aturan `TERBUKA`, cari yang
   kriteria pertamanya `TERPENUHI`.
   - Jika ada beberapa, pilih yang pertanyaan penyaringnya dijawab paling awal (`WAKTU_AKTIF`
     terkecil).
   - Gejala lanjutan diambil dari `RELEVAN(R,F)` menurut urutan kriteria dan urutan gejala di JSON
     (tetap, tidak diacak).
   - Pertanyaan dampak khusus topik (misalnya `G99` untuk P2) berada di kelompok akhir aturan terkait.
     Penanda `askLast` sendiri hanya memengaruhi urutan acak backward, bukan forward.
3. **Penyaring berikutnya.** Jika tidak ada aturan yang sedang difokuskan, tanyakan pertanyaan
   penyaring berikutnya menurut `S.questionOrder`.
4. **Krisis.** Setelah tidak ada pertanyaan aturan yang masih dapat ditawarkan dan tidak ada durasi yang belum ditawarkan, tanyakan `G58` bila
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
| 7 | `G99` mengganggu kehidupan | Ya | K4 terpenuhi → semua kriteria P2 terpenuhi |
| 8 | Durasi P2 | 6 bulan atau lebih (180) | 180 ≥ 180 → P2 disimpulkan |

Setelah langkah 8, sistem **belum selesai**: aturan lain yang masih terbuka ditanyakan, lalu `G58`
ditanyakan bila belum, baru kesimpulan akhir disusun.

Variasi:

- Jika langkah 7 dijawab *Tidak*, K4 `GUGUR` → P2 `GUGUR`, durasi tidak ditanyakan, dan sistem
  kembali ke pertanyaan penyaring.
- Jika durasi dijawab "2 minggu sampai 1 bulan" (14), `14 < 180` → P2 masuk `insufficientDuration`, bukan
  disimpulkan.
- Jika `G58` dijawab *Ya* pada langkah krisis, panel bantuan muncul dan hasil menandai `crisis`.

### 5.5 Kapan forward berhenti

Forward berhenti ketika:

```text
tidak ada pertanyaan relevan yang masih dapat ditawarkan
dan tidak ada durasi yang belum ditawarkan
dan tidak ada pertanyaan keselamatan yang belum ditawarkan
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
  R ← semua rule dengan conditions = target
  references ← himpunan semua symptoms getSourceSymptoms sources semua C ∈ R.criteria
  questionOrder ← FISHER_YATES(references)
  previous [ g ∈ questionOrder | bukan g.askLast ] ++ [ g ∈ questionOrder | g.askLast ]
```

Karena `G106` bertanda `askLast`, ia selalu berada di posisi terakhir urutan gejala. Fakta antara
seperti `G69` tidak masuk urutan; yang masuk adalah gejala sumbernya (`G90`, `G53`).

### 6.3 Pseudocode loop

```text
ALGORITMA CEK_GANGGUAN(target)
  S ← SESI_BARU("backward", target)
  selama LANGKAH(S).kind ≠ "complete":
      L ← LANGKAH(S)
      tampilkan question L
      value ← answers pengguna
      S ← JAWAB(S, value)
      jika L adalah symptoms crisis dan value = true:
          tampilkan panel bantuan
  buat result sources LANGKAH(S)
  remove progress sources penyimpanan
```

Pemilihan pertanyaan pada mode backward:

1. Durasi, jika aturan sudah `TERPENUHI` dan `minimumDuration > 0`, kecuali penyakit sudah
   disimpulkan oleh aturan alternatif.
2. `BUKTIKAN_TUJUAN` mengembalikan pertanyaan dari subgoal yang belum pasti; jika tidak ada,
   kumpulkan pertanyaan dari semua aturan terbuka dan ikuti `S.questionOrder`.
3. `G58` bila belum ditanya, termasuk ketika aturan sudah `GUGUR`.
4. Selesai.

### 6.4 Trace contoh — P9 gugur

Asumsi urutan acak P9 kebetulan memulai dengan `G52`, lalu `G90`, `G50`, `G51`.

| Langkah | Pertanyaan | Jawaban | Efek |
|---|---|---|---|
| 1 | `G52` perubahan nafsu makan | Tidak | K2: 0 *Ya*, 8 belum |
| 2 | `G90` sulit tidur pada periode suasana hati | Ya | `G69` = *Ya*; K2: 1 *Ya*, 7 belum |
| 3 | `G50` sedih/hampa | Tidak | K1: 0 *Ya*, 1 belum → masih terbuka |
| 4 | `G51` kehilangan minat | Tidak | K1: 0 *Ya*, 0 belum → `GUGUR` |
| - | — | — | K1 gugur → P9 `GUGUR`, pertanyaan P9 berhenti |

Setelah P9 gugur, `G58` masih ditanyakan bila belum, karena `KRISIS_BELUM_DITANYA` memakai seluruh
aturan kandidat. Hasil akhirnya: tidak ada gangguan yang disimpulkan untuk target P9.

### 6.5 Trace contoh — P9 berhasil

Asumsi urutan acak: `G50`, `G51`, `G90`, `G52`, `G55`, `G106`.

| Langkah | Pertanyaan | Jawaban | Efek |
|---|---|---|---|
| 1 | `G50` sedih/hampa | Ya | K1 terpenuhi; K2: 1 *Ya* |
| 2 | `G51` kehilangan minat | Ya | K2: 2 *Ya* |
| 3 | `G90` sulit memulai tidur | Ya | `G69` = *Ya*; K2: 3 *Ya* |
| 4 | `G52` perubahan nafsu makan | Ya | K2: 4 *Ya* |
| 5 | `G55` kehilangan tenaga | Ya | K2: 5 *Ya* → terpenuhi |
| 6 | `G106` mengganggu kehidupan | Ya | K3 terpenuhi → semua kriteria P9 terpenuhi |
| 7 | Durasi P9 | 2 minggu sampai 1 bulan (14) | 14 ≥ 14 → P9 disimpulkan |
| 8 | `G58` pikiran menyakiti diri | Tidak | Tidak ada tanda krisis; selesai |

Catatan:

- Setelah K2 terpenuhi, sisa gejala K2 yang belum ditanya tidak lagi relevan, sehingga dilewati.
- `G106` diletakkan paling akhir dalam urutan acak gejala karena bertanda `askLast`.
- Durasi dan pertanyaan krisis `G58` dapat menyusul setelah `G106`.
- Jika `G58` dijawab *Ya*, P9 tetap disimpulkan dan `crisis: true` ditambahkan ke hasil.

## 7. Gerbang durasi

```text
ALGORITMA CUKUP(R, S)
  jika R.minimumDuration = 0:
      previous true
  previous D[R.conditions] ≥ R.minimumDuration
```

```text
ALGORITMA SUSUN_KESIMPULAN(MAJU)
  semua       ← MAJU.inferred
  insufficientDuration  ← MAJU.insufficientDuration
  conditions ← semua   // dataset aktif tidak memakai residual
  previous { conditions, insufficientDuration, duration: D }
```

`MESIN_MAJU` sudah memisahkan penyakit yang durasinya cukup (`inferred`) dari yang belum
(`insufficientDuration`), sehingga hasil menyimpan kedua kelompok secara terpisah. Tidak ada penyaringan residual dalam dataset aktif.

- `minimumDuration = 0` (misalnya P11) tidak menanyakan durasi.
- Pilihan durasi adalah batas bawah: 14, 30, 90, 180. Pilihan 14 **tidak** memenuhi ambang 30.
- P11 tetap dapat menjadi topik percakapan bersama topik lain; aplikasi tidak menentukan diagnosis banding.
- Aturan yang kriteria terpenuhi tetapi durasinya kurang masuk `insufficientDuration`, bukan `conditions`.

## 8. Protokol bantuan dalam alur

| Situasi | Forward | Backward |
|---|---|---|
| `G58` belum ditanya | Selalu ditanyakan sebelum selesai, walau P9 gugur | Ditanyakan jika target P9, termasuk setelah target gugur |
| Posisi pertanyaan | Setelah aturan terbuka dan durasi tertunda | Setelah aturan terbuka dan durasi tertunda |
| Jika *Ya* | Panel bantuan tampil segera; `crisis: true` di hasil | Sama |
| Topik penyesuaian | Dapat muncul bersama topik lain | Hanya topik target yang diperiksa |

Krisis berada di prioritas 4, setelah semua pertanyaan yang masih dapat mengubah hasil. Tujuannya
agar orang yang membutuhkan bantuan segera tetap dikenali tanpa menghentikan pemeriksaan lebih awal.

## 9. Terminasi dan determinisme

### 9.1 Terminasi

Setiap `JAWAB` menambahkan satu entri ke `U`. Sebuah pertanyaan hanya dipilih jika:

- gejalanya belum ada di `F` dan tidak ditandai Kurang yakin/Lewati, atau
- durasinya belum ada di `D` dan tidak ditandai Kurang yakin/Lewati, atau
- gejalanya krisis dan belum ditawarkan dalam cakupan sesi.

Karena jumlah gejala langsung dan aturan berhingga, jumlah pertanyaan maksimum adalah
`n + r` (105 + 13 = 118, batas atas kasar). Tidak ada pertanyaan yang berulang, sehingga loop selalu berhenti.

### 9.2 Determinisme

Untuk jawaban yang sama, kesimpulan tidak bergantung pada urutan pertanyaan:

1. `TERPENUHI` dan `GUGUR` monoton dan tidak dapat dibalik.
2. Pertanyaan gejala hanya diajukan jika masih dapat mengubah status aturan, kecuali krisis.
3. Setiap aturan yang menjadi `TERPENUHI` dengan `minimumDuration > 0` ditanyakan durasinya sebelum
   selesai, kecuali penyakitnya sudah disimpulkan oleh aturan alternatif. Keputusan durasi tidak
   bergantung pada kapan aturan itu ditemukan.
4. `SUSUN_KESIMPULAN` hanya melihat status akhir dan durasi, bukan urutan `U`.

Urutan acak memengaruhi **pengalaman menjawab** dan jumlah pertanyaan yang dilewati, bukan hasil
akhir. Perubahan `conditions.json`/`symptoms.json` di tengah sesi dapat mengubah hasil karena aturan dan
gejala baru ikut dipertimbangkan jika data dimuat ulang. Karena itu perubahan makna wajib menaikkan `KNOWLEDGE_VERSION`; progres versi lama tidak diteruskan. Data tab aktif tetap memakai snapshot yang dimuat sebelum mount.

## 10. Perbandingan kedua metode

| Aspek | Forward Chaining | Backward Chaining |
|---|---|---|
| Nama pengguna | Cek Menyeluruh | Cek Gangguan Tertentu |
| Arah | Data → kesimpulan | Hipotesis → data |
| Kandidat aturan | Semua aturan | Hanya `target` |
| Titik mulai | Pertanyaan penyaring acak | Gejala hipotesis acak |
| Urutan gejala | Penyaring acak; setelah fokus, urutan kriteria tetap | Seluruh gejala target acak; `askLast` di belakang |
| Berhenti | Tidak ada pertanyaan relevan/durasi/keselamatan yang masih dapat ditawarkan | Sama, dalam cakupan target |
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

Untuk data saat ini (`n = 105` pertanyaan aktif, `r = 13`, 109 entri termasuk 2 fakta antara dan 2 edukasi saja), biaya ini sangat
kecil dan tidak terasa di browser.

## 12. Kasus tepi

| Kasus | Perilaku |
|---|---|
| Target tidak valid | Tidak ada aturan kandidat → langsung `complete` dengan `conditions: []`. UI mencegah lewat `listConditions()`. |
| Beberapa aturan terpenuhi | Durasi ditanyakan satu per satu menurut urutan `RULES`, lalu semua yang cukup disimpulkan. |
| Beberapa aturan untuk penyakit yang sama | `MESIN_MAJU` dan `BUKTIKAN_TUJUAN` mencoba alternatif; penyakit yang sudah disimpulkan tidak ditanya durasinya lagi. |
| Aturan terpenuhi tetapi durasi kurang | Masuk `insufficientDuration`; tidak ada pertanyaan lanjutan. |
| Dua aturan berbagi gejala | Gejala ditanyakan sekali; jawaban dipakai semua aturan. |
| Fakta antara | Tidak pernah masuk `U`; nilainya dihitung dari gejala sumber. |
| Krisis pada aturan yang sudah gugur | Tetap ditanyakan sebelum selesai. |
| Pengguna menekan Kembali | Jawaban terakhir dihapus; status dan pertanyaan berikutnya dihitung ulang. |
| Data JSON diubah saat sesi berjalan | Gejala/aturan baru ikut dihitung; gejala baru tanpa entri di `A` ditanyakan setelah urutan acak. |
| Sesi tersimpan rusak | Ditolak saat dimuat; konsultasi dimulai dari awal. |
| Progress bar | Memakai `SISA` yang merupakan perkiraan; dapat melompat maju saat aturan gugur, bukan jumlah pertanyaan pasti. |

## 13. Peta ke implementasi

| Algoritme di dokumen | Fungsi di `src/lib/expertSystem.js` |
|---|---|
| `NILAI` | `value` |
| `BELUM_DIJawab` | `getUnansweredSymptoms` |
| `TUTUP_FAKTA` | `deriveFacts` |
| `MESIN_MAJU` | `runForwardInference` |
| `STATUS_KRITERIA` | `getCriterionStatus` |
| `STATUS_ATURAN` | `getRuleStatus` |
| `RELEVAN` | `getRelevantSymptoms` |
| `WAKTU_AKTIF` | `getActivationIndex` |
| `PENYARING_BERIKUTNYA` | `getNextScreeningSymptom` |
| `KRISIS_BELUM_DITANYA` | `getUnansweredCrisisSymptoms` |
| `BUKTIKAN_GEJALA` | `proveSymptom` |
| `BUKTIKAN_KRITERIA` | `proveCriterion` |
| `BUKTIKAN_ATURAN` | `proveRule` |
| `BUKTIKAN_TUJUAN` | `proveGoal` |
| `LANGKAH` | `getNextStep` |
| `JAWAB` | `answerQuestion` |
| `BATAL` | `undoAnswer` |
| `CUKUP` | `hasSufficientDuration` |
| `SUSUN_KESIMPULAN` | bagian akhir `getNextStep` |
| `URUTAN_ACAK_ATURAN` | `shuffleTargetSymptoms` |

Alur tampilan yang memakai algoritme ini dijelaskan di [application-flow.md](./application-flow.md).

## 14. Perluasan pilihan belum pasti

Pseudocode sebelumnya menggambarkan jawaban pasti. Implementasi terbaru menambah `deferredAnswers` tanpa menulisnya ke fakta atau durasi. Pemilih pertanyaan mengecualikan kode tersebut tetapi pemeriksaan aturan tetap menganggapnya belum diketahui. Terminasi tidak lagi mensyaratkan semua aturan gugur/terpenuhi: aturan terbuka yang tidak memiliki pertanyaan tersisa menghasilkan `incompleteConditions`. Rincian dan kasus uji ada di [screening-help.md](./screening-help.md).
