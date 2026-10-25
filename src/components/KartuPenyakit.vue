<script setup>
import Rujukan from "@/components/Rujukan.vue";
import { PENYAKIT } from "@/lib/sistemPakar";

const props = defineProps({
    id: { type: String, required: true }
});

const penyakit = PENYAKIT[props.id];
</script>

<template>
    <article class="card flex flex-col">
        <div class="mb-3 flex flex-wrap gap-1.5">
            <span class="pill bg-accent-soft text-accent">{{ id }}</span>
            <span class="pill bg-surface-2 text-muted">{{ penyakit.kategori }}</span>
        </div>
        <h3 class="mb-2 text-lg font-bold">{{ penyakit.nama }}</h3>
        <p class="mb-4 flex-1 text-[.95rem] text-muted">
            {{ penyakit.deskripsi }}<Rujukan :ids="penyakit.sumber.slice(0, 2)" />
        </p>
        <RouterLink class="font-bold no-underline hover:underline" :to="{ path: '/backward', query: { id } }">
            Buktikan dengan Backward Chaining →
        </RouterLink>
    </article>
</template>
