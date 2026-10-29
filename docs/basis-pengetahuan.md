# Basis Pengetahuan

Basis pengetahuan adalah tiga berkas JSON statis di `public/data/`. Pada hasil build, berkas yang
sama disalin ke `dist/data/` dan dapat diubah langsung di hosting tanpa build ulang.

| Berkas | Isi | Jumlah saat ini |
|---|---|---|
| `penyakit.json` | Gangguan, kriteria, durasi minimal, penanganan, rujukan | 12 entri (`P0`–`P11`) |
| `gejala.json` | Gejala, pertanyaan, fakta antara, tanda krisis/akhir | 69 entri (67 pertanyaan + 2 fakta antara) |
| `sumber.json` | Daftar pustaka; nomor `[n]` mengikuti urutan array | 23 entri |

## 1. Pemuatan dan validasi

`muatBasisPengetahuan()` di `src/lib/sistemPakar.js`:

1. Mengambil ketiga berkas paralel dengan `fetch(`${BASIS}data/${nama}`, { cache: "no-cache" })`.
2. Memberi nomor sumber berdasarkan urutan array (`nomor = index + 1`).
3. Mengindeks gejala per `kode` dan penyakit per `kode`.
4. Memvalidasi `dari` pada fakta antara.
5. Memvalidasi kriteria, durasi, dan sumber setiap penyakit.
6. Menyusun `ATURAN` (aturan produksi) dari penyakit selain `P0` yang memiliki minimal satu
   kriteria valid.
7. Memastikan `P0` ada; jika tidak, melempar error dan aplikasi menampilkan halaman galat.

Peringatan validasi ditulis ke console browser. Data yang tidak valid **dibuang**, aplikasi tetap
berjalan dengan data yang tersisa.

| Masalah | Perilaku |
|---|---|
| Kode gejala ganda | Peringatan; kemunculan terakhir menimpa indeks `GEJALA`, keduanya tetap masuk daftar. |
| `dari` menunjuk kode tidak ada / fakta antara lain | Entri tersebut dibuang dari `dari`, peringatan. |
| Kode penyakit ganda | Peringatan; definisi terakhir menimpa indeks, aturan bisa ganda. |
| Gejala pada kriteria tidak dikenal | Gejala dibuang, peringatan. |
| `minimal` melebihi jumlah gejala | Dibatasi dengan `Math.min`. |
| Kriteria menjadi kosong atau `minimal` ≤ 0 | Kriteria dibuang. |
| `durasiMinimal` bukan 0/14/30/90/180 | Peringatan; nilai tetap dipakai sebagai ambang. |
| `sumber` menunjuk id tidak ada | Dibuang, peringatan. |
| `P0` tidak ada | Aplikasi berhenti dengan galat. |

Tidak ada skema JSON formal atau validasi tipe di luar pemeriksaan di atas.

## 2. Skema `gejala.json`

```json
{
  "kode": "G50",
  "nama": "Sedih, hampa, atau putus asa hampir setiap hari",
  "pertanyaan": "Apakah anda merasa sedih, hampa, atau putus asa hampir setiap hari?"
}
```

| Field | Wajib | Keterangan |
|---|---|---|
| `kode` | Ya | Unik, dipakai di kriteria penyakit. |
| `nama` | Ya | Label pendek untuk tampilan dan PDF. |
| `pertanyaan` | Untuk gejala langsung | Kalimat pertanyaan yang ditampilkan. Harus dapat berdiri sendiri karena urutan pertanyaan diacak. |
| `dari` | Tidak | Daftar kode gejala asal. Menandai fakta antara; tidak ditanyakan. |
| `krisis` | Tidak | `true` = jika dijawab *Ya*, panel bantuan segera muncul. |
| `akhir` | Tidak | `true` = selalu diletakkan paling akhir pada urutan acak backward chaining. |

Aturan penulisan:

- Gejala langsung tidak boleh punya `dari`; fakta antara tidak boleh punya `pertanyaan`.
- `dari` hanya boleh menunjuk gejala langsung (bukan fakta antara lain).
- Pertanyaan tidak boleh merujuk pertanyaan lain ("serangan tersebut") karena urutan diacak.
- Satu gejala boleh dipakai beberapa aturan.

