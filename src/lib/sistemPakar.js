import { shallowRef } from "vue";
import { BASIS } from "./basis";
import { baca, bersihkanDataLama, hapus, simpan } from "./penyimpanan";

const KEY_SESI = "sispak.sesi";
const METODE = ["forward", "backward"];

export const KODE_NORMAL = "P0";
const AWALAN_DURASI = "durasi:";

// pilihan jawaban durasi, "hari" adalah batas bawah tiap pilihan
export const OPSI_DURASI = [
    { hari: 0, label: "Kurang dari 2 minggu" },
    { hari: 14, label: "2 minggu sampai 1 bulan" },
    { hari: 30, label: "1 sampai 3 bulan" },
    { hari: 90, label: "3 sampai 6 bulan" },
    { hari: 180, label: "6 bulan atau lebih" }
];

/* ---------- Basis pengetahuan (public/data/*.json) ---------- */

// diisi oleh muatBasisPengetahuan() sebelum aplikasi di-mount
export const PENYAKIT = {};
export const GEJALA = {};
export const DAFTAR_GEJALA = [];
export const SUMBER = {};
export const DAFTAR_SUMBER = [];
// aturan produksi: IF semua kriteria terpenuhi THEN penyakit,
// kriteria terpenuhi jika minimal sejumlah gejalanya dijawab Ya
export const ATURAN = [];

async function ambilJson(nama) {
    const respons = await fetch(`${BASIS}data/${nama}`, { cache: "no-cache" });
    if (!respons.ok) throw new Error(`Gagal memuat data/${nama} (${respons.status})`);
    return respons.json();
}

export async function muatBasisPengetahuan() {
    const [daftarPenyakit, daftarGejala, daftarSumber] = await Promise.all([ambilJson("penyakit.json"), ambilJson("gejala.json"), ambilJson("sumber.json")]);

    daftarSumber.forEach((s, i) => {
        SUMBER[s.id] = { ...s, nomor: i + 1 };
        DAFTAR_SUMBER.push(SUMBER[s.id]);
    });

    for (const g of daftarGejala) {
        if (GEJALA[g.kode]) console.warn(`gejala.json: kode ${g.kode} dipakai lebih dari sekali`);
        GEJALA[g.kode] = g;
        DAFTAR_GEJALA.push(g);
    }

    // fakta antara hanya boleh disusun dari gejala yang ditanyakan langsung
    for (const g of DAFTAR_GEJALA.filter((g) => g.dari)) {
        g.dari = g.dari.filter((kode) => {
            const valid = GEJALA[kode] && !GEJALA[kode].dari;
            if (!valid) console.warn(`gejala.json: ${kode} pada "dari" ${g.kode} tidak ada atau juga fakta antara`);
            return valid;
        });
    }

    for (const p of daftarPenyakit) {
        if (PENYAKIT[p.kode]) console.warn(`penyakit.json: kode ${p.kode} dipakai lebih dari sekali`);

        const kriteria = (p.kriteria ?? []).map((k) => {
            const gejala = (k.gejala ?? []).filter((kode) => {
                if (!GEJALA[kode]) console.warn(`penyakit.json: gejala ${kode} pada ${p.kode} tidak ada di gejala.json`);
                return GEJALA[kode];
            });
            const minimal = Math.min(k.minimal ?? gejala.length, gejala.length);
            return { gejala, minimal };
        }).filter((k) => k.minimal > 0);

        const durasiMinimal = p.durasiMinimal ?? 0;
        if (!OPSI_DURASI.some((o) => o.hari === durasiMinimal)) {
            console.warn(`penyakit.json: durasiMinimal ${p.kode} sebaiknya salah satu dari ${OPSI_DURASI.map((o) => o.hari).join(", ")} hari`);
        }

        const sumber = (p.sumber ?? []).filter((id) => {
            if (!SUMBER[id]) console.warn(`penyakit.json: sumber ${id} pada ${p.kode} tidak ada di sumber.json`);
            return SUMBER[id];
        });

        PENYAKIT[p.kode] = { ...p, kriteria, durasiMinimal, sumber, pengobatan: p.pengobatan ?? [] };
        if (p.kode !== KODE_NORMAL && kriteria.length > 0) {
            ATURAN.push({ penyakit: p.kode, kriteria, durasiMinimal });
        }
    }

    if (!PENYAKIT[KODE_NORMAL]) throw new Error(`penyakit.json wajib berisi ${KODE_NORMAL} (tidak terdeteksi)`);
}

