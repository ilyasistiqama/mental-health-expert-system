// Dari gangguan pilihan menuju aturan, kriteria, dan pertanyaan pembuktiannya.
import { RULES, SYMPTOMS } from "./knowledgeBase.js";
import { getFactValue, getRelevantSymptoms } from "./rules.js";

function selectByOrder(candidates, order = []) {
    const unique = [...new Set(candidates)];
    return order.find((k) => unique.includes(k)) ?? unique[0];
}

// Buktikan sebuah gejala. Gejala langsung menjadi daun pembuktian; fakta antara menjadi
// subgoal OR yang sumbernya dibuktikan rekursif.
function proveSymptom(code, facts, order, excluded, visited = new Set()) {
    const g = SYMPTOMS[code];
    if (!g) {
        const factValue = getFactValue(code, facts);
        return factValue === undefined ? { status: undefined } : { status: factValue };
    }
    if (!g.sources) {
        const v = facts[code];
        if (v === true || v === false) return { status: v };
        return { status: undefined, question: excluded.has(code) ? undefined : code };
    }
    if (visited.has(code)) return { status: undefined };

    const nextVisited = new Set(visited).add(code);
    const result = g.sources.map((k) => ({ code: k, ...proveSymptom(k, facts, order, excluded, nextVisited) }));

    if (result.some((h) => h.status === true)) return { status: true };
    if (result.every((h) => h.status === false)) return { status: false };

    const candidates = result.filter((h) => h.status === undefined && h.question).map((h) => h.question);
    return { status: undefined, question: selectByOrder(candidates, order) };
}

// Buktikan kriteria ambang: terpenuhi jika cukup banyak gejala Ya, gugur jika sisa gejala yang
// belum diketahui tidak mungkin lagi mencapai ambang.
function proveCriterion(criteria, facts, order, excluded) {
    const result = criteria.symptoms.map((k) => ({ code: k, ...proveSymptom(k, facts, order, excluded) }));
    const yes = result.filter((h) => h.status === true).length;
    const unknownCount = result.filter((h) => h.status === undefined).length;

    if (yes >= criteria.minimum) return { status: true };
    if (yes + unknownCount < criteria.minimum) return { status: false };

    const candidates = result.filter((h) => h.status === undefined && h.question).map((h) => h.question);
    return { status: undefined, question: selectByOrder(candidates, order) };
}

// Buktikan satu aturan: semua kriteria harus terpenuhi (AND). Jika satu kriteria gugur, aturan
// langsung gugur; jika ada kriteria yang belum pasti, kembalikan pertanyaan pertama.
function proveRule(rule, facts, order, excluded) {
    let status = true;
    let question;

    for (const k of rule.criteria) {
        const result = proveCriterion(k, facts, order, excluded);
        if (result.status === false) return { status: false };
        if (result.status === undefined) {
            status = undefined;
            if (!question) question = result.question;
        }
    }

    return { status, question };
}

// Buktikan tujuan: coba semua aturan yang menyimpulkan penyakit target. Jika satu aturan berhasil,
// tujuan terbukti; jika semua gugur, tujuan gugur; selain itu masih ada subgoal yang belum pasti.
function proveGoal(target, facts, order, excluded) {
    const targetRules = RULES.filter((a) => a.conditionCode === target);
    if (targetRules.length === 0) return { status: false };

    let hasOpenRule = false;
    let question;

    for (const a of targetRules) {
        const result = proveRule(a, facts, order, excluded);
        if (result.status === true) return { status: true };
        if (result.status === undefined) {
            hasOpenRule = true;
            if (!question) question = result.question;
        }
    }

    return hasOpenRule ? { status: undefined, question } : { status: false };
}

export function selectBackwardQuestion(session, openRules, facts) {
    const excluded = new Set(Object.keys(session.deferredAnswers ?? {}));
    const proof = proveGoal(session.target, facts, session.questionOrder, excluded);
    if (proof.status === undefined && proof.question) return proof.question;

    // Alternatif aturan: kumpulkan pertanyaan dari semua aturan yang masih terbuka, lalu ikuti
    // urutan acak sesi. Ini membuat goal yang punya beberapa aturan tetap bisa dicoba bergantian.
    const candidates = openRules.flatMap((a) => {
        const result = proveRule(a, facts, session.questionOrder, excluded);
        return result.status === undefined && result.question ? [result.question] : [];
    });
    const code = selectByOrder(candidates, session.questionOrder);
    if (code) return code;

    // Fallback untuk data yang ditambahkan setelah sesi dibuat.
    const relevant = openRules.flatMap((a) => getRelevantSymptoms(a, facts, excluded));
    return [...session.questionOrder, ...relevant].find((k) => relevant.includes(k)) ?? relevant[0];
}