Fakta antara saat ini:

```json
{ "kode": "G68", "nama": "Gangguan tidur", "dari": ["G60", "G61", "G62", "G24"] }
{ "kode": "G69", "nama": "Sulit tidur atau tidur berlebihan", "dari": ["G60", "G61", "G62", "G53"] }
```

## 3. Skema `penyakit.json`

```json
{
  "kode": "P9",
  "nama": "Nama Gangguan",
  "kategori": "Gangguan Kecemasan",
  "deskripsi": "Penjelasan singkat.",
  "kriteria": [
    { "gejala": ["G50", "G51"], "minimal": 1 },
    { "gejala": ["G50", "G51", "G52", "G69", "G54", "G55", "G56", "G57", "G58"], "minimal": 5 },
    { "gejala": ["G49"] }
  ],
  "durasiMinimal": 14,
  "catatanDurasi": "Opsional, tampil jika durasi belum terpenuhi.",
  "catatan": "Opsional, tampil di hasil dan PDF.",
  "pengobatan": ["Saran penanganan 1.", "Saran penanganan 2."],
  "rujukan": "DSM-5-TR: ... · ICD-11: ... · PPDGJ-III: ...",
  "sumber": ["dsm5tr", "icd11", "ppdgj3"],
  "residual": true
}
```

| Field | Wajib | Keterangan |
|---|---|---|
| `kode` | Ya | Unik. `P0` wajib ada. |
| `nama` | Ya | Nama gangguan. |
| `kategori` | Ya | Kategori DSM-5-TR atau kelompok terkait. |
| `deskripsi` | Ya | Ditampilkan di kartu, halaman hasil, dan PDF. |
| `kriteria` | Ya untuk selain `P0` | Array kriteria. Kosong pada `P0`. |
| `kriteria[].gejala` | Ya | Daftar kode gejala langsung atau fakta antara. |
| `kriteria[].minimal` | Tidak | Default = jumlah gejala (semua wajib *Ya*). |
| `durasiMinimal` | Tidak | Default `0`. Hari; gunakan 0/14/30/90/180. |
| `catatanDurasi` | Tidak | Ditampilkan saat kriteria terpenuhi tetapi durasi kurang. |
| `catatan` | Tidak | Ditampilkan di hasil/PDF, misalnya peringatan bipolar atau penyebab fisik. |
| `pengobatan` | Tidak | Daftar saran penanganan; default `[]`. Tidak menyebut nama obat. |
| `rujukan` | Tidak | Ringkasan klasifikasi; ditampilkan sebagai "Klasifikasi: ...". |
| `sumber` | Tidak | Daftar id dari `sumber.json`; default `[]`. |
| `residual` | Tidak | `true` = hanya disimpulkan jika tidak ada gangguan lain. |

`P0` adalah entri khusus yang isinya ditampilkan ketika tidak ada gangguan yang terdeteksi. `P0`
tidak boleh punya kriteria dan tidak masuk `ATURAN`.

## 4. Skema `sumber.json`

```json
{
  "id": "dsm5tr",
  "penulis": "American Psychiatric Association",
  "tahun": "2022",
  "judul": "Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition, Text Revision (DSM-5-TR)",
  "penerbit": "American Psychiatric Association Publishing",
  "url": "https://www.psychiatry.org/psychiatrists/practice/dsm",
  "diakses": "26 Oktober 2026"
}
```

| Field | Keterangan |
|---|---|
| `id` | Kunci unik yang dirujuk `penyakit.sumber` dan komponen `Rujukan`. |
| `penulis`, `tahun`, `judul`, `penerbit` | Disusun menjadi sitasi. |
| `url` | Opsional; ditautkan di halaman Sumber. |
| `diakses` | Tanggal akses; tampil di halaman Sumber. |

Nomor rujukan ditentukan oleh posisi di array. Menyisipkan sumber baru akan menggeser nomor semua
sumber sesudahnya. Komponen `Rujukan` menampilkan `[n]` dan menaut ke `/sumber#<id>`.

## 5. Daftar gangguan dan aturan

`1×` berarti wajib satu gejala; `≥a/b` berarti minimal `a` dari `b` gejala.

