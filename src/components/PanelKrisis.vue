<script setup>
import Rujukan from "@/components/Rujukan.vue";
import { ISI_KRISIS, JUDUL_KRISIS, KONTAK_DIPERIKSA, LANGKAH_KRISIS } from "@/lib/pesanDukungan";

defineProps({
    // teks tombol lanjut; tanpa teks, tombol tidak ditampilkan (misalnya di halaman hasil)
    lanjut: { type: String, default: "" }
});
defineEmits(["lanjut"]);
</script>

<template>
    <section class="rounded-2xl border-2 border-warn bg-warn-soft px-5 py-6 sm:px-7" role="alert" aria-labelledby="judul-krisis">
        <h2 id="judul-krisis" class="mb-3 text-xl font-extrabold text-warn sm:text-2xl">{{ JUDUL_KRISIS }}</h2>
        <p v-for="(p, i) in ISI_KRISIS" :key="i" class="mb-4">{{ p }}<Rujukan :ids="['who-media-suicide-2023']" /></p>

        <ol class="mb-5 list-decimal space-y-2 pl-5">
            <li v-for="(l, i) in LANGKAH_KRISIS" :key="i">
                {{ l }}<Rujukan v-if="i === 1" :ids="['healing119', 'healing119-faq']" />
            </li>
        </ol>

        <p class="mb-4 text-sm text-muted">Kontak layanan terakhir diperiksa {{ KONTAK_DIPERIKSA }}.</p>

        <div class="flex flex-wrap gap-3 print:hidden">
            <a class="btn btn-primary flex-1 sm:flex-none" href="tel:119">Telepon 119, lalu ext 8</a>
            <a class="btn btn-ghost flex-1 sm:flex-none" href="https://www.healing119.id/" target="_blank" rel="noopener">Buka healing119.id</a>
        </div>

        <div v-if="lanjut" class="mt-5 border-t border-line pt-4">
            <button class="btn-text btn" type="button" @click="$emit('lanjut')">{{ lanjut }}</button>
        </div>
    </section>
</template>
