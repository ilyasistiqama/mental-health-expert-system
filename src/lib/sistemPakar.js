import { baca, hapus, simpan } from "./penyimpanan";

const KEY_SESI = "sispak.sesi";
const KEY_RIWAYAT = "sispak.riwayat";
const MAKS_RIWAYAT = 20;

export const KODE_NORMAL = "P0";
export const KODE_DURASI = "durasi";
export const PERTANYAAN_DURASI = "Apakah anda sudah mengalami gejala-gejala tersebut selama 2 minggu atau lebih?";

/* ---------- Basis pengetahuan (public/data/*.json) ---------- */

// diisi oleh muatBasisPengetahuan() sebelum aplikasi di-mount
export const PENYAKIT = {};
export const GEJALA = {};
export const DAFTAR_GEJALA = [];
// aturan produksi: IF semua gejala THEN penyakit
export const ATURAN = [];

async function ambilJson(nama) {
    const respons = await fetch(`${import.meta.env.BASE_URL}data/${nama}`, { cache: "no-cache" });
    if (!respons.ok) throw new Error(`Gagal memuat data/${nama} (${respons.status})`);
    return respons.json();
}

export async function muatBasisPengetahuan() {
    const [daftarPenyakit, daftarGejala] = await Promise.all([ambilJson("penyakit.json"), ambilJson("gejala.json")]);

    for (const g of daftarGejala) {
        if (GEJALA[g.kode]) console.warn(`gejala.json: kode ${g.kode} dipakai lebih dari sekali`);
        GEJALA[g.kode] = g;
        DAFTAR_GEJALA.push(g);
    }

    for (const p of daftarPenyakit) {
        if (PENYAKIT[p.kode]) console.warn(`penyakit.json: kode ${p.kode} dipakai lebih dari sekali`);
        PENYAKIT[p.kode] = { ...p, gejala: p.gejala ?? [], pengobatan: p.pengobatan ?? [] };

        const gejala = PENYAKIT[p.kode].gejala.filter((k) => {
            if (!GEJALA[k]) console.warn(`penyakit.json: gejala ${k} pada ${p.kode} tidak ada di gejala.json`);
            return GEJALA[k];
        });
        if (p.kode !== KODE_NORMAL && gejala.length > 0) {
            ATURAN.push({ penyakit: p.kode, gejala });
        }
    }

    if (!PENYAKIT[KODE_NORMAL]) throw new Error(`penyakit.json wajib berisi ${KODE_NORMAL} (tidak terdeteksi)`);
}

export function penyakitValid(kode) {
    return Object.hasOwn(PENYAKIT, kode ?? "");
}

export function daftarPenyakit() {
    return ATURAN.map((a) => a.penyakit);
}

export function gejalaPenyakit(kode) {
    return (PENYAKIT[kode]?.gejala ?? []).filter((k) => GEJALA[k]).map((k) => GEJALA[k]);
}

