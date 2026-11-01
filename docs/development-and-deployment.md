# Pengembangan dan Deployment

## 1. Prasyarat

- Node.js **20.19+** atau **22.12+** (disarankan versi LTS).
- npm.
- Tidak perlu PHP, MySQL, atau server aplikasi.

## 2. Perintah

```bash
npm install      # sekali saja
npm test         # uji otomatis mesin inferensi
npm run dev      # server development Vite, biasanya http://localhost:5173
npm run build    # build produksi to dist/
npm run preview  # mencoba result build secara lokal
```

`npm test` menjalankan pengujian inferensi dengan test runner bawaan Node.js. Tidak ada script
`lint` atau `typecheck`. Pemeriksaan antarmuka tetap mengikuti checklist di bagian 10.

## 3. Struktur folder

```text
.
├── index.html                  references Vite (bukan aplikasi jadi)
├── package.json
├── vite.config.js              base, alias, plugin halaman + PWA
├── deploy/
│   └── nginx.conf              contoh konfigurasi nginx
├── .github/workflows/
│   └── deploy.yml              build & deploy GitHub Pages
├── public/
│   ├── favicon.svg
│   └── data/                   basis pengetahuan (disalin to dist/data)
│       ├── conditions.json
│       ├── symptoms.json
│       └── references.json
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── router.js
│   ├── assets/main.css
│   ├── lib/                    basis, mesin pakar, penyimpanan, offline, bahasa, dan teks dukungan
│   ├── components/
│   └── views/
├── dist/                       result build (ikut di-commit di branch main)
└── docs/                       dokumentasi ini
```

## 4. Build

`npm run build` menghasilkan `dist/` berisi:

- `index.html` hasil transformasi Vite;
- `assets/*` dengan nama ber-hash;
- `data/*.json` dari `public/`;
- `favicon.svg`;
- salinan `index.html` untuk setiap halaman: `artikel.html`, `konsultasi.html`,
  `cek-menyeluruh.html`, `cek-gangguan.html`, `result.html`, `references.html`, `tentang.html`,
  `forward.html`, `backward.html`, dan `404.html`;
- service worker (`sw.js`) dan berkas Workbox.

`index.html` di root proyek adalah **sumber**, bukan aplikasi jadi. Jika folder proyek dibuka
langsung lewat web server (bukan `npm run dev`), skrip di dalamnya mengalihkan pengunjung ke
`./dist/`. Blok skrip ini dibuang saat build oleh plugin `removeSourceRedirect`.

### Base URL

```bash
npm run build                        # base relatif "./", bisa ditaruh di subfolder mana pun
BASE_PATH=/name-repo/ npm run build  # base absolut, dipakai GitHub Pages
```

`BASE_PATH` harus diakhiri garis miring. Nilai ini masuk ke `import.meta.env.BASE_URL` dan dipakai
router, fetch data, serta service worker.

### Daftar halaman

Plugin `copyRoutePages` membaca konstanta `PAGE_ROUTES` di `vite.config.js`. **Setiap rute baru harus
ditambahkan ke daftar itu** agar GitHub Pages dapat melayani alamat tersebut secara langsung.

## 5. Deploy ke GitHub Pages

Workflow `.github/workflows/deploy.yml` berjalan pada setiap push ke `main` (atau manual lewat
`workflow_dispatch`):

1. Checkout dan setup Node 22 dengan cache npm.
2. `npm ci`.
3. `npm run build` dengan `BASE_PATH=/<name-repo>/`.
4. Upload `dist/` sebagai artifact Pages.
5. Deploy ke environment `github-pages`.

Persiapan sekali:

1. Buka **Settings → Pages → Build and deployment → Source**.
2. Pilih **GitHub Actions**.
3. Push ke `main`.
4. Pantau progres di tab **Actions**.

Alamat bersih (`https://<user>.github.io/<repo>/artikel`) bekerja karena setiap halaman punya
salinan HTML sendiri dan `404.html` menjadi cadangan. Tautan lama `#/artikel` dialihkan otomatis ke
`/artikel`.

## 6. Deploy ke VPS dengan nginx

1. `npm run build`.
2. Salin **isi** `dist/` ke server, misalnya `/var/www/sispak/dist`.
3. Gunakan contoh [`deploy/nginx.conf`](../deploy/nginx.conf), sesuaikan `server_name` dan `root`.
4. Aktifkan situs, lalu:

   ```bash
   nginx -t && systemctl reload nginx
   ```

5. Pasang HTTPS (misalnya `certbot --nginx`), karena service worker hanya aktif di HTTPS.

Inti konfigurasi:

```nginx
location / {
    try_files $uri $uri.html $uri/ /index.html;
}
```

- `$uri.html` melayani `/artikel` dari `artikel.html`.
- `/index.html` menjadi fallback SPA untuk alamat lain.
- `location /assets/` memakai `Cache-Control: public, max-age=31536000, immutable` karena nama
  berkas ber-hash.
