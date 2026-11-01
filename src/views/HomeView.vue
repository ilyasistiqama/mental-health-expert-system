<script setup>
import { t } from "@/lib/i18n";
import ImportantNote from "@/components/ImportantNote.vue";
import ConditionCard from "@/components/ConditionCard.vue";
import ReferenceLink from "@/components/ReferenceLink.vue";
import { listConditions } from "@/lib/knowledgeBase";

const step = [
    { title: "Pilih jenis pemeriksaan", body: "Pilih Skrining Menyeluruh untuk merefleksikan keluhan secara umum, atau Skrining Topik Tertentu untuk mempelajari satu topik." },
    { title: "Jawab dengan jujur", body: "Jawaban bisa dibatalkan kapan saja, dan skrining bisa dilanjutkan jika browser tertutup." },
    { title: "Lihat hasil & langkah bantuan", body: "Baca ringkasan skrining dan langkah mencari bantuan profesional. Hasil hanya ditampilkan sementara dan tidak disimpan." }
];
</script>

<template>
    <section class="relative overflow-hidden py-12 sm:py-16 lg:py-20">
        <div class="absolute -top-32 -right-20 -z-10 size-[420px] rounded-full bg-primary-soft opacity-50 blur-3xl" aria-hidden="true"></div>
        <div class="absolute -bottom-36 -left-24 -z-10 size-80 rounded-full bg-accent-soft opacity-50 blur-3xl" aria-hidden="true"></div>

        <div class="container-page grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
            <div>
                <span class="eyebrow">{{ t("Skrining Mandiri · Edukasi") }}</span>
                <h1 class="mb-4 text-4xl font-extrabold sm:text-5xl xl:text-6xl">{{ t("Kenali keluhan anda, ambil langkah mencari bantuan") }}</h1>
                <p class="mb-7 max-w-xl text-lg text-muted">
                    {{ t("Kecemasan dan depresi adalah gangguan mental yang paling umum di dunia. Sekitar 470 juta orang hidup dengan gangguan kecemasan") }}<ReferenceLink :ids="['who-anxiety-2026']" /> {{ t("dan sekitar 322 juta orang dengan depresi,") }}<ReferenceLink :ids="['who-depression-2026']" />
                    {{ t("namun sebagian besar belum mendapat penanganan. Skrining awal ini membantu anda memikirkan keluhan dan mendorong anda mencari bantuan profesional.") }}
                </p>
                <div class="flex flex-wrap gap-3">
                    <RouterLink class="btn btn-primary flex-1 px-7 py-4 text-[1.05rem] sm:flex-none" to="/konsultasi">{{ t("Mulai Skrining") }}</RouterLink>
                    <RouterLink class="btn btn-ghost flex-1 px-7 py-4 text-[1.05rem] sm:flex-none" to="/tentang#professional-help">{{ t("Cara mencari bantuan") }}</RouterLink>
                </div>
            </div>
            <div class="card rotate-0 p-7 lg:rotate-[1.5deg]" aria-hidden="true">
                <span class="text-xs font-bold text-muted">{{ t("Pertanyaan ke-1") }}</span>
                <h3 class="mt-2.5 mb-5 text-lg font-bold">{{ t("Apakah anda merasa khawatir secara berlebihan tentang banyak hal sehari-hari hampir setiap hari?") }}</h3>
                <div class="flex gap-2.5">
                    <span class="flex-1 rounded-xl border border-control-line bg-surface py-2.5 text-center font-bold text-ink">{{ t("Ya") }}</span>
                    <span class="flex-1 rounded-xl border border-control-line bg-surface py-2.5 text-center font-bold text-ink">{{ t("Tidak") }}</span>
                </div>
            </div>
        </div>
    </section>

    <section class="py-10 sm:py-14">
        <div class="container-page">
            <div class="mb-7 max-w-2xl">
                <span class="eyebrow">{{ t("Cara kerja") }}</span>
                <h2 class="text-2xl font-extrabold sm:text-3xl">{{ t("Tiga langkah sederhana") }}</h2>
            </div>
            <div class="grid gap-4 md:grid-cols-3">
                <div v-for="(l, i) in step" :key="i" class="card">
                    <span class="mb-4 grid size-8 place-items-center rounded-lg bg-primary-soft font-extrabold text-primary-strong">{{ i + 1 }}</span>
                    <h3 class="mb-1 text-lg font-bold">{{ t(l.title) }}</h3>
                    <p class="text-[.95rem] text-muted">{{ t(l.body) }}</p>
                </div>
            </div>
        </div>
    </section>

    <section class="py-10 sm:py-14">
        <div class="container-page">
            <div class="mb-7 max-w-2xl">
                <span class="eyebrow">{{ t("Basis pengetahuan") }}</span>
                <h2 class="mb-2 text-2xl font-extrabold sm:text-3xl">{{ listConditions().length }} {{ t("topik dalam skrining") }}</h2>
                <p class="text-muted">
                    {{ t("Pertanyaan merujuk pada DSM-5-TR, ICD-11, dan PPDGJ-III untuk edukasi. Sistem ini belum divalidasi sebagai instrumen skrining klinis.") }}<ReferenceLink :ids="['dsm5tr', 'icd11', 'ppdgj3']" />
                </p>
            </div>
            <p class="mb-5 max-w-3xl rounded-xl bg-surface-2 px-4 py-3 text-sm text-muted">{{ t("Nama gangguan di bagian ini adalah topik edukasi, bukan label untuk anda. Keluhan yang mirip dapat memiliki penyebab berbeda dan perlu dibicarakan dengan profesional.") }}</p>
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <ConditionCard v-for="id in listConditions()" :key="id" :id="id" />
            </div>
        </div>
    </section>

    <section class="py-10 sm:py-14">
        <div class="container-page">
            <ImportantNote>{{ t("skrining ini tidak menetapkan atau menyingkirkan gangguan. Jika keluhan mengganggu keseharian atau membuat anda khawatir, cari bantuan psikolog klinis, psikiater, atau puskesmas, apa pun hasilnya.") }}</ImportantNote>
        </div>
    </section>
</template>
