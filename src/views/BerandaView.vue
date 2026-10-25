<script setup>
import CatatanPenting from "@/components/CatatanPenting.vue";
import KartuPenyakit from "@/components/KartuPenyakit.vue";
import Rujukan from "@/components/Rujukan.vue";
import { daftarPenyakit } from "@/lib/sistemPakar";

const langkah = [
    { judul: "Pilih metode", isi: "Forward chaining menelusuri dari gejala, backward chaining membuktikan satu gangguan tertentu." },
    { judul: "Jawab dengan jujur", isi: "Pertanyaan penyaring diacak; gejala lanjutan ditanyakan berurutan. Jawaban bisa dibatalkan kapan saja." },
    { judul: "Lihat hasil & saran", isi: "Sistem menanyakan durasi keluhan, lalu memberi gambaran kecenderungan, saran penanganan, dan PDF hasil." }
];
</script>

<template>
    <section class="relative overflow-hidden py-12 sm:py-16 lg:py-20">
        <div class="absolute -top-32 -right-20 -z-10 size-[420px] rounded-full bg-primary-soft opacity-50 blur-3xl" aria-hidden="true"></div>
        <div class="absolute -bottom-36 -left-24 -z-10 size-80 rounded-full bg-accent-soft opacity-50 blur-3xl" aria-hidden="true"></div>

        <div class="container-page grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
            <div>
                <span class="eyebrow">Sistem Pakar · Psikologi</span>
                <h1 class="mb-4 text-4xl font-extrabold sm:text-5xl xl:text-6xl">Kenali kecenderungan gangguan kecemasan anda</h1>
                <p class="mb-7 max-w-xl text-lg text-muted">
                    Gangguan kecemasan adalah gangguan mental yang paling umum di dunia, dialami sekitar 470 juta orang pada 2023,
                    namun hanya sekitar 1 dari 4 yang mendapat penanganan.<Rujukan :ids="['who-anxiety-2026']" />
                    Jawab beberapa pertanyaan untuk mengenali kecenderungan anda.
                </p>
                <div class="flex flex-wrap gap-3">
                    <RouterLink class="btn btn-primary flex-1 px-7 py-4 text-[1.05rem] sm:flex-none" to="/forward">Mulai Konsultasi</RouterLink>
                    <RouterLink class="btn btn-ghost flex-1 px-7 py-4 text-[1.05rem] sm:flex-none" to="/artikel">Pelajari Kecemasan</RouterLink>
                </div>
            </div>
            <div class="card rotate-0 p-7 lg:rotate-[1.5deg]" aria-hidden="true">
                <span class="text-xs font-bold text-muted">Pertanyaan ke-1</span>
                <h3 class="mt-2.5 mb-5 text-lg font-bold">Apakah anda merasa khawatir secara berlebihan tentang banyak hal sehari-hari hampir setiap hari?</h3>
                <div class="flex gap-2.5">
                    <span class="flex-1 rounded-xl bg-primary py-2.5 text-center font-bold text-on-primary">Ya</span>
                    <span class="flex-1 rounded-xl bg-surface-2 py-2.5 text-center font-bold text-muted">Tidak</span>
                </div>
            </div>
        </div>
    </section>

    <section class="py-10 sm:py-14">
        <div class="container-page">
            <div class="mb-7 max-w-2xl">
                <span class="eyebrow">Cara kerja</span>
                <h2 class="text-2xl font-extrabold sm:text-3xl">Tiga langkah sederhana</h2>
            </div>
            <div class="grid gap-4 md:grid-cols-3">
                <div v-for="(l, i) in langkah" :key="i" class="card">
                    <span class="mb-4 grid size-8 place-items-center rounded-lg bg-primary-soft font-extrabold text-primary-strong">{{ i + 1 }}</span>
                    <h3 class="mb-1 text-lg font-bold">{{ l.judul }}</h3>
                    <p class="text-[.95rem] text-muted">{{ l.isi }}</p>
                </div>
            </div>
        </div>
    </section>

    <section class="py-10 sm:py-14">
        <div class="container-page">
            <div class="mb-7 max-w-2xl">
                <span class="eyebrow">Basis pengetahuan</span>
                <h2 class="mb-2 text-2xl font-extrabold sm:text-3xl">{{ daftarPenyakit().length }} gangguan yang dapat dikenali</h2>
                <p class="text-muted">
                    Aturan setiap gangguan disusun berdasarkan kriteria DSM-5-TR, ICD-11, dan PPDGJ-III, termasuk durasi minimal keluhan.<Rujukan :ids="['dsm5tr', 'icd11', 'ppdgj3']" />
                </p>
            </div>
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <KartuPenyakit v-for="id in daftarPenyakit()" :key="id" :id="id" />
            </div>
        </div>
    </section>

    <section class="py-10 sm:py-14">
        <div class="container-page">
            <CatatanPenting>hasil dari sistem ini hanya gambaran awal, bukan diagnosis. Data konsultasi hanya disimpan di browser anda dan tidak dikirim ke mana pun. Untuk diagnosis yang tepat, konsultasikan dengan psikolog klinis atau psikiater.</CatatanPenting>
        </div>
    </section>
</template>