export function penyakitValid(kode) {
    return Object.hasOwn(PENYAKIT, kode ?? "");
}

export function daftarPenyakit() {
    // Satu penyakit boleh punya beberapa aturan alternatif; daftar untuk UI tetap unik.
    return [...new Set(ATURAN.map((a) => a.penyakit))];
}

export function formatTanggal(waktu) {
    return new Date(waktu).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

export function labelDurasi(hari) {
    if (hari >= 30) return `${hari / 30} bulan`;
    if (hari >= 7) return `${hari / 7} minggu`;
    return `${hari} hari`;
}

/* ---------- Mesin inferensi ---------- */

// Fakta antara: gejala bertanda "dari" tidak ditanyakan, melainkan disimpulkan dari gejala asalnya
// (Ya jika salah satu gejala asal dijawab Ya, Tidak jika semuanya dijawab Tidak). Misalnya
// "gangguan tidur" disimpulkan dari sulit memulai tidur, sering terbangun, atau bangun terlalu pagi,
// sehingga pertanyaan tidur cukup ditanyakan sekali walaupun dipakai beberapa aturan.
function asal(kode) {
    return GEJALA[kode]?.dari ?? [kode];
}

// Nilai tiga keadaan sebuah gejala: true, false, atau undefined (belum diketahui).
// Fakta antara dihitung rekursif, sehingga fakta antara bertingkat pun didukung.
function nilai(kode, fakta, dilihat = new Set()) {
    const g = GEJALA[kode];
    if (!g || !g.dari) {
        const v = fakta[kode];
        return v === true || v === false ? v : undefined;
    }
    if (dilihat.has(kode)) return undefined;

    const berikut = new Set(dilihat).add(kode);
    const sumber = g.dari.map((k) => nilai(k, fakta, berikut));
    if (sumber.some((v) => v === true)) return true;
    if (sumber.every((v) => v === false)) return false;
    return undefined;
}

// gejala yang perlu ditanyakan agar nilai kode diketahui
function belumDijawab(kode, fakta) {
    const g = GEJALA[kode];
    if (!g) return nilai(kode, fakta) === undefined ? [kode] : [];
    if (!g.dari) {
        const v = fakta[kode];
        return v === true || v === false ? [] : [kode];
    }
    if (nilai(kode, fakta) !== undefined) return [];
    return g.dari.flatMap((k) => belumDijawab(k, fakta));
}

// Forward chaining membutuhkan working memory yang sudah memuat semua fakta turunan.
// Fungsi ini menghitung penutupan (closure) fakta antara sampai tidak ada nilai baru.
// Fakta turunan hanya dipakai selama inferensi dan tidak pernah ditulis ke sesi.
export function tutupFakta(fakta) {
    const hasil = {};
    for (const [kode, nilaiFakta] of Object.entries(fakta)) {
        if (!GEJALA[kode]?.dari && (nilaiFakta === true || nilaiFakta === false)) hasil[kode] = nilaiFakta;
    }

    let berubah = true;
    while (berubah) {
        berubah = false;
        for (const g of DAFTAR_GEJALA) {
            if (!g.dari || Object.hasOwn(hasil, g.kode)) continue;

            const sumber = g.dari.map((k) => hasil[k]);
            if (sumber.some((v) => v === true)) {
                hasil[g.kode] = true;
                berubah = true;
            } else if (sumber.every((v) => v === false)) {
                hasil[g.kode] = false;
                berubah = true;
            }
        }
    }
    return hasil;
}

// sesi = { metode: "forward" | "backward", target, fakta: { G01: true, ... }, durasi: { P1: hari },
//         urutan: [kode yang dijawab], acak: [urutan acak pertanyaan penyaring], usia: "dewasa" | "remaja" }
// acak: forward = urutan acak pertanyaan penyaring, backward = urutan acak seluruh gejala hipotesis
export function sesiBaru(metode, target = null) {
    const acak = metode === "forward" ? acakUrutan(gejalaPenyaring()) : urutanAcakAturan(target);
    return { metode, target, fakta: {}, durasi: {}, urutan: [], acak };
}

// gejala bertanda "akhir" (misalnya dampak ke kehidupan sehari-hari) selalu ditanyakan paling akhir
function urutanAcakAturan(target) {
    const aturan = ATURAN.filter((a) => a.penyakit === target);
    if (aturan.length === 0) return [];

    const acak = acakUrutan([...new Set(aturan.flatMap((a) => a.kriteria.flatMap((k) => k.gejala.flatMap(asal))))]);
    return [...acak.filter((k) => !GEJALA[k]?.akhir), ...acak.filter((k) => GEJALA[k]?.akhir)];
}

// pertanyaan penyaring = gejala pada kriteria pertama setiap aturan
function gejalaPenyaring() {
    const penyaring = new Set(ATURAN.flatMap((a) => a.kriteria[0].gejala.flatMap(asal)));
    return DAFTAR_GEJALA.map((g) => g.kode).filter((k) => penyaring.has(k));
}

function angkaAcak(batas) {
    if (globalThis.crypto?.getRandomValues) {
        return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] % batas;
    }
    return Math.floor(Math.random() * batas);
}

