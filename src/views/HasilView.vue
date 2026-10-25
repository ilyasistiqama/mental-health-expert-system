<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import CatatanPenting from "@/components/CatatanPenting.vue";
import DaftarKriteria from "@/components/DaftarKriteria.vue";
import { KODE_NORMAL, PENYAKIT, ambilRiwayat, formatTanggal, judulHasil, labelDurasi, namaMetode } from "@/lib/sistemPakar";

const route = useRoute();

// ?r=<waktu> menunjuk entri riwayat, tanpa parameter tampilkan hasil terakhir
const entri = computed(() => {
    const riwayat = ambilRiwayat();
    return riwayat.find((e) => String(e.waktu) === route.query.r) ?? (route.query.r ? null : riwayat[0] ?? null);
});

const terdiagnosa = computed(() => entri.value.penyakit.filter((k) => PENYAKIT[k]).map((k) => PENYAKIT[k]));
const belumCukup = computed(() => entri.value.belumCukup.filter((k) => PENYAKIT[k]).map((k) => PENYAKIT[k]));
</script>

<template>
    <div class="container quiz">
        <div v-if="!entri">
            <header class="page-head">
                <h1>Belum ada hasil</h1>
                <p>Hasil konsultasi tidak ditemukan di perangkat ini.</p>
            </header>
            <RouterLink class="btn btn-primary btn-lg" to="/konsultasi">Mulai Konsultasi</RouterLink>
        </div>

        <div v-else>
            <section class="result-hero" :class="{ aman: terdiagnosa.length === 0 }">
                <span class="eyebrow">{{ terdiagnosa.length ? "Kecenderungan yang terdeteksi" : "Hasil konsultasi" }}</span>
                <h1>{{ judulHasil(entri) }}</h1>
                <p v-if="terdiagnosa.length">
                    Jawaban anda memenuhi aturan untuk {{ terdiagnosa.length > 1 ? "gangguan-gangguan" : "gangguan" }} berikut. Hasil ini adalah
                    kecenderungan, bukan diagnosis; diagnosis hanya dapat ditegakkan oleh psikolog klinis atau psikiater.
                </p>
                <p v-else-if="entri.metode === 'backward' && belumCukup.length === 0">
                    Tidak semua kriteria dari hipotesis tersebut terpenuhi. Coba hipotesis lain atau gunakan Forward Chaining.
                </p>
                <p v-else-if="belumCukup.length === 0">{{ PENYAKIT[KODE_NORMAL].deskripsi }}</p>
                <span class="result-meta">{{ namaMetode(entri.metode) }} · {{ formatTanggal(entri.waktu) }}</span>
            </section>

            <div v-for="p in belumCukup" :key="p.kode" class="notice notice-info">
                <p>
                    <strong>Gejala {{ p.nama }} terpenuhi, tetapi durasinya belum mencapai {{ labelDurasi(p.durasiMinimal) }}</strong>
                    sehingga belum dapat disimpulkan. Pantau terus kondisi anda dan lakukan konsultasi ulang jika keluhan berlanjut.
                    <template v-if="p.catatanDurasi">{{ p.catatanDurasi }}</template>
                </p>
            </div>

            <div class="result-grid">
                <div class="stack">
                    <section v-for="p in terdiagnosa" :key="p.kode" class="card">
                        <div class="tags">
                            <span class="disease-code">{{ p.kode }}</span>
                            <span class="disease-category">{{ p.kategori }}</span>
                        </div>
                        <h2>{{ p.nama }}</h2>
                        <p class="muted">{{ p.deskripsi }}</p>
                        <h3>Penanganan yang dapat dilakukan</h3>
                        <ol class="treatment">
                            <li v-for="(t, i) in p.pengobatan" :key="i">{{ t }}</li>
                        </ol>
                        <p v-if="p.rujukan" class="reference">Rujukan: {{ p.rujukan }}</p>
                    </section>
                    <section v-if="terdiagnosa.length === 0" class="card">
                        <h2>Tips menjaga kesehatan mental</h2>
                        <ol class="treatment">
                            <li v-for="(t, i) in PENYAKIT[KODE_NORMAL].pengobatan" :key="i">{{ t }}</li>
                        </ol>
                    </section>
                    <section v-if="entri.jawaban.length" class="card">
                        <details>
                            <summary>Lihat jawaban anda ({{ entri.jawaban.length }} pertanyaan)</summary>
                            <ol class="answer-log">
                                <li v-for="j in entri.jawaban" :key="j.kode">
                                    <span>{{ j.pertanyaan }}</span>
                                    <span class="badge" :class="j.ya === false ? 'badge-tidak' : 'badge-ya'">{{ j.jawaban }}</span>
                                </li>
                            </ol>
                        </details>
                    </section>
                </div>
                <div class="stack">
                    <section v-for="p in terdiagnosa" :key="p.kode" class="card">
                        <h3>Aturan {{ p.nama }}</h3>
                        <DaftarKriteria :kode="p.kode" />
                    </section>
                    <CatatanPenting>hasil ini adalah gambaran awal, bukan diagnosis. Obat-obatan hanya boleh dikonsumsi sesuai resep dokter. Kunjungi psikolog klinis, psikiater, atau puskesmas terdekat untuk pemeriksaan lebih lanjut.</CatatanPenting>
                    <div class="btn-group">
                        <RouterLink class="btn btn-primary" to="/forward">Konsultasi lagi</RouterLink>
                        <RouterLink class="btn btn-ghost" to="/konsultasi">Lihat riwayat</RouterLink>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
