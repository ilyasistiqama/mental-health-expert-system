// Presentation follows the selected language; inference continues to use canonical data.
import { CONDITIONS, SYMPTOMS } from "./knowledgeBase.js";
import { DURATION_PREFIX } from "./consultationSession.js";
import { t, getDateLocale } from "./i18n.js";

export function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString(getDateLocale(), { dateStyle: "medium", timeStyle: "short" });
}

export function formatDuration(days) {
    if (days >= 30) return t(days === 30 ? "1 bulan" : "{0} bulan", [days / 30]);
    if (days >= 7) return t(days === 7 ? "1 minggu" : "{0} minggu", [days / 7]);
    return t(days === 1 ? "1 hari" : "{0} hari", [days]);
}

export const METHOD_INFO = {
    forward: { name: "Skrining Menyeluruh", route: "/cek-menyeluruh", technicalName: "Forward Chaining" },
    backward: { name: "Skrining Topik Tertentu", route: "/cek-gangguan", technicalName: "Backward Chaining" }
};

export function getMethodName(method) { return t(METHOD_INFO[method]?.name ?? method); }
export function getMethodRoute(method, target = null) {
    return target ? { path: METHOD_INFO[method].route, query: { id: target } } : METHOD_INFO[method].route;
}

export function getResultTitle(entry) {
    if (entry.conditions.length > 0) return t("Jawaban anda dapat menjadi bahan percakapan dengan profesional");
    if (entry.insufficientDuration.length > 0) return t("Keluhan yang anda laporkan tetap layak dibicarakan");
    if (entry.crisis) return t("Utamakan dukungan untuk diri anda");
    if (entry.incompleteConditions?.length) return t("Informasi belum cukup untuk merangkum sebagian topik");
    return t("Belum ada topik khusus dari jawaban anda");
}

export function getNoTopicSummary(entry) {
    if (entry.incompleteConditions?.length) {
        if (entry.method === "backward") return t("Informasi untuk topik {0} belum cukup karena sebagian pertanyaan belum dijawab dengan pasti. Topik lain tidak diperiksa dalam sesi ini. Pilihan Kurang yakin dan Lewati tidak dianggap sebagai jawaban Tidak.", [CONDITIONS[entry.target]?.name ?? entry.target]);
        return t("Sebagian pertanyaan belum memiliki jawaban pasti, sehingga informasi belum cukup untuk merangkum topik terkait. Pilihan Kurang yakin dan Lewati tidak dianggap sebagai jawaban Tidak.");
    }
    if (entry.method === "backward") {
        return t("Skrining untuk topik {0} sudah selesai. Jawaban anda belum mengarah ke topik ini. Topik kesehatan mental lain tidak diperiksa dalam sesi ini.", [CONDITIONS[entry.target]?.name ?? entry.target]);
    }
    return t("Skrining sudah selesai. Dari jawaban anda, belum ada topik khusus yang dapat dirangkum dalam cakupan skrining ini.");
}

export function getLocalizedDurationQuestion(code) {
    return t("Sudah berapa lama keluhan yang anda jawab berlangsung pada topik {0}?", [CONDITIONS[code]?.name ?? code]);
}

// Resolve by stable codes so a completed result can change language without being recreated.
export function getAnswerQuestion(answer) {
    return answer.code.startsWith(DURATION_PREFIX)
        ? getLocalizedDurationQuestion(answer.code.slice(DURATION_PREFIX.length))
        : t(SYMPTOMS[answer.code]?.question ?? answer.question);
}
