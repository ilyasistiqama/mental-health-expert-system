import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { before, test } from "node:test";
import { RULES, SYMPTOMS, loadKnowledgeBase } from "../src/lib/knowledgeBase.js";
import { deriveFacts } from "../src/lib/rules.js";
import { runForwardInference } from "../src/lib/forwardChaining.js";
import { createSession, getNextStep, answerQuestion, undoAnswer } from "../src/lib/consultationSession.js";

before(async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url) => ({
        ok: true,
        json: async () => JSON.parse(await readFile(new URL("../public/data/" + String(url).split("/").at(-1), import.meta.url), "utf8"))
    });
    try { await loadKnowledgeBase(); } finally { globalThis.fetch = originalFetch; }
});

// Urutan dibuat tetap agar kegagalan mudah diulangi tanpa bergantung pada pengacakan.
function runConsultation(method, target, facts, days = 180) {
    let session = { ...createSession(method, target), questionOrder: Object.keys(SYMPTOMS).filter(k => !SYMPTOMS[k].sources) };
    const asked = new Set();
    for (let i = 0; i < Object.keys(SYMPTOMS).length + RULES.length + 1; i++) {
        const step = getNextStep(session);
        if (step.kind === "complete") return { session, result: step, asked };
        if (step.kind === "symptom") {
            assert.ok(!SYMPTOMS[step.code].sources, "Fakta turunan tidak ditanyakan");
            assert.ok(!asked.has(step.code), "Pertanyaan tidak berulang");
            asked.add(step.code);
        }
        session = answerQuestion(session, step.kind === "duration" ? days : facts[step.code] === true);
    }
    assert.fail("Konsultasi tidak selesai dalam jumlah langkah yang terbatas");
}

function factsForRule(rule) {
    return Object.fromEntries(rule.criteria.flatMap(k => k.symptoms.flatMap(code => SYMPTOMS[code].sources ?? [code])).map(code => [code, true]));
}

test("Semua gangguan dapat dibuktikan melalui sesi backward", () => {
    for (const rule of RULES) {
        const { result } = runConsultation("backward", rule.conditionCode, factsForRule(rule));
        assert.deepEqual(result.conditions, [rule.conditionCode]);
    }
});

test("Semua jawaban Tidak mengakhiri kedua metode tanpa kesimpulan gangguan", () => {
    assert.deepEqual(runConsultation("forward", null, {}).result.conditions, []);
    for (const a of RULES) assert.deepEqual(runConsultation("backward", a.conditionCode, {}).result.conditions, []);
});

test("Durasi kurang dipisahkan dari kesimpulan, termasuk batas tepatnya", () => {
    for (const a of RULES.filter(a => a.minimumDuration > 0)) {
        const facts = factsForRule(a);
        const tooShort = runForwardInference(facts, { [a.conditionCode]: a.minimumDuration - 1 }, [a]);
        assert.deepEqual(tooShort.conditions, []);
        assert.deepEqual(tooShort.insufficientDuration, [a.conditionCode]);
        assert.deepEqual(runForwardInference(facts, { [a.conditionCode]: a.minimumDuration }, [a]).conditions, [a.conditionCode]);
    }
});

test("Keluhan tidur umum tidak dihitung sebagai gejala GAD atau depresi tanpa konteks", () => {
    assert.equal(deriveFacts({ G60: true }).G68, undefined);
    assert.equal(deriveFacts({ G60: true }).G69, undefined);
    const facts = { G109: true, G90: false, G53: false };
    assert.equal(deriveFacts(facts).G68, true);
    assert.equal(deriveFacts(facts).G69, false);
    assert.deepEqual(facts, { G109: true, G90: false, G53: false });
    assert.equal(deriveFacts({ G90: true }).G69, true);
    assert.equal(deriveFacts({ G109: false, G24: false }).G68, false);
});

test("Pertanyaan krisis tetap ditanyakan saat depresi gugur, sesuai cakupan metode", () => {
    assert.ok(runConsultation("forward", null, {}).asked.has("G58"));
    assert.ok(runConsultation("backward", "P9", {}).asked.has("G58"));
    assert.ok(!runConsultation("backward", "P2", {}).asked.has("G58"));
});

