import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { muatBasisPengetahuan } from "./lib/sistemPakar";
import { penyimpananAktif } from "./lib/penyimpanan";
import "./assets/main.css";

const wadah = document.getElementById("app");

function tampilkanPesan(judul, isi) {
    wadah.innerHTML = `
        <main class="container-page flex flex-1 items-center justify-center py-12">
            <div class="card w-full max-w-xl" role="alert">
                <span class="eyebrow">Sistem Pakar Gangguan Kecemasan</span>
                <h1 class="mb-3 text-2xl font-extrabold sm:text-3xl">${judul}</h1>
                ${isi}
                <button class="btn btn-primary mt-6" type="button" onclick="location.reload()">Muat ulang halaman</button>
            </div>
        </main>`;
}

// tanpa localStorage progres dan hasil konsultasi tidak bisa disimpan, jadi sistem tidak dijalankan
if (!penyimpananAktif()) {
    tampilkanPesan("Penyimpanan browser tidak aktif", `
        <p class="mb-4 text-muted">Sistem ini membutuhkan <strong class="text-ink">penyimpanan browser (localStorage)</strong> untuk menyimpan progres
        konsultasi dan riwayat hasil di perangkat anda. Data tidak dikirim ke server mana pun.</p>
        <p class="mb-2 font-bold">Cara mengaktifkan:</p>
        <ul class="list-disc space-y-1 pl-5 text-muted">
            <li><strong class="text-ink">Chrome / Edge:</strong> Setelan → Privasi dan keamanan → Setelan situs → izinkan situs menyimpan data di perangkat.</li>
            <li><strong class="text-ink">Firefox:</strong> Setelan → Privasi & Keamanan → jangan blokir cookie dan data situs untuk situs ini.</li>
            <li><strong class="text-ink">Safari (iPhone/iPad):</strong> Pengaturan → Safari → matikan "Blokir Semua Cookie".</li>
        </ul>
        <p class="mt-4 text-sm text-muted">Setelah diaktifkan, muat ulang halaman ini.</p>`);
} else {
    muatBasisPengetahuan()
        .then(() => createApp(App).use(router).mount(wadah))
        .catch((e) => {
            console.error(e);
            tampilkanPesan("Basis pengetahuan gagal dimuat", `
                <p class="text-muted">File <code>data/penyakit.json</code>, <code>data/gejala.json</code>, atau <code>data/sumber.json</code>
                tidak dapat dibaca. Periksa koneksi internet anda, atau hubungi pengelola situs.</p>`);
        });
}