- `sw.js` dan `/data/` memakai `Cache-Control: no-cache` agar versi baru dan perubahan JSON cepat
  terdeteksi.
- `gzip` diaktifkan untuk CSS, JavaScript, JSON, dan SVG.

Jika aplikasi ditaruh di subfolder (misalnya `domain.com/sispak/`), build dengan
`BASE_PATH=/sispak/ npm run build` dan sesuaikan `location`/`alias` nginx.

## 7. Memperbarui data tanpa build ulang

Basis pengetahuan adalah JSON statis. Untuk mengubah pertanyaan, aturan, atau sumber:

1. Edit `public/data/*.json` (development) atau `data/*.json` di hosting (produksi).
2. Refresh browser.
3. Periksa console untuk peringatan validasi.

Karena service worker memakai **NetworkFirst** untuk `data/*.json`, saat online versi terbaru
diambil dari server. Tidak perlu mengganti service worker atau membangun ulang aplikasi.

Perubahan kode (Vue, CSS, library) tetap memerlukan `npm run build` dan deploy ulang.

## 8. Menambah halaman

1. Buat komponen di `src/views/`.
2. Daftarkan rute di `src/router.js` beserta `meta.menu` dan `meta.title`.
3. Tambahkan nama halaman ke `PAGE_ROUTES` di `vite.config.js`.
4. Tambahkan ke `menuItems` di `src/App.vue` bila perlu muncul di navigasi utama.
5. Jika halaman memakai `ReferenceLink`, pastikan id sumber ada di `references.json`.
6. Uji alamat langsung dan refresh di hosting statis.

## 9. Sebelum rilis publik

Status validasi saat ini: pertanyaan dan aturan disusun pengembang dari DSM-5-TR, ICD-11,
PPDGJ-III, dan pedoman klinis, **belum divalidasi oleh psikolog klinis atau psikiater**. Status ini
dinyatakan terbuka di `/tentang` dan `/references`.

Langkah yang disarankan:

1. Minta psikolog klinis/psikiater mereview seluruh `symptoms.json` dan `conditions.json`.
2. Cantumkan nama pakar dan hapus pernyataan "belum divalidasi" setelah review selesai.
3. Jika diujicobakan ke responden (misalnya penelitian), siapkan informed consent, ajukan ethical
   clearance ke komisi etik, dan tetapkan siapa yang dihubungi bila responden menjawab *Ya* pada
   `G58`.
4. Pastikan nomor kontak darurat dan layanan kesehatan jiwa masih berlaku.

## 10. Checklist QA manual

**Build dan rute**

- [ ] `npm ci && npm run build` berhasil tanpa error.
- [ ] `npm run preview` menampilkan aplikasi.
- [ ] Setiap rute dapat dibuka langsung dan di-refresh (bukan hanya lewat navigasi).
- [ ] Alamat lama `/forward`, `/backward?id=P1`, dan `#/artikel` dialihkan dengan benar.
- [ ] Halaman 404/alamat acak kembali ke beranda.

**Inferensi**

- [ ] Cek Menyeluruh dengan semua jawaban *Tidak* menghasilkan `P0`.
- [ ] Kasus P2 yang memenuhi semua kriteria dan durasi ≥ 6 bulan menyimpulkan P2.
- [ ] Kasus yang memenuhi kriteria tetapi durasi kurang menampilkan `insufficientDuration` dan `durationNote`.
- [ ] Cek Gangguan Tertentu berhenti bertanya setelah satu kriteria mustahil.
- [ ] Topik penyesuaian dapat muncul bersama topik lain tanpa klaim diagnosis banding.
- [ ] Progres versi pertanyaan lama tidak dilanjutkan dan pemberitahuan mulai ulang muncul.
- [ ] Setiap pertanyaan aktif memiliki tautan sumber.
- [ ] Fakta antara (G68/G69) tidak ditanyakan sebagai pertanyaan sendiri.
- [ ] Urutan pertanyaan berubah setelah mulai ulang, tetapi hasil sama untuk jawaban sama.
- [ ] `G58` selalu ditanyakan pada Cek Menyeluruh dan cek P9.

**Krisis dan remaja**

- [ ] Menjawab *Ya* pada `G58` langsung menampilkan panel bantuan.
- [ ] Panel krisis berada di paling atas halaman hasil.
- [ ] Pilihan usia di bawah 18 menampilkan pesan remaja sebelum pertanyaan pertama.
- [ ] Pesan remaja muncul di hasil.

**Sesi dan penyimpanan**

- [ ] Progres tersimpan setelah jawaban pertama dan bisa dilanjutkan setelah reload.
- [ ] Dua tab tetap sinkron; progres tidak tertimpa.
- [ ] "Mulai ulang" menghapus jawaban dan mengacak ulang urutan.
- [ ] "Hapus jawaban saya" menghapus progres dan keluar ke `/konsultasi`.
- [ ] Progres terhapus setelah hasil keluar.
- [ ] Data lama localStorage termigrasi dan `sispak.riwayat` terhapus.
- [ ] Aplikasi menolak berjalan dan memberi petunjuk saat IndexedDB diblokir.

