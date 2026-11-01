import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { validateKnowledgeBase } from '../src/lib/knowledgeValidation.js';
import { CONDITIONS, DURATION_OPTIONS, KNOWLEDGE_VERSION, loadKnowledgeBase, RULES, SYMPTOMS } from '../src/lib/knowledgeBase.js';
import { createSession } from '../src/lib/consultationSession.js';
import { loadProgress, reloadSession, getSavedSession, saveSession, wasProgressReset, isValidSession } from '../src/lib/consultationProgress.js';
import { initializeStorage } from '../src/lib/storage.js';
import { decodeStoredSession, encodeStoredSession } from '../src/lib/sessionCompatibility.js';
const read = async name => JSON.parse(await readFile(new URL('../public/data/' + name + '.json', import.meta.url), 'utf8'));
const [conditions, symptoms, references] = await Promise.all(['conditions', 'symptoms', 'references'].map(read));
const validate = (c = conditions, s = symptoms, r = references) => validateKnowledgeBase(c, s, r, DURATION_OPTIONS);

test('Bukti seluruh gejala dan aturan tersedia; data rusak tidak menurunkan ambang diam-diam', () => {
    assert.doesNotThrow(() => validate());
    const damaged = structuredClone(conditions);
    damaged.find(p => p.code === 'P1').criteria[1].minimum = 99;
    assert.throws(() => validate(damaged), /ambang/);
    const missing = structuredClone(conditions);
    missing.find(p => p.code === 'P1').criteria[1].symptoms[0] = 'G999';
    assert.throws(() => validate(missing), /gejala/);
    assert.throws(() => validate(conditions, symptoms, references.slice(0, 23)), /rujukan/);
    assert.throws(() => validate(conditions, [...symptoms, symptoms[0]]), /duplikat/);
    const derived = structuredClone(symptoms);
    derived.find(s => s.code === 'G68').sources = ['G69'];
    assert.throws(() => validate(conditions, derived), /turunan/);
});

test('Pemuatan ulang tidak menggandakan aturan; versi lama tidak boleh dilanjutkan', async () => {
    const original = globalThis.fetch;
    globalThis.fetch = async url => ({ ok: true, json: async () => ({ 'conditions.json': structuredClone(conditions), 'symptoms.json': structuredClone(symptoms), 'references.json': structuredClone(references) })[String(url).split('/').at(-1)] });
    try { await loadKnowledgeBase(); await loadKnowledgeBase(); } finally { globalThis.fetch = original; }
    assert.equal(RULES.length, conditions.length - 1);
    assert.equal(Object.keys(CONDITIONS).length, conditions.length);
    assert.equal(Object.keys(SYMPTOMS).length, symptoms.length);
    const current = createSession('backward', 'P1');
    assert.equal(current.knowledgeVersion, KNOWLEDGE_VERSION);
    assert.ok(isValidSession(decodeStoredSession(encodeStoredSession(current))));
    const old = structuredClone(current); delete old.knowledgeVersion;
    assert.equal(isValidSession(old), false);
    assert.equal(isValidSession({ ...current, knowledgeVersion: 'older' }), false);
    assert.equal(isValidSession({ ...current, target: 'P999' }), false);
    assert.equal(isValidSession({ ...current, facts: { G11: 'yes' } }), false);
});

test('Progres lama dihapus dengan alasan reset; tulisan tab lama tidak menimpa progres baru', async () => {
    const previous = globalThis.indexedDB;
    const values = new Map();
    const database = { transaction() {
        const transaction = { objectStore: () => ({
            get: key => ({ result: structuredClone(values.get(key)) }),
            put: (value, key) => { values.set(key, structuredClone(value)); return {}; },
            delete: key => { values.delete(key); return {}; }
        }) };
        queueMicrotask(() => transaction.oncomplete?.());
        return transaction;
    } };
    globalThis.indexedDB = { open() {
        const request = { result: database };
        queueMicrotask(() => request.onsuccess?.());
        return request;
    } };
    try {
        assert.ok(await initializeStorage());
        const current = { ...createSession('backward', 'P1'), order: ['G11', 'G70'], facts: { G11: true }, deferredAnswers: { G70: 'skipped' } };
        const legacy = structuredClone(current); delete legacy.knowledgeVersion;
        values.set('sispak.sesi.backward', encodeStoredSession(legacy));
        values.set('sispak.sesi.2026-11-01-audit-1.backward', encodeStoredSession(legacy));
        await loadProgress();
        assert.equal(getSavedSession('backward'), null);
        assert.equal(wasProgressReset('backward'), true);
        assert.equal(values.has('sispak.sesi.backward'), false);
        assert.equal(values.has('sispak.sesi.2026-11-01-audit-1.backward'), false);
        saveSession(current);
        await new Promise(resolve => setTimeout(resolve, 0));
        assert.equal(wasProgressReset('backward'), false);
        assert.ok(values.has('sispak.sesi.' + KNOWLEDGE_VERSION + '.backward'));
        values.set('sispak.sesi.backward', encodeStoredSession({ ...legacy, facts: { G11: false } }));
        await reloadSession('backward');
        assert.equal(getSavedSession('backward').facts.G11, true);
        assert.equal(getSavedSession('backward').deferredAnswers.G70, 'skipped');
    } finally {
        if (previous === undefined) delete globalThis.indexedDB;
        else globalThis.indexedDB = previous;
    }
});