test("Topik stres tetap bisa dibahas bersama topik lain tanpa menyimpulkan diagnosis banding", () => {
    const allYes = Object.fromEntries(Object.keys(SYMPTOMS).map(k => [k, true]));
    const result = runConsultation("forward", null, allYes).result;
    assert.ok(result.conditions.includes("P9"));
    assert.ok(result.conditions.includes("P11"));
    assert.deepEqual(runConsultation("forward", null, factsForRule(RULES.find(a => a.conditionCode === "P11"))).result.conditions, ["P11"]);
});

test("Kembali membatalkan jawaban gejala dan durasi serta memulihkan langkah", () => {
    const initial = createSession("backward", "P3");
    assert.deepEqual(undoAnswer(answerQuestion(initial, true)), initial);
    const { session } = runConsultation("backward", "P3", factsForRule(RULES.find(a => a.conditionCode === "P3")));
    const previous = undoAnswer(session);
    assert.deepEqual(previous.duration, {});
    assert.equal(getNextStep(previous).kind, "duration");
    assert.deepEqual(answerQuestion(previous, 180), session);
});

test("P2 memerlukan minimal tiga gejala pendukung, selain kriteria wajib", () => {
    const rule = RULES.find(a => a.conditionCode === "P2");
    const facts = { G02: true, G18: true, G99: true, G19: true, G20: true, G21: false, G22: false, G23: false, G109: false, G24: false };
    assert.deepEqual(runForwardInference(facts, { P2: 180 }, [rule]).conditions, []);
    assert.deepEqual(runForwardInference({ ...facts, G21: true }, { P2: 180 }, [rule]).conditions, ["P2"]);
});

test("Gejala panik yang terpisah dihitung sendiri dan kekhawatiran satu bulan wajib", () => {
    const rule = RULES.find(rule => rule.conditionCode === "P1");
    const facts = { G01: true, G11: true, G70: true, G12: true, G71: true, G17: true };
    assert.deepEqual(runForwardInference(facts, {}, [rule]).conditions, ["P1"]);
    assert.deepEqual(runForwardInference({ ...facts, G17: false }, {}, [rule]).conditions, []);
    assert.deepEqual(runForwardInference({ ...facts, G71: false }, {}, [rule]).conditions, []);
});

test("Dampak satu topik tidak dipinjam untuk membuktikan topik lain", () => {
    const rule = RULES.find(rule => rule.conditionCode === "P10");
    const facts = { G60: true, G63: true, G64: true, G49: true, G106: true, G107: false };
    assert.deepEqual(runForwardInference(facts, { P10: 90 }, [rule]).conditions, []);
    assert.deepEqual(runForwardInference({ ...facts, G107: true }, { P10: 90 }, [rule]).conditions, ["P10"]);
});

test("PTSD tidak meminjam marah, konsentrasi, atau tidur dari keluhan umum", () => {
    const rule = RULES.find(rule => rule.conditionCode === "P5");
    const facts = factsForRule(rule);
    for (const code of ["G85", "G86", "G33", "G84", "G87", "G88"]) facts[code] = false;
    Object.assign(facts, { G22: true, G21: true, G60: true, G109: true });
    assert.deepEqual(runForwardInference(facts, { P5: 30 }, [rule]).conditions, []);
    assert.deepEqual(runForwardInference({ ...facts, G87: true, G88: true }, { P5: 30 }, [rule]).conditions, ["P5"]);
});

test("Topik baru memerlukan dampak yang terkait; OCD tidak memakai ambang dua minggu", () => {
    for (const [target, impact] of [["P12", "G95"], ["P13", "G98"]]) {
        const rule = RULES.find(rule => rule.conditionCode === target);
        const facts = factsForRule(rule);
        assert.deepEqual(runConsultation("backward", target, facts).result.conditions, [target]);
        assert.deepEqual(runConsultation("backward", target, { ...facts, [impact]: false }).result.conditions, []);
    }
    const rule = RULES.find(rule => rule.conditionCode === "P4");
    const result = runConsultation("backward", "P4", factsForRule(rule), 0);
    assert.deepEqual(result.result.conditions, ["P4"]);
    assert.ok(!result.session.order.includes("duration:P4"));
});
