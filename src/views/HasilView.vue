<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import CatatanPenting from "@/components/CatatanPenting.vue";
import { GEJALA, PENYAKIT } from "@/data/pengetahuan";
import { ambilRiwayat, formatTanggal, gejalaPenyakit, penyakitValid } from "@/lib/sistemPakar";

const route = useRoute();

// ?id=P1&r=<waktu>: r menunjuk entri riwayat, tanpa parameter tampilkan hasil terakhir
const hasil = computed(() => {
    const riwayat = ambilRiwayat();
    const { id: idQuery, r } = route.query;

    let entri = riwayat.find((e) => String(e.waktu) === r) ?? null;
    const id = penyakitValid(idQuery) ? idQuery : (entri ?? riwayat[0])?.penyakit;
    if (!idQuery && !entri) entri = riwayat[0] ?? null;
    if (entri && entri.penyakit !== id) entri = null;
    if (!id) return null;

    return {
        id,
        aman: id === "P0",
        penyakit: PENYAKIT[id],
        entri,
        gejala: id === "P0" ? [] : gejalaPenyakit(id),
        jawaban: Array.isArray(entri?.jawaban) ? entri.jawaban.filter((j) => GEJALA[j.id]) : []
    };
});
</script>

<template>
    <div class="container quiz">
        <div v-if="!hasil">
            <header class="page-head">
                <h1>Belum ada hasil</h1>
                <p>Anda belum melakukan konsultasi di perangkat ini.</p>
            </header>
            <RouterLink class="btn btn-primary btn-lg" to="/konsultasi">Mulai Konsultasi</RouterLink>
        </div>

        <div v-else>
            <section class="result-hero" :class="{ aman: hasil.aman }">
                <span class="eyebrow">{{ hasil.aman ? "Hasil konsultasi" : "Kecenderungan yang terdeteksi" }}</span>
                <h1>{{ hasil.penyakit.nama }}</h1>
                <p>{{ hasil.penyakit.deskripsi }}</p>
                <span v-if="hasil.entri" class="result-meta">{{ hasil.entri.metode }} · {{ formatTanggal(hasil.entri.waktu) }}</span>
            </section>

            <div class="result-grid">
                <div class="stack">
                    <section class="card">
                        <h2>{{ hasil.aman ? "Tips menjaga kesehatan mental" : "Penanganan yang dapat dilakukan" }}</h2>
                        <ol class="treatment">
                            <li v-for="(t, i) in hasil.penyakit.pengobatan" :key="i">{{ t }}</li>
                        </ol>
                    </section>
                    <section v-if="hasil.jawaban.length" class="card">
                        <details>
                            <summary>Lihat jawaban anda</summary>
                            <ol class="answer-log">
                                <li v-for="(j, i) in hasil.jawaban" :key="i">
                                    <span>{{ GEJALA[j.id].pertanyaan }}</span>
                                    <span class="badge" :class="j.jawaban === 'ya' ? 'badge-ya' : 'badge-tidak'">{{ j.jawaban === "ya" ? "Ya" : "Tidak" }}</span>
                                </li>
                            </ol>
                        </details>
                    </section>
                </div>
                <div class="stack">
                    <section v-if="hasil.gejala.length" class="card">
                        <h3>Gejala yang berkaitan</h3>
                        <ul class="symptom-list">
                            <li v-for="g in hasil.gejala" :key="g.id">{{ g.gejala }}</li>
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