// Fisher-Yates shuffle
function acakUrutan(daftar) {
    const hasil = [...daftar];
    for (let i = hasil.length - 1; i > 0; i--) {
        const j = angkaAcak(i + 1);
        [hasil[i], hasil[j]] = [hasil[j], hasil[i]];
    }
    return hasil;
}

function statusKriteria(kriteria, fakta) {
    const ya = kriteria.gejala.filter((k) => nilai(k, fakta) === true).length;
    const belum = kriteria.gejala.filter((k) => nilai(k, fakta) === undefined).length;
    if (ya >= kriteria.minimal) return "terpenuhi";
    if (ya + belum < kriteria.minimal) return "gugur";
    return "terbuka";
}

function statusAturan(aturan, fakta) {
    const status = aturan.kriteria.map((k) => statusKriteria(k, fakta));
    if (status.includes("gugur")) return "gugur";
    if (status.every((s) => s === "terpenuhi")) return "terpenuhi";
    return "terbuka";
}

// gejala yang masih bisa mengubah status aturan
function gejalaRelevan(aturan, fakta) {
    return aturan.kriteria
        .filter((k) => statusKriteria(k, fakta) === "terbuka")
        .flatMap((k) => k.gejala.flatMap((kode) => belumDijawab(kode, fakta)));
}

// Gejala krisis (pikiran tentang kematian atau menyakiti diri) selalu ditanyakan walaupun tidak lagi
// mengubah hasil, agar orang yang membutuhkan bantuan segera tetap dikenali. Menanyakannya tidak
// meningkatkan risiko (Dazzi dkk., 2014).
function krisisBelumDitanya(kandidat, fakta) {
    return [...new Set(kandidat.flatMap((a) => a.kriteria.flatMap((k) => k.gejala.flatMap(asal))))]
        .filter((k) => GEJALA[k]?.krisis && fakta[k] !== true && fakta[k] !== false);
}

export function jawabanKrisis(fakta) {
    return Object.keys(fakta).filter((k) => fakta[k] === true && GEJALA[k]?.krisis);
}

// forward chaining memakai semua aturan, backward chaining hanya aturan hipotesis
function aturanKandidat(sesi) {
    return sesi.metode === "backward" ? ATURAN.filter((a) => a.penyakit === sesi.target) : ATURAN;
}

