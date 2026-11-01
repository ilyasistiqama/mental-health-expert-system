<script setup>
import { getAnswerQuestion, getLocalizedDurationQuestion } from "@/lib/consultationDisplay";
import { t } from "@/lib/i18n";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import CrisisPanel from "@/components/CrisisPanel.vue";
import { SYMPTOMS, DURATION_OPTIONS } from "@/lib/knowledgeBase";
import { wasProgressReset, getSavedSession, onSessionChange, deleteSession, reloadSession, areSessionsEqual, saveSession } from "@/lib/consultationProgress";
import { undoAnswer, listAnswers, answerQuestion, getNextStep, createSession } from "@/lib/consultationSession";
import { createResult } from "@/lib/consultationResult";
import { confirmAction } from "@/lib/dialog";
import { MINOR_PARAGRAPHS, MINOR_TITLE } from "@/lib/supportMessages";
import ReferenceLink from "@/components/ReferenceLink.vue";

const props = defineProps({
    method: { type: String, required: true },
    target: { type: String, default: null }
});

const router = useRouter();

function resumeOrCreate(savedSession) {
    return savedSession && savedSession.target === props.target ? savedSession : createSession(props.method, props.target);
}

const progressWasReset = ref(wasProgressReset(props.method));
const session = ref(resumeOrCreate(getSavedSession(props.method)));
// petunjuk pengisian tampil sebelum pertanyaan pertama; dilewati jika melanjutkan konsultasi
const ready = ref(session.value.order.length > 0);

const instructions = [
    "Jawablah dengan jujur sesuai yang benar-benar anda rasakan, bukan yang menurut anda seharusnya atau yang diharapkan orang lain. Tidak ada jawaban benar atau salah.",
    "Gunakan periode keluhan yang sama untuk setiap topik. Ikuti frekuensi yang disebut dalam pertanyaan; gejala panik harus terjadi dalam satu serangan yang sama. Untuk suasana hati, pikirkan satu periode yang sama selama dua minggu terakhir.",
    "Anda boleh memilih Kurang yakin atau Lewati. Keduanya tidak dianggap sebagai Tidak. Gunakan Kembali jika ingin mengganti jawaban.",
    "Beberapa pertanyaan menyangkut perasaan sedih, peristiwa yang menyakitkan, atau pikiran tentang menyakiti diri. Jika terasa berat, anda boleh berhenti kapan saja dan menghubungi layanan kesehatan jiwa 119 ext 8.",
    "Isilah di tempat yang tenang tanpa terburu-buru. Anda boleh berhenti kapan saja; jawaban tersimpan dan bisa dilanjutkan.",
    "Jawaban disimpan sementara hanya di perangkat ini dan tidak dikirim ke mana pun. Jika perangkat ini dipakai bersama orang lain, tekan \"Hapus jawaban saya\" saat berhenti di tengah jalan."
];

// pengguna di bawah 18 tahun mendapat pesan khusus sebelum pertanyaan pertama
const showMinorNotice = ref(false);

function start(ageGroup) {
    session.value = { ...session.value, ageGroup };
    if (ageGroup === "minor") showMinorNotice.value = true;
    else ready.value = true;
}
// pesan bantuan tampil begitu pertanyaan krisis (pikiran menyakiti diri) dijawab Ya
const showCrisisPanel = ref(false);

const step = computed(() => getNextStep(session.value));
const progress = computed(() => (session.value.order.length / (session.value.order.length + (step.value.remaining ?? 0))) * 100);
const answers = computed(() => listAnswers(session.value));
const questionElement = ref(null);

// Di layar kecil, tombol jawaban sering berada di bawah kartu. Setelah menjawab, pertanyaan
// berikutnya bisa berada di luar pandangan sehingga hanya tombol yang terlihat. Gulirkan teks
// pertanyaan baru ke area pandang, tanpa mengganggu pengguna desktop.
function scrollToQuestion() {
    if (typeof window === "undefined" || window.innerWidth >= 1024) return;
    const element = questionElement.value;
    if (!element) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    element.scrollIntoView({ behavior: behavior, block: "nearest" });
}

