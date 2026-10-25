// Alamat dasar aplikasi, misalnya "/" (npm run dev), "/sispak-gangguan-kecemasan/" (GitHub Pages)
// atau "/folder/dist/" (Apache/Laragon). Build untuk GitHub Pages memakai base absolut; build biasa
// memakai base relatif "./", sehingga alamatnya dihitung dari lokasi file JavaScript (folder assets/).
export const BASIS = import.meta.env.BASE_URL.startsWith("/")
    ? import.meta.env.BASE_URL
    : new URL(/* @vite-ignore */ "..", import.meta.url).pathname;

// Versi sebelumnya memakai alamat hash (#/artikel). Tautan lama diubah ke alamat bersih (/artikel).
// Dijalankan saat modul dimuat, sebelum router membaca alamat halaman.
if (location.hash.startsWith("#/")) {
    history.replaceState(null, "", BASIS + location.hash.slice(2));
}
