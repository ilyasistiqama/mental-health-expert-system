// Alur utama: buat sesi -> tentukan langkah -> catat jawaban -> ulangi sampai selesai.
// Seluruh fungsi di sini JavaScript biasa; tidak memakai Vue atau penyimpanan browser.
import { KNOWLEDGE_VERSION, RULES, SYMPTOM_LIST, SYMPTOMS, CONDITIONS, DURATION_OPTIONS } from "./knowledgeBase.js";
import { getSourceSymptoms, deriveFacts, getRuleStatus, getRelevantSymptoms, getUnansweredCrisisSymptoms } from "./rules.js";
import { runForwardInference, selectForwardQuestion } from "./forwardChaining.js";
import { selectBackwardQuestion } from "./backwardChaining.js";

export const DURATION_PREFIX = "duration:";
export const DEFERRED_ANSWERS = { unsure: "Kurang yakin", skipped: "Dilewati" };
export function isDeferredAnswer(value) { return Object.hasOwn(DEFERRED_ANSWERS, value); }

// sesi = { metode: "forward" | "backward", target, fakta: { G01: true, ... }, durasi: { P1: hari },
//         urutan: [kode yang dijawab], acak: [urutan acak pertanyaan penyaring], usia: "dewasa" | "remaja" }
// acak: forward = urutan acak pertanyaan penyaring, backward = urutan acak seluruh gejala hipotesis
export function createSession(method, target = null) {
    const questionOrder = method === "forward" ? shuffle(getScreeningSymptoms()) : shuffleTargetSymptoms(target);
    return { knowledgeVersion: KNOWLEDGE_VERSION, method, target, facts: {}, duration: {}, deferredAnswers: {}, order: [], questionOrder };
}

// gejala bertanda "akhir" (misalnya dampak ke kehidupan sehari-hari) selalu ditanyakan paling akhir
function shuffleTargetSymptoms(target) {
    const rule = RULES.filter((a) => a.conditionCode === target);
    if (rule.length === 0) return [];

    const questionOrder = shuffle([...new Set(rule.flatMap((a) => a.criteria.flatMap((k) => k.symptoms.flatMap(getSourceSymptoms))))]);
    return [...questionOrder.filter((k) => !SYMPTOMS[k]?.askLast), ...questionOrder.filter((k) => SYMPTOMS[k]?.askLast)];
}

// pertanyaan penyaring = gejala pada kriteria pertama setiap aturan
function getScreeningSymptoms() {
    const screening = new Set(RULES.flatMap((a) => a.criteria[0].symptoms.flatMap(getSourceSymptoms)));
    return SYMPTOM_LIST.map((g) => g.code).filter((k) => screening.has(k));
}

function randomInteger(limit) {
    if (globalThis.crypto?.getRandomValues) {
        return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] % limit;
    }
    return Math.floor(Math.random() * limit);
}

