# Data dan Privasi

## 1. Prinsip

1. **Hasil konsultasi tidak pernah disimpan** — tidak di browser, tidak di server.
2. **Jawaban yang belum selesai** disimpan sementara di perangkat agar konsultasi bisa dilanjutkan,
   lalu dihapus otomatis saat hasil keluar.
3. **Tidak ada akun, login, API, analitik, iklan, atau pelacak.**
4. **Tidak ada permintaan ke pihak ketiga.** Seluruh aset, termasuk font, dimuat dari situs sendiri.
5. Aplikasi tetap bisa dipakai tanpa internet setelah kunjungan pertama (service worker).

## 2. Ringkasan data

| Data | Lokasi | Kapan ditulis | Masa hidup |
|---|---|---|---|
| Hasil konsultasi | Memori halaman (`hasilTerakhir`, `shallowRef`) | Saat inferensi selesai | Hilang saat halaman hasil dimuat ulang, ditutup, atau ditinggalkan |
| Progres konsultasi | IndexedDB `sispak` → store `sesi` | Setiap jawaban | Dihapus saat hasil keluar, mulai ulang, hapus jawaban, atau diganti sesi baru |
| Cache sesi | Memori (`cacheSesi`) | Startup dan setiap perubahan | Selama tab terbuka |
| Data lama localStorage | localStorage | Hanya dibaca/dihapus saat migrasi | Dihapus pada startup |
| Cache offline | Cache Storage (Workbox) | Build/first visit | Sampai versi baru atau cache dibersihkan |
| Cookie | - | - | Aplikasi tidak menetapkan cookie |
| Data analitik | - | - | Tidak ada |

## 3. IndexedDB

`src/lib/penyimpanan.js`:

| Properti | Nilai |
|---|---|
| Nama database | `sispak` |
| Versi | `1` |
| Object store | `sesi` |
| Model kunci | Out-of-line (`store.put(nilai, kunci)`) |
| Durability | `"strict"` pada setiap transaksi |
| Kunci sesi | `sispak.sesi.forward`, `sispak.sesi.backward` |
| Kunci uji tulis | `sispak.cek` (dibuat lalu dihapus saat startup) |

`durability: "strict"` dipakai karena IndexedDB dengan mode ini menunggu data benar-benar tertulis
ke disk sebelum transaksi dianggap selesai. localStorage ditulis ke disk secara tertunda, sehingga
progres bisa hilang bila browser ditutup paksa (misalnya aplikasi browser di ponsel di-swipe).

Urutan pemeriksaan saat startup:

```js
siapkanPenyimpanan():
  1. jika globalThis.indexedDB tidak ada -> false
  2. buka database (membuat store saat upgradeneeded)
  3. tulis kunci uji "sispak.cek"
  4. hapus kunci uji
  5. true
```

Jika langkah mana pun gagal (mode penyamaran, cookie/data situs diblokir, kuota, database
terkunci), fungsi mengembalikan `false`. `main.js` kemudian **tidak menjalankan aplikasi** dan
menampilkan petunjuk pengaturan per browser. Ini disengaja: tanpa penyimpanan, konsultasi bisa
terputus di tengah jalan.

Operasi baca/simpan/hapus dibungkus Promise. `baca()` menelan error dan mengembalikan `undefined`.
`simpanSesi()` dan `hapusSesi()` mencatat kegagalan ke console tanpa menghentikan konsultasi.

## 4. Daur hidup sesi

1. Sesi dibuat di memori oleh `sesiBaru()` saat halaman konsultasi dibuka.
2. Watcher `simpanSesi` berjalan setiap sesi berubah.
3. Sesi dengan `urutan.length === 0` tidak disimpan. Jika ada sesi lama untuk metode yang sama, sesi
   lama dihapus.
4. Setelah jawaban pertama, sesi disalin (`JSON.parse(JSON.stringify(...))`) lalu ditulis ke
   IndexedDB.
5. Saat inferensi selesai, `buatHasil()` menyusun hasil di memori dan `hapusSesi()` menghapus progres
   dari perangkat.
6. Mulai ulang atau "Hapus jawaban saya" juga menghapus progres.

Saat dibaca kembali, sesi divalidasi:

- `metode` harus `forward` atau `backward`;
- `urutan` harus array;
- `fakta` dan `durasi` harus objek;
- `acak` harus array;
- setiap entri `urutan` harus gejala langsung yang ada atau `durasi:<penyakit>` yang valid.

Sesi yang tidak lolos validasi diabaikan. Validasi tidak memeriksa tipe nilai `fakta` maupun
kisaran nilai `durasi`.

## 5. Migrasi dari localStorage

Versi lama menyimpan progres dan riwayat hasil di localStorage. Pada startup, `bersihkanDataLama()`
dijalankan untuk setiap kunci sesi:

- Jika IndexedDB belum memiliki kunci tersebut dan localStorage memilikinya, nilai lama
  dipindahkan ke IndexedDB.
- Kunci localStorage kemudian dihapus.
- Kunci `sispak.riwayat` selalu dihapus, karena riwayat hasil bersifat rahasia dan tidak lagi
  didukung.

Akses localStorage dibungkus `try/catch` agar browser yang memblokir storage (misalnya Safari mode
privat) tidak membuat aplikasi gagal. Jika localStorage melempar error, migrasi dilewati.

