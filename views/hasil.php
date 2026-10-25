<?php

require __DIR__ . '/../lib/bantu.php';
require __DIR__ . '/../lib/pesan_dukungan.php';

wajib_login('../');

$sp = sistem_pakar();
// hasil hanya ditampilkan sekali lalu langsung dihapus dari session, tidak pernah disimpan
$hasil = $_SESSION['hasil'] ?? null;
unset($_SESSION['hasil']);
$r = $hasil;

$judul = 'Hasil Konsultasi';
$aktif = 'konsultasi';
$dasar = '../';

if (!$hasil) {
    require __DIR__ . '/partials/header.php';
    echo '<h1 class="judul-halaman">Hasil tidak tersedia</h1>'
        . '<p class="pengantar">Demi menjaga kerahasiaan, hasil konsultasi tidak disimpan di mana pun dan hanya tampil sekali setelah konsultasi selesai. '
        . 'Hasil hilang jika halaman dimuat ulang atau ditutup.</p>'
        . '<p class="kosong"><a href="konsultasi.php">Mulai konsultasi kembali</a></p>';
    require __DIR__ . '/partials/footer.php';
    exit;
}

$normal = $sp->penyakit[SistemPakar::KODE_NORMAL];
$terdiagnosa = array_values(array_filter(array_map(fn ($k) => $sp->penyakit[$k] ?? null, $hasil['penyakit'])));
$belumCukup = array_values(array_filter(array_map(fn ($k) => $sp->penyakit[$k] ?? null, $hasil['belumCukup'])));
$judulHasil = $sp->judulHasil($hasil, $r['metode'], $r['target']);

if ($terdiagnosa) {
    $penjelasan = 'Ini adalah kecenderungan berdasarkan jawaban anda, bukan diagnosis. Diagnosis hanya dapat ditegakkan oleh psikolog klinis atau psikiater setelah bertemu dan berbicara langsung dengan anda.'
        . (count($terdiagnosa) > 1 ? ' Beberapa gangguan kecemasan memang dapat muncul bersamaan; profesional akan menentukan diagnosis utamanya.' : '');
} elseif ($r['metode'] === 'backward' && !$belumCukup) {
    $penjelasan = 'Tidak semua kriteria gangguan tersebut terpenuhi. Hasil ini tidak menjamin anda bebas dari gangguan tersebut; jika anda tetap merasa terganggu, sebaiknya tetap berbicara dengan psikolog. Anda juga bisa mengecek gangguan lain atau memakai Cek Menyeluruh.';
} elseif (!$belumCukup) {
    $penjelasan = $normal['deskripsi'];
} else {
    $penjelasan = '';
}
$catatanDurasi = array_map(fn ($p) => "Gejala {$p['nama_penyakit']} terpenuhi, tetapi durasinya belum mencapai "
    . SistemPakar::labelDurasi($p['durasi_minimal']) . ' sehingga belum dapat disimpulkan. Pantau terus kondisi anda dan lakukan konsultasi ulang jika keluhan berlanjut. '
    . ($p['catatan_durasi'] ?? ''), $belumCukup);

