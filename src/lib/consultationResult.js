// Penghubung hasil ke tampilan Vue. Hasil hanya disimpan di memori.
import { shallowRef } from "vue";
import { getCrisisAnswers } from "./rules.js";
import { listAnswers } from "./consultationSession.js";

// Hasil skrining bersifat rahasia: hanya disimpan di memori halaman, tidak pernah ditulis ke
// penyimpanan browser maupun dikirim ke server. Hasil hilang saat halaman dimuat ulang atau ditutup.
export const latestResult = shallowRef(null);

// entri = { waktu, metode, target, penyakit: [terdiagnosa], belumCukup: [kriteria terpenuhi tapi durasi kurang], durasi,
//          krisis: gejala krisis dijawab Ya, remaja: pengguna di bawah 18 tahun, jawaban }
export function createResult(session, conclusion) {
    latestResult.value = {
        timestamp: Date.now(),
        method: session.method,
        target: session.target,
        conditions: conclusion.conditions,
        insufficientDuration: conclusion.insufficientDuration,
        incompleteConditions: conclusion.incompleteConditions ?? [],
        deferredAnswers: conclusion.deferredAnswers ?? {},
        hasUnansweredSafetyQuestion: conclusion.hasUnansweredSafetyQuestion ?? false,
        duration: conclusion.duration,
        crisis: getCrisisAnswers(session.facts).length > 0,
        isMinor: session.ageGroup === "minor",
        answers: listAnswers(session)
    };
    return latestResult.value;
}

