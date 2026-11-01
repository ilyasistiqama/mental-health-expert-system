<script setup>
import { t } from "@/lib/i18n";
import { REFERENCE_LIST } from "@/lib/knowledgeBase";
</script>

<template>
    <div class="container-page max-w-4xl py-10 sm:py-12 2xl:max-w-4xl">
        <header class="mb-8">
            <span class="eyebrow">{{ t("Sumber & Rujukan") }}</span>
            <h1 class="mb-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">{{ t("Daftar pustaka") }}</h1>
            <p class="text-muted">
                {{ t("Materi edukasi dan dasar pertanyaan skrining merujuk pada sumber berikut. Sumber ini bukan bukti bahwa aplikasi dapat mendiagnosis. Nomornya sama dengan rujukan [n] di seluruh halaman.") }}
            </p>
        </header>

        <ol class="grid list-none gap-3 p-0">
            <li v-for="s in REFERENCE_LIST" :id="s.id" :key="s.id" class="card flex scroll-mt-24 gap-4 p-4 sm:p-5">
                <span class="grid size-8 flex-none place-items-center rounded-lg bg-primary-soft text-sm font-extrabold text-primary-strong">{{ s.number }}</span>
                <div class="min-w-0 text-[.95rem]">
                    <p>{{ t(s.author) }} ({{ s.year }}). <em>{{ t(s.title) }}</em>. {{ t(s.publisher) }}.</p>
                    <p v-if="s.url" class="mt-1 text-sm break-all text-muted">
                        <a :href="s.url" target="_blank" rel="noopener">{{ t(s.url) }}</a> {{ t("· diakses") }} {{ t(s.accessedAt) }}
                    </p>
                </div>
            </li>
        </ol>

        <div class="mt-8 rounded-2xl bg-warn-soft p-5 text-[.95rem]">
            <p>
                <strong class="text-warn">{{ t("Catatan:") }}</strong> {{ t("pertanyaan pada sistem ini merupakan penyederhanaan kriteria diagnosis untuk keperluan skrining mandiri dan edukasi, dan belum divalidasi oleh psikolog klinis atau psikiater. Diagnosis hanya dapat ditegakkan oleh psikolog klinis atau psikiater melalui pemeriksaan langsung.") }}
            </p>
        </div>
    </div>
</template>
