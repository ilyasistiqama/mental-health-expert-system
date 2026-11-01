// Penyimpanan progres dan sinkronisasi antar-tab, terpisah dari algoritma.
import { KNOWLEDGE_VERSION, DURATION_OPTIONS, SYMPTOMS, CONDITIONS } from "./knowledgeBase.js";
import { DURATION_PREFIX, isDeferredAnswer } from "./consultationSession.js";
import { read, migrateLegacyStorage, remove, write } from "./storage.js";

import { decodeStoredSession, encodeStoredSession } from "./sessionCompatibility.js";

const LEGACY_SESSION_KEY = "sispak.sesi";
const SESSION_KEY = `${LEGACY_SESSION_KEY}.${KNOWLEDGE_VERSION}`;
const METHODS = ["forward", "backward"];
// Keep known older namespaces here so a schema update does not leave private progress behind.
const PREVIOUS_SESSION_KEYS = ["sispak.sesi.2026-11-01-audit-1"];

// Progres yang belum selesai disimpan di IndexedDB agar bisa dilanjutkan setelah browser ditutup,
// lalu dihapus begitu hasil keluar. Salinannya disimpan di memori supaya bisa dibaca langsung.
const sessionCache = {};
const resetMethods = new Set();
export function wasProgressReset(method) { return resetMethods.has(method); }
// Jangan membuat BroadcastChannel di luar browser (misalnya saat pengujian Node). Di browser
// saluran ini menyinkronkan progres antar-tab.
const channel = typeof window !== "undefined" && window.BroadcastChannel ? new window.BroadcastChannel("sispak") : null;

export function isValidSession(session) {
    return session && session.knowledgeVersion === KNOWLEDGE_VERSION && METHODS.includes(session.method) && Array.isArray(session.order)
        && session.facts && typeof session.facts === "object" && !Array.isArray(session.facts) && session.duration && typeof session.duration === "object" && !Array.isArray(session.duration) && Array.isArray(session.questionOrder)
        && (session.method === 'forward' ? session.target === null : Boolean(CONDITIONS[session.target] && session.target !== 'P0'))
        && Object.entries(session.facts).every(([code, value]) => SYMPTOMS[code] && !SYMPTOMS[code].sources && !SYMPTOMS[code].educationalOnly && typeof value === 'boolean')
        && Object.entries(session.duration).every(([code, value]) => CONDITIONS[code] && code !== 'P0' && DURATION_OPTIONS.some(option => option.days === value))
        && typeof (session.deferredAnswers ?? {}) === 'object' && !Array.isArray(session.deferredAnswers)
        && Object.entries(session.deferredAnswers ?? {}).every(([code, value]) => isDeferredAnswer(value) && session.order.includes(code) && (
            code.startsWith(DURATION_PREFIX)
                ? CONDITIONS[code.slice(DURATION_PREFIX.length)]?.minimumDuration > 0 && !Object.hasOwn(session.duration, code.slice(DURATION_PREFIX.length))
                : SYMPTOMS[code] && !SYMPTOMS[code].sources && !SYMPTOMS[code].educationalOnly && !Object.hasOwn(session.facts, code)
        ))
        && session.questionOrder.every(code => SYMPTOMS[code] && !SYMPTOMS[code].sources)
        && session.order.every((k) => typeof k === "string" && ((SYMPTOMS[k] && !SYMPTOMS[k].sources) || (k.startsWith(DURATION_PREFIX) && CONDITIONS[k.slice(DURATION_PREFIX.length)])));
}

// dipanggil sekali saat aplikasi dimulai, setelah basis pengetahuan dimuat
export async function loadProgress() {
    await migrateLegacyStorage(METHODS.map((m) => `${LEGACY_SESSION_KEY}.${m}`));
    await Promise.all(METHODS.map(async method => {
        for (const prefix of PREVIOUS_SESSION_KEYS) {
            const key = prefix + '.' + method;
            if (await read(key) !== undefined) {
                resetMethods.add(method);
                await remove(key).catch(() => {});
            }
        }
    }));
    await Promise.all(METHODS.map(reloadSession));
}

// membaca ulang dari IndexedDB, misalnya saat tab kembali aktif atau tab lain mengubah progres
export async function reloadSession(method) {
    const current = await read(SESSION_KEY + '.' + method);
    const legacy = current === undefined ? await read(LEGACY_SESSION_KEY + '.' + method) : undefined;
    const session = decodeStoredSession(current ?? legacy);
    if (session && session.knowledgeVersion !== KNOWLEDGE_VERSION) {
        resetMethods.add(method);
        await remove((current === undefined ? LEGACY_SESSION_KEY : SESSION_KEY) + '.' + method).catch(() => {});
    }
    sessionCache[method] = isValidSession(session) && session.method === method ? session : null;
    if (sessionCache[method]) resetMethods.delete(method);
    return sessionCache[method];
}

export function getSavedSession(method) {
    return sessionCache[method] ?? null;
}

export function areSessionsEqual(a, b) {
    return JSON.stringify([a?.knowledgeVersion, a?.target, a?.order, a?.facts, a?.duration, a?.deferredAnswers, a?.questionOrder, a?.ageGroup]) === JSON.stringify([b?.knowledgeVersion, b?.target, b?.order, b?.facts, b?.duration, b?.deferredAnswers, b?.questionOrder, b?.ageGroup]);
}

function notifyOtherTabs(method) {
    channel?.postMessage({ method, ["metode"]: method });
}

// progres baru disimpan setelah pengguna menjawab minimal satu pertanyaan
export function saveSession(session) {
    if (session.order.length === 0) {
        if (sessionCache[session.method] !== null) deleteSession(session.method);
        return;
    }
    if (areSessionsEqual(sessionCache[session.method], session)) return;
    if (!isValidSession(session)) return;
    resetMethods.delete(session.method);
    const copy = JSON.parse(JSON.stringify(session));
    sessionCache[session.method] = copy;
    write(`${SESSION_KEY}.${session.method}`, encodeStoredSession(copy))
        .then(() => notifyOtherTabs(session.method))
        .catch((e) => console.warn("Progres gagal disimpan", e));
}

export function deleteSession(method) {
    sessionCache[method] = null;
    remove(`${SESSION_KEY}.${method}`)
        .then(() => notifyOtherTabs(method))
        .catch((e) => console.warn("Progres gagal dihapus", e));
}

export function onSessionChange(callback) {
    const handleMessage = (e) => callback(e.data?.method ?? e.data?.["metode"]);
    channel?.addEventListener("message", handleMessage);
    return () => channel?.removeEventListener("message", handleMessage);
}

