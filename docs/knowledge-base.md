# Basis pengetahuan

Tiga JSON di `public/data/` dimuat oleh `src/lib/knowledgeBase.js`. Dataset saat ini memiliki **13 topik aktif**, 109 entri gejala (105 pertanyaan aktif, dua fakta turunan, dua entri edukasi saja), dan 39 sumber. `P0` adalah entri internal tanpa aturan, bukan pernyataan sehat.

Riset, alasan perubahan, dan pemetaan sumber seluruh gejala ada di [research-audit.md](./research-audit.md). Audit sumber bukan validasi klinis. Aturan mengelompokkan topik untuk dibicarakan dengan profesional.

## Berkas dan pemuatan

| Berkas | Isi |
|---|---|
| `conditions.json` | P0–P13, deskripsi edukasi, kelompok aturan, durasi, sumber |
| `symptoms.json` | G01–G109, pertanyaan atau sumber fakta turunan, metadata bukti |
| `references.json` | Pustaka; nomor tampilan mengikuti urutan array |

Loader mengambil ketiganya paralel, lalu `validateKnowledgeBase()` memvalidasi seluruh isi sebelum mengisi objek/array engine. Pemanggilan ulang mengganti isi tanpa menggandakan aturan. Jika gagal, aplikasi menampilkan galat pemuatan, bukan menjalankan aturan yang dipangkas.

Validator menolak kode kosong/duplikat, gejala atau sumber tidak dikenal, rantai fakta turunan, kriteria kosong, ambang bukan integer positif atau melebihi jumlah item, durasi di luar pilihan aplikasi, rujukan bukti kosong, dan penggunaan gejala `educationalOnly` dalam aturan. Tidak ada pemangkasan `minimum` atau penghapusan syarat otomatis.

## Skema gejala

`code`, `name`, `references`, dan `reviewedAt` wajib untuk entri yang diaudit. Gejala langsung mempunyai `question`; fakta turunan mempunyai `sources` berisi kode gejala langsung.

| Field tambahan | Makna |
|---|---|
| `crisis` | Jawaban Ya memunculkan panel bantuan; tetap ditanyakan sesuai cakupan sesi |
| `askLast` | Ditempatkan di belakang urutan acak backward |
| `educationalOnly` | Disimpan sebagai konsep edukasi, tidak ditanyakan/dihitung aturan |

Pertanyaan harus menyebut konteksnya sendiri karena urutan dapat diacak. G49 (dampak umum) dan G66 (preokupasi stresor dalam konsep ICD-11) hanya edukasi. Dampak yang dihitung memakai pertanyaan khusus topik.

Fakta turunan bekerja dengan OR tiga keadaan: satu sumber Ya → Ya; seluruh sumber Tidak → Tidak; selain itu belum diketahui.

`G68 = G109 OR G24` (tidur dalam periode kekhawatiran).

`G69 = G90 OR G53` (tidur dalam periode keluhan suasana hati).

## Skema kondisi dan kriteria

| Field | Makna |
|---|---|
| `code`, `name`, `category`, `description` | Identitas dan konten edukasi |
| `criteria` | Kelompok yang semuanya harus terpenuhi (AND) |
| `criteria[].symptoms` | Kode yang dihitung dalam kelompok |
| `criteria[].minimum` | Ambang Ya; bila absen, semua item wajib Ya |
| `criteria[].references` | Dasar kelompok aturan |
| `minimumDuration` | Batas bawah 0/14/30/90/180 hari; 0 tidak menanyakan durasi tersendiri |
| `evidenceReferences` | Sumber yang digunakan dalam audit aturan |
| `ruleBasis` | Ringkasan kerangka yang dipakai; bukan klaim implementasi lengkap pedoman |
| `reviewedAt` | Tanggal tinjau pengembang, bukan persetujuan klinis |
| `references` | Pustaka tampilan, termasuk latar belakang/edukasi |
| `note`, `durationNote` | Penjelasan edukasi opsional |
| `treatment`, `classification` | Metadata lama; bukan rekomendasi atau label diagnosis personal |

`P1` mempunyai `minimumDuration: 0` karena durasi kekhawatiran/perubahan sesudah serangan diperiksa langsung oleh G17. Nilai 0 bukan berarti topik tanpa konteks waktu. OCD/P4 tidak diberi durasi dua minggu buatan.

Tidak ada kondisi aktif yang bertanda `residual`. Dukungan generik engine untuk field itu masih tersedia, tetapi P11 tidak disembunyikan ketika topik lain muncul. Penyaringan komputer bukan diagnosis banding.

## Register aturan operasional

Notasi `≥k/n` menunjukkan ambang dalam satu kelompok; titik koma memisahkan kelompok AND. Tabel ini menggambarkan kode program, bukan daftar kriteria diagnosis lengkap.

