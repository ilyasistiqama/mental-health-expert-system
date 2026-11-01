import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { before, test } from "node:test";
import { RULES, SYMPTOMS, loadKnowledgeBase } from "../src/lib/knowledgeBase.js";
import { createSession, getNextStep, answerQuestion, undoAnswer, listAnswers } from "../src/lib/consultationSession.js";
import { deriveFacts } from "../src/lib/rules.js";
import { createResult, latestResult } from "../src/lib/consultationResult.js";
import { getResultTitle, getNoTopicSummary } from "../src/lib/consultationDisplay.js";
import { isValidSession, areSessionsEqual } from "../src/lib/consultationProgress.js";
import { decodeStoredSession, encodeStoredSession } from "../src/lib/sessionCompatibility.js";
import { setLanguage } from "../src/lib/i18n.js";

before(async () => {
    const original = globalThis.fetch;
    globalThis.fetch = async url => ({ ok: true, json: async () => JSON.parse(await readFile(new URL('../public/data/' + String(url).split('/').at(-1), import.meta.url), 'utf8')) });
    try { await loadKnowledgeBase(); } finally { globalThis.fetch = original; }
});

function complete(method, target, choose) {
    let session = createSession(method, target);
    session.questionOrder = Object.keys(SYMPTOMS).filter(code => !SYMPTOMS[code].sources && !SYMPTOMS[code].educationalOnly);
    const asked = new Set();
    for (let index = 0; index <= Object.keys(SYMPTOMS).length + RULES.length; index++) {
        const step = getNextStep(session);
        if (step.kind === 'complete') return { session, result: step, asked };
        const code = step.kind === 'duration' ? 'duration:' + step.conditionCode : step.code;
        assert.ok(!asked.has(code), 'Deferred questions must not repeat: ' + code);
        asked.add(code);
        session = answerQuestion(session, choose(code, step));
    }
    assert.fail('Screening must terminate even when every answer is unknown');
}

test('All unsure/skipped answers terminate both methods without treating unknown as No', () => {
    for (const response of ['unsure', 'skipped']) {
        for (const [method, target] of [['forward', null], ...RULES.map(rule => ['backward', rule.conditionCode])]) {
            const { session, result } = complete(method, target, () => response);
            assert.deepEqual(session.facts, {});
            assert.deepEqual(session.duration, {});
            assert.deepEqual(result.conditions, []);
            assert.deepEqual(result.insufficientDuration, []);
            assert.equal(result.incompleteConditions.length, method === 'forward' ? RULES.length : 1);
            assert.equal(Object.keys(session.deferredAnswers).length, session.order.length);
            assert.ok(isValidSession(session));
        }
    }
});

test('An uncertain mandatory symptom remains unknown while other topics can be summarized', () => {
    for (const method of ['forward', 'backward']) {
        const { session, result } = complete(method, method === 'backward' ? 'P2' : null, (code, step) => code === 'G02' ? 'unsure' : step.kind === 'duration' ? 180 : true);
        assert.equal(Object.hasOwn(session.facts, 'G02'), false);
        assert.equal(deriveFacts(session.facts).G02, undefined);
        assert.ok(!result.conditions.includes('P2'));
        assert.ok(result.incompleteConditions.includes('P2'));
        assert.ok(!Object.hasOwn(session.duration, 'P2'));
        if (method === 'forward') assert.ok(result.conditions.includes('P9'));
    }
});

test('Unknown OR sources do not become false and can block a threshold', () => {
    const yes = new Set(['G02', 'G18', 'G19', 'G20', 'G99']);
    const { session, result } = complete('backward', 'P2', code => code === 'G24' ? 'skipped' : yes.has(code));
    assert.equal(deriveFacts(session.facts).G68, undefined);
    assert.deepEqual(result.conditions, []);
    assert.deepEqual(result.incompleteConditions, ['P2']);
});

test('An unknown optional item does not invalidate a threshold already met by definite answers', () => {
    const { session, result } = complete('backward', 'P1', code => code === 'G11' ? 'unsure' : true);
    assert.deepEqual(result.conditions, ['P1']);
    assert.deepEqual(result.incompleteConditions, []);
    assert.equal(session.deferredAnswers.G11, 'unsure');
    const answer = listAnswers(session).find(answer => answer.code === 'G11');
    assert.equal(answer.answers, 'Kurang yakin');
    assert.equal(answer.yes, null);
});

test('A skipped duration is unknown, not zero or an insufficient-duration result; Back restores it', () => {
    const { session, result } = complete('backward', 'P3', (code, step) => step.kind === 'duration' ? 'skipped' : true);
    assert.deepEqual(session.duration, {});
    assert.deepEqual(result.conditions, []);
    assert.deepEqual(result.insufficientDuration, []);
    assert.deepEqual(result.incompleteConditions, ['P3']);
    assert.equal(listAnswers(session).at(-1).answers, 'Dilewati');
    const restored = undoAnswer(session);
    assert.equal(getNextStep(restored).kind, 'duration');
    assert.equal(Object.hasOwn(restored.deferredAnswers, 'duration:P3'), false);
    assert.deepEqual(getNextStep(answerQuestion(restored, 180)).conditions, ['P3']);
});

test('Back removes an uncertain symptom; changing it to No changes the rule rather than guessing', () => {
    const initial = createSession('backward', 'P12');
    const uncertain = answerQuestion(initial, 'unsure');
    assert.deepEqual(undoAnswer(uncertain), initial);
    assert.ok(!areSessionsEqual(initial, uncertain));
    assert.deepEqual(decodeStoredSession(encodeStoredSession(uncertain)), uncertain);
    assert.ok(isValidSession(uncertain));
    const code = uncertain.order[0];
    assert.equal(isValidSession({ ...uncertain, facts: { [code]: false } }), false);
    assert.equal(isValidSession({ ...uncertain, deferredAnswers: { [code]: 'maybe' } }), false);
    assert.throws(() => answerQuestion(initial, undefined), TypeError);
});

test('A skipped safety question is never flagged as No, safe, or a positive crisis answer', () => {
    const { session, result } = complete('backward', 'P9', code => code === 'G58' ? 'skipped' : false);
    assert.ok(result.hasUnansweredSafetyQuestion);
    assert.equal(Object.hasOwn(session.facts, 'G58'), false);
    const entry = createResult(session, result);
    assert.equal(entry.crisis, false);
    assert.equal(entry.hasUnansweredSafetyQuestion, true);
    assert.equal(entry.deferredAnswers.G58, 'skipped');
    latestResult.value = null;
});

test('Incomplete-result copy is explicit and changes language without altering answers', () => {
    const { session, result } = complete('backward', 'P12', () => 'unsure');
    const entry = createResult(session, result);
    const snapshot = structuredClone(entry);
    assert.match(getResultTitle(entry), /Informasi belum cukup/);
    assert.match(getNoTopicSummary(entry), /tidak dianggap.*Tidak/);
    try {
        setLanguage('en');
        assert.match(getResultTitle(entry), /not enough information/);
        assert.match(getNoTopicSummary(entry), /not treated as No/);
        assert.deepEqual(entry, snapshot);
    } finally { setLanguage('id'); latestResult.value = null; }
});
