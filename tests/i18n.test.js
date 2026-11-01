import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { before, afterEach, test } from "node:test";
import { nextTick } from "vue";
import { language, setLanguage, readLanguage, t, translate } from "../src/lib/i18n.js";
import { loadKnowledgeBase, CONDITIONS, SYMPTOMS } from "../src/lib/knowledgeBase.js";
import { createSession, getNextStep, answerQuestion } from "../src/lib/consultationSession.js";
import { getResultTitle, getAnswerQuestion, formatDuration, formatDate } from "../src/lib/consultationDisplay.js";
import { createResult, latestResult } from "../src/lib/consultationResult.js";
import { CONSULTATION_GUIDE_INTRO, CONSULTATION_GUIDE_PROMPTS, CONSULTATION_GUIDE_EXAMPLE, FAQ_ITEMS } from "../src/lib/screeningHelp.js";
import * as support from "../src/lib/supportMessages.js";

before(async () => {
    const original = globalThis.fetch;
    globalThis.fetch = async url => ({ ok: true, json: async () => JSON.parse(await readFile(new URL("../public/data/" + String(url).split("/").at(-1), import.meta.url), "utf8")) });
    try { await loadKnowledgeBase(); } finally { globalThis.fetch = original; }
});
afterEach(() => { setLanguage("id"); latestResult.value = null; });

test("Language preferences persist, validate supported codes, and tolerate blocked storage", () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
    const values = new Map();
    const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
    try {
        Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
        setLanguage("en"); assert.equal(readLanguage(storage), "en");
        setLanguage("fr"); assert.equal(language.value, "en");
        assert.equal(readLanguage({ getItem: () => "invalid" }), "id");
        Object.defineProperty(globalThis, "localStorage", { configurable: true, get() { throw new Error("blocked"); } });
        assert.doesNotThrow(() => setLanguage("id"));
        assert.equal(readLanguage({ getItem() { throw new Error("blocked"); } }), "id");
    } finally { if (original) Object.defineProperty(globalThis, "localStorage", original); else delete globalThis.localStorage; }
});

test("HTML language follows the selected language", async () => {
    const original = globalThis.document;
    globalThis.document = { documentElement: { lang: "id" } };
    try { setLanguage("en"); await nextTick(); assert.equal(document.documentElement.lang, "en"); }
    finally { if (original) globalThis.document = original; else delete globalThis.document; }
});

test("Every symptom and condition display field has an English translation", () => {
    for (const symptom of Object.values(SYMPTOMS)) {
        for (const field of ["name", "question"]) if (symptom[field]) assert.notEqual(translate(symptom[field], [], "en"), symptom[field], symptom.code + ":" + field);
    }
    for (const condition of Object.values(CONDITIONS)) {
        const messages = [condition.name, condition.category, condition.description, condition.note, condition.durationNote, ...condition.treatment].filter(message => message && message !== "-");
        for (const message of messages) assert.notEqual(translate(message, [], "en"), message, condition.code + ":" + message);
    }
    for (const message of Object.values(support).flat()) assert.notEqual(translate(message, [], "en"), message);
});

test("Switching language preserves consultation answers, order, and next step", () => {
    const session = answerQuestion(createSession("backward", "P2"), true);
    const original = structuredClone(session); const step = getNextStep(session);
    setLanguage("en"); assert.deepEqual(getNextStep(session), step); assert.deepEqual(session, original);
    assert.equal(t("Ya"), "Yes"); setLanguage("id"); assert.equal(t("Ya"), "Ya");
});

test("A completed result and its duration question switch language without being recreated", () => {
    let session = createSession("backward", "P9");
    for (let i = 0; i < 100; i++) {
        const step = getNextStep(session);
        if (step.kind === "complete") { createResult(session, step); break; }
        session = answerQuestion(session, step.kind === "duration" ? 14 : true);
    }
    const entry = latestResult.value; const original = structuredClone(entry);
    const durationAnswer = entry.answers.find(answer => answer.code.startsWith("duration:"));
    assert.equal(getResultTitle(entry), "Jawaban anda dapat menjadi bahan percakapan dengan profesional");
    setLanguage("en");
    assert.equal(getResultTitle(entry), "Your answers can help start a conversation with a professional");
    assert.match(getAnswerQuestion(durationAnswer), /^How long/);
    assert.equal(formatDuration(180), "6 months");
    assert.match(formatDate(new Date(2026, 9, 26, 12).getTime()), /Oct/);
    assert.strictEqual(latestResult.value, entry); assert.deepEqual(entry, original);
    setLanguage("id"); assert.match(getAnswerQuestion(durationAnswer), /^Sudah berapa lama/);
    assert.equal(formatDuration(180), "6 bulan");
});

test("Parameterized messages preserve values and fall back to the source text", () => {
    assert.equal(translate("Lihat jawaban anda ({0} pertanyaan)", [3], "en"), "View your answers (3 questions)");
    assert.equal(translate("An untranslated reference title", [], "en"), "An untranslated reference title");
    assert.deepEqual(translate(["Ya", "Tidak"], [], "en"), ["Yes", "No"]);
});

test("Consultation guidance, FAQ and deferred-answer labels have English translations", () => {
    const messages = [CONSULTATION_GUIDE_INTRO, CONSULTATION_GUIDE_EXAMPLE, ...CONSULTATION_GUIDE_PROMPTS, ...FAQ_ITEMS.flatMap(item => [item.question, item.answer]), "Kurang yakin", "Lewati", "Dilewati"];
    for (const message of messages) assert.notEqual(translate(message, [], "en"), message);
});