function cukupDurasi(aturan, durasi) {
    return aturan.durasiMinimal === 0 || (Object.hasOwn(durasi, aturan.penyakit) && durasi[aturan.penyakit] >= aturan.durasiMinimal);
}

function durasiDiketahui(aturan, durasi) {
    return aturan.durasiMinimal === 0 || Object.hasOwn(durasi, aturan.penyakit);
}

// Forward chaining: working memory berisi fakta gejala, fakta turunan, dan penyakit yang sudah
// di-fire. Semua aturan dicocokkan berulang sampai tidak ada fakta baru (fixed point). Durasi
// adalah gerbang akhir: kriteria yang terpenuhi tetapi durasinya belum cukup dicatat sebagai
// belumCukup, bukan disimpulkan.
export function mesinMaju(fakta, durasi = {}, aturan = ATURAN) {
    const WM = tutupFakta(fakta);
    const disimpulkan = new Set();
    const belumCukup = new Set();

    let berubah = true;
    while (berubah) {
        berubah = false;
        for (const a of aturan) {
            if (disimpulkan.has(a.penyakit)) continue;
            if (statusAturan(a, WM) !== "terpenuhi") continue;

            if (cukupDurasi(a, durasi)) {
                WM[a.penyakit] = true;
                disimpulkan.add(a.penyakit);
                belumCukup.delete(a.penyakit);
                berubah = true;
            } else if (durasiDiketahui(a, durasi)) {
                belumCukup.add(a.penyakit);
            }
        }
    }

    return { fakta: WM, penyakit: [...disimpulkan], belumCukup: [...belumCukup] };
}

/* ---------- Backward chaining ---------- */

function pilihMenurutUrutan(kandidat, urutan = []) {
    const unik = [...new Set(kandidat)];
    return urutan.find((k) => unik.includes(k)) ?? unik[0];
}

// Buktikan sebuah gejala. Gejala langsung menjadi daun pembuktian; fakta antara menjadi
// subgoal OR yang sumbernya dibuktikan rekursif.
function buktikanGejala(kode, fakta, urutan, dilihat = new Set()) {
    const g = GEJALA[kode];
    if (!g) {
        const nilaiFakta = nilai(kode, fakta);
        return nilaiFakta === undefined ? { status: undefined } : { status: nilaiFakta };
    }
    if (!g.dari) {
        const v = fakta[kode];
        if (v === true || v === false) return { status: v };
        return { status: undefined, pertanyaan: kode };
    }
    if (dilihat.has(kode)) return { status: undefined };

    const berikut = new Set(dilihat).add(kode);
    const hasil = g.dari.map((k) => ({ kode: k, ...buktikanGejala(k, fakta, urutan, berikut) }));

    if (hasil.some((h) => h.status === true)) return { status: true };
    if (hasil.every((h) => h.status === false)) return { status: false };

    const kandidat = hasil.filter((h) => h.status === undefined && h.pertanyaan).map((h) => h.pertanyaan);
    return { status: undefined, pertanyaan: pilihMenurutUrutan(kandidat, urutan) };
}

// Buktikan kriteria ambang: terpenuhi jika cukup banyak gejala Ya, gugur jika sisa gejala yang
// belum diketahui tidak mungkin lagi mencapai ambang.
function buktikanKriteria(kriteria, fakta, urutan) {
    const hasil = kriteria.gejala.map((k) => ({ kode: k, ...buktikanGejala(k, fakta, urutan) }));
    const ya = hasil.filter((h) => h.status === true).length;
    const belum = hasil.filter((h) => h.status === undefined).length;

    if (ya >= kriteria.minimal) return { status: true };
    if (ya + belum < kriteria.minimal) return { status: false };

    const kandidat = hasil.filter((h) => h.status === undefined && h.pertanyaan).map((h) => h.pertanyaan);
    return { status: undefined, pertanyaan: pilihMenurutUrutan(kandidat, urutan) };
}