// Fisher-Yates shuffle
function shuffle(list) {
    const result = [...list];
    for (let i = result.length - 1; i > 0; i--) {
        const j = randomInteger(i + 1);
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// forward chaining memakai semua aturan, backward chaining hanya aturan hipotesis
function getCandidateRules(session) {
    return session.method === "backward" ? RULES.filter((a) => a.conditionCode === session.target) : RULES;
}

// Menentukan pertanyaan berikutnya, atau kesimpulan jika inferensi selesai.
//
// Forward chaining memakai semua aturan dan working memory hasil penutupan fakta. Aturan yang
// premisnya terpenuhi di-fire ke working memory; durasi menjadi gerbang akhir. Pertanyaan dipilih
// dari aturan yang masih terbuka: tuntaskan aturan yang pertanyaan penyaringnya sudah Ya, atau
// tanyakan penyaring berikutnya sesuai urutan acak.
//
// Backward chaining memakai aturan hipotesis saja. Pertanyaan berasal dari pembuktian rekursif
// tujuan (aturan -> kriteria -> subgoal gejala/fakta antara).
//
// Prioritas:
// 1. durasi untuk aturan yang kriterianya terpenuhi (kecuali penyakit sudah disimpulkan aturan lain),
// 2. backward: pertanyaan dari pembuktian tujuan,
// 3. forward: tuntaskan aturan yang penyaringnya sudah terpenuhi, atau tanyakan penyaring berikutnya,
// 4. gejala krisis yang belum ditanyakan,
// 5. selesai.
export function getNextStep(session) {
    // 1. Pilih aturan dan hitung fakta yang sudah diketahui.
    const candidates = getCandidateRules(session);
    const deferredAnswers = session.deferredAnswers ?? {};
    const excluded = new Set(Object.keys(deferredAnswers));
    const facts = deriveFacts(session.facts);
    const inference = runForwardInference(session.facts, session.duration, candidates);
    const inferredCodes = new Set(inference.conditions);

    const status = new Map(candidates.map((a) => [a, getRuleStatus(a, facts)]));
    const openRules = candidates.filter((a) => status.get(a) === "open" && !inferredCodes.has(a.conditionCode));
    const satisfiedRules = candidates.filter((a) => status.get(a) === "satisfied");
    // gangguan tanpa durasi minimal (durasiMinimal 0) tidak perlu ditanyakan durasinya
    const needsDuration = satisfiedRules.filter((a) => a.minimumDuration > 0 && !Object.hasOwn(session.duration, a.conditionCode) && !excluded.has(DURATION_PREFIX + a.conditionCode) && !inferredCodes.has(a.conditionCode));
    const crisis = getUnansweredCrisisSymptoms(candidates, facts, excluded);
    const remaining = () => new Set([...openRules.flatMap((a) => getRelevantSymptoms(a, facts, excluded)), ...crisis]).size + needsDuration.length + openRules.length;

    // 2. Kriteria cocok: pastikan durasi sebelum menyimpulkan.
    if (needsDuration.length > 0) {
        return { kind: "duration", conditionCode: needsDuration[0].conditionCode, remaining: remaining() };
    }

    // 3. Cari pertanyaan yang masih diperlukan oleh metode pilihan.
    if (openRules.length > 0 && session.method === "backward") {
        const code = selectBackwardQuestion(session, openRules, facts);
        if (code) return { kind: "symptom", code, remaining: remaining() };
    }

    if (openRules.length > 0) {
        const code = selectForwardQuestion(session, openRules, facts);
        if (code) return { kind: "symptom", code, remaining: remaining() };
    }

    // 4. Pastikan pertanyaan krisis dalam cakupan sudah dijawab.
    if (crisis.length > 0) {
        return { kind: "symptom", code: crisis[0], remaining: remaining() };
    }

    // An open rule can remain unknown after all useful questions were deferred.
    // It must never be reported as rejected or as evidence of being healthy.
    const incompleteConditions = [...new Set(candidates.filter(rule =>
        !inference.conditions.includes(rule.conditionCode) && !inference.insufficientDuration.includes(rule.conditionCode) && (status.get(rule) === "open" || (status.get(rule) === "satisfied" && rule.minimumDuration > 0 && !Object.hasOwn(session.duration, rule.conditionCode)))
    ).map(rule => rule.conditionCode))];
    return {
        kind: "complete",
        conditions: inference.conditions,
        insufficientDuration: inference.insufficientDuration,
        incompleteConditions,
        deferredAnswers: { ...deferredAnswers },
        hasUnansweredSafetyQuestion: Object.keys(deferredAnswers).some(code => SYMPTOMS[code]?.crisis),
        duration: { ...session.duration }
    };
}

// Uncertain/skipped responses are recorded separately; facts contain booleans only.
export function answerQuestion(session, value) {
    const step = getNextStep(session);
    if (step.kind === "complete") return session;
    const code = step.kind === "duration" ? DURATION_PREFIX + step.conditionCode : step.code;
    if (isDeferredAnswer(value)) {
        return { ...session, deferredAnswers: { ...session.deferredAnswers, [code]: value }, order: [...session.order, code] };
    }
    if (step.kind === "symptom") {
        if (typeof value !== "boolean") throw new TypeError("Jawaban gejala tidak valid");
        return { ...session, facts: { ...session.facts, [code]: value }, order: [...session.order, code] };
    }
    if (!DURATION_OPTIONS.some(option => option.days === value)) throw new TypeError("Jawaban durasi tidak valid");
    return { ...session, duration: { ...session.duration, [step.conditionCode]: value }, order: [...session.order, code] };
}

export function undoAnswer(session) {
    const lastAnswer = session.order.at(-1);
    if (!lastAnswer) return session;
    const order = session.order.slice(0, -1);
    if (Object.hasOwn(session.deferredAnswers ?? {}, lastAnswer)) {
        const { [lastAnswer]: _, ...deferredAnswers } = session.deferredAnswers;
        return { ...session, deferredAnswers, order };
    }
    if (lastAnswer.startsWith(DURATION_PREFIX)) {
        const { [lastAnswer.slice(DURATION_PREFIX.length)]: _, ...duration } = session.duration;
        return { ...session, duration, order };
    }
    const { [lastAnswer]: _, ...facts } = session.facts;
    return { ...session, facts, order };
}

export function getDurationQuestion(conditionCode) {
    return `Sudah berapa lama keluhan yang anda jawab berlangsung pada topik ${CONDITIONS[conditionCode]?.name ?? conditionCode}?`;
}

// jawaban dalam bentuk siap tampil: { kode, pertanyaan, jawaban, ya }
export function listAnswers(session) {
    return session.order.map((code) => {
        if (Object.hasOwn(session.deferredAnswers ?? {}, code)) {
            const response = session.deferredAnswers[code];
            const question = code.startsWith(DURATION_PREFIX) ? getDurationQuestion(code.slice(DURATION_PREFIX.length)) : SYMPTOMS[code]?.question ?? code;
            return { code, question, answers: DEFERRED_ANSWERS[response], response, yes: null };
        }
        if (code.startsWith(DURATION_PREFIX)) {
            const conditions = code.slice(DURATION_PREFIX.length);
            const days = session.duration[conditions];
            return { code, question: getDurationQuestion(conditions), answers: DURATION_OPTIONS.find((o) => o.days === days)?.label ?? "-", yes: null };
        }
        const yes = session.facts[code];
        return { code, question: SYMPTOMS[code]?.question ?? code, answers: yes === true ? "Ya" : yes === false ? "Tidak" : "Belum dijawab", yes };
    });
}

