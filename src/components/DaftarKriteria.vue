<script setup>
import { GEJALA, PENYAKIT, labelDurasi } from "@/lib/sistemPakar";

defineProps({
    kode: { type: String, required: true }
});
</script>

<template>
    <ol class="criteria">
        <li v-for="(k, i) in PENYAKIT[kode].kriteria" :key="i">
            <span class="criteria-label">
                {{ k.minimal === k.gejala.length ? (k.gejala.length > 1 ? "Semua gejala berikut" : "Gejala") : `Minimal ${k.minimal} dari ${k.gejala.length} gejala berikut` }}
            </span>
            <ul class="symptom-list">
                <li v-for="g in k.gejala" :key="g">{{ GEJALA[g].nama }}</li>
            </ul>
        </li>
        <li v-if="PENYAKIT[kode].durasiMinimal > 0">
            <span class="criteria-label">Durasi</span>
            <ul class="symptom-list">
                <li>Dialami minimal {{ labelDurasi(PENYAKIT[kode].durasiMinimal) }}</li>
            </ul>
        </li>
    </ol>
</template>