// Buktikan satu aturan: semua kriteria harus terpenuhi (AND). Jika satu kriteria gugur, aturan
// langsung gugur; jika ada kriteria yang belum pasti, kembalikan pertanyaan pertama.
function buktikanAturan(aturan, fakta, urutan) {
    let status = true;
    let pertanyaan;

    for (const k of aturan.kriteria) {
        const hasil = buktikanKriteria(k, fakta, urutan);
        if (hasil.status === false) return { status: false };
        if (hasil.status === undefined) {
            status = undefined;
            if (!pertanyaan) pertanyaan = hasil.pertanyaan;
        }
    }

    return { status, pertanyaan };
}

// Buktikan tujuan: coba semua aturan yang menyimpulkan penyakit target. Jika satu aturan berhasil,
// tujuan terbukti; jika semua gugur, tujuan gugur; selain itu masih ada subgoal yang belum pasti.
function buktikanTujuan(target, fakta, urutan) {
    const aturanTarget = ATURAN.filter((a) => a.penyakit === target);
    if (aturanTarget.length === 0) return { status: false };

    let adaTerbuka = false;
    let pertanyaan;

    for (const a of aturanTarget) {
        const hasil = buktikanAturan(a, fakta, urutan);
        if (hasil.status === true) return { status: true };
        if (hasil.status === undefined) {
            adaTerbuka = true;
            if (!pertanyaan) pertanyaan = hasil.pertanyaan;
        }
    }

    return adaTerbuka ? { status: undefined, pertanyaan } : { status: false };
}

function pertanyaanBackward(sesi, terbuka, fakta) {
    const bukti = buktikanTujuan(sesi.target, fakta, sesi.acak);
    if (bukti.status === undefined && bukti.pertanyaan) return bukti.pertanyaan;

    // Alternatif aturan: kumpulkan pertanyaan dari semua aturan yang masih terbuka, lalu ikuti
    // urutan acak sesi. Ini membuat goal yang punya beberapa aturan tetap bisa dicoba bergantian.
    const kandidat = terbuka.flatMap((a) => {
        const hasil = buktikanAturan(a, fakta, sesi.acak);
        return hasil.status === undefined && hasil.pertanyaan ? [hasil.pertanyaan] : [];
    });
    const kode = pilihMenurutUrutan(kandidat, sesi.acak);
    if (kode) return kode;

    // Fallback untuk data yang ditambahkan setelah sesi dibuat.
    const relevan = terbuka.flatMap((a) => gejalaRelevan(a, fakta));
    return [...sesi.acak, ...relevan].find((k) => relevan.includes(k)) ?? relevan[0];
}

