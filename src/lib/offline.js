import { ref } from "vue";
import { registerSW } from "virtual:pwa-register";
import { BASIS } from "./basis";

export const adaVersiBaru = ref(false);
let perbarui = null;

// Kunjungan pertama memuat data sebelum service worker aktif, sehingga data belum masuk cache.
// Begitu service worker mengendalikan halaman, data diambil ulang lewat service worker agar tersimpan.
function hangatkanCacheData() {
    const berkas = ["penyakit.json", "gejala.json", "sumber.json"];
    berkas.forEach((nama) => fetch(`${BASIS}data/${nama}`, { cache: "no-cache" }).catch(() => {}));
}

export function aktifkanCacheOffline() {
    // service worker hanya berjalan di HTTPS atau localhost
    if (!("serviceWorker" in navigator)) return;

    perbarui = registerSW({
        immediate: true,
        onNeedRefresh() {
            adaVersiBaru.value = true;
        },
        onRegisteredSW() {
            if (navigator.serviceWorker.controller) {
                hangatkanCacheData();
            } else {
                navigator.serviceWorker.addEventListener("controllerchange", hangatkanCacheData, { once: true });
            }
        },
        onRegisterError(e) {
            console.warn("Cache offline tidak aktif", e);
        }
    });
}

// memuat ulang ke versi baru; progres aman karena tersimpan di IndexedDB
export function pakaiVersiBaru() {
    perbarui?.(true);
}