watch(
    [() => session.value.order.length, () => step.value.kind, ready, showMinorNotice, showCrisisPanel],
    async () => {
        await nextTick();
        if (!ready.value || showMinorNotice.value || showCrisisPanel.value || step.value.kind === "complete") return;
        scrollToQuestion();
    }
);

watch(session, saveSession, { immediate: true });

// hasil hanya disimpan di memori; progres dihapus begitu hasil keluar
watch(step, (l) => {
    if (l.kind !== "complete") return;
    createResult(session.value, l);
    deleteSession(props.method);
    router.push("/hasil");
}, { immediate: true });

function selectAnswer(value) {
    if (step.value.kind === "complete") return;
    if (step.value.kind === "symptom" && !SYMPTOMS[step.value.code]) return;
    const crisis = step.value.kind === "symptom" && SYMPTOMS[step.value.code]?.crisis && value === true;
    session.value = answerQuestion(session.value, value);
    if (crisis) showCrisisPanel.value = true;
}

async function restart() {
    const confirmed = session.value.order.length === 0 || await confirmAction({
        title: "Mulai ulang skrining?",
        message: t("{0} jawaban yang sudah anda isi akan dihapus dan pertanyaan dimulai dari awal.", [session.value.order.length]),
        yes: "Ya, mulai ulang",
        no: "Lanjutkan menjawab",
        danger: true
    });
    if (confirmed) session.value = { ...createSession(props.method, props.target), ageGroup: session.value.ageGroup };
}

// untuk perangkat yang dipakai bersama: jawaban dihapus dari perangkat lalu keluar dari konsultasi
async function deleteAndExit() {
    const confirmed = await confirmAction({
        title: "Hapus jawaban anda?",
        message: "Semua jawaban yang sudah anda isi akan dihapus dari perangkat ini, sehingga tidak dapat dilihat orang lain yang memakai perangkat yang sama.",
        yes: "Ya, hapus",
        no: "Batal",
        danger: true
    });
    if (!confirmed) return;
    session.value = createSession(props.method, props.target);
    deleteSession(props.method);
    router.push("/konsultasi");
}

// Tab yang lama tidak aktif (misalnya browser HP ditinggal ke aplikasi lain, atau ada tab kedua)
// bisa menampilkan progres usang. Saat tab aktif kembali, progres dibaca ulang dari penyimpanan.
async function synchronize() {
    const savedSession = await reloadSession(props.method);
    progressWasReset.value = wasProgressReset(props.method);
    if (savedSession?.target !== props.target && savedSession) return;
    const latestSession = resumeOrCreate(savedSession);
    if (!areSessionsEqual(latestSession, session.value)) session.value = latestSession;
    // konsultasi sudah dimulai di tab lain, petunjuk tidak perlu ditampilkan lagi
    if (latestSession.order.length > 0) ready.value = true;
}

function onVisibility() {
    if (document.visibilityState === "visible") synchronize();
}

