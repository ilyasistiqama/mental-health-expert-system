<script setup>
import { t } from "@/lib/i18n";
import ReferenceLink from "@/components/ReferenceLink.vue";
import { CONSULTATION_GUIDE_INTRO, CONSULTATION_GUIDE_PROMPTS, CONSULTATION_GUIDE_EXAMPLE } from "@/lib/screeningHelp";
</script>

<template>
    <section id="first-consultation" class="card scroll-mt-24" aria-labelledby="first-consultation-title">
        <span class="eyebrow">{{ t("Panduan konsultasi pertama") }}</span>
        <h2 id="first-consultation-title" class="mb-3 text-xl font-extrabold sm:text-2xl">{{ t("Bingung harus mulai bercerita dari mana?") }}</h2>
        <p class="mb-4 text-muted">{{ t(CONSULTATION_GUIDE_INTRO) }}</p>
        <ul class="mb-5 list-disc space-y-2 pl-5">
            <li v-for="prompt in CONSULTATION_GUIDE_PROMPTS" :key="prompt">{{ t(prompt) }}</li>
        </ul>
        <div class="rounded-xl bg-surface-2 p-4 sm:p-5">
            <h3 class="mb-2 font-bold">{{ t("Contoh pembuka percakapan") }}</h3>
            <blockquote class="m-0 border-l-2 border-primary pl-4">{{ t(CONSULTATION_GUIDE_EXAMPLE) }}</blockquote>
            <p class="mt-3 text-sm text-muted">{{ t("Contoh ini hanya panduan umum, bukan kesimpulan tentang diri anda.") }}<ReferenceLink :ids="['nimh-consultation-preparation']" /></p>
        </div>
    </section>
</template>
