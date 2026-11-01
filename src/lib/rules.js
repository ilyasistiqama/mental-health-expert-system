// Operasi bersama untuk membaca fakta dan memeriksa kriteria. Tidak bergantung pada Vue.
import { SYMPTOMS, SYMPTOM_LIST } from "./knowledgeBase.js";

// Fakta antara: gejala bertanda "dari" tidak ditanyakan, melainkan disimpulkan dari gejala asalnya
// (Ya jika salah satu gejala asal dijawab Ya, Tidak jika semuanya dijawab Tidak). Misalnya
// "gangguan tidur" disimpulkan dari sulit memulai tidur, sering terbangun, atau bangun terlalu pagi,
// sehingga pertanyaan tidur cukup ditanyakan sekali walaupun dipakai beberapa aturan.
export function getSourceSymptoms(code) {
    return SYMPTOMS[code]?.sources ?? [code];
}

// Nilai tiga keadaan sebuah gejala: true, false, atau undefined (belum diketahui).
// Fakta antara dihitung rekursif, sehingga fakta antara bertingkat pun didukung.
export function getFactValue(code, facts, visited = new Set()) {
    const g = SYMPTOMS[code];
    if (!g || !g.sources) {
        const v = facts[code];
        return v === true || v === false ? v : undefined;
    }
    if (visited.has(code)) return undefined;

    const nextVisited = new Set(visited).add(code);
    const references = g.sources.map((k) => getFactValue(k, facts, nextVisited));
    if (references.some((v) => v === true)) return true;
    if (references.every((v) => v === false)) return false;
    return undefined;
}

// gejala yang perlu ditanyakan agar nilai kode diketahui
export function getUnansweredSymptoms(code, facts) {
    const g = SYMPTOMS[code];
    if (!g) return getFactValue(code, facts) === undefined ? [code] : [];
    if (!g.sources) {
        const v = facts[code];
        return v === true || v === false ? [] : [code];
    }
    if (getFactValue(code, facts) !== undefined) return [];
    return g.sources.flatMap((k) => getUnansweredSymptoms(k, facts));
}

// Forward chaining membutuhkan working memory yang sudah memuat semua fakta turunan.
// Fungsi ini menghitung penutupan (closure) fakta antara sampai tidak ada nilai baru.
// Fakta turunan hanya dipakai selama inferensi dan tidak pernah ditulis ke sesi.
export function deriveFacts(facts) {
    const result = {};
    for (const [code, factValue] of Object.entries(facts)) {
        if (!SYMPTOMS[code]?.sources && (factValue === true || factValue === false)) result[code] = factValue;
    }

    let changed = true;
    while (changed) {
        changed = false;
        for (const g of SYMPTOM_LIST) {
            if (!g.sources || Object.hasOwn(result, g.code)) continue;

            const references = g.sources.map((k) => result[k]);
            if (references.some((v) => v === true)) {
                result[g.code] = true;
                changed = true;
            } else if (references.every((v) => v === false)) {
                result[g.code] = false;
                changed = true;
            }
        }
    }
    return result;
}

export function getCriterionStatus(criteria, facts) {
    const yes = criteria.symptoms.filter((k) => getFactValue(k, facts) === true).length;
    const unknownCount = criteria.symptoms.filter((k) => getFactValue(k, facts) === undefined).length;
    if (yes >= criteria.minimum) return "satisfied";
    if (yes + unknownCount < criteria.minimum) return "rejected";
    return "open";
}

export function getRuleStatus(rule, facts) {
    const status = rule.criteria.map((k) => getCriterionStatus(k, facts));
    if (status.includes("rejected")) return "rejected";
    if (status.every((s) => s === "satisfied")) return "satisfied";
    return "open";
}

// gejala yang masih bisa mengubah status aturan
export function getRelevantSymptoms(rule, facts, excluded = new Set()) {
    return rule.criteria
        .filter((k) => getCriterionStatus(k, facts) === "open")
        .flatMap((k) => k.symptoms.flatMap((code) => getUnansweredSymptoms(code, facts)))
        .filter(code => !excluded.has(code));
}

// Gejala krisis (pikiran tentang kematian atau menyakiti diri) selalu ditanyakan walaupun tidak lagi
// mengubah hasil, agar orang yang membutuhkan bantuan segera tetap dikenali. Menanyakannya tidak
// meningkatkan risiko (Dazzi dkk., 2014).
export function getUnansweredCrisisSymptoms(candidates, facts, excluded = new Set()) {
    return [...new Set(candidates.flatMap((a) => a.criteria.flatMap((k) => k.symptoms.flatMap(getSourceSymptoms))))]
        .filter((k) => SYMPTOMS[k]?.crisis && !excluded.has(k) && facts[k] !== true && facts[k] !== false);
}

export function getCrisisAnswers(facts) {
    return Object.keys(facts).filter((k) => facts[k] === true && SYMPTOMS[k]?.crisis);
}