// Menentukan pertanyaan berikutnya, atau kesimpulan jika inferensi selesai.
//
// Forward chaining memakai semua aturan dan working memory hasil penutupan fakta. Aturan yang
// premisnya terpenuhi di-fire ke working memory; durasi menjadi gerbang akhir. Pertanyaan dipilih
// dari aturan yang masih terbuka: tuntaskan aturan yang pertanyaan penyaringnya sudah Ya, atau
// tanyakan penyaring berikutnya sesuai urutan acak.
//
// Backward chaining memakai aturan hipotesis saja. Pertanyaan berasal dari pembuktian rekursif
// tujuan (aturan -> kriteria -> subgoal gejala/fakta antara).
//
// Prioritas:
// 1. durasi untuk aturan yang kriterianya terpenuhi (kecuali penyakit sudah disimpulkan aturan lain),
// 2. backward: pertanyaan dari pembuktian tujuan,
// 3. forward: tuntaskan aturan yang penyaringnya sudah terpenuhi, atau tanyakan penyaring berikutnya,
// 4. gejala krisis yang belum ditanyakan,
// 5. selesai.
export function langkahBerikutnya(sesi) {
    const kandidat = aturanKandidat(sesi);
    const fakta = tutupFakta(sesi.fakta);
    const maju = mesinMaju(sesi.fakta, sesi.durasi, kandidat);
    const sudah = new Set(maju.penyakit);

    const status = new Map(kandidat.map((a) => [a, statusAturan(a, fakta)]));
    const terbuka = kandidat.filter((a) => status.get(a) === "terbuka" && !sudah.has(a.penyakit));
    const terpenuhi = kandidat.filter((a) => status.get(a) === "terpenuhi");
    // gangguan tanpa durasi minimal (durasiMinimal 0) tidak perlu ditanyakan durasinya
    const tanpaDurasi = terpenuhi.filter((a) => a.durasiMinimal > 0 && !Object.hasOwn(sesi.durasi, a.penyakit) && !sudah.has(a.penyakit));
    const krisis = krisisBelumDitanya(kandidat, fakta);
    const sisa = () => new Set([...terbuka.flatMap((a) => gejalaRelevan(a, fakta)), ...krisis]).size + tanpaDurasi.length + terbuka.length;

    if (tanpaDurasi.length > 0) {
        return { jenis: "durasi", penyakit: tanpaDurasi[0].penyakit, sisa: sisa() };
    }

    if (terbuka.length > 0 && sesi.metode === "backward") {
        const kode = pertanyaanBackward(sesi, terbuka, fakta);
        if (kode) return { jenis: "gejala", kode, sisa: sisa() };
    }

    if (terbuka.length > 0) {
        const fokus = terbuka
            .filter((a) => statusKriteria(a.kriteria[0], fakta) === "terpenuhi")
            .sort((a, b) => waktuAktif(a, sesi, fakta) - waktuAktif(b, sesi, fakta))[0];
        const kode = fokus
            ? gejalaRelevan(fokus, fakta)[0]
            : penyaringBerikutnya(sesi, terbuka, fakta);
        if (kode) return { jenis: "gejala", kode, sisa: sisa() };
    }

    if (krisis.length > 0) {
        return { jenis: "gejala", kode: krisis[0], sisa: sisa() };
    }

    // Gangguan residual (misalnya gangguan penyesuaian) hanya disimpulkan jika tidak ada gangguan
    // lain yang disimpulkan, karena DSM-5-TR mensyaratkan gejalanya tidak memenuhi kriteria
    // gangguan lain. Aturan yang durasinya belum cukup dilaporkan terpisah sebagai belumCukup.
    const utama = maju.penyakit.filter((k) => !PENYAKIT[k].residual);
    const penyakit = utama.length > 0 ? utama : maju.penyakit;
    const belumCukup = maju.belumCukup.filter((k) => !(utama.length > 0 && PENYAKIT[k].residual));
    return {
        jenis: "selesai",
        penyakit,
        belumCukup,
        durasi: { ...sesi.durasi }
    };
}

// urutan jawaban saat pertanyaan penyaring sebuah aturan terpenuhi
function waktuAktif(aturan, sesi, fakta = sesi.fakta) {
    const posisi = aturan.kriteria[0].gejala.flatMap(asal).filter((k) => fakta[k] === true).map((k) => sesi.urutan.indexOf(k));
    return Math.min(...posisi);
}

function penyaringBerikutnya(sesi, terbuka, fakta = sesi.fakta) {
    const relevan = new Set(terbuka.flatMap((a) => statusKriteria(a.kriteria[0], fakta) === "terbuka"
        ? a.kriteria[0].gejala.flatMap((k) => belumDijawab(k, fakta))
        : []));
    // penyaring baru (data ditambah setelah sesi dibuat) ditaruh di akhir
    const urutan = [...sesi.acak, ...DAFTAR_GEJALA.map((g) => g.kode)];
    return urutan.find((k) => relevan.has(k));
}

