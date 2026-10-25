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
    <div class="container narrow quiz">
        <header class="page-head" style="padding-top: 8px;">
            <span class="eyebrow">Backward Chaining</span>
            <h1>Pilih gangguan yang ingin dibuktikan</h1>
            <p>Gangguan yang dipilih menjadi hipotesis. Sistem akan menanyakan gejalanya satu per satu untuk membuktikan hipotesis tersebut.</p>
        </header>

        <nav class="chips" aria-label="Pilih hipotesis">
            <RouterLink v-for="k in daftarPenyakit()" :key="k" class="chip" :class="{ aktif: k === target }" :to="{ query: { id: k } }">
                {{ PENYAKIT[k].nama }}
            </RouterLink>
        </nav>

        <p v-if="!target" class="empty">Pilih salah satu gangguan di atas sebagai hipotesis.</p>

        <template v-else>
            <details class="card hypothesis">
                <summary>
                    <span class="eyebrow">Hipotesis</span>
                    <h2>{{ PENYAKIT[target].nama }}</h2>
                    <span class="muted">Lihat aturan pembuktian</span>
                </summary>
                <DaftarKriteria :kode="target" />
            </details>

            <SesiKonsultasi :key="target" metode="backward" :target="target" />
        </template>
    </div>
</template>
