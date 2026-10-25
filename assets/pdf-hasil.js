// Membuat PDF hasil konsultasi dari blok-blok yang disiapkan views/hasil.php.
// blok: { jenis: "judul" | "teks" | "tebal" | "besar" | "kecil" | "daftar", isi: string | string[] }
//       atau { jenis: "kotak", judul, isi: string[], daftar?: string[] }
function unduhPdfHasil(data) {
    var MARGIN = 18, LEBAR = 210, TINGGI = 297, LEBAR_TEKS = LEBAR - MARGIN * 2;
    var doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
    var y = MARGIN;

    // font bawaan PDF hanya mendukung karakter Latin dasar
    function aman(teks) {
        return String(teks == null ? "" : teks)
            .replace(/[–—]/g, "-").replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
            .replace(/·/g, "-").replace(/≥/g, ">=").replace(/→/g, "->").replace(/[^\x20-\x7e\n]/g, "");
    }

    function tulis(teks, ukuran, tebal, warna, indent, jarak) {
        doc.setFont("helvetica", tebal ? "bold" : "normal");
        doc.setFontSize(ukuran);
        doc.setTextColor(warna[0], warna[1], warna[2]);
        var baris = doc.splitTextToSize(aman(teks), LEBAR_TEKS - indent);
        var tinggiBaris = ukuran * 0.42;
        baris.forEach(function (b) {
            if (y + tinggiBaris > TINGGI - MARGIN) { doc.addPage(); y = MARGIN; }
            doc.text(b, MARGIN + indent, y + tinggiBaris * 0.8);
            y += tinggiBaris;
        });
        y += jarak;
    }

    var HITAM = [28, 43, 41], ABU = [91, 109, 106], UNGU = [128, 0, 128];

    // kotak berlatar warna; tinggi dihitung dulu agar kotak tidak terpotong pindah halaman
    function kotak(b) {
        var lebar = LEBAR_TEKS - 10;
        function potong(teks, ukuran, tebal) {
            doc.setFont("helvetica", tebal ? "bold" : "normal");
            doc.setFontSize(ukuran);
            return doc.splitTextToSize(aman(teks), lebar);
        }
        var isi = [{ baris: potong(b.judul, 12, true), ukuran: 12, tebal: true, jarak: 2 }];
        (b.isi || []).forEach(function (t, i) { isi.push({ baris: potong(t, 10, i === 0), ukuran: 10, tebal: i === 0, jarak: 1.5 }); });
        (b.daftar || []).forEach(function (t, i) { isi.push({ baris: potong((i + 1) + ". " + t, 10, false), ukuran: 10, tebal: false, jarak: 1 }); });
        var tinggi = isi.reduce(function (t, x) { return t + x.baris.length * x.ukuran * 0.42 + x.jarak; }, 0) + 10;
        if (y + tinggi > TINGGI - MARGIN) { doc.addPage(); y = MARGIN; }
        doc.setFillColor(246, 234, 246);
        doc.setDrawColor(128, 0, 128);
        doc.roundedRect(MARGIN, y, LEBAR_TEKS, tinggi, 3, 3, "FD");
        y += 5;
        isi.forEach(function (x) {
            doc.setFont("helvetica", x.tebal ? "bold" : "normal");
            doc.setFontSize(x.ukuran);
            var warna = x.ukuran === 12 ? UNGU : HITAM;
            doc.setTextColor(warna[0], warna[1], warna[2]);
            x.baris.forEach(function (baris) {
                var tinggiBaris = x.ukuran * 0.42;
                doc.text(baris, MARGIN + 5, y + tinggiBaris * 0.8);
                y += tinggiBaris;
            });
            y += x.jarak;
        });
        y += 6;
    }
    doc.setFillColor(128, 0, 128);
    doc.rect(0, 0, LEBAR, 8, "F");
    tulis("HASIL KONSULTASI", 9, true, UNGU, 0, 1);
    tulis("Sistem Pakar Psikologi Gangguan Kecemasan", 17, true, HITAM, 0, 2);

    data.blok.forEach(function (b) {
        if (b.jenis === "judul") { y += 3; tulis(b.isi, 13, true, UNGU, 0, 2); }
        else if (b.jenis === "besar") tulis(b.isi, 14, true, HITAM, 0, 2);
        else if (b.jenis === "tebal") tulis(b.isi, 10.5, true, HITAM, 0, 1);
        else if (b.jenis === "kecil") tulis(b.isi, 9, false, ABU, 0, 1.5);
        else if (b.jenis === "kotak") kotak(b);
        else if (b.jenis === "daftar") { b.isi.forEach(function (t, i) { tulis((i + 1) + ". " + t, 10, false, HITAM, 3, 1); }); y += 1; }
        else tulis(b.isi, 10.5, false, HITAM, 0, 1.5);
    });

    var jumlah = doc.getNumberOfPages();
    for (var i = 1; i <= jumlah; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(ABU[0], ABU[1], ABU[2]);
        doc.text("Sistem Pakar Gangguan Kecemasan - halaman " + i + " dari " + jumlah, MARGIN, TINGGI - 8);
    }
    doc.save(data.namaFile);
}
