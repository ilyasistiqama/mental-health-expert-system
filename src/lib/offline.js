import { ref } from "vue";
import { registerSW } from "virtual:pwa-register";
import { BASE_PATH } from "./basePath";

export const updateAvailable = ref(false);
let updateServiceWorker = null;

// Kunjungan pertama memuat data sebelum service worker aktif, sehingga data belum masuk cache.
// Begitu service worker mengendalikan halaman, data diambil ulang lewat service worker agar tersimpan.
function warmDataCache() {
    const files = ["conditions.json", "symptoms.json", "references.json"];
    files.forEach((name) => fetch(`${BASE_PATH}data/${name}`, { cache: "no-cache" }).catch(() => {}));
}

export function enableOfflineCache() {
    // service worker hanya berjalan di HTTPS atau localhost
    if (!("serviceWorker" in navigator)) return;

    updateServiceWorker = registerSW({
        immediate: true,
        onNeedRefresh() {
            updateAvailable.value = true;
        },
        onRegisteredSW() {
            if (navigator.serviceWorker.controller) {
                warmDataCache();
            } else {
                navigator.serviceWorker.addEventListener("controllerchange", warmDataCache, { once: true });
            }
        },
        onRegisterError(e) {
            console.warn("Cache offline tidak aktif", e);
        }
    });
}

// memuat ulang ke versi baru; progres aman karena tersimpan di IndexedDB
export function applyUpdate() {
    updateServiceWorker?.(true);
}
