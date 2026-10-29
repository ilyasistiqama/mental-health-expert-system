import {
    GEJALA, KODE_NORMAL, OPSI_DURASI, PENYAKIT, SUMBER, formatTanggal, judulHasil, labelDurasi, namaMetode
} from "./sistemPakar";
import { NAMA_SISTEM } from "./nama";
import {
    ISI_DISCLAIMER, ISI_KRISIS, ISI_REMAJA, JUDUL_DISCLAIMER, JUDUL_KRISIS, JUDUL_REMAJA, LANGKAH_KRISIS, LANGKAH_SELANJUTNYA,
    PESAN_TENANG
} from "./pesanDukungan";

const MARGIN = 18;
const LEBAR_HALAMAN = 210;
const TINGGI_HALAMAN = 297;
const LEBAR_TEKS = LEBAR_HALAMAN - MARGIN * 2;

// warna kotak: latar, garis, judul
const WARNA_DUKUNGAN = { latar: [220, 239, 235], garis: [42, 122, 114], judul: [31, 95, 89] };
const WARNA_KRISIS = { latar: [255, 244, 220], garis: [122, 82, 0], judul: [122, 82, 0] };

// font bawaan PDF hanya mendukung karakter Latin dasar
function aman(teks) {
    return String(teks ?? "")
        .replace(/[–—]/g, "-")
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/·/g, "-")
        .replace(/≥/g, ">=")
        .replace(/→/g, "->")
        .replace(/[^\x20-\x7e\n]/g, "");
}

// fakta antara ditulis bersama gejala asalnya
function namaGejala(kode) {
    const g = GEJALA[kode];
    return g.dari ? `${g.nama} (salah satu dari: ${g.dari.map((k) => GEJALA[k].nama.toLowerCase()).join(", ")})` : g.nama;
}

function labelKriteria(k) {
    if (k.minimal < k.gejala.length) return `Minimal ${k.minimal} dari ${k.gejala.length} gejala`;
    return k.gejala.length > 1 ? "Semua gejala" : "Gejala";
}

