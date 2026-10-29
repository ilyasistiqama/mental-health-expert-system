# Arsitektur Aplikasi

## 1. Teknologi

| Lapisan | Implementasi |
|---|---|
| Entry HTML | `index.html` (sumber Vite) |
| Bootstrap | `src/main.js` |
| Framework | Vue 3.5 (`<script setup>`) |
| Router | `vue-router` mode `createWebHistory`, alamat bersih tanpa `#` |
| Build | Vite 8, plugin `@vitejs/plugin-vue`, `@tailwindcss/vite` |
| Styling | Tailwind CSS 4, token warna CSS di `src/assets/main.css` |
| PDF | `jspdf`, di-import dinamis di `src/lib/pdf.js` |
| Offline | `vite-plugin-pwa` (Workbox), registrasi di `src/lib/offline.js` |
| Penyimpanan | IndexedDB (`src/lib/penyimpanan.js`) |
| Komunikasi antar-tab | `BroadcastChannel("sispak")` |
| Data | Fetch JSON statis dari `<base>/data/*.json` |

Tidak ada backend, database, autentikasi, state manager eksternal, maupun permintaan ke layanan
pihak ketiga.

## 2. Urutan startup

`src/main.js` menjalankan urutan berikut:

```mermaid
flowchart TD
    A[index.html memuat src/main.js] --> B[aktifkanCacheOffline]
    B --> C{siapkanPenyimpanan}
    C -- gagal --> D[Tampilkan petunjuk mengaktifkan penyimpanan browser]
    C -- berhasil --> E[muatBasisPengetahuan]
    E -- gagal --> F[Tampilkan galat basis pengetahuan]
    E -- berhasil --> G[muatProgres]
    G --> H[createApp(App).use(router).mount]
```

Detail:

1. **`aktifkanCacheOffline()`** dipanggil lebih dulu. Fungsi ini mendaftarkan service worker bila
   browser mendukung. Kegagalan registrasi hanya dicatat di console; aplikasi tetap berjalan.
2. **`siapkanPenyimpanan()`** membuka IndexedDB `sispak` dan melakukan uji tulis/hapus pada kunci
   `sispak.cek`. Jika IndexedDB tidak tersedia, diblokir, atau gagal ditulis, aplikasi **tidak
   dijalankan** dan pengguna diberi petunjuk per browser. Alasannya: tanpa penyimpanan, progres bisa
   hilang di tengah konsultasi.
3. **`muatBasisPengetahuan()`** mengambil `data/penyakit.json`, `data/gejala.json`, dan
   `data/sumber.json` secara paralel dengan `fetch(..., { cache: "no-cache" })`, lalu memvalidasi dan
   menyusun indeks di memori. Jika gagal, muncul halaman galat dengan tombol muat ulang.
4. **`muatProgres()`** memigrasikan data localStorage lama, lalu membaca sesi `forward` dan `backward`
   dari IndexedDB.
5. Baru setelah semua siap, aplikasi Vue di-mount ke `#app`.

Basis pengetahuan sengaja dimuat **sebelum** mount agar komponen dapat mengakses objek global
`PENYAKIT`, `GEJALA`, `SUMBER`, dan `ATURAN` secara sinkron tanpa loading state di setiap halaman.

## 3. Peta modul

### Titik masuk dan kerangka

| Berkas | Tanggung jawab |
|---|---|
| `index.html` | Dokumen HTML sumber. Berisi skrip pengalih ke `dist/` bila dibuka langsung lewat web server; blok ini dibuang saat build. |
| `src/main.js` | Bootstrap, pemeriksaan penyimpanan, pemuatan data, penanganan galat fatal. |
| `src/App.vue` | Header/navigasi, banner versi baru, `<RouterView>`, footer, dialog konfirmasi global. |
| `src/router.js` | Daftar rute, judul dokumen per halaman, scroll ke anchor, redirect alamat lama. |
| `src/assets/main.css` | Token warna (mode terang/gelap), komponen Tailwind (`card`, `btn`, `pill`, dll.), aturan aksesibilitas. |

### Library inti

| Berkas | Tanggung jawab |
|---|---|
| `src/lib/basis.js` | Menghitung `BASIS` (alamat dasar aplikasi) dan mengubah URL hash lama `#/artikel` menjadi `/artikel`. |
| `src/lib/nama.js` | Nama panjang dan singkat sistem. |
| `src/lib/sistemPakar.js` | Pemuatan dan validasi basis pengetahuan, mesin inferensi, sesi, progres, hasil, penamaan metode, format tampilan. |
| `src/lib/penyimpanan.js` | Pembungkus IndexedDB, uji ketersediaan, migrasi dari localStorage. |
| `src/lib/offline.js` | Registrasi service worker, banner versi baru, pemanasan cache data. |
| `src/lib/pdf.js` | Penyusunan PDF hasil konsultasi dengan jsPDF. |
| `src/lib/pesanDukungan.js` | Satu sumber teks disclaimer, pesan krisis, pesan remaja, dan langkah lanjutan. |
| `src/lib/dialog.js` | State dialog konfirmasi berbasis Promise, pengganti `confirm()` browser. |