**Hasil skrining**

- [ ] Hasil mengutamakan langkah mencari bantuan dan tidak menyatakan diagnosis.
- [ ] Semua hasil, termasuk tanpa pola yang ditandai, tetap mendorong bantuan jika keluhan mengganggu.
- [ ] Durasi kurang tidak disajikan sebagai alasan menunggu bantuan.
- [ ] Tidak ada fitur ekspor atau unduh hasil.
- [ ] Meninggalkan halaman hasil meminta konfirmasi lalu menghapus hasil.
- [ ] Setelah pagehide atau muat ulang, hasil tidak tersedia.

**Offline dan tampilan**

- [ ] Setelah kunjungan online, skrining, hasil (tanpa reload), dan artikel berjalan offline.
- [ ] Perubahan JSON di server terlihat saat online.
- [ ] Banner versi baru muncul saat deploy baru dan tidak muncul di `/result`.
- [ ] Mode gelap mengikuti preferensi sistem.
- [ ] Tampilan mobile, keyboard (Y/T/1–5), fokus, dan pembaca layar wajar.
- [ ] Halaman hasil dapat dicetak tanpa tombol/navigasi.

## 11. Pemeliharaan berkala

Periksa minimal setiap semester, lalu perbarui `CONTACTS_REVIEWED_AT` di
`src/lib/supportMessages.js` dan tanggal `accessedAt` di `public/data/references.json`:

- [ ] Nomor dan cara akses Healing119 (119 ext 8, chat WhatsApp di healing119.id) masih berlaku.
- [ ] Nomor gawat darurat 112 dan 119 masih berlaku.
- [ ] Ada edisi baru DSM, pembaruan ICD-11, atau pengganti PPDGJ-III.
- [ ] Ada pembaruan pedoman NICE (NG222, CG31 yang sedang diperbarui, dll.), fact sheet WHO, atau
      pedoman insomnia.
- [ ] Semua tautan di halaman Sumber masih dapat dibuka.
- [ ] Pesan krisis masih sesuai pedoman WHO tentang pesan pencegahan bunuh diri.

## 12. Utang teknis dan batasan

- Tidak ada unit test, integration test, lint, atau pemeriksaan tipe.
- Basis pengetahuan berupa objek global yang dapat berubah; tidak ada skema runtime formal.
- Kesalahan data hanya dilaporkan sebagai peringatan console dan entri dibuang.
- Daftar `PAGE_ROUTES` di `vite.config.js` harus disinkronkan manual dengan `router.js`.
- Salinan HTML per halaman hanya dibuat saat build; halaman baru tanpa entri `PAGE_ROUTES` akan
  dilayani lewat `404.html` dengan status 404, bukan 200.
- `dist/` ikut di-commit di branch `main`; pastikan hasil build selalu diperbarui saat kode berubah.
- Validasi klinis belum dilakukan.
- Aplikasi tidak memiliki mekanisme pemulihan hasil setelah halaman hasil ditinggalkan; ini adalah
  keputusan privasi, bukan bug.

## 13. Troubleshooting

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| Data JSON tidak berubah setelah diedit | Service worker/cache browser | Pastikan online; refresh; periksa NetworkFirst; bersihkan cache situs bila perlu. |
| Alamat `/artikel` 404 setelah refresh | Server tidak punya fallback SPA | Gunakan `try_files` nginx atau pastikan salinan `artikel.html` ada di GitHub Pages. |
| Mode offline tidak aktif | Situs diakses lewat HTTP biasa | Pasang HTTPS; service worker hanya aktif di HTTPS/localhost. |
| Aplikasi menampilkan petunjuk penyimpanan | IndexedDB diblokir | Izinkan data situs; keluar dari mode penyamaran. |
| Basis pengetahuan gagal dimuat | `data/*.json` tidak ada/rusak | Periksa path dan format JSON; lihat console. |
| Progres hilang | Penyimpanan dibersihkan browser/kuota | Tidak dapat dipulihkan; mulai sesi baru. |

## 14. Catatan branch dan tag

- `main` — versi web statis Vue 3 (aplikasi ini).
- `sispak-v1` — versi lama PHP + MySQL + login.
- Tag `backup-originalFetch` — kode asli sebelum perbaikan.

Dokumentasi ini hanya membahas branch `main`.

Pemeriksaan fitur jawaban belum pasti: uji semua pertanyaan Kurang yakin/Lewati pada forward/backward, durasi dilewati, tidak ada pengulangan, Kembali, reload progres, dan hasil dengan informasi belum lengkap. Pastikan `/faq` serta `faq.html` tersedia pada build GitHub Pages. Versi skema baru harus memperbarui `KNOWLEDGE_VERSION` serta daftar namespace lama yang dibersihkan.
