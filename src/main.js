import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { muatBasisPengetahuan, muatProgres } from "./lib/sistemPakar";
import { siapkanPenyimpanan } from "./lib/penyimpanan";
import { aktifkanCacheOffline } from "./lib/offline";
// font disimpan bersama aplikasi agar tidak ada permintaan ke server pihak ketiga
import "@fontsource-variable/plus-jakarta-sans";
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

async function mulai() {
    // tanpa penyimpanan browser progres konsultasi bisa hilang di tengah jalan, jadi sistem tidak dijalankan
    if (!(await siapkanPenyimpanan())) {
        tampilkanPesanPenyimpanan();
        return;
    }
    try {
        await muatBasisPengetahuan();
        await muatProgres();
    } catch (e) {
        console.error(e);
        tampilkanPesan("Basis pengetahuan gagal dimuat", `
            <p class="text-muted">File <code>data/penyakit.json</code>, <code>data/gejala.json</code>, atau <code>data/sumber.json</code>
            tidak dapat dibaca. Jika ini kunjungan pertama, sambungkan ke internet terlebih dahulu; setelah itu sistem bisa dipakai offline.</p>`);
        return;
    }
    createApp(App).use(router).mount(wadah);
}

aktifkanCacheOffline();

function tampilkanPesanPenyimpanan() {
    tampilkanPesan("Penyimpanan browser tidak aktif", `
        <p class="mb-4 text-muted">Sistem ini membutuhkan <strong class="text-ink">penyimpanan browser</strong> untuk menyimpan jawaban anda
        sementara, supaya konsultasi bisa dilanjutkan jika browser tertutup. Jawaban hanya disimpan di perangkat anda, tidak dikirim
        ke mana pun, dan langsung dihapus begitu hasil keluar. Hasil diagnosa tidak pernah disimpan.</p>
        <p class="mb-2 font-bold">Cara mengaktifkan:</p>
        <ul class="list-disc space-y-1 pl-5 text-muted">
            <li><strong class="text-ink">Chrome / Edge:</strong> Setelan → Privasi dan keamanan → Setelan situs → izinkan situs menyimpan data di perangkat.</li>
            <li><strong class="text-ink">Firefox:</strong> Setelan → Privasi & Keamanan → jangan blokir cookie dan data situs untuk situs ini.</li>
            <li><strong class="text-ink">Safari (iPhone/iPad):</strong> Pengaturan → Safari → matikan "Blokir Semua Cookie".</li>
        </ul>
        <p class="mt-4 text-sm text-muted">Setelah diaktifkan, muat ulang halaman ini. Mode penyamaran (incognito) pada beberapa browser juga dapat memblokir penyimpanan.</p>`);
}

mulai();
