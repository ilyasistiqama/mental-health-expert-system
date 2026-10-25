<script setup>
import { GEJALA, PENYAKIT, labelDurasi } from "@/lib/sistemPakar";

defineProps({
    kode: { type: String, required: true }
});

function label(k) {
    if (k.minimal < k.gejala.length) return `Minimal ${k.minimal} dari ${k.gejala.length} gejala berikut`;
    return k.gejala.length > 1 ? "Semua gejala berikut" : "Gejala";
}
</script>

<template>
    <ol class="m-0 grid list-none gap-3.5 p-0">
        <li v-for="(k, i) in PENYAKIT[kode].kriteria" :key="i" class="relative pl-9">
            <span class="absolute top-0 left-0 grid size-6 place-items-center rounded-lg bg-primary-soft text-xs font-extrabold text-primary-strong">{{ i + 1 }}</span>
            <span class="mb-1.5 block text-sm font-bold">{{ label(k) }}</span>
            <ul class="grid list-none gap-1 p-0 text-[.95rem]">
                <li v-for="g in k.gejala" :key="g" class="relative pl-5 before:absolute before:top-[.6em] before:left-1 before:size-2 before:rounded-full before:bg-accent">
                    {{ GEJALA[g].nama }}
                </li>
            </ul>
        </li>
        <li v-if="PENYAKIT[kode].durasiMinimal > 0" class="relative pl-9">
            <span class="absolute top-0 left-0 grid size-6 place-items-center rounded-lg bg-primary-soft text-xs font-extrabold text-primary-strong">{{ PENYAKIT[kode].kriteria.length + 1 }}</span>
            <span class="mb-1.5 block text-sm font-bold">Durasi</span>
            <p class="text-[.95rem]">Keluhan dialami minimal {{ labelDurasi(PENYAKIT[kode].durasiMinimal) }}</p>
        </li>
    </ol>
</template>
