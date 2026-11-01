// Alamat dasar aplikasi, misalnya "/" (npm run dev), "/mental-health-expert-system/" (GitHub Pages)
// atau "/folder/dist/" (web server lokal). Build untuk GitHub Pages memakai base absolut; build biasa
// memakai base relatif "./", sehingga alamatnya dihitung dari lokasi file JavaScript (folder assets/).
// Optional chaining membuat modul ini tetap bisa diimpor di Node untuk pengujian mesin inferensi.
const base = import.meta.env?.BASE_URL ?? "./";
export const BASE_PATH = base.startsWith("/")
    ? base
    : new URL(/* @vite-ignore */ "..", import.meta.url).pathname;

// Versi sebelumnya memakai alamat hash (#/artikel). Tautan lama diubah ke alamat bersih (/artikel).
// Dijalankan saat modul dimuat, sebelum router membaca alamat halaman.
if (typeof location !== "undefined" && location.hash.startsWith("#/")) {
    history.replaceState(null, "", BASE_PATH + location.hash.slice(2));
}