| Kode | Gangguan | Kategori | Durasi | Kriteria |
|---|---|---|---|---|
| `P0` | Tidak Menunjukkan Kecenderungan pada Gangguan yang Diperiksa | - | - | Tanpa kriteria; dipakai saat tidak ada gangguan yang disimpulkan. |
| `P1` | Gangguan Panik | Gangguan Kecemasan | 30 hari | `1× G01`; `≥4/7 G10–G16`; `1× G17`; `1× G49` |
| `P2` | Gangguan Kecemasan Menyeluruh | Gangguan Kecemasan | 180 hari | `1× G02`; `1× G18`; `≥3/6 G19–G23, G68`; `1× G49` |
| `P3` | Fobia Spesifik | Gangguan Kecemasan | 180 hari | `1× G03`; `1× G25`; `1× G26`; `1× G49` |
| `P4` | Gangguan Obsesif-Kompulsif | Obsesif-Kompulsif dan Terkait | 14 hari | `≥1/2 G04–G05`; `≥1/2 G59, G49` |
| `P5` | Gangguan Stres Pascatrauma (PTSD) | Terkait Trauma dan Stresor | 30 hari | `1× G06`; `≥1/2 G27–G28`; `1× G29`; `≥2/3 G30–G32`; `≥2/4 G33, G22, G21, G68`; `1× G49` |
| `P6` | Gangguan Kecemasan Sosial | Gangguan Kecemasan | 180 hari | `1× G07`; `1× G34`; `1× G35`; `1× G49` |
| `P7` | Agorafobia | Gangguan Kecemasan | 180 hari | `1× G08`; `≥2/5 G36–G40`; `1× G41`; `1× G49` |
| `P8` | Gangguan Kecemasan Perpisahan | Gangguan Kecemasan | 180 hari | `1× G09`; `≥3/7 G42–G48`; `1× G49` |
| `P9` | Gangguan Depresi Mayor | Gangguan Depresi | 14 hari | `≥1/2 G50–G51`; `≥5/9 G50, G51, G52, G69, G54–G58`; `1× G49` |
| `P10` | Gangguan Insomnia | Gangguan Tidur-Bangun | 90 hari | `≥1/3 G60–G62`; `1× G63`; `1× G64`; `1× G49` |
| `P11` | Gangguan Penyesuaian | Terkait Trauma dan Stresor | 0 | `1× G65`; `1× G66`; `≥1/2 G67, G49`; residual |

Catatan klinis yang memengaruhi aturan:

- **P9** mengikuti kriteria A DSM-5-TR: minimal 5 dari 9 gejala, salah satunya wajib `G50` atau
  `G51`, berlangsung minimal 2 minggu, dan mengganggu fungsi. Sembilan gejala itu juga menjadi dasar
  PHQ-9. Sistem tidak dapat menyingkirkan gangguan bipolar atau penyebab fisik; karena itu P9
  memiliki `catatan`.
- **P4** mengikuti kriteria A dan B DSM-5-TR: obsesi dan/atau kompulsi, menyita > 1 jam sehari
  (`G59`) **atau** menimbulkan gangguan fungsi (`G49`).
- **P10** mengikuti DSM-5-TR dan ICD-11 (7A00): sulit memulai tidur, sering terbangun, atau bangun
  terlalu pagi; minimal 3 malam seminggu; tetap sulit walau ada kesempatan tidur; mengganggu; dan
  minimal 3 bulan.
- **P11** mengikuti DSM-5-TR dan ICD-11 (6B43): keluhan muncul dalam 3 bulan setelah peristiwa
  berat, terus memikirkan peristiwa, dan tertekan melebihi wajar **atau** kehidupan terganggu.
  Bertanda `residual`.

## 6. Daftar gejala

Kolom "Dipakai" mencantumkan aturan penyakit dan fakta antara yang memakai gejala tersebut.

