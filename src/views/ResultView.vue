<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { t } from "@/lib/i18n";
import ConsultationGuide from "@/components/ConsultationGuide.vue";
import CrisisPanel from "@/components/CrisisPanel.vue";
import SupportMessage from "@/components/SupportMessage.vue";
import ReferenceLink from "@/components/ReferenceLink.vue";
import { confirmAction } from "@/lib/dialog";
import { MINOR_PARAGRAPHS, MINOR_TITLE } from "@/lib/supportMessages";
import { CONDITIONS } from "@/lib/knowledgeBase";
import { formatDate, getResultTitle, getNoTopicSummary, getMethodName, getAnswerQuestion } from "@/lib/consultationDisplay";
import { latestResult } from "@/lib/consultationResult";

const entry = latestResult;
const deferredCount = computed(() => Object.keys(entry.value?.deferredAnswers ?? {}).length);
// These are discussion topics, never diagnoses or a personalised treatment plan.
const discussionTopics = computed(() => [...new Set([...(entry.value?.conditions ?? []), ...(entry.value?.insufficientDuration ?? [])])]
    .filter(code => CONDITIONS[code]).map(code => CONDITIONS[code]));

function clearResult() { latestResult.value = null; }
onMounted(() => window.addEventListener("pagehide", clearResult));
onUnmounted(() => {
    window.removeEventListener("pagehide", clearResult);
    clearResult();
});

onBeforeRouteLeave(async () => {
    if (!entry.value) return true;
    const leave = await confirmAction({
        title: "Tinggalkan hasil skrining?",
        message: "Hasil skrining hanya ada di halaman ini dan akan dihapus saat anda meninggalkannya. Anda tetap dapat mencari bantuan profesional tanpa membawa hasil ini.",
        yes: "Tinggalkan", no: "Tetap di sini"
    });
    if (leave) latestResult.value = null;
    return leave;
});
</script>