function onKeydown(e) {
    if (!ready.value || showCrisisPanel.value || showMinorNotice.value || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key.toLowerCase();
    if (step.value.kind === "symptom") {
        if (key === "y") selectAnswer(true);
        else if (key === "t") selectAnswer(false);
    } else if (step.value.kind === "duration" && DURATION_OPTIONS[Number(key) - 1]) {
        selectAnswer(DURATION_OPTIONS[Number(key) - 1].days);
    }
}

let stopListening = null;
onMounted(() => {
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", synchronize);
    stopListening = onSessionChange((method) => method === props.method && synchronize());
});
onUnmounted(() => {
    document.removeEventListener("keydown", onKeydown);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pageshow", synchronize);
    stopListening?.();
});
</script>

<template>
    <section v-if="!ready && !showMinorNotice && step.kind !== 'complete'" class="card px-5 py-7 sm:px-8 sm:py-9" aria-labelledby="judul-petunjuk">
        <p v-if="progressWasReset" role="status" class="mb-4 rounded-xl bg-primary-soft px-4 py-3">{{ t("Pertanyaan skrining sudah diperbarui. Progres versi lama tidak dapat dilanjutkan; silakan mulai skrining baru.") }}</p>
        <h2 id="judul-petunjuk" class="mb-2 text-2xl font-extrabold">{{ t("Sebelum mulai mengisi") }}</h2>
        <p class="mb-4 text-muted">{{ t("Agar jawaban mencerminkan pengalaman anda, perhatikan hal berikut:") }}</p>
        <ol class="mb-5 space-y-3">
            <li v-for="(p, i) in instructions" :key="i" class="flex gap-3">
                <span class="grid size-7 flex-none place-items-center rounded-lg bg-primary-soft text-sm font-extrabold text-primary-strong">{{ i + 1 }}</span>
                <span>{{ t(p) }}</span>
            </li>
        </ol>
        <p class="mb-6 rounded-xl bg-surface-2 px-4 py-3 text-[.95rem] text-muted">
            {{ t("Skrining ini bukan diagnosis dan belum divalidasi sebagai instrumen klinis. Gunakan hasilnya untuk mendorong percakapan dengan profesional.") }}
        </p>
        <p class="mb-5"><RouterLink to="/faq">{{ t("Baca FAQ") }}</RouterLink></p>
        <p class="mb-3 font-bold">{{ t("Berapa usia anda?") }}</p>
        <div class="flex flex-wrap gap-3">
            <button class="btn btn-primary flex-1 py-4 sm:flex-none sm:px-8" type="button" @click="start('adult')">{{ t("18 tahun ke atas, mulai") }}</button>
            <button class="btn btn-ghost flex-1 py-4 sm:flex-none sm:px-8" type="button" @click="start('minor')">{{ t("Di bawah 18 tahun") }}</button>
        </div>
    </section>

    <section v-else-if="showMinorNotice && step.kind !== 'complete'" class="card px-5 py-7 sm:px-8 sm:py-9" aria-labelledby="judul-remaja">
        <h2 id="judul-remaja" class="mb-4 text-2xl font-extrabold">{{ t(MINOR_TITLE) }}</h2>
        <p v-for="(p, i) in MINOR_PARAGRAPHS" :key="i" class="mb-3">
            {{ t(p) }}<ReferenceLink v-if="i === MINOR_PARAGRAPHS.length - 1" :ids="['healing119-faq']" />
        </p>
        <button class="btn btn-primary mt-3 w-full py-4 text-lg sm:w-auto sm:px-8" type="button" @click="showMinorNotice = false; ready = true">{{ t("Saya mengerti, mulai") }}</button>
    </section>

    <CrisisPanel v-else-if="showCrisisPanel && step.kind !== 'complete'" :continue-label="t(&quot;Saya mengerti, lanjutkan pertanyaan&quot;)" @continue="showCrisisPanel = false" />

    <div v-else-if="step.kind !== 'complete'">
        <div class="card px-5 py-7 sm:px-8 sm:py-9" aria-live="polite">
            <div class="mb-5 h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" :aria-valuenow="Math.round(progress)" aria-valuemin="0" aria-valuemax="100">
                <span class="block h-full rounded-full bg-primary transition-[width] duration-300" :style="{ width: t(&quot;{0}%&quot;, [progress]) }"></span>
            </div>

            <div :key="session.order.length" class="animate-enter">
                <div class="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span class="text-sm font-bold text-muted">{{ t("Pertanyaan ke-") }}{{ session.order.length + 1 }}</span>
                    <span class="pill bg-accent-soft text-[.8rem] text-accent">{{ t(step.kind === "duration" ? "Durasi keluhan" : (t(SYMPTOMS[step.code]?.name) || "Gejala")) }}</span>
                </div>
                <p ref="questionElement" class="mb-7 scroll-mt-24 text-xl font-bold sm:text-2xl lg:text-[1.65rem]">
                    {{ t(step.kind === "duration" ? getLocalizedDurationQuestion(step.conditionCode) : (SYMPTOMS[step.code]?.question || "Pertanyaan tidak tersedia. Silakan muat ulang halaman atau mulai ulang skrining.")) }}
                    <ReferenceLink v-if="step.kind === 'symptom'" :ids="SYMPTOMS[step.code]?.references ?? []" />
                </p>
            </div>

            <p v-if="step.kind === 'symptom' && SYMPTOMS[step.code]?.crisis" class="mb-4 rounded-xl bg-warn-soft p-4 text-sm">
                {{ t("Anda boleh tidak menjawab. Jika saat ini merasa tidak aman atau mungkin menyakiti diri, cari pertolongan segera; anda tidak perlu menyelesaikan skrining.") }}
                <RouterLink to="/tentang#professional-help">{{ t("Cara mencari bantuan") }}</RouterLink>
            </p>

            <div v-if="step.kind === 'duration'" class="grid gap-2.5 sm:grid-cols-2">
                <button
                    v-for="(o, i) in DURATION_OPTIONS"
                    :key="o.days"
                    class="btn btn-ghost justify-start rounded-2xl px-4 py-3.5 text-left whitespace-normal hover:border-primary"
                    type="button"
                    @click="selectAnswer(o.days)"
                >
                    <kbd class="hidden rounded-md border border-line bg-surface-2 px-1.5 text-xs md:inline">{{ i + 1 }}</kbd> {{ t(o.label) }}
                </button>
            </div>
            <div v-else class="grid grid-cols-2 gap-3">
                <button class="btn btn-neutral rounded-2xl py-4.5 text-lg" type="button" @click="selectAnswer(true)">{{ t("Ya") }}</button>
                <button class="btn btn-neutral rounded-2xl py-4.5 text-lg" type="button" @click="selectAnswer(false)">{{ t("Tidak") }}</button>
            </div>

            <div class="mt-3 grid grid-cols-2 gap-3">
                <button class="btn btn-neutral rounded-2xl px-3 py-3.5 text-sm whitespace-normal" type="button" @click="selectAnswer('unsure')">{{ t("Kurang yakin") }}</button>
                <button class="btn btn-neutral rounded-2xl px-3 py-3.5 text-sm whitespace-normal" type="button" @click="selectAnswer('skipped')">{{ t("Lewati") }}</button>
            </div>
            <p class="mt-3 text-sm text-muted">{{ t("Anda boleh memilih Kurang yakin atau Lewati. Keduanya tidak dianggap sebagai Tidak. Gunakan Kembali jika ingin mengganti jawaban.") }}</p>

            <div class="mt-5 flex flex-wrap items-center justify-between gap-2">
                <button class="btn-text btn" type="button" :disabled="session.order.length === 0" @click="session = undoAnswer(session)">{{ t("← Kembali") }}</button>
                <span v-if="step.kind === 'symptom'" class="hidden text-sm text-muted md:inline">
                    {{ t("Pintasan:") }} <kbd class="rounded-md border border-line bg-surface-2 px-1.5 text-xs font-bold">Y</kbd> {{ t("Ya ·") }}
                    <kbd class="rounded-md border border-line bg-surface-2 px-1.5 text-xs font-bold">T</kbd> {{ t("Tidak") }}
                </span>
                <span class="flex gap-1">
                    <button class="btn-text btn" type="button" @click="restart">{{ t("Mulai ulang") }}</button>
                    <button class="btn-text btn" type="button" @click="deleteAndExit">{{ t("Hapus jawaban saya") }}</button>
                </span>
            </div>
        </div>

        <!-- tertutup secara bawaan agar jawaban tidak langsung terlihat oleh orang di sekitar -->
        <details v-if="answers.length" class="pt-10">
            <summary class="cursor-pointer text-lg font-bold">{{ t("Lihat jawaban anda sejauh ini (") }}{{ answers.length }})</summary>
            <p class="mt-1 mb-3 text-sm text-muted">{{ t("Jawaban disimpan sementara hanya di perangkat ini agar bisa dilanjutkan, dan dihapus otomatis begitu hasil keluar.") }}</p>
            <ol class="grid list-none gap-2 p-0">
                <li v-for="j in answers" :key="j.code" class="flex flex-col gap-1.5 rounded-xl border border-line bg-surface px-4 py-3 text-[.95rem] sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <span>{{ getAnswerQuestion(j) }}</span>
                    <span class="pill flex-none self-start bg-surface-2 text-muted">{{ t(j.answers) }}</span>
                </li>
            </ol>
        </details>
    </div>
</template>