| Kode | Gejala | Dipakai | Tanda |
|---|---|---|---|
| G01 | Serangan panik berulang | P1 | - |
| G02 | Khawatir berlebihan tentang banyak hal | P2 | - |
| G03 | Takut berlebihan pada objek atau situasi tertentu | P3 | - |
| G04 | Obsesi (pikiran berulang yang tidak diinginkan) | P4 | - |
| G05 | Kompulsi (tindakan berulang) | P4 | - |
| G06 | Pernah mengalami peristiwa traumatis | P5 | - |
| G07 | Takut pada situasi sosial | P6 | - |
| G08 | Takut terjebak tanpa pertolongan di tempat umum | P7 | - |
| G09 | Cemas berlebihan terhadap perpisahan | P8 | - |
| G10 | Jantung berdebar kencang | P1 | - |
| G11 | Berkeringat atau gemetar | P1 | - |
| G12 | Sesak napas atau rasa tercekik | P1 | - |
| G13 | Nyeri atau rasa tidak nyaman di dada | P1 | - |
| G14 | Mual, pusing, atau rasa akan pingsan | P1 | - |
| G15 | Merasa tidak nyata atau terlepas dari diri | P1 | - |
| G16 | Takut kehilangan kendali atau mati | P1 | - |
| G17 | Khawatir terus akan serangan berikutnya | P1 | - |
| G18 | Sulit mengendalikan rasa khawatir | P2 | - |
| G19 | Gelisah atau merasa tegang | P2 | - |
| G20 | Mudah lelah | P2 | - |
| G21 | Sulit berkonsentrasi atau pikiran terasa kosong | P2, P5 | - |
| G22 | Mudah marah atau tersinggung | P2, P5 | - |
| G23 | Otot terasa tegang atau kaku | P2 | - |
| G24 | Tidur gelisah atau tidak nyenyak | G68 | - |
| G25 | Rasa takut muncul hampir setiap kali | P3 | - |
| G26 | Menghindari objek atau situasi yang ditakuti | P3 | - |
| G27 | Ingatan, mimpi buruk, atau kilas balik | P5 | - |
| G28 | Reaksi kuat saat teringat peristiwa | P5 | - |
| G29 | Menghindari hal yang mengingatkan peristiwa | P5 | - |
| G30 | Perasaan negatif yang menetap | P5 | - |
| G31 | Merasa terasing atau mati rasa | P5 | - |
| G32 | Sulit mengingat bagian penting peristiwa | P5 | - |
| G33 | Mudah kaget atau selalu waspada | P5 | - |
| G34 | Takut dinilai negatif atau dipermalukan | P6 | - |
| G35 | Menghindari situasi sosial | P6 | - |
| G36 | Takut naik transportasi umum | P7 | - |
| G37 | Takut berada di ruang terbuka | P7 | - |
| G38 | Takut berada di ruang tertutup | P7 | - |
| G39 | Takut mengantre atau berada di keramaian | P7 | - |
| G40 | Takut keluar rumah sendirian | P7 | - |
| G41 | Menghindari tempat tersebut atau harus ditemani | P7 | - |
| G42 | Sangat tertekan saat berpisah | P8 | - |
| G43 | Khawatir orang terdekat celaka | P8 | - |
| G44 | Khawatir peristiwa buruk akan memisahkan | P8 | - |
| G45 | Enggan pergi jauh dari orang terdekat | P8 | - |
| G46 | Takut sendirian atau tidur tanpa orang terdekat | P8 | - |
| G47 | Mimpi buruk tentang perpisahan | P8 | - |
| G48 | Keluhan fisik saat berpisah | P8 | - |
| G49 | Mengganggu kehidupan sehari-hari | P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11 | selalu terakhir |
| G50 | Sedih, hampa, atau putus asa hampir setiap hari | P9 | - |
| G51 | Kehilangan minat atau kesenangan | P9 | - |
| G52 | Perubahan nafsu makan atau berat badan | P9 | - |
| G53 | Tidur berlebihan | G69 | - |
| G54 | Gerak atau bicara melambat, atau sangat gelisah | P9 | - |
| G55 | Kehilangan tenaga atau sangat lelah | P9 | - |
| G56 | Merasa tidak berharga atau bersalah berlebihan | P9 | - |
| G57 | Sulit berkonsentrasi atau mengambil keputusan | P9 | - |
| G58 | Pikiran tentang kematian atau menyakiti diri | P9 | krisis |
| G59 | Obsesi atau kompulsi menyita waktu | P4 | - |
| G60 | Sulit memulai tidur | P10, G68, G69 | - |
| G61 | Sering terbangun dan sulit tidur kembali | P10, G68, G69 | - |
| G62 | Bangun terlalu pagi | P10, G68, G69 | - |
| G63 | Sulit tidur minimal 3 malam seminggu | P10 | - |
| G64 | Tetap sulit tidur walau ada kesempatan | P10 | - |
| G65 | Keluhan muncul setelah peristiwa berat | P11 | - |
| G66 | Terus memikirkan peristiwa berat | P11 | - |
| G67 | Tertekan melebihi wajarnya | P11 | - |
| G68 | Gangguan tidur | P2, P5 | fakta antara dari G60, G61, G62, G24 |
| G69 | Sulit tidur atau tidur berlebihan | P9 | fakta antara dari G60, G61, G62, G53 |