// blok isi PDF, urutannya sama dengan tampilan halaman
$sumberPdf = ['dsm5tr', 'who-anxiety-2026', 'healing119'];
$blok = [
    ['jenis' => 'kecil', 'isi' => 'Jenis pemeriksaan: ' . SistemPakar::namaMetode($r['metode']) . ($r['target'] ? ' (' . ($sp->penyakit[$r['target']]['nama_penyakit'] ?? $r['target']) . ')' : '')],
    ['jenis' => 'kecil', 'isi' => 'Nama: ' . ($_SESSION['nama_user'] ?? $_SESSION['username']) . ' - Tanggal: ' . format_tanggal($r['waktu'])],
    // disclaimer di awal, sebelum hasil dibaca
    ['jenis' => 'kotak', 'judul' => JUDUL_DISCLAIMER, 'isi' => ISI_DISCLAIMER],
    ['jenis' => 'judul', 'isi' => 'Gambaran hasil'],
];
if ($terdiagnosa) $blok[] = ['jenis' => 'kecil', 'isi' => 'Jawaban anda menunjukkan kecenderungan ke arah:'];
$blok[] = ['jenis' => 'besar', 'isi' => $judulHasil];
if ($penjelasan) $blok[] = ['jenis' => 'teks', 'isi' => $penjelasan];
foreach ($catatanDurasi as $c) $blok[] = ['jenis' => 'teks', 'isi' => $c];
foreach ($terdiagnosa as $p) {
    $blok[] = ['jenis' => 'judul', 'isi' => "{$p['id_penyakit']} - {$p['nama_penyakit']}"];
    $blok[] = ['jenis' => 'kecil', 'isi' => "Kategori: {$p['kategori']}"];
    $blok[] = ['jenis' => 'teks', 'isi' => $p['deskripsi']];
    $blok[] = ['jenis' => 'tebal', 'isi' => 'Kriteria yang terpenuhi:'];
    $aturan = array_map(fn ($k) => $sp->labelKriteria($k) . ': ' . implode('; ', array_map(fn ($g) => $sp->gejala[$g]['nama_gejala'], $k['gejala'])), $p['kriteria']);
    $aturan[] = 'Durasi: keluhan dialami minimal ' . SistemPakar::labelDurasi($p['durasi_minimal']) . ' (jawaban anda: ' . SistemPakar::labelOpsiDurasi((int) $hasil['durasi'][$p['id_penyakit']]) . ')';
    $blok[] = ['jenis' => 'daftar', 'isi' => $aturan];
    $blok[] = ['jenis' => 'tebal', 'isi' => 'Penanganan yang umumnya dilakukan oleh profesional:'];
    $blok[] = ['jenis' => 'daftar', 'isi' => $p['pengobatan']];
    if ($p['rujukan']) $blok[] = ['jenis' => 'kecil', 'isi' => "Klasifikasi: {$p['rujukan']}"];
    $sumberPdf = [...$sumberPdf, ...$p['sumber']];
}
if (!$terdiagnosa) {
    $blok[] = ['jenis' => 'judul', 'isi' => 'Tips menjaga kesehatan mental'];
    $blok[] = ['jenis' => 'daftar', 'isi' => $normal['pengobatan']];
    $sumberPdf = [...$sumberPdf, ...$normal['sumber']];
}
$blok[] = ['jenis' => 'judul', 'isi' => 'Jawaban anda (' . count($hasil['jawaban']) . ' pertanyaan)'];
$blok[] = ['jenis' => 'daftar', 'isi' => array_map(fn ($j) => "{$j['pertanyaan']} -> {$j['jawaban']}", $hasil['jawaban'])];
$blok[] = ['jenis' => 'judul', 'isi' => 'Catatan penting'];
$blok[] = ['jenis' => 'teks', 'isi' => 'Dokumen ini bersifat rahasia dan tidak disimpan oleh sistem. Saran penanganan di atas adalah informasi umum dari pedoman klinis, bukan resep; jangan mengonsumsi obat tanpa resep dan pengawasan dokter.'];
// disclaimer diulang di akhir bersama langkah selanjutnya
$blok[] = ['jenis' => 'kotak', 'judul' => 'Langkah yang bisa anda ambil', 'isi' => [PESAN_TENANG], 'daftar' => LANGKAH_SELANJUTNYA];
$blok[] = ['jenis' => 'judul', 'isi' => 'Sumber'];
$sumberUrut = array_values(array_filter(array_map(fn ($id) => $sp->sumber[$id] ?? null, array_unique($sumberPdf))));
usort($sumberUrut, fn ($a, $b) => $a['nomor'] <=> $b['nomor']);
foreach ($sumberUrut as $s) {
    $blok[] = ['jenis' => 'kecil', 'isi' => "[{$s['nomor']}] {$s['penulis']} ({$s['tahun']}). {$s['judul']}. {$s['penerbit']}." . ($s['url'] ? " {$s['url']}" : '')];
}
$dataPdf = ['blok' => $blok, 'namaFile' => 'hasil-konsultasi-' . date('Y-m-d', strtotime($r['waktu'])) . '.pdf'];

require __DIR__ . '/partials/header.php';
?>
<div class="hasil-atas <?= $terdiagnosa ? 'terdeteksi' : 'aman' ?>">
    <p class="label-kecil"><?= $terdiagnosa ? 'Jawaban anda menunjukkan kecenderungan ke arah' : 'Hasil pemeriksaan awal' ?></p>
    <h1><?= e($judulHasil) ?></h1>
    <?php if ($penjelasan) { ?><p><?= e($penjelasan) ?></p><?php } ?>
    <p class="meta"><?= e(SistemPakar::namaMetode($r['metode'])) ?> · <?= e(format_tanggal($r['waktu'])) ?></p>
    <div class="aksi-hasil">
        <button class="tombol-utama" type="button" id="tombol-pdf">Unduh PDF</button>
        <a class="tombol-kedua" href="forward.php">Konsultasi lagi</a>
    </div>
</div>

<?php require __DIR__ . '/partials/pesan-dukungan.php'; ?>

