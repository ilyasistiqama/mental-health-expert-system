<script setup>
import { t } from "@/lib/i18n";
import { SYMPTOMS, CONDITIONS } from "@/lib/knowledgeBase";
import { formatDuration } from "@/lib/consultationDisplay";

defineProps({
    code: { type: String, required: true }
});

function label(k) {
    if (k.minimum < k.symptoms.length) return t("Minimal {0} dari {1} gejala berikut", [k.minimum, k.symptoms.length]);
    return k.symptoms.length > 1 ? "Semua gejala berikut" : "Gejala";
}
</script>

<template>
    <ol class="m-0 grid list-none gap-3.5 p-0">
        <li v-for="(k, i) in CONDITIONS[code].criteria" :key="i" class="relative pl-9">
            <span class="absolute top-0 left-0 grid size-6 place-items-center rounded-lg bg-primary-soft text-xs font-extrabold text-primary-strong">{{ i + 1 }}</span>
            <span class="mb-1.5 block text-sm font-bold">{{ t(label(k)) }}</span>
            <ul class="grid list-none gap-1 p-0 text-[.95rem]">
                <li v-for="g in k.symptoms" :key="g" class="relative pl-5 before:absolute before:top-[.6em] before:left-1 before:size-2 before:rounded-full before:bg-accent">
                    {{ t(SYMPTOMS[g].name) }}
                    <span v-if="SYMPTOMS[g].sources" class="block text-sm text-muted">{{ t("salah satu dari:") }} {{ t(SYMPTOMS[g].sources.map((k) => t(SYMPTOMS[k].name).toLowerCase()).join(", ")) }}</span>
                </li>
            </ul>
        </li>
        <li v-if="CONDITIONS[code].minimumDuration > 0" class="relative pl-9">
            <span class="absolute top-0 left-0 grid size-6 place-items-center rounded-lg bg-primary-soft text-xs font-extrabold text-primary-strong">{{ CONDITIONS[code].criteria.length + 1 }}</span>
            <span class="mb-1.5 block text-sm font-bold">{{ t("Durasi") }}</span>
            <p class="text-[.95rem]">{{ t("Keluhan dialami minimal") }} {{ formatDuration(CONDITIONS[code].minimumDuration) }}</p>
        </li>
    </ol>
</template>