export async function unduhPdfHasil(entri) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    let y = MARGIN;

    const ruang = (tinggi) => {
        if (y + tinggi > TINGGI_HALAMAN - MARGIN) {
            doc.addPage();
            y = MARGIN;
        }
    };

    const tulis = (teks, { ukuran = 10.5, tebal = false, warna = [28, 43, 41], indent = 0, jarak = 1.5 } = {}) => {
        doc.setFont("helvetica", tebal ? "bold" : "normal");
        doc.setFontSize(ukuran);
        doc.setTextColor(...warna);
        const baris = doc.splitTextToSize(aman(teks), LEBAR_TEKS - indent);
        const tinggiBaris = ukuran * 0.42;
        for (const b of baris) {
            ruang(tinggiBaris);
            doc.text(b, MARGIN + indent, y + tinggiBaris * 0.8);
            y += tinggiBaris;
        }
        y += jarak;
    };

    const judul = (teks) => {
        y += 3;
        ruang(12);
        tulis(teks, { ukuran: 13, tebal: true, warna: [31, 95, 89], jarak: 2 });
    };

    // kotak berlatar warna; tinggi dihitung dulu agar kotak tidak terpotong pindah halaman
    const kotak = (judulKotak, paragraf, daftarBernomor = [], warna = WARNA_DUKUNGAN) => {
        const lebar = LEBAR_TEKS - 10;
        const potong = (teks, ukuran, tebal) => {
            doc.setFont("helvetica", tebal ? "bold" : "normal");
            doc.setFontSize(ukuran);
            return doc.splitTextToSize(aman(teks), lebar);
        };
        const blok = [
            { baris: potong(judulKotak, 12, true), ukuran: 12, tebal: true, jarak: 2 },
            ...paragraf.map((t, i) => ({ baris: potong(t, 10, i === 0), ukuran: 10, tebal: i === 0, jarak: 1.5 })),
            ...daftarBernomor.map((t, i) => ({ baris: potong(`${i + 1}. ${t}`, 10, false), ukuran: 10, tebal: false, jarak: 1 }))
        ];
        const tinggi = blok.reduce((t, b) => t + b.baris.length * b.ukuran * 0.42 + b.jarak, 0) + 10;
        ruang(tinggi);
        doc.setFillColor(...warna.latar);
        doc.setDrawColor(...warna.garis);
        doc.roundedRect(MARGIN, y, LEBAR_TEKS, tinggi, 3, 3, "FD");
        y += 5;
        for (const b of blok) {
            doc.setFont("helvetica", b.tebal ? "bold" : "normal");
            doc.setFontSize(b.ukuran);
            doc.setTextColor(...(b.ukuran === 12 ? warna.judul : [28, 43, 41]));
            for (const baris of b.baris) {
                const tinggiBaris = b.ukuran * 0.42;
                doc.text(baris, MARGIN + 5, y + tinggiBaris * 0.8);
                y += tinggiBaris;
            }
            y += b.jarak;
        }
        y += 6;
    };

    const daftar = (items, { bernomor = false, indent = 4 } = {}) => {
        items.forEach((item, i) => tulis(`${bernomor ? `${i + 1}.` : "-"} ${item}`, { indent, jarak: 1 }));
        y += 1;
    };

    const terdiagnosa = entri.penyakit.filter((k) => PENYAKIT[k]).map((k) => PENYAKIT[k]);
    const belumCukup = entri.belumCukup.filter((k) => PENYAKIT[k]).map((k) => PENYAKIT[k]);
    const sumber = new Set();

    // kop
    doc.setFillColor(42, 122, 114);
    doc.rect(0, 0, LEBAR_HALAMAN, 8, "F");
    y = MARGIN;
    tulis("HASIL KONSULTASI", { ukuran: 9, tebal: true, warna: [42, 122, 114], jarak: 1 });
    tulis(NAMA_SISTEM, { ukuran: 18, tebal: true, jarak: 2 });
    tulis(`Jenis pemeriksaan: ${namaMetode(entri.metode)}${entri.target && PENYAKIT[entri.target] ? ` (${PENYAKIT[entri.target].nama})` : ""}`, { ukuran: 10, warna: [91, 109, 106], jarak: 0.5 });
    tulis(`Tanggal: ${formatTanggal(entri.waktu)}`, { ukuran: 10, warna: [91, 109, 106], jarak: 4 });

    // bantuan segera didahulukan dari hasil apa pun
    if (entri.krisis) {
        kotak(JUDUL_KRISIS, ISI_KRISIS, LANGKAH_KRISIS, WARNA_KRISIS);
        ["who-media-suicide-2023", "healing119-faq"].forEach((id) => sumber.add(id));
    }

    // disclaimer di awal, sebelum hasil dibaca
    kotak(JUDUL_DISCLAIMER, ISI_DISCLAIMER);
    if (entri.remaja) {
        kotak(JUDUL_REMAJA, ISI_REMAJA);
        sumber.add("healing119-faq");
    }

    judul("Gambaran hasil");
    tulis(judulHasil(entri), { ukuran: 14, tebal: true, jarak: 2 });
    if (terdiagnosa.length) {
        tulis("Kesesuaian ini hanya berdasarkan jawaban anda dan bukan diagnosis. Diagnosis hanya dapat ditegakkan oleh psikolog klinis atau psikiater setelah bertemu dan berbicara langsung dengan anda.");
    } else if (belumCukup.length === 0) {
        tulis(entri.metode === "backward"
            ? "Tidak semua kriteria gangguan tersebut terpenuhi. Hasil ini tidak menjamin anda bebas dari gangguan tersebut; jika anda tetap merasa terganggu, sebaiknya tetap berbicara dengan psikolog."
            : PENYAKIT[KODE_NORMAL].deskripsi);
    }
    for (const p of belumCukup) {
        tulis(`Gejala ${p.nama} terpenuhi, tetapi durasinya belum mencapai ${labelDurasi(p.durasiMinimal)} sehingga belum dapat disimpulkan. ${p.catatanDurasi ?? ""}`);
    }

    for (const p of terdiagnosa) {
        judul(`${p.kode} - ${p.nama}`);
        tulis(`Kategori: ${p.kategori}`, { ukuran: 9.5, warna: [91, 109, 106], jarak: 1 });
        tulis(p.deskripsi);
        if (p.catatan) tulis(p.catatan, { warna: [91, 109, 106] });
        tulis("Kriteria yang terpenuhi:", { tebal: true, jarak: 1 });
        p.kriteria.forEach((k, i) => tulis(`${i + 1}. ${labelKriteria(k)}: ${k.gejala.map(namaGejala).join("; ")}`, { indent: 4, jarak: 1 }));
        if (p.durasiMinimal > 0) {
            tulis(`${p.kriteria.length + 1}. Durasi: keluhan dialami minimal ${labelDurasi(p.durasiMinimal)} (jawaban anda: ${OPSI_DURASI.find((o) => o.hari === entri.durasi[p.kode])?.label ?? "-"})`, { indent: 4, jarak: 2 });
        }
        tulis("Penanganan yang umumnya dilakukan oleh profesional:", { tebal: true, jarak: 1 });
        daftar(p.pengobatan, { bernomor: true });
        if (p.rujukan) tulis(`Klasifikasi: ${p.rujukan}`, { ukuran: 9, warna: [91, 109, 106] });
        p.sumber.forEach((id) => sumber.add(id));
    }

    if (terdiagnosa.length === 0) {
        judul("Tips menjaga kesehatan mental");
        daftar(PENYAKIT[KODE_NORMAL].pengobatan, { bernomor: true });
        PENYAKIT[KODE_NORMAL].sumber.forEach((id) => sumber.add(id));
    }

    judul(`Jawaban anda (${entri.jawaban.length} pertanyaan)`);
    entri.jawaban.forEach((j, i) => tulis(`${i + 1}. ${j.pertanyaan} -> ${j.jawaban}`, { ukuran: 9.5, indent: 2, jarak: 1 }));

    judul("Catatan penting");
    tulis("Dokumen ini bersifat rahasia dan tidak disimpan oleh sistem. Saran penanganan di atas adalah informasi umum dari pedoman klinis, bukan resep; jangan mengonsumsi obat tanpa resep dan pengawasan dokter.");
    y += 2;
    // disclaimer diulang di akhir bersama langkah selanjutnya
    kotak("Langkah yang bisa anda ambil", [PESAN_TENANG], LANGKAH_SELANJUTNYA);
    ["dsm5tr", "who-anxiety-2026", "who-depression-2026", "healing119"].forEach((id) => sumber.add(id));

    judul("Sumber");
    [...sumber].filter((id) => SUMBER[id]).map((id) => SUMBER[id]).sort((a, b) => a.nomor - b.nomor).forEach((s) => {
        tulis(`[${s.nomor}] ${s.penulis} (${s.tahun}). ${s.judul}. ${s.penerbit}.${s.url ? ` ${s.url}` : ""}`, { ukuran: 9, indent: 2, jarak: 1 });
    });

    // nomor halaman
    const jumlah = doc.getNumberOfPages();
    for (let i = 1; i <= jumlah; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(91, 109, 106);
        doc.text(`${NAMA_SISTEM} - halaman ${i} dari ${jumlah}`, MARGIN, TINGGI_HALAMAN - 8);
    }

    // tanggal lokal pengguna (toISOString memakai UTC)
    const w = new Date(entri.waktu);
    const tanggal = `${w.getFullYear()}-${String(w.getMonth() + 1).padStart(2, "0")}-${String(w.getDate()).padStart(2, "0")}`;
    const nama = `hasil-konsultasi-${tanggal}.pdf`;

    // Unduhan lewat blob + anchor lebih andal di browser ponsel daripada doc.save().
    // URL blob juga dikembalikan agar halaman hasil dapat menampilkan tautan cadangan
    // "buka PDF" bila browser memblokir unduhan otomatis.
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const tautan = document.createElement("a");
    tautan.href = url;
    tautan.download = nama;
    tautan.rel = "noopener";
    document.body.appendChild(tautan);

    // Safari di iPhone/iPad kadang mengabaikan atribut download dan membuka blob URL di tab
    // yang sama, sehingga halaman hasil hilang. Di sana biarkan pengguna menekan tautan
    // cadangan; browser ponsel lain tetap mencoba mengunduh otomatis.
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
        || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (!iOS) tautan.click();

    tautan.remove();

    return { url, nama };
}
