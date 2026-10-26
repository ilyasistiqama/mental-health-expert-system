<script setup>
import Rujukan from "@/components/Rujukan.vue";
import { ISI_DISCLAIMER, JUDUL_DISCLAIMER, LANGKAH_SELANJUTNYA, PESAN_TENANG } from "@/lib/pesanDukungan";
</script>

<template>
    <section class="rounded-2xl border-2 border-primary bg-primary-soft px-5 py-6 sm:px-7" aria-labelledby="judul-dukungan">
        <div class="mb-3 flex items-center gap-3">
            <svg class="size-7 flex-none text-primary-strong" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
            <h2 id="judul-dukungan" class="text-xl font-extrabold text-primary-strong sm:text-2xl">{{ JUDUL_DISCLAIMER }}</h2>
        </div>
        <div class="space-y-2.5">
            <p v-for="(p, i) in ISI_DISCLAIMER" :key="i">
                <template v-if="i === 0"><strong>{{ p }}</strong></template>
                <template v-else>{{ p }}</template>
                <Rujukan v-if="i === 2" :ids="['who-anxiety-2026', 'who-depression-2026']" />
            </p>
        </div>

        <h3 class="mt-5 mb-2 font-bold">Langkah yang bisa anda ambil</h3>
        <ol class="list-decimal space-y-1.5 pl-5">
            <li v-for="(l, i) in LANGKAH_SELANJUTNYA" :key="i">
                {{ l }}<Rujukan v-if="i === LANGKAH_SELANJUTNYA.length - 1" :ids="['healing119']" />
            </li>
        </ol>

        <p class="mt-5 rounded-xl bg-surface px-4 py-3 text-[.95rem] text-muted">{{ PESAN_TENANG }}</p>
    </section>
</template>
