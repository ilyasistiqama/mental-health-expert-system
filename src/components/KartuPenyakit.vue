<script setup>
import { PENYAKIT } from "@/data/pengetahuan";

const props = defineProps({
    id: { type: String, required: true }
});

const penyakit = PENYAKIT[props.id];
</script>

<template>
    <article class="card disease-card">
        <span class="disease-code">{{ id }}</span>
        <h3>{{ penyakit.nama }}</h3>
        <p>{{ penyakit.deskripsi }}</p>
        <RouterLink class="link-arrow" :to="{ path: '/backward', query: { id } }">Lihat gejala</RouterLink>
    </article>
</template>