### Komponen

| Berkas | Tanggung jawab |
|---|---|
| `SesiKonsultasi.vue` | Seluruh alur tanya-jawab; dipakai metode forward dan backward. |
| `PanelKrisis.vue` | Kontak bantuan segera saat gejala krisis dijawab *Ya* dan di halaman hasil. |
| `PesanDukungan.vue` | Disclaimer dan langkah lanjutan di halaman hasil. |
| `DaftarKriteria.vue` | Menampilkan kriteria sebuah gangguan beserta durasi minimal. |
| `KartuPenyakit.vue` | Kartu ringkas gangguan di beranda dan artikel. |
| `CatatanPenting.vue` | Kotak peringatan yang dipakai ulang. |
| `Rujukan.vue` | Nomor rujukan `[n]` yang menaut ke `/sumber#<id>`. |
| `DialogKonfirmasi.vue` | Elemen `<dialog>` native untuk konfirmasi. |

### Halaman

| Berkas | Rute |
|---|---|
| `BerandaView.vue` | `/` |
| `ArtikelView.vue` | `/artikel` |
| `KonsultasiView.vue` | `/konsultasi` |
| `ForwardView.vue` | `/cek-menyeluruh` |
| `BackwardView.vue` | `/cek-gangguan` |
| `HasilView.vue` | `/hasil` |
| `SumberView.vue` | `/sumber` |
| `TentangView.vue` | `/tentang` |

## 4. Aliran data

```mermaid
flowchart LR
    J[public/data/*.json] --> K[lib/sistemPakar.js]
    K --> L[SesiKonsultasi.vue]
    L --> M[langkahBerikutnya]
    M --> L
    M --> N[buatHasil]
    N --> O[hasilTerakhir<br/>shallowRef di memori]
    O --> P[HasilView.vue]
    P --> Q[lib/pdf.js]
    O -. tidak pernah ditulis .-> R[(Penyimpanan browser)]
    L -. progres sementara .-> S[(IndexedDB sispak.sesi.*)]
```

Poin penting:

- Data JSON menjadi **objek global yang bisa berubah** (`PENYAKIT`, `GEJALA`, `SUMBER`, `ATURAN`).
  Tidak ada state terpusat lain untuk basis pengetahuan.
- Sesi konsultasi adalah objek biasa yang dioper ke fungsi murni di `sistemPakar.js`.
  `SesiKonsultasi.vue` menyimpan sesi di `ref` dan menulisnya ke IndexedDB lewat watcher.
- Hasil konsultasi hanya hidup di `shallowRef` `hasilTerakhir`. Tidak ada serialisasi ke
  penyimpanan.
- PDF dibuat dari objek hasil yang sama, sehingga halaman dan PDF memakai teks dukungan yang identik.

## 5. Alamat dasar dan routing

### `BASIS`

`src/lib/basis.js`:

```js
export const BASIS = import.meta.env.BASE_URL.startsWith("/")
    ? import.meta.env.BASE_URL
    : new URL("..", import.meta.url).pathname;
```

- Build dengan `BASE_PATH` (misalnya GitHub Pages) menghasilkan base absolut seperti
  `/nama-repo/`.
- Build biasa memakai base relatif `./`. Karena JavaScript berada di `assets/`, alamat dasar
  dihitung naik satu folder agar fetch data tetap benar saat ditaruh di subfolder mana pun.
- URL lama berformat hash (`#/artikel`) diubah dengan `history.replaceState` saat modul dimuat,
  sebelum router membaca alamat.

### Rute

| Pola | Komponen | Menu aktif |
|---|---|---|
| `/` | Beranda | `home` |
| `/artikel` | Artikel | `artikel` |
| `/konsultasi` | Pilih metode | `konsultasi` |
| `/cek-menyeluruh` | Cek Menyeluruh | `konsultasi` |
| `/cek-gangguan?id=Pn` | Cek Gangguan Tertentu | `konsultasi` |
| `/hasil` | Hasil | `konsultasi` |
| `/sumber` | Daftar pustaka | `sumber` |
| `/tentang` | Tentang & batasan | `tentang` |
| `/forward` | Redirect ke `/cek-menyeluruh` | - |
| `/backward` | Redirect ke `/cek-gangguan` + query | - |
| lainnya | Redirect ke `/` | - |

