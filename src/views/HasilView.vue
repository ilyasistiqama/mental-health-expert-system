<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import CatatanPenting from "@/components/CatatanPenting.vue";
import {
    KODE_NORMAL, PENYAKIT, ambilRiwayat, formatTanggal, gejalaPenyakit,
    judulHasil, namaMetode, teksPertanyaan
} from "@/lib/sistemPakar";

const route = useRoute();

// ?r=<waktu> menunjuk entri riwayat, tanpa parameter tampilkan hasil terakhir
const entri = computed(() => {
    const riwayat = ambilRiwayat();
    return riwayat.find((e) => String(e.waktu) === route.query.r) ?? (route.query.r ? null : riwayat[0] ?? null);
});

const terdiagnosa = computed(() => entri.value.penyakit.filter((k) => PENYAKIT[k]).map((k) => PENYAKIT[k]));
const belumDuaMinggu = computed(() => entri.value.durasi === false
    ? entri.value.terdeteksi.filter((k) => PENYAKIT[k]).map((k) => PENYAKIT[k].nama)
    : []);
const jawaban = computed(() => entri.value.jawaban.filter((j) => teksPertanyaan(j.kode)));
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
                <p v-if="belumDuaMinggu.length">
                    Gejala {{ belumDuaMinggu.join(", ") }} terpenuhi, tetapi belum dialami selama 2 minggu atau lebih sehingga belum dapat
                    disimpulkan sebagai gangguan. Pantau terus kondisi anda dan lakukan konsultasi ulang jika gejala berlanjut.
                </p>
                <p v-else-if="terdiagnosa.length === 0 && entri.metode === 'backward'">
                    Tidak semua gejala dari hipotesis tersebut anda alami. Coba hipotesis lain atau gunakan Forward Chaining.
                </p>
                <p v-else-if="terdiagnosa.length === 0">{{ PENYAKIT[KODE_NORMAL].deskripsi }}</p>
                <span class="result-meta">{{ namaMetode(entri.metode) }} · {{ formatTanggal(entri.waktu) }}</span>
            </section>

            <div class="result-grid">
                <div class="stack">
                    <section v-for="p in terdiagnosa" :key="p.kode" class="card">
                        <span class="disease-code">{{ p.kode }}</span>
                        <h2>{{ p.nama }}</h2>
                        <p class="muted">{{ p.deskripsi }}</p>
                        <h3>Penanganan yang dapat dilakukan</h3>
                        <ol class="treatment">
                            <li v-for="(t, i) in p.pengobatan" :key="i">{{ t }}</li>
                        </ol>
                    </section>
                    <section v-if="terdiagnosa.length === 0" class="card">
                        <h2>Tips menjaga kesehatan mental</h2>
                        <ol class="treatment">
                            <li v-for="(t, i) in PENYAKIT[KODE_NORMAL].pengobatan" :key="i">{{ t }}</li>
                        </ol>
                    </section>
                    <section v-if="jawaban.length" class="card">
                        <details>
                            <summary>Lihat jawaban anda</summary>
                            <ol class="answer-log">
                                <li v-for="j in jawaban" :key="j.kode">
                                    <span>{{ teksPertanyaan(j.kode) }}</span>
                                    <span class="badge" :class="j.ya ? 'badge-ya' : 'badge-tidak'">{{ j.ya ? "Ya" : "Tidak" }}</span>
                                </li>
                            </ol>
                        </details>
                    </section>
                </div>
                <div class="stack">
                    <section v-for="p in terdiagnosa" :key="p.kode" class="card">
                        <h3>Gejala {{ p.nama }}</h3>
                        <ul class="symptom-list">
                            <li v-for="g in gejalaPenyakit(p.kode)" :key="g.kode">{{ g.nama }}</li>
                        </ul>
                    </section>
                    <CatatanPenting>hasil ini adalah gambaran awal, bukan diagnosis. Obat-obatan hanya boleh dikonsumsi sesuai resep dokter. Kunjungi pusat pelayanan psikologi terdekat untuk penanganan lebih lanjut.</CatatanPenting>
                    <div class="btn-group">
                        <RouterLink class="btn btn-primary" to="/forward">Konsultasi lagi</RouterLink>
                        <RouterLink class="btn btn-ghost" to="/konsultasi">Lihat riwayat</RouterLink>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