export function formatTanggal(waktu) {
    return new Date(waktu).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

/* ---------- Mesin inferensi ---------- */

// sesi = { metode: "forward" | "backward", target, fakta: { G01: true, ... }, durasi: null | boolean, urutan: [kode yang dijawab] }
export function sesiBaru(metode, target = null) {
    return { metode, target, fakta: {}, durasi: null, urutan: [] };
}

function statusAturan(aturan, fakta) {
    if (aturan.gejala.some((k) => fakta[k] === false)) return "gugur";
    if (aturan.gejala.every((k) => fakta[k] === true)) return "terpenuhi";
    return "terbuka";
}

// forward chaining memakai semua aturan, backward chaining hanya aturan hipotesis
function aturanKandidat(sesi) {
    return sesi.metode === "backward" ? ATURAN.filter((a) => a.penyakit === sesi.target) : ATURAN;
}

// Menentukan pertanyaan berikutnya, atau kesimpulan jika inferensi selesai.
// Gejala yang hanya dimiliki aturan yang sudah gugur tidak ditanyakan karena tidak bisa mengubah kesimpulan.
export function langkahBerikutnya(sesi) {
    const kandidat = aturanKandidat(sesi);
    const terbuka = kandidat.filter((a) => statusAturan(a, sesi.fakta) === "terbuka");

    if (terbuka.length > 0) {
        const belumDitanya = (k) => !Object.hasOwn(sesi.fakta, k);
        const kode = sesi.metode === "backward"
            ? terbuka[0].gejala.find(belumDitanya)
            : DAFTAR_GEJALA.find((g) => belumDitanya(g.kode) && terbuka.some((a) => a.gejala.includes(g.kode))).kode;
        return { jenis: "gejala", kode, sisa: sisaPertanyaan(terbuka, sesi.fakta) + 1 };
    }

    const terpenuhi = kandidat.filter((a) => statusAturan(a, sesi.fakta) === "terpenuhi").map((a) => a.penyakit);

    // semua gejala sudah terpenuhi, durasi >= 2 minggu menjadi akhir diagnosa
    if (terpenuhi.length > 0 && sesi.durasi === null) {
        return { jenis: "durasi", sisa: 1 };
    }

    return {
        jenis: "selesai",
        penyakit: sesi.durasi === true ? terpenuhi : [],
        terdeteksi: terpenuhi,
        durasi: sesi.durasi
    };
}

function sisaPertanyaan(terbuka, fakta) {
    return new Set(terbuka.flatMap((a) => a.gejala).filter((k) => !Object.hasOwn(fakta, k))).size;
}

export function jawab(sesi, ya) {
    const langkah = langkahBerikutnya(sesi);
    if (langkah.jenis === "gejala") {
        return { ...sesi, fakta: { ...sesi.fakta, [langkah.kode]: ya }, urutan: [...sesi.urutan, langkah.kode] };
    }
    if (langkah.jenis === "durasi") {
        return { ...sesi, durasi: ya, urutan: [...sesi.urutan, KODE_DURASI] };
    }
    return sesi;
}

export function batalkan(sesi) {
    const terakhir = sesi.urutan.at(-1);
    if (!terakhir) return sesi;
    if (terakhir === KODE_DURASI) {
        return { ...sesi, durasi: null, urutan: sesi.urutan.slice(0, -1) };
    }
    const { [terakhir]: _, ...fakta } = sesi.fakta;
    return { ...sesi, fakta, urutan: sesi.urutan.slice(0, -1) };
}

export function daftarJawaban(sesi) {
    return sesi.urutan.map((kode) => ({ kode, ya: kode === KODE_DURASI ? sesi.durasi : sesi.fakta[kode] }));
}

export function teksPertanyaan(kode) {
    return kode === KODE_DURASI ? PERTANYAAN_DURASI : GEJALA[kode]?.pertanyaan;
}

/* ---------- Penyimpanan sesi ---------- */

function sesiValid(sesi) {
    return sesi && ["forward", "backward"].includes(sesi.metode) && Array.isArray(sesi.urutan)
        && sesi.fakta && typeof sesi.fakta === "object"
        && sesi.urutan.every((k) => k === KODE_DURASI || GEJALA[k]);
}

export function ambilSesi(metode) {
    const sesi = baca(`${KEY_SESI}.${metode}`, null);
    return sesiValid(sesi) && sesi.metode === metode ? sesi : null;
}

export function simpanSesi(sesi) {
    simpan(`${KEY_SESI}.${sesi.metode}`, sesi);
}

export function hapusSesi(metode) {
    hapus(`${KEY_SESI}.${metode}`);
}

/* ---------- Riwayat konsultasi ---------- */

// entri = { waktu, metode, target, penyakit: [terdiagnosa], terdeteksi: [gejala terpenuhi], durasi, jawaban: [{ kode, ya }] }
export function ambilRiwayat() {
    const riwayat = baca(KEY_RIWAYAT, []);
    return Array.isArray(riwayat)
        ? riwayat.filter((e) => e && Number.isFinite(e.waktu) && Array.isArray(e.penyakit) && Array.isArray(e.terdeteksi) && Array.isArray(e.jawaban))
        : [];
}

export function hapusRiwayat() {
    hapus(KEY_RIWAYAT);
}

export function catatHasil(sesi, kesimpulan) {
    const entri = {
        waktu: Date.now(),
        metode: sesi.metode,
        target: sesi.target,
        penyakit: kesimpulan.penyakit,
        terdeteksi: kesimpulan.terdeteksi,
        durasi: kesimpulan.durasi,
        jawaban: daftarJawaban(sesi)
    };
    simpan(KEY_RIWAYAT, [entri, ...ambilRiwayat()].slice(0, MAKS_RIWAYAT));
    return entri;
}

export function ruteHasil(entri) {
    return { path: "/hasil", query: { r: String(entri.waktu) } };
}

export function namaMetode(metode) {
    return metode === "backward" ? "Backward Chaining" : "Forward Chaining";
}

export function judulHasil(entri) {
    if (entri.penyakit.length > 0) return entri.penyakit.map((k) => PENYAKIT[k]?.nama ?? k).join(", ");
    if (entri.metode === "backward") return `Hipotesis ${PENYAKIT[entri.target]?.nama ?? entri.target} tidak terbukti`;
    return PENYAKIT[KODE_NORMAL].nama;
}
