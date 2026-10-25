<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import DaftarKriteria from "@/components/DaftarKriteria.vue";
import SesiKonsultasi from "@/components/SesiKonsultasi.vue";
import { PENYAKIT, daftarPenyakit } from "@/lib/sistemPakar";

const route = useRoute();
const target = computed(() => (daftarPenyakit().includes(route.query.id) ? route.query.id : null));
</script>

<template>
    <div class="container-page max-w-3xl py-8 sm:py-10 2xl:max-w-3xl">
        <header class="mb-6">
            <span class="eyebrow">Backward Chaining</span>
            <h1 class="mb-3 text-3xl font-extrabold sm:text-4xl">Pilih gangguan yang ingin dibuktikan</h1>
            <p class="text-muted">Gangguan yang dipilih menjadi hipotesis. Sistem akan menanyakan kriterianya satu per satu untuk membuktikan hipotesis tersebut.</p>
        </header>

        <nav class="mb-7 flex flex-wrap gap-2" aria-label="Pilih hipotesis">
            <RouterLink
                v-for="k in daftarPenyakit()"
                :key="k"
                :to="{ query: { id: k } }"
                class="rounded-full border px-4 py-2 text-[.95rem] font-semibold no-underline transition"
                :class="k === target ? 'border-primary bg-primary text-on-primary' : 'border-line bg-surface text-ink hover:border-primary'"
                :aria-current="k === target ? 'true' : undefined"
            >
                {{ PENYAKIT[k].nama }}
            </RouterLink>
        </nav>

        <p v-if="!target" class="empty">Pilih salah satu gangguan di atas sebagai hipotesis.</p>

        <template v-else>
            <details class="card group mb-5">
                <summary class="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span class="eyebrow">Hipotesis</span>
                    <h2 class="text-2xl font-extrabold">{{ PENYAKIT[target].nama }}</h2>
                    <span class="text-sm text-muted underline">Lihat aturan pembuktian</span>
                </summary>
                <div class="pt-5">
                    <DaftarKriteria :kode="target" />
                </div>
            </details>

            <SesiKonsultasi :key="target" metode="backward" :target="target" />
        </template>
    </div>
</template>
