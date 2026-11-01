import { t } from "./lib/i18n.js";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { loadKnowledgeBase } from "./lib/knowledgeBase";
import { loadProgress } from "./lib/consultationProgress";
import { initializeStorage } from "./lib/storage";
import { enableOfflineCache } from "./lib/offline";
// font disimpan bersama aplikasi agar tidak ada permintaan ke server pihak ketiga
import "@fontsource-variable/plus-jakarta-sans";
import "./assets/main.css";

const container = document.getElementById("app");

function showMessage(title, body) {
    container.innerHTML = `
        <main class="container-page flex flex-1 items-center justify-center py-12">
            <div class="card w-full max-w-xl" role="alert">
                <span class="eyebrow">${t("Skrining Awal Kesehatan Mental")}</span>
                <h1 class="mb-3 text-2xl font-extrabold sm:text-3xl">${t(title)}</h1>
                ${body}
                <button class="btn btn-primary mt-6" type="button" onclick="location.reload()">${t("Muat ulang halaman")}</button>
            </div>
        </main>`;
}

async function start() {
    // tanpa penyimpanan browser progres konsultasi bisa hilang di tengah jalan, jadi sistem tidak dijalankan
    if (!(await initializeStorage())) {
        showStorageMessage();
        return;
    }
    try {
        await loadKnowledgeBase();
        await loadProgress();
    } catch (e) {
        console.error(e);
        showMessage("Basis pengetahuan gagal dimuat", `<p class="text-muted">${t("File basis pengetahuan tidak dapat dibaca. Jika ini kunjungan pertama, sambungkan ke internet terlebih dahulu; setelah itu sistem bisa dipakai offline.")}</p>`);
        return;
    }
    createApp(App).use(router).mount(container);
}

enableOfflineCache();

function showStorageMessage() {
    showMessage("Penyimpanan browser tidak aktif", `
        <p class="mb-4 text-muted">${t("Sistem ini membutuhkan penyimpanan browser untuk menyimpan jawaban sementara agar skrining bisa dilanjutkan jika browser tertutup. Jawaban hanya disimpan di perangkat anda, tidak dikirim ke mana pun, dan dihapus begitu hasil keluar. Hasil tidak pernah disimpan.")}</p>
        <p class="mb-2 font-bold">${t("Cara mengaktifkan:")}</p>
        <ul class="list-disc space-y-1 pl-5 text-muted">
            <li><strong>Chrome / Edge:</strong> ${t("Setelan → Privasi dan keamanan → Setelan situs → izinkan situs menyimpan data di perangkat.")}</li>
            <li><strong>Firefox:</strong> ${t("Setelan → Privasi & Keamanan → jangan blokir cookie dan data situs untuk situs ini.")}</li>
            <li><strong>Safari (iPhone/iPad):</strong> ${t('Pengaturan → Safari → matikan "Blokir Semua Cookie".')}</li>
        </ul>
        <p class="mt-4 text-sm text-muted">${t("Setelah diaktifkan, muat ulang halaman ini. Mode penyamaran pada beberapa browser juga dapat memblokir penyimpanan.")}</p>`);
}

start();
