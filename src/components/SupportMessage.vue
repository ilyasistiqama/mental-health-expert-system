<script setup>
import { t } from "@/lib/i18n";
import ReferenceLink from "@/components/ReferenceLink.vue";
import { DISCLAIMER_PARAGRAPHS, DISCLAIMER_TITLE, NEXT_STEPS, REASSURANCE_MESSAGE } from "@/lib/supportMessages";
</script>

<template>
    <section class="rounded-2xl border-2 border-primary bg-primary-soft px-5 py-6 sm:px-7" aria-labelledby="judul-dukungan">
        <div class="mb-3 flex items-center gap-3">
            <svg class="size-7 flex-none text-primary-strong" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
            <h2 id="judul-dukungan" class="text-xl font-extrabold text-primary-strong sm:text-2xl">{{ t(DISCLAIMER_TITLE) }}</h2>
        </div>
        <div class="space-y-2.5">
            <p v-for="(p, i) in DISCLAIMER_PARAGRAPHS" :key="i">
                <template v-if="i === 0"><strong>{{ t(p) }}</strong></template>
                <template v-else>{{ t(p) }}</template>
                <ReferenceLink v-if="i === 2" :ids="['who-anxiety-2026', 'who-depression-2026']" />
            </p>
        </div>

        <h3 class="mt-5 mb-2 font-bold">{{ t("Langkah mencari bantuan profesional") }}</h3>
        <ol class="list-decimal space-y-1.5 pl-5">
            <li v-for="(l, i) in NEXT_STEPS" :key="i">
                {{ t(l) }}<ReferenceLink v-if="i === NEXT_STEPS.length - 1" :ids="['healing119']" />
            </li>
        </ol>

        <p class="mt-5 rounded-xl bg-surface px-4 py-3 text-[.95rem] text-muted">{{ t(REASSURANCE_MESSAGE) }}</p>
    </section>
</template>