## 6. Sinkronisasi antar-tab

- `BroadcastChannel("sispak")` dipakai bila tersedia.
- Setiap penyimpanan/penghapusan sesi mengirim `{ metode }`.
- Tab lain yang mendengarkan memanggil `muatUlangSesi(metode)` lalu memperbarui UI bila sesinya
  berbeda (`sesiSama` membandingkan `target`, `urutan`, `fakta`, `durasi`, dan `acak`).
- Sinkronisasi juga dipicu `visibilitychange` dan `pageshow`, sehingga tab yang lama tidak aktif
  tidak menampilkan progres usang.
- Jika tab lain menghapus sesi, tab yang sedang aktif akan kembali ke sesi baru saat sinkronisasi.

Tujuan: progres tidak tertimpa versi lama ketika pengguna membuka beberapa tab.

## 7. Mode offline dan cache

Service worker dihasilkan `vite-plugin-pwa` saat `npm run build` dan didaftarkan
`src/lib/offline.js`.

| Cache | Isi | Strategi |
|---|---|---|
| Precache Workbox | `js`, `css`, `html`, `svg`, `woff2` — termasuk font dan jsPDF | Precache saat instalasi |
| `sispak-data` | `data/penyakit.json`, `data/gejala.json`, `data/sumber.json` | **NetworkFirst**, timeout 5 detik, hanya status 200 |

Perilaku:

- Saat online, data selalu diambil dari server (fetch `cache: "no-cache"`), sehingga edit JSON di
  hosting langsung terlihat. Saat offline, salinan terakhir dipakai.
- Pada kunjungan pertama, data dimuat sebelum service worker aktif. Setelah service worker
  mengendalikan halaman, `hangatkanCacheData()` mengambil ulang tiga JSON agar masuk cache.
- `registerType: "prompt"`: versi baru tidak langsung mengaktifkan diri. Banner "Versi baru sistem
  tersedia" muncul dengan tombol Perbarui.
- Banner **tidak ditampilkan di `/hasil`**, karena memuat ulang halaman akan menghapus hasil yang
  hanya ada di memori. Progres jawaban tetap aman di IndexedDB.
- Cache tidak pernah berisi data pengguna: hanya berkas aplikasi dan basis pengetahuan.
- Service worker hanya aktif di HTTPS atau `localhost`. Di HTTP biasa aplikasi tetap berjalan,
  tanpa mode offline.
- `clientsClaim: true` membuat service worker baru langsung mengendalikan halaman; namun aktivasi
  versi baru tetap menunggu aksi pengguna karena mode prompt.

## 8. Permintaan jaringan

| Tujuan | Kapan | Isi |
|---|---|---|
| `<base>/data/*.json` | Startup dan refresh | Berkas statis, tanpa data pengguna |
| Aset aplikasi (`assets/*`, halaman) | Muat halaman | Berkas statis |
| `healing119.id`, tautan sumber | Hanya jika pengguna mengklik | Membuka situs pihak ketiga |

Tidak ada jawaban, hasil, atau identitas pengguna yang dikirim ke mana pun. Hosting statis tetap
dapat mencatat permintaan HTTP biasa (alamat IP, URL berkas) sesuai kebijakan penyedia hosting,
tetapi isi konsultasi tidak pernah termasuk di dalamnya.

Font Plus Jakarta Sans dibundel lewat `@fontsource-variable/plus-jakarta-sans` (lisensi OFL),
sehingga tidak ada permintaan ke Google Fonts atau CDN lain. jsPDF juga dibundel dan di-import
dinamis dari aset aplikasi, bukan CDN.

## 9. Batasan privasi

- Hasil ada di memori halaman dan dapat terlihat oleh siapa pun yang memegang perangkat saat
  halaman hasil masih terbuka. Sistem menyediakan tombol kembali/hapus dan konfirmasi saat
  meninggalkan halaman, tetapi tidak dapat mencegah screenshot atau orang lain melihat layar.
- PDF yang diunduh adalah berkas biasa tanpa enkripsi. Keamanannya bergantung pada pengelolaan
  berkas oleh pengguna.
- IndexedDB tidak dienkripsi. Data dapat dibaca oleh pengguna lain dengan akses ke profil browser
  atau perangkat yang sama.
- Browser dapat membersihkan penyimpanan (eviction) saat ruang disk menipis, sehingga progres bisa
  hilang.
- Tidak ada autentikasi; siapa pun yang membuka situs di perangkat yang sama dapat memulai sesi
  baru. Karena itu tersedia tombol "Hapus jawaban saya" dan daftar jawaban tertutup secara bawaan.
- Aplikasi tidak menetapkan cookie, tetapi pembersihan data situs di browser akan menghapus
  IndexedDB dan cache offline.
- Mode penyamaran dapat memblokir IndexedDB; aplikasi akan menolak berjalan dan menampilkan
  petunjuk.

## 10. Untuk perangkat bersama

1. Gunakan "Hapus jawaban saya" bila berhenti di tengah konsultasi.
2. Unduh PDF bila ingin menyimpan hasil, lalu tinggalkan halaman hasil.
3. Jangan membiarkan halaman hasil terbuka tanpa pengawasan.
4. Hapus PDF dari folder unduhan setelah dibaca bila perangkat dipakai bersama.
5. Bersihkan data situs di browser untuk menghapus cache dan sisa penyimpanan.
