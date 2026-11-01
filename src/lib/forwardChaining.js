// Dari fakta jawaban menuju gangguan yang memenuhi aturan dan durasi.
import { RULES, SYMPTOM_LIST } from "./knowledgeBase.js";
import { getSourceSymptoms, getUnansweredSymptoms, getRelevantSymptoms, getRuleStatus, getCriterionStatus, deriveFacts } from "./rules.js";

function hasSufficientDuration(rule, duration) {
    return rule.minimumDuration === 0 || (Object.hasOwn(duration, rule.conditionCode) && duration[rule.conditionCode] >= rule.minimumDuration);
}

function isDurationKnown(rule, duration) {
    return rule.minimumDuration === 0 || Object.hasOwn(duration, rule.conditionCode);
}

// Forward chaining: working memory berisi fakta gejala, fakta turunan, dan penyakit yang sudah
// di-fire. Semua aturan dicocokkan berulang sampai tidak ada fakta baru (fixed point). Durasi
// adalah gerbang akhir: kriteria yang terpenuhi tetapi durasinya belum cukup dicatat sebagai
// belumCukup, bukan disimpulkan.
export function runForwardInference(facts, duration = {}, rule = RULES) {
    const WM = deriveFacts(facts);
    const inferred = new Set();
    const insufficientDuration = new Set();

    let changed = true;
    while (changed) {
        changed = false;
        for (const a of rule) {
            if (inferred.has(a.conditionCode)) continue;
            if (getRuleStatus(a, WM) !== "satisfied") continue;

            if (hasSufficientDuration(a, duration)) {
                WM[a.conditionCode] = true;
                inferred.add(a.conditionCode);
                insufficientDuration.delete(a.conditionCode);
                changed = true;
            } else if (isDurationKnown(a, duration)) {
                insufficientDuration.add(a.conditionCode);
            }
        }
    }

    return { facts: WM, conditions: [...inferred], insufficientDuration: [...insufficientDuration] };
}

// Pilih pertanyaan untuk aturan aktif, lalu lanjutkan pertanyaan penyaring.
export function selectForwardQuestion(session, openRules, facts) {
    const excluded = new Set(Object.keys(session.deferredAnswers ?? {}));
    const focus = openRules
        .filter((a) => getCriterionStatus(a.criteria[0], facts) === "satisfied" && getRelevantSymptoms(a, facts, excluded).length > 0)
        .sort((a, b) => getActivationIndex(a, session, facts) - getActivationIndex(b, session, facts))[0];
    if (focus) return getRelevantSymptoms(focus, facts, excluded)[0];
    const screening = getNextScreeningSymptom(session, openRules, facts);
    if (screening) return screening;
    // An uncertain screening answer leaves the rule open. Collect remaining useful answers,
    // then stop with an incomplete result rather than treating uncertainty as No.
    const relevant = new Set(openRules.flatMap(rule => getRelevantSymptoms(rule, facts, excluded)));
    return [...session.questionOrder, ...SYMPTOM_LIST.map(symptom => symptom.code)].find(code => relevant.has(code));
}

// urutan jawaban saat pertanyaan penyaring sebuah aturan terpenuhi
function getActivationIndex(rule, session, facts = session.facts) {
    const positions = rule.criteria[0].symptoms.flatMap(getSourceSymptoms).filter((k) => facts[k] === true).map((k) => session.order.indexOf(k));
    return Math.min(...positions);
}

function getNextScreeningSymptom(session, openRules, facts = session.facts) {
    const relevant = new Set(openRules.flatMap((a) => getCriterionStatus(a.criteria[0], facts) === "open"
        ? a.criteria[0].symptoms.flatMap((k) => getUnansweredSymptoms(k, facts))
        : []));
    // penyaring baru (data ditambah setelah sesi dibuat) ditaruh di akhir
    const order = [...session.questionOrder, ...SYMPTOM_LIST.map((g) => g.code)];
    return order.find((k) => relevant.has(k) && !Object.hasOwn(session.deferredAnswers ?? {}, k));
}

