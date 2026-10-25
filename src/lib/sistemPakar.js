import { shallowRef } from "vue";
import { baca, bersihkanDataLama, hapus, simpan } from "./penyimpanan";

const KEY_SESI = "sispak.sesi";
const METODE = ["forward", "backward"];

export const KODE_NORMAL = "P0";
const AWALAN_DURASI = "durasi:";

// pilihan jawaban durasi, "hari" adalah batas bawah tiap pilihan
export const OPSI_DURASI = [
    { hari: 0, label: "Kurang dari 2 minggu" },
    { hari: 14, label: "2 minggu sampai 1 bulan" },
    { hari: 30, label: "1 sampai 6 bulan" },
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
    const respons = await fetch(`${import.meta.env.BASE_URL}data/${nama}`, { cache: "no-cache" });
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
    return ATURAN.map((a) => a.penyakit);
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

// sesi = { metode: "forward" | "backward", target, fakta: { G01: true, ... }, durasi: { P1: hari },
//         urutan: [kode yang dijawab], acak: [urutan acak pertanyaan penyaring] }
export function sesiBaru(metode, target = null) {
    return { metode, target, fakta: {}, durasi: {}, urutan: [], acak: metode === "forward" ? acakUrutan(gejalaPenyaring()) : [] };
}

// pertanyaan penyaring = gejala pada kriteria pertama setiap aturan
function gejalaPenyaring() {
    const penyaring = new Set(ATURAN.flatMap((a) => a.kriteria[0].gejala));
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
    const ya = kriteria.gejala.filter((k) => fakta[k] === true).length;
    const belum = kriteria.gejala.filter((k) => !Object.hasOwn(fakta, k)).length;
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
        .flatMap((k) => k.gejala.filter((kode) => !Object.hasOwn(fakta, kode)));
}

// forward chaining memakai semua aturan, backward chaining hanya aturan hipotesis
function aturanKandidat(sesi) {
    return sesi.metode === "backward" ? ATURAN.filter((a) => a.penyakit === sesi.target) : ATURAN;
}

// Menentukan pertanyaan berikutnya, atau kesimpulan jika inferensi selesai. Prioritasnya:
// 1. gangguan yang semua kriterianya terpenuhi langsung ditanyakan durasinya (akhir diagnosa),
// 2. gangguan yang pertanyaan penyaringnya sudah terpenuhi ditelusuri sampai tuntas dengan urutan tetap,
// 3. selain itu tanyakan pertanyaan penyaring berikutnya sesuai urutan acak sesi (forward chaining).
// Gejala yang tidak bisa lagi mengubah status aturan tidak ditanyakan, sehingga kesimpulan
// selalu sama dengan menanyakan semua gejala, apa pun urutan acaknya.
export function langkahBerikutnya(sesi) {
    const kandidat = aturanKandidat(sesi);
    const status = new Map(kandidat.map((a) => [a, statusAturan(a, sesi.fakta)]));
    const terbuka = kandidat.filter((a) => status.get(a) === "terbuka");
    const terpenuhi = kandidat.filter((a) => status.get(a) === "terpenuhi");
    const tanpaDurasi = terpenuhi.filter((a) => !Object.hasOwn(sesi.durasi, a.penyakit));
    const sisa = () => new Set(terbuka.flatMap((a) => gejalaRelevan(a, sesi.fakta))).size + tanpaDurasi.length + terbuka.length;

    if (tanpaDurasi.length > 0) {
        return { jenis: "durasi", penyakit: tanpaDurasi[0].penyakit, sisa: sisa() };
    }

    if (terbuka.length > 0) {
        const fokus = terbuka
            .filter((a) => statusKriteria(a.kriteria[0], sesi.fakta) === "terpenuhi")
            .sort((a, b) => waktuAktif(a, sesi) - waktuAktif(b, sesi))[0];
        const kode = fokus
            ? gejalaRelevan(fokus, sesi.fakta)[0]
            : penyaringBerikutnya(sesi, terbuka);
        return { jenis: "gejala", kode, sisa: sisa() };
    }

    const cukup = (a) => sesi.durasi[a.penyakit] >= a.durasiMinimal;
    return {
        jenis: "selesai",
        penyakit: terpenuhi.filter(cukup).map((a) => a.penyakit),
        belumCukup: terpenuhi.filter((a) => !cukup(a)).map((a) => a.penyakit),
        durasi: { ...sesi.durasi }
    };
}

// urutan jawaban saat pertanyaan penyaring sebuah aturan terpenuhi
function waktuAktif(aturan, sesi) {
    const posisi = aturan.kriteria[0].gejala.filter((k) => sesi.fakta[k] === true).map((k) => sesi.urutan.indexOf(k));
    return Math.min(...posisi);
}

function penyaringBerikutnya(sesi, terbuka) {
    const relevan = new Set(terbuka.flatMap((a) => statusKriteria(a.kriteria[0], sesi.fakta) === "terbuka"
        ? a.kriteria[0].gejala.filter((k) => !Object.hasOwn(sesi.fakta, k))
        : []));
    // backward chaining tidak diacak; penyaring baru (data ditambah setelah sesi dibuat) ditaruh di akhir
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
const saluran = globalThis.BroadcastChannel ? new BroadcastChannel("sispak") : null;

function sesiValid(sesi) {
    return sesi && METODE.includes(sesi.metode) && Array.isArray(sesi.urutan)
        && sesi.fakta && typeof sesi.fakta === "object" && sesi.durasi && typeof sesi.durasi === "object" && Array.isArray(sesi.acak)
        && sesi.urutan.every((k) => GEJALA[k] || (k.startsWith(AWALAN_DURASI) && PENYAKIT[k.slice(AWALAN_DURASI.length)]));
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

// entri = { waktu, metode, target, penyakit: [terdiagnosa], belumCukup: [kriteria terpenuhi tapi durasi kurang], durasi, jawaban }
export function buatHasil(sesi, kesimpulan) {
    hasilTerakhir.value = {
        waktu: Date.now(),
        metode: sesi.metode,
        target: sesi.target,
        penyakit: kesimpulan.penyakit,
        belumCukup: kesimpulan.belumCukup,
        durasi: kesimpulan.durasi,
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

export function judulHasil(entri) {
    if (entri.penyakit.length > 0) return entri.penyakit.map((k) => PENYAKIT[k]?.nama ?? k).join(", ");
    if (entri.metode === "backward") return `Gejala anda tidak sesuai dengan ${PENYAKIT[entri.target]?.nama ?? entri.target}`;
    return PENYAKIT[KODE_NORMAL].nama;
}
