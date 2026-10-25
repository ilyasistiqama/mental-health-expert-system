<script setup>
import { ref } from "vue";
import { PENYAKIT } from "@/data/pengetahuan";
import { ambilRiwayat, ambilSesi, formatTanggal, hapusRiwayat, ruteHasil } from "@/lib/sistemPakar";

const sesi = ambilSesi();
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
            <p>Kedua metode memakai basis pengetahuan yang sama. Pilih yang paling sesuai dengan kebutuhan anda.</p>
        </header>

        <section class="section" style="padding-top: 24px;">
            <div v-if="sesi && sesi.langkah.length > 0" class="card resume">
                <div>
                    <h3 style="margin: 0;">Lanjutkan konsultasi sebelumnya?</h3>
                    <p>Anda sudah menjawab {{ sesi.langkah.length }} pertanyaan pada konsultasi sebelumnya.</p>
                </div>
                <RouterLink class="btn btn-primary" to="/forward">Lanjutkan</RouterLink>
            </div>

            <div class="grid grid-2">
                <article class="card method-card">
                    <span class="method-tag">Direkomendasikan</span>
                    <h2>Forward Chaining</h2>
                    <p>Sistem menelusuri dari gejala yang anda alami hingga menemukan kesimpulan.</p>
                    <ul>
                        <li>Cocok jika anda belum tahu gangguan apa yang dialami</li>
                        <li>Jawab pertanyaan Ya/Tidak satu per satu</li>
                    </ul>
                    <RouterLink class="btn btn-primary" to="/forward">Mulai Forward Chaining</RouterLink>
                </article>
                <article class="card method-card">
                    <span class="method-tag alt">Verifikasi</span>
                    <h2>Backward Chaining</h2>
                    <p>Pilih satu gangguan sebagai hipotesis, lalu sistem memeriksa apakah gejalanya terpenuhi.</p>
                    <ul>
                        <li>Cocok jika anda menduga gangguan tertentu</li>
                        <li>Centang gejala yang anda alami</li>
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
                        <span class="history-dot" :class="{ aman: entri.penyakit === 'P0' }"></span>
                        <span class="history-main">
                            <strong>{{ PENYAKIT[entri.penyakit].nama }}</strong>
                            <small>{{ entri.metode }} · {{ formatTanggal(entri.waktu) }}</small>
                        </span>
                        <span class="history-arrow" aria-hidden="true">→</span>
                    </RouterLink>
                </li>
            </ul>
        </section>
    </div>
</template>