<p class="catatan-penting">
    <strong>Hasil ini tidak disimpan di mana pun</strong> demi menjaga kerahasiaan anda, dan akan hilang jika halaman ditutup,
    dimuat ulang, atau anda berpindah halaman. Unduh PDF jika ingin menyimpannya.
</p>

<?php foreach ($catatanDurasi as $c) { ?>
    <p class="catatan-durasi"><?= e($c) ?></p>
<?php } ?>

<div class="grid-hasil">
    <div>
        <?php foreach ($terdiagnosa as $p) { ?>
            <section class="kartu">
                <p><span class="tag"><?= e($p['id_penyakit']) ?></span> <span class="tag abu"><?= e($p['kategori']) ?></span></p>
                <h2><?= e($p['nama_penyakit']) ?></h2>
                <p><?= e($p['deskripsi']) ?></p>
                <h4>Penanganan yang umumnya dilakukan oleh profesional<?= rujukan(array_diff($p['sumber'], ['dsm5tr', 'icd11', 'ppdgj3']), '../') ?></h4>
                <ol class="daftar-penanganan">
                    <?php foreach ($p['pengobatan'] as $t) { ?><li><?= e($t) ?></li><?php } ?>
                </ol>
                <p class="kecil">Klasifikasi: <?= e($p['rujukan']) ?><?= rujukan(['dsm5tr', 'icd11', 'ppdgj3'], '../') ?></p>
            </section>
        <?php } ?>
        <?php if (!$terdiagnosa) { ?>
            <section class="kartu">
                <h2>Tips menjaga kesehatan mental<?= rujukan($normal['sumber'], '../') ?></h2>
                <ol class="daftar-penanganan">
                    <?php foreach ($normal['pengobatan'] as $t) { ?><li><?= e($t) ?></li><?php } ?>
                </ol>
            </section>
        <?php } ?>
        <section class="kartu">
            <details>
                <summary>Lihat jawaban anda (<?= count($hasil['jawaban']) ?> pertanyaan)</summary>
                <ol class="log-jawaban">
                    <?php foreach ($hasil['jawaban'] as $j) { ?>
                        <li>
                            <span><?= e($j['pertanyaan']) ?></span>
                            <span class="lencana <?= $j['ya'] === false ? 'tidak' : 'ya' ?>"><?= e($j['jawaban']) ?></span>
                        </li>
                    <?php } ?>
                </ol>
            </details>
        </section>
    </div>
    <div>
        <?php foreach ($terdiagnosa as $p) { ?>
            <section class="kartu">
                <h4>Kriteria <?= e($p['nama_penyakit']) ?></h4>
                <?php $kodePenyakit = $p['id_penyakit']; require __DIR__ . '/partials/kriteria.php'; ?>
            </section>
        <?php } ?>
        <p class="catatan-penting">
            <strong>Catatan penting:</strong> saran penanganan di halaman ini adalah informasi umum dari pedoman klinis, bukan resep.
            Jangan mengonsumsi obat tanpa resep dan pengawasan dokter. Psikolog atau psikiater akan menentukan penanganan yang sesuai untuk anda.
        </p>
    </div>
</div>

<script src="../assets/vendor/jspdf.umd.min.js"></script>
<script src="../assets/pdf-hasil.js"></script>
<script>
    var sudahDiunduh = false;
    document.getElementById("tombol-pdf").addEventListener("click", function () {
        unduhPdfHasil(<?= json_encode($dataPdf, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>);
        sudahDiunduh = true;
    });
    var sudahDikonfirmasi = false;

    // Pindah halaman lewat tautan di website: konfirmasi dengan dialog sendiri
    document.addEventListener("click", function (e) {
        var tautan = e.target.closest("a[href]");
        if (!tautan || sudahDiunduh || tautan.target === "_blank" || tautan.getAttribute("href").startsWith("#")) return;
        e.preventDefault();
        konfirmasi({
            judul: "Tinggalkan halaman hasil?",
            pesan: "Demi menjaga kerahasiaan, hasil ini tidak disimpan dan akan hilang setelah anda meninggalkan halaman ini. Unduh PDF terlebih dahulu jika ingin menyimpannya.",
            ya: "Tinggalkan",
            tidak: "Tetap di sini"
        }).then(function (pergi) {
            if (!pergi) return;
            sudahDikonfirmasi = true;
            location.href = tautan.href;
        });
    });

    // Menutup tab atau memuat ulang: browser hanya mengizinkan dialog bawaannya sendiri
    window.addEventListener("beforeunload", function (e) {
        if (!sudahDiunduh && !sudahDikonfirmasi) {
            e.preventDefault();
            e.returnValue = "";
        }
    });
</script>
<?php require __DIR__ . '/partials/footer.php'; ?>