// nilai: true/false untuk gejala, jumlah hari (OPSI_DURASI) untuk durasi
export function jawab(sesi, nilai) {
    const langkah = langkahBerikutnya(sesi);
    if (langkah.jenis === "gejala") {
        return { ...sesi, fakta: { ...sesi.fakta, [langkah.kode]: nilai === true }, urutan: [...sesi.urutan, langkah.kode] };
    }
    if (langkah.jenis === "durasi") {
        return { ...sesi, durasi: { ...sesi.durasi, [langkah.penyakit]: Number(nilai) }, urutan: [...sesi.urutan, AWALAN_DURASI + langkah.penyakit] };
    }
    return sesi;
}

export function batalkan(sesi) {
    const terakhir = sesi.urutan.at(-1);
    if (!terakhir) return sesi;
    const urutan = sesi.urutan.slice(0, -1);
    if (terakhir.startsWith(AWALAN_DURASI)) {
        const { [terakhir.slice(AWALAN_DURASI.length)]: _, ...durasi } = sesi.durasi;
        return { ...sesi, durasi, urutan };
    }
    const { [terakhir]: _, ...fakta } = sesi.fakta;
    return { ...sesi, fakta, urutan };
}

export function teksDurasi(kodePenyakit) {
    return `Sudah berapa lama anda mengalami keluhan-keluhan yang berkaitan dengan ${PENYAKIT[kodePenyakit]?.nama ?? kodePenyakit}?`;
}

// jawaban dalam bentuk siap tampil: { kode, pertanyaan, jawaban, ya }
export function daftarJawaban(sesi) {
    return sesi.urutan.map((kode) => {
        if (kode.startsWith(AWALAN_DURASI)) {
            const penyakit = kode.slice(AWALAN_DURASI.length);
            const hari = sesi.durasi[penyakit];
            return { kode, pertanyaan: teksDurasi(penyakit), jawaban: OPSI_DURASI.find((o) => o.hari === hari)?.label ?? "-", ya: null };
        }
        const ya = sesi.fakta[kode];
        return { kode, pertanyaan: GEJALA[kode]?.pertanyaan ?? kode, jawaban: ya ? "Ya" : "Tidak", ya };
    });
}

/* ---------- Progres konsultasi ---------- */

// Progres yang belum selesai disimpan di IndexedDB agar bisa dilanjutkan setelah browser ditutup,
// lalu dihapus begitu hasil keluar. Salinannya disimpan di memori supaya bisa dibaca langsung.
const cacheSesi = {};
// Jangan membuat BroadcastChannel di luar browser (misalnya saat pengujian Node). Di browser
// saluran ini menyinkronkan progres antar-tab.
const saluran = typeof window !== "undefined" && window.BroadcastChannel ? new window.BroadcastChannel("sispak") : null;

function sesiValid(sesi) {
    return sesi && METODE.includes(sesi.metode) && Array.isArray(sesi.urutan)
        && sesi.fakta && typeof sesi.fakta === "object" && sesi.durasi && typeof sesi.durasi === "object" && Array.isArray(sesi.acak)
        && sesi.urutan.every((k) => (GEJALA[k] && !GEJALA[k].dari) || (k.startsWith(AWALAN_DURASI) && PENYAKIT[k.slice(AWALAN_DURASI.length)]));
}

// dipanggil sekali saat aplikasi dimulai, setelah basis pengetahuan dimuat
export async function muatProgres() {
    await bersihkanDataLama(METODE.map((m) => `${KEY_SESI}.${m}`));
    await Promise.all(METODE.map(muatUlangSesi));
}

// membaca ulang dari IndexedDB, misalnya saat tab kembali aktif atau tab lain mengubah progres
export async function muatUlangSesi(metode) {
    const sesi = await baca(`${KEY_SESI}.${metode}`);
    cacheSesi[metode] = sesiValid(sesi) && sesi.metode === metode ? sesi : null;
    return cacheSesi[metode];
}

export function ambilSesi(metode) {
    return cacheSesi[metode] ?? null;
}

export function sesiSama(a, b) {
    return JSON.stringify([a?.target, a?.urutan, a?.fakta, a?.durasi, a?.acak]) === JSON.stringify([b?.target, b?.urutan, b?.fakta, b?.durasi, b?.acak]);
}