## 7. Daftar sumber

| No | id | Sitasi |
|---|---|---|
| 1 | `dsm5tr` | American Psychiatric Association (2022). Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition, Text Revision (DSM-5-TR). American Psychiatric Association Publishing. |
| 2 | `apa-dsm-2026` | American Psychiatric Association (2026). APA Releases Roadmap for the Future of the DSM. Psychiatry.org. |
| 3 | `icd11` | World Health Organization (2026). International Classification of Diseases, 11th Revision (ICD-11), versi 2026-01. World Health Organization. |
| 4 | `ppdgj3` | Departemen Kesehatan RI, Direktorat Jenderal Pelayanan Medik (1993). Pedoman Penggolongan dan Diagnosis Gangguan Jiwa di Indonesia III (PPDGJ-III). Departemen Kesehatan RI. |
| 5 | `who-anxiety-2026` | World Health Organization (2026). Anxiety disorders (fact sheet, 15 September 2026). World Health Organization. |
| 6 | `who-wmht-2025` | World Health Organization (2025). World mental health today: latest data. World Health Organization. |
| 7 | `ski-2023` | Badan Kebijakan Pembangunan Kesehatan, Kementerian Kesehatan RI (2024). Pemanfaatan Data SKI 2023 untuk Evaluasi Program. Kementerian Kesehatan RI. |
| 8 | `inamhs-2022` | Wahdi, A. E., Wilopo, S. A., & Erskine, H. E. (2023). The Prevalence of Adolescent Mental Disorders in Indonesia: An Analysis of Indonesia – National Mental Health Survey (I-NAMHS). Journal of Adolescent Health. |
| 9 | `healing119` | Kementerian Kesehatan RI (2025). Healing119.id: Layanan Hotline Kesehatan Mental dan Bunuh Diri (119 ext 8). Kementerian Kesehatan RI. |
| 10 | `nice-cg113` | National Institute for Health and Care Excellence (2011, diperbarui 2020). Generalised anxiety disorder and panic disorder in adults: management (CG113). NICE. |
| 11 | `nice-cg159` | National Institute for Health and Care Excellence (2013). Social anxiety disorder: recognition, assessment and treatment (CG159). NICE. |
| 12 | `nice-ng116` | National Institute for Health and Care Excellence (2018). Post-traumatic stress disorder (NG116). NICE. |
| 13 | `nice-cg31` | National Institute for Health and Care Excellence (2005). Obsessive-compulsive disorder and body dysmorphic disorder: treatment (CG31) — sedang diperbarui. NICE. |
| 14 | `apa-ptsd-2025` | American Psychological Association (2025). Clinical Practice Guideline for the Treatment of Posttraumatic Stress Disorder (PTSD) in Adults. American Psychological Association. |
| 15 | `who-depression-2026` | World Health Organization (2026). Depressive disorder (depression) (fact sheet, 11 September 2026). World Health Organization. |
| 16 | `nice-ng222` | National Institute for Health and Care Excellence (2022). Depression in adults: treatment and management (NG222). NICE. |
| 17 | `kroenke-phq9-2001` | Kroenke, K., Spitzer, R. L., & Williams, J. B. W. (2001). The PHQ-9: Validity of a brief depression severity measure. Journal of General Internal Medicine, 16(9), 606–613. |
| 18 | `dazzi-2014` | Dazzi, T., Gribble, R., Wessely, S., & Fear, N. T. (2014). Does asking about suicide and related behaviours induce suicidal ideation? What is the evidence?. Psychological Medicine, 44(16), 3361–3363. |
| 19 | `who-media-suicide-2023` | World Health Organization & International Association for Suicide Prevention (2023). Preventing suicide: a resource for media professionals, update 2023. World Health Organization. |
| 20 | `healing119-faq` | Direktorat Jenderal Kesehatan Masyarakat, Kementerian Kesehatan RI (2025). FAQ Layanan Hotline Healing119.id. Kementerian Kesehatan RI. |
| 21 | `aasm-insomnia-2021` | Edinger, J. D., Arnedt, J. T., Bertisch, S. M., dkk. (2021). Behavioral and psychological treatments for chronic insomnia disorder in adults: an American Academy of Sleep Medicine clinical practice guideline. Journal of Clinical Sleep Medicine, 17(2), 255–262. |
| 22 | `acp-insomnia-2016` | Qaseem, A., Kansagara, D., Forciea, M. A., Cooke, M., & Denberg, T. D. (2016). Management of chronic insomnia disorder in adults: a clinical practice guideline from the American College of Physicians. Annals of Internal Medicine, 165(2), 125–133. |
| 23 | `odonnell-2019` | O'Donnell, M. L., Agathos, J. A., Metcalf, O., Gibson, K., & Lau, W. (2019). Adjustment disorder: current developments and future directions. International Journal of Environmental Research and Public Health, 16(14), 2537. |

