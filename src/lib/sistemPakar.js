import { GEJALA, PENYAKIT } from "@/data/pengetahuan";
import { baca, hapus, simpan } from "./penyimpanan";

const KEY_SESI = "sispak.sesi";
const KEY_RIWAYAT = "sispak.riwayat";
const MAKS_RIWAYAT = 20;

export const ID_DUA_MINGGU = 13;

export function penyakitValid(id) {
    return Object.hasOwn(PENYAKIT, id ?? "");
}

export function daftarPenyakit() {
    return Object.keys(PENYAKIT).filter((id) => id !== "P0");
}

export function gejalaPenyakit(idPenyakit) {
    return Object.entries(GEJALA)
        .filter(([, g]) => g.penyakit === idPenyakit)
        .map(([id, g]) => ({ id: Number(id), ...g }));
}

export function formatTanggal(waktu) {
    return new Date(waktu).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

/* ---------- Riwayat konsultasi ---------- */

export function ambilRiwayat() {
    const riwayat = baca(KEY_RIWAYAT, []);
    return Array.isArray(riwayat) ? riwayat.filter((e) => e && penyakitValid(e.penyakit) && Number.isFinite(e.waktu)) : [];
}

export function hapusRiwayat() {
    hapus(KEY_RIWAYAT);
}

export function catatHasil(penyakit, metode, jawaban) {
    const entri = { waktu: Date.now(), metode, penyakit, jawaban };
    simpan(KEY_RIWAYAT, [entri, ...ambilRiwayat()].slice(0, MAKS_RIWAYAT));
    return entri;
}

export function ruteHasil(entri) {
    return { path: "/hasil", query: { id: entri.penyakit, r: String(entri.waktu) } };
}

/* ---------- Forward chaining ---------- */

export function sesiBaru() {
    return { id: 1, penyakit: null, langkah: [] };
}

export function ambilSesi() {
    const sesi = baca(KEY_SESI, null);
    return sesi && GEJALA[sesi.id] && Array.isArray(sesi.langkah) ? sesi : null;
}

export function simpanSesi(sesi) {
    simpan(KEY_SESI, sesi);
}

export function hapusSesi() {
    hapus(KEY_SESI);
}

// Menghasilkan sesi berikutnya, atau { selesai: idPenyakit } jika konsultasi berakhir.
// Setiap langkah menyimpan keadaan sebelum menjawab supaya bisa dibatalkan.
export function jawab(sesi, jawaban) {
    const g = GEJALA[sesi.id];
    const berikutnya = g[jawaban];
    const langkah = [...sesi.langkah, { id: sesi.id, penyakit: sesi.penyakit, jawaban }];

    // jawaban "tidak" yang menuju konfirmasi 2 minggu tetap memakai penyakit sebelumnya
    let penyakit = sesi.penyakit;
    if (g.penyakit !== "P0" && !(jawaban === "tidak" && berikutnya === ID_DUA_MINGGU)) {
        penyakit = g.penyakit;
    }

    if (berikutnya === "f") {
        return { selesai: penyakit ?? "P0", langkah };
    }
    if (berikutnya === 12) {
        return { selesai: "P0", langkah };
    }
    return { id: berikutnya, penyakit, langkah };
}

export function batalkan(sesi) {
    const terakhir = sesi.langkah.at(-1);
    if (!terakhir) return sesi;
    return { id: terakhir.id, penyakit: terakhir.penyakit, langkah: sesi.langkah.slice(0, -1) };
}