| Kode | Topik | Durasi tersendiri (hari) | Kelompok kode |
|---|---|---|---|
| P1 | Gangguan Panik | 0 | ≥1/1 G01; ≥4/13 G10, G11, G70, G12, G71, G13, G14, G72, G74, G75, G15, G16, G73; ≥1/1 G17 |
| P2 | Gangguan Kecemasan Menyeluruh | 180 | ≥1/1 G02; ≥1/1 G18; ≥3/6 G19, G20, G21, G22, G23, G68; ≥1/1 G99 |
| P3 | Fobia Spesifik | 180 | ≥1/1 G03; ≥1/1 G25; ≥1/1 G26; ≥1/1 G100 |
| P4 | Gangguan Obsesif-Kompulsif | 0 | ≥1/2 G04, G05; ≥1/2 G59, G101 |
| P5 | Gangguan Stres Pascatrauma (PTSD) | 30 | ≥1/1 G06; ≥1/5 G27, G76, G77, G28, G78; ≥1/2 G29, G79; ≥2/7 G32, G82, G80, G30, G83, G31, G81; ≥2/6 G85, G86, G33, G84, G87, G88; ≥1/1 G102 |
| P6 | Gangguan Kecemasan Sosial | 180 | ≥1/1 G07; ≥1/1 G34; ≥1/1 G91; ≥1/1 G35; ≥1/1 G103 |
| P7 | Agorafobia | 180 | ≥1/1 G08; ≥2/5 G36, G37, G38, G39, G40; ≥1/1 G92; ≥1/1 G41; ≥1/1 G104 |
| P8 | Gangguan Kecemasan Perpisahan | 180 | ≥1/1 G09; ≥3/8 G42, G43, G44, G45, G46, G47, G48, G89; ≥1/1 G105 |
| P9 | Gangguan Depresi Mayor | 14 | ≥1/2 G50, G51; ≥5/9 G50, G51, G52, G69, G54, G55, G56, G57, G58; ≥1/1 G106 |
| P10 | Gangguan Insomnia | 90 | ≥1/3 G60, G61, G62; ≥1/1 G63; ≥1/1 G64; ≥1/1 G107 |
| P11 | Gangguan Penyesuaian | 0 | ≥1/1 G65; ≥1/2 G67, G108 |
| P12 | Mimpi buruk berulang | 0 | ≥1/1 G93; ≥1/1 G94; ≥1/1 G95 |
| P13 | Pola tidur-bangun terlambat | 90 | ≥1/1 G96; ≥1/1 G97; ≥1/1 G98 |

## Sumber dan terjemahan

Sumber memiliki `id`, `author`, `title`, `url`, dan metadata tahun/tanggal akses. Tautan `ReferenceLink` di samping pertanyaan menuju entri pada halaman Sumber. Judul resmi sumber tidak harus diterjemahkan.

Teks Indonesia dipakai sebagai kunci terjemahan `src/locales/en.json`. Tambahkan terjemahan untuk nama, pertanyaan, kategori, deskripsi, dan catatan baru. Mengubah bahasa tidak mengubah kode/fakta.

## Versi sesi dan pembaruan

`KNOWLEDGE_VERSION` di `knowledgeBase.js` harus berubah ketika arti pertanyaan atau aturan berubah. Sesi menyimpan `knowledgeVersion`; IndexedDB memakai kunci `sispak.sesi.<versi>.<metode>`. Progres versi lama diabaikan/dihapus saat ditemukan dan pengguna mendapat pemberitahuan untuk mulai ulang. Format field lama masih dinormalisasi oleh `sessionCompatibility.js`, tetapi normalisasi bentuk tidak membuat versi pertanyaan lama kompatibel.

Jangan mengganti JSON produksi secara terpisah sambil mempertahankan kode/version yang lama. Bangun dan deploy ketiga JSON bersama kode agar validasi, versi, dan terjemahan sesuai. Dataset yang sudah dimuat tidak berubah di tengah sesi dalam satu tab.

## Menambah atau memperbarui topik

1. Temukan sumber yang mendukung konsep, konteks, serta ambangnya. Bedakan ringkasan DSM, ICD, atau aturan edukasi buatan pengembang.
2. Catat keputusan di audit; jangan menganggap adanya referensi membuktikan validitas pertanyaan.
3. Tambahkan gejala langsung per domain. Jangan menggabungkan beberapa domain lalu menghitungnya sebagai satu tanpa alasan.
4. Kaitkan dampak dan gejala dengan topiknya. Tambahkan rujukan setiap item/kelompok.
5. Tambahkan terjemahan serta ubah versi pengetahuan jika semantik berubah.
6. Jalankan `npm test` dan `npm run build`, termasuk kasus batas serta jawaban yang harus tidak menghasilkan topik.

Pertanyaan dan aturan ini tetap perlu dinilai profesional sebelum diklaim sebagai alat skrining klinis.

## Pilihan belum pasti

Pilihan Kurang yakin dan Lewati mengubah status pengisian, bukan kriteria klinis JSON. Data gejala tetap boolean; respons belum pasti dicatat pada `deferredAnswers`. Topik terbuka dapat selesai sebagai informasi belum cukup. Versi saat ini `2026-11-01-responses-2`. Lihat [screening-help.md](./screening-help.md).