function kabariTabLain(metode) {
    saluran?.postMessage({ metode });
}

// progres baru disimpan setelah pengguna menjawab minimal satu pertanyaan
export function simpanSesi(sesi) {
    if (sesi.urutan.length === 0) {
        if (cacheSesi[sesi.metode] !== null) hapusSesi(sesi.metode);
        return;
    }
    if (sesiSama(cacheSesi[sesi.metode], sesi)) return;
    const salinan = JSON.parse(JSON.stringify(sesi));
    cacheSesi[sesi.metode] = salinan;
    simpan(`${KEY_SESI}.${sesi.metode}`, salinan)
        .then(() => kabariTabLain(sesi.metode))
        .catch((e) => console.warn("Progres gagal disimpan", e));
}

export function hapusSesi(metode) {
    cacheSesi[metode] = null;
    hapus(`${KEY_SESI}.${metode}`)
        .then(() => kabariTabLain(metode))
        .catch((e) => console.warn("Progres gagal dihapus", e));
}

export function dengarPerubahanTabLain(fungsi) {
    const tangani = (e) => fungsi(e.data?.metode);
    saluran?.addEventListener("message", tangani);
    return () => saluran?.removeEventListener("message", tangani);
}

/* ---------- Hasil konsultasi ---------- */

// Hasil diagnosa bersifat rahasia: hanya disimpan di memori halaman, tidak pernah ditulis ke
// penyimpanan browser maupun dikirim ke server. Hasil hilang saat halaman dimuat ulang atau ditutup.
export const hasilTerakhir = shallowRef(null);

// entri = { waktu, metode, target, penyakit: [terdiagnosa], belumCukup: [kriteria terpenuhi tapi durasi kurang], durasi,
//          krisis: gejala krisis dijawab Ya, remaja: pengguna di bawah 18 tahun, jawaban }
export function buatHasil(sesi, kesimpulan) {
    hasilTerakhir.value = {
        waktu: Date.now(),
        metode: sesi.metode,
        target: sesi.target,
        penyakit: kesimpulan.penyakit,
        belumCukup: kesimpulan.belumCukup,
        durasi: kesimpulan.durasi,
        krisis: jawabanKrisis(sesi.fakta).length > 0,
        remaja: sesi.usia === "remaja",
        jawaban: daftarJawaban(sesi)
    };
    return hasilTerakhir.value;
}

/* ---------- Penamaan untuk pengguna ---------- */

// nama awam untuk pengguna; istilah teknisnya forward chaining dan backward chaining
export const METODE_INFO = {
    forward: { nama: "Cek Menyeluruh", rute: "/cek-menyeluruh", teknis: "forward chaining" },
    backward: { nama: "Cek Gangguan Tertentu", rute: "/cek-gangguan", teknis: "backward chaining" }
};

export function namaMetode(metode) {
    return METODE_INFO[metode]?.nama ?? metode;
}

export function ruteMetode(metode, target = null) {
    return target ? { path: METODE_INFO[metode].rute, query: { id: target } } : METODE_INFO[metode].rute;
}

// "A", "A dan B", "A, B, dan C"
function gabungDaftar(daftar) {
    if (daftar.length <= 2) return daftar.join(" dan ");
    return `${daftar.slice(0, -1).join(", ")}, dan ${daftar.at(-1)}`;
}

// Judul hasil sengaja menyebut kesesuaian gejala dengan kriteria, bukan "anda mengalami ...",
// agar tidak terbaca sebagai vonis atau diagnosis.
export function judulHasil(entri) {
    if (entri.penyakit.length > 0) return `Gejala yang anda laporkan sesuai dengan kriteria ${gabungDaftar(entri.penyakit.map((k) => PENYAKIT[k]?.nama ?? k))}`;
    if (entri.metode === "backward") return `Gejala yang anda laporkan belum sesuai dengan kriteria ${PENYAKIT[entri.target]?.nama ?? entri.target}`;
    return PENYAKIT[KODE_NORMAL].nama;
}
