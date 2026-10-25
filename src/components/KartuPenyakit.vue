<script setup>
import { PENYAKIT } from "@/lib/sistemPakar";

const props = defineProps({
    id: { type: String, required: true }
});

const penyakit = PENYAKIT[props.id];
</script>

<template>
    <article class="card disease-card">
        <div class="tags">
            <span class="disease-code">{{ id }}</span>
            <span class="disease-category">{{ penyakit.kategori }}</span>
        </div>
        <h3>{{ penyakit.nama }}</h3>
        <p>{{ penyakit.deskripsi }}</p>
        <RouterLink class="link-arrow" :to="{ path: '/backward', query: { id } }">Buktikan dengan Backward Chaining</RouterLink>
    </article>
</template>
