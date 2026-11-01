import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { createServer } from "vite";
import { createSSRApp } from "vue";
import { renderToString } from "@vue/server-renderer";

test("Screening pages encourage professional support without diagnosis or export in either language", async () => {
    const root = fileURLToPath(new URL("../", import.meta.url));
    const server = await createServer({ root, server: { middlewareMode: true, hmr: false }, appType: "custom" });
    const originalFetch = globalThis.fetch;
    const originalIndexedDB = globalThis.indexedDB;
    globalThis.fetch = async url => ({ ok: true, json: async () => JSON.parse(await readFile(new URL("../public/data/" + String(url).split("/").at(-1), import.meta.url), "utf8")) });
    try {
        const { createRouter, createMemoryHistory } = await server.ssrLoadModule("vue-router");
        const knowledge = await server.ssrLoadModule("/src/lib/knowledgeBase.js");
        await knowledge.loadKnowledgeBase();
        // In-memory IndexedDB test double lets the real session component resume progress.
        const records = new Map();
        const database = { transaction() {
            const transaction = { objectStore: () => ({
                get: key => ({ result: structuredClone(records.get(key)) }),
                put: (value, key) => { records.set(key, structuredClone(value)); return {}; },
                delete: key => { records.delete(key); return {}; }
            }) };
            queueMicrotask(() => transaction.oncomplete?.());
            return transaction;
        } };
        globalThis.indexedDB = { open() { const request = { result: database }; queueMicrotask(() => request.onsuccess?.()); return request; } };
        const storage = await server.ssrLoadModule("/src/lib/storage.js");
        assert.ok(await storage.initializeStorage());
        const progress = await server.ssrLoadModule("/src/lib/consultationProgress.js");
        const sessions = await server.ssrLoadModule("/src/lib/consultationSession.js");
        const { setLanguage, t } = await server.ssrLoadModule("/src/lib/i18n.js");
        const { latestResult } = await server.ssrLoadModule("/src/lib/consultationResult.js");
        const { getResultTitle, getNoTopicSummary } = await server.ssrLoadModule("/src/lib/consultationDisplay.js");
        const { CRISIS_TITLE, MINOR_TITLE } = await server.ssrLoadModule("/src/lib/supportMessages.js");
        const App = (await server.ssrLoadModule("/src/App.vue")).default;
        const pages = { "/": "HomeView", "/artikel": "ArticlesView", "/konsultasi": "ConsultationView", "/cek-menyeluruh": "ForwardView", "/cek-gangguan": "BackwardView", "/hasil": "ResultView", "/sumber": "ReferencesView", "/tentang": "AboutView", "/faq": "FaqView" };
        const routes = await Promise.all(Object.entries(pages).map(async ([path, name]) => ({ path, component: (await server.ssrLoadModule("/src/views/" + name + ".vue")).default, meta: { menu: path === "/" ? "home" : path.slice(1) } })));
        const base = { timestamp: 123456789, method: "backward", target: "P9", conditions: [], insufficientDuration: [], duration: {}, crisis: false, isMinor: false, answers: [] };
        const scenarios = [
            { ...base, incompleteConditions: ["P9"], deferredAnswers: { G50: "unsure", G58: "skipped" }, hasUnansweredSafetyQuestion: true },
            { ...base, method: "forward", conditions: ["P12"], incompleteConditions: ["P9"], deferredAnswers: { G50: "skipped" } },
            { ...base, target: "P12", conditions: ["P12"] },
            { ...base, target: "P13", conditions: ["P13"], duration: { P13: 90 } },
            { ...base, conditions: ["P9"], duration: { P9: 14 } },
            { ...base },
            { ...base, method: "forward", target: null },
            { ...base, crisis: true },
            { ...base, target: "P2", insufficientDuration: ["P2"], duration: { P2: 14 } },
            { ...base, conditions: ["P9"], crisis: true, isMinor: true, duration: { P9: 14 } }
        ];
        const render = async path => {
            const router = createRouter({ history: createMemoryHistory(), routes });
            await router.push(path); await router.isReady();
            return renderToString(createSSRApp(App).use(router));
        };
        for (const language of ["id", "en"]) {
            setLanguage(language);
            for (const entry of scenarios) {
                latestResult.value = structuredClone(entry);
                const html = await render("/hasil");
                const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]*>/g, "");
                assert.equal(heading, getResultTitle(entry));
                assert.doesNotMatch(heading, /Gangguan|Disorder/);
                assert.ok(html.includes('href="#professional-help"'));
                assert.ok(html.includes(t("Langkah mencari bantuan profesional")));
                if (entry.conditions.length || entry.insufficientDuration.length) {
                    assert.ok(html.indexOf('id="discussion-topics-title"') < html.indexOf('id="professional-help"'));
                }
                assert.ok(html.includes(t("Jika keluhan mengganggu keseharian, menetap, atau membuat anda khawatir, hubungi psikolog klinis, psikiater, atau puskesmas, apa pun hasil skriningnya.")));
                assert.doesNotMatch(html, /PDF|download=|Kriteria yang terpenuhi|Criteria met|Treatments commonly provided|Penanganan yang umumnya/);
                if (!entry.conditions.length && !entry.insufficientDuration.length) {
                    assert.ok(html.includes('id="no-topic-summary"'));
                    assert.ok(html.includes(t("Yang tetap bisa anda ceritakan kepada profesional")));
                    assert.ok(html.includes(t("Ini bukan pernyataan bahwa anda sehat atau bebas dari gangguan. Skrining memiliki keterbatasan, dan keluhan yang anda rasakan tetap layak didengarkan.")));
                    assert.ok(html.includes(getNoTopicSummary(entry)));
                    if (entry.crisis) assert.ok(html.includes(t("Tidak adanya topik khusus tidak mengurangi pentingnya mencari bantuan. Gunakan kontak bantuan di atas jika anda merasa tidak aman.")));
                }
                assert.ok(html.includes(t("Panduan konsultasi pertama")));
                assert.ok(html.includes('id="first-consultation"'));
                if (Object.keys(entry.deferredAnswers ?? {}).length) {
                    assert.ok(html.includes('id="incomplete-information"'));
                    assert.ok(html.includes(t("Ada {0} pertanyaan dengan pilihan Kurang yakin atau Lewati. Pilihan tersebut tetap dicatat sebagai belum diketahui, bukan Tidak.", [Object.keys(entry.deferredAnswers).length])));
                }
                if (entry.hasUnansweredSafetyQuestion) assert.ok(html.includes(t("Pertanyaan tentang keselamatan belum dijawab dengan pasti. Aplikasi ini tidak dapat menilai apakah anda aman. Jika merasa tidak aman atau mungkin menyakiti diri, segera cari bantuan melalui kontak yang tersedia.")));
                if (entry.insufficientDuration.length) assert.ok(html.includes(t("Ada keluhan yang belum mencapai durasi pada aturan skrining. Hal ini tidak berarti keluhan tersebut ringan atau aman diabaikan. Anda tidak perlu menunggu lebih lama untuk mencari bantuan.")));
                if (entry.crisis) assert.ok(html.indexOf(t(CRISIS_TITLE)) < html.indexOf("<h1"));
                if (entry.isMinor) assert.ok(html.includes(t(MINOR_TITLE)));
            }
            // Verify the actual question component offers the choices in both languages,
            // including duration and safety questions, using valid persisted progress.
            const symptomSession = sessions.answerQuestion(sessions.createSession("backward", "P12"), true);
            let durationSession = sessions.createSession("backward", "P3");
            for (let index = 0; sessions.getNextStep(durationSession).kind === "symptom" && index < 20; index++) durationSession = sessions.answerQuestion(durationSession, true);
            assert.equal(sessions.getNextStep(durationSession).kind, "duration");
            let safetySession = sessions.createSession("backward", "P9");
            for (let index = 0; sessions.getNextStep(safetySession).code !== "G58" && index < 20; index++) safetySession = sessions.answerQuestion(safetySession, false);
            assert.equal(sessions.getNextStep(safetySession).code, "G58");
            for (const session of [symptomSession, durationSession, safetySession]) {
                progress.saveSession(session);
                const html = await render("/cek-gangguan?id=" + session.target);
                const buttons = [...html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)].map(match => match[1].replace(/<[^>]*>/g, "").trim());
                assert.ok(buttons.includes(t("Kurang yakin")));
                assert.ok(buttons.includes(t("Lewati")));
                if (sessions.getNextStep(session).kind === "symptom") {
                    assert.ok(buttons.includes(t("Ya")));
                    assert.ok(buttons.includes(t("Tidak")));
                }
                if (session.target === "P9") assert.ok(html.includes(t("Anda boleh tidak menjawab. Jika saat ini merasa tidak aman atau mungkin menyakiti diri, cari pertolongan segera; anda tidak perlu menyelesaikan skrining.")));
            }
            latestResult.value = null;
            const empty = await render("/hasil");
            assert.ok(empty.includes(t("Hasil tidak tersedia")));
            assert.ok(empty.includes('href="/tentang#professional-help"'));
            for (const path of ["/", "/konsultasi", "/tentang", "/artikel", "/faq"]) {
                const html = await render(path); assert.doesNotMatch(html, /PDF|download=/);
                assert.ok(html.includes(language === "en" ? "professional" : "profesional"));
                assert.ok(html.includes('href="/faq"'));
                if (path === "/faq") {
                    assert.equal((html.match(/<details/g) ?? []).length, 8);
                    assert.ok(html.includes(t("Apa bedanya Kurang yakin, Lewati, dan Tidak?")));
                    assert.ok(html.includes('href="/tentang#first-consultation"'));
                }
            }
        }
    } finally {
        globalThis.fetch = originalFetch;
        if (originalIndexedDB === undefined) delete globalThis.indexedDB; else globalThis.indexedDB = originalIndexedDB;
        await server.close();
    }
});
