# Warna dan aksesibilitas tampilan

Diperbarui 1 November 2026. Tema diterapkan melalui token di `src/assets/main.css`, favicon, dan warna browser di `index.html`.

## Arah desain

Biru petrol dipakai untuk tindakan utama dan tautan, sage untuk aksen edukasi, serta krem hangat untuk latar. Ini keputusan desain untuk kesan visual yang lebih lembut dan konsisten; tidak ada klaim bahwa palet ini mengobati keluhan atau pasti menenangkan setiap orang. Preferensi warna dipengaruhi konteks dan individu.

Dasar riset yang dipakai adalah keterbacaan dan fungsi warna. [Panduan warna layanan kesehatan NHS](https://service-manual.nhs.uk/design-system/styles/colour) menjelaskan latar bertint untuk mengurangi silau, hierarki informasi, dan penggunaan warna sesuai konteks. Palet ini dibuat untuk aplikasi sendiri dan tidak meniru identitas NHS.

[Pedoman aksesibilitas NHS](https://service-manual.nhs.uk/accessibility/design) menekankan bahwa warna tidak boleh menjadi satu-satunya petunjuk. Karena itu tombol tetap memiliki label, navigasi aktif tetap memakai `aria-current`, dan bantuan tetap mempunyai judul serta teks.

## Palet inti

| Fungsi | Terang | Gelap |
|---|---|---|
| Latar | `#f7f6f2` | `#111c22` |
| Kartu | `#ffffff` | `#18272e` |
| Teks utama | `#20343c` | `#e8efef` |
| Teks sekunder | `#52666f` | `#afc1c5` |
| Biru utama | `#235f73` | `#8ac9df` |
| Sage | `#426b59` | `#b0cdb8` |
| Latar biru lembut | `#e1edf2` | `#203e4b` |
| Latar sage lembut | `#e8f0e8` | `#263e34` |
| Fokus keyboard | `#83551c` | `#efd29a` |

Jawaban **Ya dan Tidak** memakai warna, batas, dan gaya tombol netral yang sama, termasuk contoh di beranda. Penanda jawaban pada daftar jawaban juga memakai gaya netral yang sama. Warna tidak membedakan atau mengunggulkan salah satu pilihan. Warna merah tetap tersedia untuk tindakan penghapusan, sedangkan amber menandai catatan penting dan panel bantuan. Jawaban Ya/Tidak bukan penilaian benar/salah.

Mode gelap mengikuti preferensi sistem, dengan teks tombol gelap di atas biru terang. Bayangan kartu dibuat lebih lembut agar selaras dengan palet baru.

## Pemeriksaan kontras

[WCAG 2.2 SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) menetapkan minimal 4,5:1 untuk teks biasa dan 3:1 untuk teks besar, dengan pengecualian yang dijelaskan dalam pedoman. [SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) membahas kontras 3:1 untuk informasi visual kontrol/status yang diperlukan.

Perhitungan menggunakan luminans relatif sRGB, tanpa membulatkan nilai sebelum dibandingkan dengan ambang.

| Pasangan | Terang | Gelap |
|---|---|---|
| Teks utama / latar | 12,00:1 | 14,86:1 |
| Teks sekunder / surface-2 | 5,33:1 | 6,95:1 |
| Teks tombol / biru utama | 7,10:1 | 8,41:1 |
| Sage / latar sage | 5,19:1 | 6,74:1 |
| Teks peringatan / latar amber | 5,94:1 | 7,94:1 |
| Fokus / kartu | 6,40:1 | 10,49:1 |
| Batas tombol netral / surface-2 | 3,14:1 | 4,13:1 |

Pemeriksaan pasangan token bukan sertifikasi WCAG menyeluruh. Pratinjau visual melalui browser otomatis tidak tersedia pada lingkungan pengerjaan ini; pengujian render komponen dan build tetap dijalankan.
