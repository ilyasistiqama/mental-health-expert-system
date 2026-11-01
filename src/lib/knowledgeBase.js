// Data dan aturan dibaca dari JSON sebelum aplikasi ditampilkan.
import { BASE_PATH } from "./basePath.js";
import { validateKnowledgeBase } from "./knowledgeValidation.js";

export const KNOWLEDGE_VERSION = "2026-11-01-responses-2";

export const NO_TENDENCY_CODE = "P0";

// pilihan jawaban durasi, "hari" adalah batas bawah tiap pilihan
export const DURATION_OPTIONS = [
    { days: 0, label: "Kurang dari 2 minggu" },
    { days: 14, label: "2 minggu sampai 1 bulan" },
    { days: 30, label: "1 sampai 3 bulan" },
    { days: 90, label: "3 sampai 6 bulan" },
    { days: 180, label: "6 bulan atau lebih" }
];

// diisi oleh muatBasisPengetahuan() sebelum aplikasi di-mount
export const CONDITIONS = {};
export const SYMPTOMS = {};
export const SYMPTOM_LIST = [];
export const REFERENCES = {};
export const REFERENCE_LIST = [];
// aturan produksi: IF semua kriteria terpenuhi THEN penyakit,
// kriteria terpenuhi jika minimal sejumlah gejalanya dijawab Ya
export const RULES = [];

async function fetchJson(name) {
    const response = await fetch(`${BASE_PATH}data/${name}`, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Gagal memuat data/${name} (${response.status})`);
    return response.json();
}

export async function loadKnowledgeBase() {
    const [listConditions, symptomList, referenceList] = await Promise.all([fetchJson("conditions.json"), fetchJson("symptoms.json"), fetchJson("references.json")]);

    validateKnowledgeBase(listConditions, symptomList, referenceList, DURATION_OPTIONS);
    for (const record of [CONDITIONS, SYMPTOMS, REFERENCES]) for (const key of Object.keys(record)) delete record[key];
    for (const list of [SYMPTOM_LIST, REFERENCE_LIST, RULES]) list.length = 0;
    referenceList.forEach((reference, index) => {
        REFERENCES[reference.id] = { ...reference, number: index + 1 };
        REFERENCE_LIST.push(REFERENCES[reference.id]);
    });
    for (const symptom of symptomList) {
        SYMPTOMS[symptom.code] = symptom;
        SYMPTOM_LIST.push(symptom);
    }
    for (const condition of listConditions) {
        const criteria = condition.criteria.map(criterion => ({ ...criterion, minimum: criterion.minimum ?? criterion.symptoms.length }));
        CONDITIONS[condition.code] = { ...condition, criteria, treatment: condition.treatment ?? [] };
        if (condition.code !== NO_TENDENCY_CODE) RULES.push({ conditionCode: condition.code, criteria, minimumDuration: condition.minimumDuration });
    }

    if (!CONDITIONS[NO_TENDENCY_CODE]) throw new Error(`conditions.json wajib berisi ${NO_TENDENCY_CODE} (tidak terdeteksi)`);
}

export function isValidCondition(code) {
    return Object.hasOwn(CONDITIONS, code ?? "");
}

export function listConditions() {
    // Satu penyakit boleh punya beberapa aturan alternatif; daftar untuk UI tetap unik.
    return [...new Set(RULES.map((a) => a.conditionCode))];
}

