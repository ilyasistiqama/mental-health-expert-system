<script setup>
import { t } from "@/lib/i18n";
import { FAQ_ITEMS } from "@/lib/screeningHelp";
import ReferenceLink from "@/components/ReferenceLink.vue";
</script>

<template>
    <div class="container-page max-w-3xl py-10 sm:py-12 2xl:max-w-3xl">
        <header class="mb-8">
            <span class="eyebrow">FAQ</span>
            <h1 class="mb-3 text-3xl font-extrabold sm:text-4xl">{{ t("Pertanyaan yang sering diajukan") }}</h1>
            <p class="text-lg text-muted">{{ t("Kenali tujuan skrining, pilihan jawaban, privasi, dan cara mencari bantuan.") }}</p>
        </header>
        <div class="space-y-3">
            <details v-for="item in FAQ_ITEMS" :id="item.id" :key="item.id" class="card scroll-mt-24">
                <summary class="cursor-pointer font-bold">{{ t(item.question) }}</summary>
                <p class="mt-3 text-muted">{{ t(item.answer) }}<ReferenceLink v-if="item.id === 'urgent-help'" :ids="['healing119-faq']" /></p>
            </details>
        </div>
        <div class="mt-8 flex flex-wrap gap-3">
            <RouterLink class="btn btn-primary whitespace-normal" to="/tentang#first-consultation">{{ t("Panduan konsultasi pertama") }}</RouterLink>
            <RouterLink class="btn btn-ghost" to="/tentang#professional-help">{{ t("Cara mencari bantuan") }}</RouterLink>
        </div>
    </div>
</template>
