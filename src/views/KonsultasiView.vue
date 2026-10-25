<script setup>
import { ref } from "vue";
import { PENYAKIT, ambilRiwayat, ambilSesi, formatTanggal, hapusRiwayat, judulHasil, namaMetode, ruteHasil } from "@/lib/sistemPakar";

const sesiForward = ambilSesi("forward");
const sesiBackward = ambilSesi("backward");
const riwayat = ref(ambilRiwayat());

function hapusSemua() {
    if (confirm("Hapus semua riwayat konsultasi di perangkat ini?")) {
        hapusRiwayat();
        riwayat.value = [];
    }
}
</script>

<template>
    <div class="container">
        <header class="page-head">
            <span class="eyebrow">Konsultasi</span>
            <h1>Pilih metode konsultasi</h1>
            <p>Kedua metode memakai basis pengetahuan dan aturan yang sama. Diagnosa berakhir setelah semua gejala terpenuhi dan sudah dialami selama 2 minggu atau lebih.</p>
        </header>

        <section class="section" style="padding-top: 24px;">
            <div v-if="sesiForward?.urutan.length" class="card resume">
                <div>
                    <h3 style="margin: 0;">Lanjutkan Forward Chaining?</h3>
                    <p>Anda sudah menjawab {{ sesiForward.urutan.length }} pertanyaan pada konsultasi sebelumnya.</p>
                </div>
                <RouterLink class="btn btn-primary" to="/forward">Lanjutkan</RouterLink>
            </div>
            <div v-if="sesiBackward?.urutan.length && PENYAKIT[sesiBackward.target]" class="card resume">
                <div>
                    <h3 style="margin: 0;">Lanjutkan pembuktian {{ PENYAKIT[sesiBackward.target].nama }}?</h3>
                    <p>Anda sudah menjawab {{ sesiBackward.urutan.length }} pertanyaan pada konsultasi sebelumnya.</p>
                </div>
                <RouterLink class="btn btn-primary" :to="{ path: '/backward', query: { id: sesiBackward.target } }">Lanjutkan</RouterLink>
            </div>

            <div class="grid grid-2">
                <article class="card method-card">
                    <span class="method-tag">Direkomendasikan</span>
                    <h2>Forward Chaining</h2>
                    <p>Penalaran dari fakta ke kesimpulan: sistem mengumpulkan gejala yang anda alami, lalu mencocokkannya dengan seluruh aturan.</p>
                    <ul>
                        <li>Cocok jika anda belum tahu gangguan apa yang dialami</li>
                        <li>Bisa menemukan lebih dari satu gangguan</li>
                    </ul>
                    <RouterLink class="btn btn-primary" to="/forward">Mulai Forward Chaining</RouterLink>
                </article>
                <article class="card method-card">
                    <span class="method-tag alt">Pembuktian</span>
                    <h2>Backward Chaining</h2>
                    <p>Penalaran dari tujuan ke fakta: pilih satu gangguan sebagai hipotesis, lalu sistem membuktikan gejalanya satu per satu.</p>
                    <ul>
                        <li>Cocok jika anda menduga gangguan tertentu</li>
                        <li>Berhenti begitu satu gejala tidak terpenuhi</li>
                    </ul>
                    <RouterLink class="btn btn-ghost" to="/backward">Mulai Backward Chaining</RouterLink>
                </article>
            </div>
        </section>

        <section class="section" style="padding-top: 0;">
            <div class="history-head">
                <h2>Riwayat konsultasi</h2>
                <button v-if="riwayat.length" class="btn btn-text" type="button" @click="hapusSemua">Hapus riwayat</button>
            </div>
            <p class="muted">Riwayat hanya tersimpan di browser ini.</p>

            <p v-if="riwayat.length === 0" class="empty">Belum ada riwayat konsultasi di perangkat ini.</p>
            <ul v-else class="history">
                <li v-for="entri in riwayat" :key="entri.waktu">
                    <RouterLink :to="ruteHasil(entri)">
                        <span class="history-dot" :class="{ aman: entri.penyakit.length === 0 }"></span>
                        <span class="history-main">
                            <strong>{{ judulHasil(entri) }}</strong>
                            <small>{{ namaMetode(entri.metode) }} · {{ formatTanggal(entri.waktu) }}</small>
                        </span>
                        <span class="history-arrow" aria-hidden="true">→</span>
                    </RouterLink>
                </li>
            </ul>
        </section>
    </div>
</template>
