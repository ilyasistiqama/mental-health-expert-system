# Data dan privasi

| Data | Tempat | Masa simpan |
|---|---|---|
| Progres belum selesai | IndexedDB `sispak`, object store `sesi` | Sampai hasil dibuat, pengguna menghapus progres, atau data situs dihapus |
| Hasil skrining | `latestResult`, memori halaman | Sampai rute hasil ditinggalkan, `pagehide`, atau muat ulang |
| Preferensi bahasa | localStorage `sispak.language` | Sampai preferensi atau data situs dihapus |
| Aplikasi, font, basis pengetahuan | Cache service worker | Dikelola Workbox dan cache data |

Jawaban dan hasil tidak dikirim ke server, tidak dimasukkan ke cache service worker, dan tidak dicatat sebagai riwayat. Tidak ada backend, login, pelacak, atau layanan analitik. Permintaan jaringan normal hanya memuat berkas aplikasi serta data statis.

## Progres

`storage.js` membuka IndexedDB dan menguji akses tulis/hapus sebelum aplikasi dimulai. Transaksi meminta `durability: "strict"`. Jika penyimpanan tidak dapat digunakan, pengguna mendapat petunjuk mengaktifkannya.

`consultationProgress.js` menyimpan salinan sesi dan memakai BroadcastChannel untuk memberi tahu tab lain. `visibilitychange` serta `pageshow` memicu pembacaan ulang progres. `sessionCompatibility.js` mengonversi field dan penanda durasi lama ke penamaan internal English, untuk normalisasi bentuk. Kompatibilitas makna tetap mensyaratkan `knowledgeVersion` yang sama.

`migrateLegacyStorage()` memindahkan progres localStorage versi lama dan menghapus kunci riwayat lama `sispak.riwayat`.

## Hasil sementara

Hasil tidak diserialisasi ke IndexedDB atau localStorage. Saat pengguna meninggalkan halaman hasil melalui router, konfirmasi menjelaskan bahwa hasil akan hilang. Setelah disetujui, hasil dihapus. Event `pagehide` juga menghapus hasil, termasuk ketika halaman masuk cache navigasi browser. Tidak ada fitur ekspor atau unduh hasil.

Aplikasi tidak dapat mencegah pengguna membuat tangkapan layar, mencetak melalui browser, atau menyimpan isi perangkat dengan cara lain. Karena itu tidak ada klaim bahwa hasil mustahil disalin.

## Bahasa dan offline

Preferensi hanya berisi `id` atau `en` dan tidak mengandung jawaban. Kegagalan localStorage tidak menghentikan perubahan bahasa selama halaman terbuka.

Workbox menyimpan aplikasi dan font; katalog bahasa ikut bundle. JSON basis pengetahuan memakai NetworkFirst dengan salinan offline. Cache lama dibersihkan ketika service worker baru aktif. Banner pembaruan tidak memuat ulang hasil secara otomatis.

## Perangkat bersama

Gunakan **Hapus jawaban saya** bila berhenti di tengah skrining. Daftar jawaban tertutup secara bawaan. Setelah selesai, tinggalkan halaman hasil agar hasil dihapus dari memori. Preferensi bahasa boleh tetap tersimpan karena tidak mengandung informasi keluhan.

## Pembaruan basis pengetahuan

Kunci progres berbentuk `sispak.sesi.<KNOWLEDGE_VERSION>.<metode>`. Progres versi lama tidak dipetakan ke pertanyaan baru. Saat ditemukan, progres itu dihapus/diabaikan, dan halaman mulai menjelaskan bahwa pertanyaan diperbarui. Tab versi lama tidak menulis ke kunci versi baru. Jawaban sesi yang selesai tetap dihapus seperti biasa.

Pilihan Kurang yakin/Lewati ikut progres sebagai `deferredAnswers`, terpisah dari fakta boolean. Map ini juga masuk sinkronisasi antar-tab dan dihapus bersama progres setelah hasil dibuat. Namespace versi audit sebelumnya dibersihkan saat startup. Panduan konsultasi dan FAQ tidak menyimpan input baru.
