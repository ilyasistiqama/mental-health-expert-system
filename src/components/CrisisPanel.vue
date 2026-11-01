<script setup>
import { t } from "@/lib/i18n";
import ReferenceLink from "@/components/ReferenceLink.vue";
import { CRISIS_PARAGRAPHS, CRISIS_TITLE, CONTACTS_REVIEWED_AT, CRISIS_STEPS } from "@/lib/supportMessages";

defineProps({
    // teks tombol lanjut; tanpa teks, tombol tidak ditampilkan (misalnya di halaman hasil)
    continueLabel: { type: String, default: "" }
});
defineEmits(["continue"]);
</script>

<template>
    <section class="rounded-2xl border-2 border-warn bg-warn-soft px-5 py-6 sm:px-7" role="alert" aria-labelledby="judul-krisis">
        <h2 id="judul-krisis" class="mb-3 text-xl font-extrabold text-warn sm:text-2xl">{{ t(CRISIS_TITLE) }}</h2>
        <p v-for="(p, i) in CRISIS_PARAGRAPHS" :key="i" class="mb-4">{{ t(p) }}<ReferenceLink :ids="['who-media-suicide-2023']" /></p>

        <ol class="mb-5 list-decimal space-y-2 pl-5">
            <li v-for="(l, i) in CRISIS_STEPS" :key="i">
                {{ t(l) }}<ReferenceLink v-if="i === 1" :ids="['healing119', 'healing119-faq']" />
            </li>
        </ol>

        <p class="mb-4 text-sm text-muted">{{ t("Kontak layanan terakhir diperiksa") }} {{ t(CONTACTS_REVIEWED_AT) }}.</p>

        <div class="flex flex-wrap gap-3 print:hidden">
            <a class="btn btn-primary flex-1 sm:flex-none" href="tel:119">{{ t("Telepon 119, lalu ext 8") }}</a>
            <a class="btn btn-ghost flex-1 sm:flex-none" href="https://www.healing119.id/" target="_blank" rel="noopener">{{ t("Buka healing119.id") }}</a>
        </div>

        <div v-if="continueLabel" class="mt-5 border-t border-line pt-4">
            <button class="btn-text btn" type="button" @click="$emit('continue')">{{ t(continueLabel) }}</button>
        </div>
    </section>
</template>