## 8. Menambah atau mengubah data

Tidak perlu build ulang. Cukup edit JSON di `public/data/` (development) atau `data/` di hosting,
lalu refresh browser. Saat online, service worker mengambil versi terbaru karena strategi
NetworkFirst.

### Menambah gejala

```json
{ "kode": "G50", "nama": "Jantung berdebar", "pertanyaan": "Apakah jantung anda sering berdebar tanpa sebab?" }
```

- Kode harus unik.
- Pertanyaan harus dapat berdiri sendiri.
- Tambahkan `"krisis": true` jika jawaban *Ya* harus memunculkan kontak bantuan.
- Tambahkan `"akhir": true` jika harus selalu ditanyakan paling akhir pada backward chaining.
- Fakta antara ditulis tanpa `pertanyaan`, dengan `dari` berisi gejala langsung.

### Menambah gangguan

```json
{
  "kode": "P12",
  "nama": "Nama Gangguan",
  "kategori": "Gangguan Kecemasan",
  "deskripsi": "Penjelasan singkat.",
  "kriteria": [
    { "gejala": ["G01"] },
    { "gejala": ["G19", "G20", "G24"], "minimal": 2 },
    { "gejala": ["G49"] }
  ],
  "durasiMinimal": 30,
  "catatanDurasi": "Opsional.",
  "pengobatan": ["Saran penanganan 1.", "Saran penanganan 2."],
  "rujukan": "DSM-5-TR: ... · ICD-11: ... · PPDGJ-III: ...",
  "sumber": ["dsm5tr"]
}
```

Setelah menambah penyakit:

1. Gangguan otomatis muncul di beranda, halaman konsultasi backward, dan halaman Tentang karena
   semua daftar memakai `daftarPenyakit()`.
2. Tidak ada rute baru yang perlu didaftarkan.
3. Jika nama sistem berubah, sesuaikan `src/lib/nama.js` serta `<title>`/description di
   `index.html`.
4. Periksa console browser untuk peringatan validasi.
5. Uji kedua metode, termasuk durasi di bawah ambang.

### Mengubah durasi

Gunakan nilai 0/14/30/90/180 agar sesuai pilihan jawaban. `0` berarti tidak ada pertanyaan durasi.
Jika ingin semua gangguan memakai batas 2 minggu, ubah semuanya menjadi `14`.

## 9. Batasan isi

- Pertanyaan adalah penyederhanaan kriteria untuk skrining mandiri, bukan instrumen terstandar.
- Belum divalidasi oleh psikolog klinis atau psikiater. Status ini dinyatakan terbuka di halaman
  `/tentang` dan `/sumber`.
- Saran penanganan tidak menyebut nama obat; obat selalu dirujuk ke resep dan pengawasan dokter.
- Untuk penelitian dengan responden, perlu informed consent dan ethical clearance (lihat
  [pengembangan-dan-deploy.md](./pengembangan-dan-deploy.md)).