<template>
    <div class="container-page max-w-4xl py-8 sm:py-10">
        <header v-if="!entry" class="card max-w-2xl">
            <h1 class="mb-3 text-3xl font-extrabold">{{ t("Hasil tidak tersedia") }}</h1>
            <p class="mb-5 text-muted">{{ t("Hasil skrining tidak disimpan dan hilang setelah halaman ditutup, dimuat ulang, atau ditinggalkan. Anda dapat mengulang skrining atau langsung mencari bantuan profesional.") }}</p>
            <div class="flex flex-wrap gap-3">
                <RouterLink class="btn btn-primary" to="/tentang#professional-help">{{ t("Cara mencari bantuan") }}</RouterLink>
                <RouterLink class="btn btn-ghost" to="/konsultasi">{{ t("Mulai Skrining") }}</RouterLink>
            </div>
        </header>

        <div v-else class="space-y-5">
            <CrisisPanel v-if="entry.crisis" />
            <section class="rounded-2xl border border-line bg-primary-soft px-5 py-7 sm:px-8">
                <span class="eyebrow">{{ t("Hasil skrining awal") }}</span>
                <h1 class="mb-3 text-2xl font-extrabold sm:text-3xl">{{ getResultTitle(entry) }}</h1>

                <section v-if="discussionTopics.length" class="mb-5 rounded-xl border border-line bg-surface p-4 sm:p-5" aria-labelledby="discussion-topics-title">
                    <h2 id="discussion-topics-title" class="mb-3 text-xl font-extrabold">{{ t("Topik yang dapat dibicarakan dengan profesional") }}</h2>
                    <ul class="grid gap-2 sm:grid-cols-2">
                        <li v-for="topic in discussionTopics" :key="topic.code" class="rounded-xl bg-surface-2 px-4 py-3 font-semibold">{{ t(topic.name) }}</li>
                    </ul>
                    <p class="mt-4 text-sm text-muted">{{ t("Beberapa jawaban berkaitan dengan topik berikut. Daftar ini hanya bahan percakapan, bukan daftar penyakit yang anda miliki. Profesional perlu menilai keluhan, riwayat, dan kemungkinan penyebab lain secara langsung.") }}</p>
                    <p v-if="entry.insufficientDuration.length" class="mt-4 text-muted">{{ t("Ada keluhan yang belum mencapai durasi pada aturan skrining. Hal ini tidak berarti keluhan tersebut ringan atau aman diabaikan. Anda tidak perlu menunggu lebih lama untuk mencari bantuan.") }}</p>
                </section>

                <section v-else id="no-topic-summary" class="mb-5 rounded-xl border border-line bg-surface p-4 sm:p-5" aria-labelledby="reflection-prompts-title">
                    <p class="mb-3">{{ getNoTopicSummary(entry) }}</p>
                    <p class="mb-4 text-sm text-muted">{{ t("Ini bukan pernyataan bahwa anda sehat atau bebas dari gangguan. Skrining memiliki keterbatasan, dan keluhan yang anda rasakan tetap layak didengarkan.") }}</p>
                    <p v-if="entry.crisis" class="mb-4 font-semibold text-warn">{{ t("Tidak adanya topik khusus tidak mengurangi pentingnya mencari bantuan. Gunakan kontak bantuan di atas jika anda merasa tidak aman.") }}</p>
                    <h2 id="reflection-prompts-title" class="mb-2 font-bold">{{ t("Yang tetap bisa anda ceritakan kepada profesional") }}</h2>
                    <ul class="list-disc space-y-2 pl-5 text-sm text-muted">
                        <li>{{ t("Hal yang membuat anda tidak nyaman atau ingin anda pahami.") }}</li>
                        <li>{{ t("Kapan keluhan mulai terasa dan pengaruhnya pada keseharian.") }}</li>
                        <li>{{ t("Dukungan yang anda butuhkan atau pertanyaan yang ingin anda ajukan.") }}</li>
                    </ul>
                </section>

                <section v-if="deferredCount" id="incomplete-information" class="mb-5 rounded-xl border border-line bg-surface p-4" aria-labelledby="incomplete-information-title">
                    <h2 id="incomplete-information-title" class="mb-2 font-bold">{{ t("Informasi yang belum lengkap") }}</h2>
                    <p class="text-sm text-muted">{{ t("Ada {0} pertanyaan dengan pilihan Kurang yakin atau Lewati. Pilihan tersebut tetap dicatat sebagai belum diketahui, bukan Tidak.", [deferredCount]) }}</p>
                    <p v-if="entry.incompleteConditions?.length" class="mt-2 text-sm text-muted">{{ t("Sebagian topik belum dapat dirangkum karena informasi belum lengkap. Anda tetap dapat membicarakan keluhan dengan profesional tanpa mengulang atau melengkapi skrining.") }}</p>
                    <p v-if="entry.hasUnansweredSafetyQuestion" class="mt-3 rounded-lg bg-warn-soft p-3 text-sm">{{ t("Pertanyaan tentang keselamatan belum dijawab dengan pasti. Aplikasi ini tidak dapat menilai apakah anda aman. Jika merasa tidak aman atau mungkin menyakiti diri, segera cari bantuan melalui kontak yang tersedia.") }} <a href="#professional-help">{{ t("Cara mencari bantuan") }}</a></p>
                </section>

                <p class="mb-3 text-muted">{{ t("Skrining ini hanya membantu mengenali keluhan dari jawaban anda. Hasilnya tidak menetapkan atau menyingkirkan gangguan, tidak menentukan tingkat keparahan, dan bukan surat rujukan medis.") }}</p>
                <p class="mb-5 text-muted"><strong>{{ t("Jika keluhan mengganggu keseharian, menetap, atau membuat anda khawatir, hubungi psikolog klinis, psikiater, atau puskesmas, apa pun hasil skriningnya.") }}</strong></p>
                <p class="mb-5 text-sm text-muted">{{ getMethodName(entry.method) }} · {{ formatDate(entry.timestamp) }}</p>
                <div class="flex flex-wrap gap-3">
                    <a href="#professional-help" class="btn btn-primary">{{ t("Cara mencari bantuan") }}</a>
                    <RouterLink class="btn btn-ghost" to="/konsultasi">{{ t("Ulangi skrining") }}</RouterLink>
                </div>
            </section>

            <SupportMessage id="professional-help" class="scroll-mt-24" />

            <ConsultationGuide />

            <section v-if="entry.isMinor" class="card border-accent" aria-labelledby="minor-title">
                <h2 id="minor-title" class="mb-3 text-xl font-extrabold">{{ t(MINOR_TITLE) }}</h2>
                <p v-for="(paragraph, index) in MINOR_PARAGRAPHS" :key="index" class="mb-2 last:mb-0">
                    {{ t(paragraph) }}<ReferenceLink v-if="index === MINOR_PARAGRAPHS.length - 1" :ids="['healing119-faq']" />
                </p>
            </section>

            <section v-if="entry.answers.length" class="card">
                <details>
                    <summary class="cursor-pointer font-bold">{{ t("Lihat jawaban anda ({0} pertanyaan)", [entry.answers.length]) }}</summary>
                    <ol class="mt-4 grid list-none gap-2 p-0">
                        <li v-for="answer in entry.answers" :key="answer.code" class="flex flex-col gap-2 rounded-xl border border-line p-4 sm:flex-row sm:justify-between">
                            <span>{{ getAnswerQuestion(answer) }}</span>
                            <span class="pill self-start bg-surface-2">{{ t(answer.answers) }}</span>
                        </li>
                    </ol>
                </details>
            </section>

            <p class="rounded-xl border border-line px-5 py-4 text-sm text-muted" role="note">{{ t("Hasil hanya ditampilkan sementara di halaman ini. Tidak ada riwayat hasil atau fitur ekspor. Saat anda meninggalkan atau memuat ulang halaman, hasil tidak dapat dibuka kembali.") }}</p>
        </div>
    </div>
</template>
