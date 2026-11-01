<script setup>
import { language, setLanguage, SUPPORTED_LANGUAGES, t } from "@/lib/i18n";
</script>

<template>
    <label class="inline-flex shrink-0 items-center gap-2 text-sm font-semibold">
        <span class="sr-only">{{ t("Pilih bahasa") }}</span>
        <select
            :value="language"
            @change="setLanguage($event.target.value)"
            class="rounded-full border border-line bg-surface py-2 pr-6 pl-3 text-lg text-ink focus-visible:outline-primary"
            :aria-label="t('Pilih bahasa')"
        >
            <option v-for="option in SUPPORTED_LANGUAGES" :key="option.code" :value="option.code" :lang="option.code" :aria-label="option.label">
                {{ option.flag }}
            </option>
        </select>
    </label>
</template>