Perilaku tambahan:

- `router.afterEach` mengatur `document.title` dari `meta.judul`.
- `scrollBehavior` hanya menggulir ke anchor dengan format aman `#[\w-]+`, dengan offset 80 px
  untuk header lengket.
- Semua komponen halaman dimuat dinamis (*lazy load*).

## 6. Plugin build

`vite.config.js` menambahkan tiga plugin kustom/PWA:

1. **`hapusPetunjukSumber`** — membuang blok komentar `petunjuk-sumber` di `index.html` yang
   mengalihkan pengunjung ke `./dist/`. Blok ini hanya berguna saat folder proyek dibuka langsung
   lewat web server.
2. **`salinHalaman`** — setelah build, menyalin `dist/index.html` menjadi `artikel.html`,
   `konsultasi.html`, `cek-menyeluruh.html`, `cek-gangguan.html`, `hasil.html`, `sumber.html`,
   `tentang.html`, `forward.html`, `backward.html`, dan `404.html`. Ini membuat GitHub Pages
   (yang tidak punya fallback SPA) melayani alamat bersih dengan status 200. Daftar `HALAMAN`
   harus disinkronkan dengan `src/router.js`.
3. **`VitePWA`** — menghasilkan service worker Workbox:
   - `registerType: "prompt"` dan `injectRegister: false` (registrasi manual di `offline.js`).
   - `manifest: false` (tidak ada manifest PWA; aplikasi tidak dipasang sebagai app).
   - Precache `**/*.{js,css,html,svg,woff2}` termasuk font dan pembuat PDF.
   - `navigateFallback: "index.html"` dengan pengecualian alamat ber-ekstensi (agar
     `data/penyakit.json` tidak dialihkan ke HTML).
   - Runtime cache `sispak-data` dengan strategi **NetworkFirst**, timeout 5 detik, hanya
     status 200, untuk semua `*/data/*.json`.

`base` diambil dari `process.env.BASE_PATH` atau `"./"`. Alias `@` menunjuk ke `src/`.

## 7. Pola UI dan aksesibilitas

- Token warna di `main.css` otomatis mengikuti `prefers-color-scheme` (mode gelap).
- Komponen Tailwind yang dipakai berulang: `.container-page`, `.card`, `.btn`, `.btn-primary`,
  `.btn-ghost`, `.btn-text`, `.eyebrow`, `.pill`, `.empty`.
- Animasi masuk (`animate-masuk`) dimatikan saat `prefers-reduced-motion: reduce`.
- Fokus keyboard memakai `:focus-visible` dengan outline tebal.
- Dialog konfirmasi memakai `<dialog>` native (`showModal`), sehingga fokus, tombol Esc, dan
  pembaca layar ditangani browser.
- Halaman hasil menyembunyikan tombol dan navigasi saat dicetak (`print:hidden`).
- Bahasa antarmuka seluruhnya Indonesia; teks hasil dirancang netral (lihat
  [alur-aplikasi.md](./alur-aplikasi.md)).

## 8. Penanganan kegagalan

| Kondisi | Perilaku |
|---|---|
| IndexedDB diblokir/tidak tersedia | Aplikasi tidak dijalankan; tampil petunjuk pengaturan Chrome/Edge, Firefox, Safari. |
| Salah satu JSON gagal dimuat | Halaman galat "Basis pengetahuan gagal dimuat" dengan tombol muat ulang. |
| Data JSON tidak konsisten | Peringatan di console browser; entri tidak valid dibuang, aplikasi tetap berjalan. |
| Service worker gagal didaftarkan | Peringatan di console; aplikasi tetap berjalan tanpa mode offline. |
| jsPDF gagal dimuat | Pesan "PDF gagal dibuat" di halaman hasil; hasil tetap tampil. |
| Progres gagal disimpan | Peringatan di console; konsultasi tetap berjalan di memori. |

## 9. Batasan arsitektur

- Tidak ada test otomatis, lint, atau pemeriksaan tipe. Validasi masih manual dan lewat peringatan
  console.
- Basis pengetahuan adalah objek global yang dapat berubah; tidak ada immutability atau skema
  runtime formal.
- Hasil konsultasi sengaja tidak dapat di-refresh. Reload halaman hasil akan menghapusnya.
- Tidak ada server, sehingga tidak ada sinkronisasi antarperangkat, riwayat, atau akun.
- Perubahan data JSON di hosting langsung terlihat saat online karena fetch `no-cache` dan strategi
  NetworkFirst, tetapi pengguna yang sudah membuka sesi akan memakai sesi berjalan sampai selesai.
