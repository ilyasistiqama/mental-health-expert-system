<script setup>
import { t } from "@/lib/i18n";
import { METHOD_INFO, getMethodRoute } from "@/lib/consultationDisplay";
import { CONDITIONS } from "@/lib/knowledgeBase";
import { getSavedSession } from "@/lib/consultationProgress";

const forwardSession = getSavedSession("forward");
const backwardSession = getSavedSession("backward");

const method = [
    {
        id: "forward",
        tag: "Direkomendasikan",
        body: "Ingin melihat keluhan secara umum? Jawab pertanyaan dari berbagai topik untuk membantu mempersiapkan percakapan dengan profesional.",
        points: ["Membahas keluhan dari beberapa topik", "Menyusun topik yang dapat dibicarakan dengan profesional"],
        primary: true
    },
    {
        id: "backward",
        tag: "Lebih singkat",
        body: "Pilih satu topik yang ingin anda pahami. Jawaban menjadi bahan refleksi dan tidak memastikan apakah anda memiliki gangguan tersebut.",
        points: ["Berfokus pada satu topik keluhan", "Pertanyaan menyesuaikan jawaban anda"],
        primary: false
    }
];
</script>

<template>
    <div class="container-page py-10 sm:py-12">
        <header class="mb-8 max-w-3xl">
            <span class="eyebrow">{{ t("Skrining") }}</span>
            <h1 class="mb-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">{{ t("Pilih jenis pemeriksaan") }}</h1>
            <p class="text-muted">
                {{ t("Pilih skrining menyeluruh atau fokus pada satu topik. Pertanyaan tentang keluhan dan durasi membantu menyusun bahan percakapan dengan profesional, bukan menetapkan diagnosis. Hasil tidak disimpan.") }}
            </p>
        </header>

        <div class="mb-6 flex items-start gap-3 rounded-2xl border border-primary bg-primary-soft px-5 py-4 text-[.95rem]" role="note">
            <svg class="mt-0.5 size-5 flex-none text-primary-strong" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
            <p>
                <strong>{{ t("Sebelum mulai:") }}</strong> {{ t("sistem ini hanya membantu refleksi dan edukasi tentang keluhan, tanpa memberi label penyakit atau penilaian atas diri anda. Gunakan hasil untuk memulai percakapan dengan profesional. Anda boleh berhenti atau langsung mencari bantuan kapan saja.") }}
                <RouterLink to="/tentang">{{ t("Baca batasan sistem ini") }}</RouterLink>.
            </p>
        </div>

        <p class="mb-6"><RouterLink class="btn btn-ghost" to="/tentang#professional-help">{{ t("Cari bantuan tanpa menyelesaikan skrining") }}</RouterLink></p>

        <div class="mb-6 grid gap-4">
            <div v-if="forwardSession?.order.length" class="card flex flex-col gap-3 border-primary sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 class="font-bold">{{ t("Lanjutkan") }} {{ t(METHOD_INFO.forward.name) }}?</h3>
                    <p class="text-muted">{{ t("Anda sudah menjawab") }} {{ forwardSession.order.length }} {{ t("pertanyaan sebelumnya.") }}</p>
                </div>
                <RouterLink class="btn btn-primary" :to="getMethodRoute('forward')">{{ t("Lanjutkan") }}</RouterLink>
            </div>
            <div v-if="backwardSession?.order.length && CONDITIONS[backwardSession.target]" class="card flex flex-col gap-3 border-primary sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 class="font-bold">{{ t("Lanjutkan cek") }} {{ t(CONDITIONS[backwardSession.target].name) }}?</h3>
                    <p class="text-muted">{{ t("Anda sudah menjawab") }} {{ backwardSession.order.length }} {{ t("pertanyaan sebelumnya.") }}</p>
                </div>
                <RouterLink class="btn btn-primary" :to="getMethodRoute('backward', backwardSession.target)">{{ t("Lanjutkan") }}</RouterLink>
            </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
            <article v-for="m in method" :key="m.id" class="card flex flex-col">
                <span class="pill mb-2 self-start" :class="m.primary ? 'bg-primary-soft text-primary-strong' : 'bg-accent-soft text-accent'">{{ t(m.tag) }}</span>
                <h2 class="mb-2 text-2xl font-extrabold">{{ t(METHOD_INFO[m.id].name) }}</h2>
                <p class="mb-3 flex-1 text-muted">{{ t(m.body) }}</p>
                <ul class="mb-5 list-disc pl-5 text-[.95rem] text-muted">
                    <li v-for="p in m.points" :key="p">{{ t(p) }}</li>
                </ul>
                <RouterLink class="btn" :class="m.primary ? 'btn-primary' : 'btn-ghost'" :to="getMethodRoute(m.id)">{{ t("Mulai") }} {{ t(METHOD_INFO[m.id].name) }}</RouterLink>
                <p class="mt-3 text-center text-xs text-muted">{{ t("Metode sistem pakar:") }} {{ t(METHOD_INFO[m.id].technicalName) }}</p>
            </article>
        </div>
    </div>
</template>
