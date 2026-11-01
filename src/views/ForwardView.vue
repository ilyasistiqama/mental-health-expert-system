<script setup>
import { t } from "@/lib/i18n";
import ConsultationSession from "@/components/ConsultationSession.vue";
</script>

<template>
    <div class="container-page max-w-3xl py-8 sm:py-10 2xl:max-w-3xl">
        <header class="mb-6">
            <span class="eyebrow">{{ t("Skrining Menyeluruh") }}</span>
            <h1 class="mb-3 text-3xl font-extrabold sm:text-4xl">{{ t("Jawab sesuai yang anda alami") }}</h1>
            <p class="text-muted">
                {{ t("Jawab pertanyaan tentang keluhan anda sebagai bahan refleksi sebelum berbicara dengan profesional. Hasil tidak menentukan apakah anda memiliki gangguan. Beberapa pertanyaan menyangkut pengalaman sulit; anda boleh berhenti kapan saja.") }}
            </p>
        </header>

        <ConsultationSession method="forward" />
    </div>
</template>
