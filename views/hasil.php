<?php

require __DIR__ . '/../lib/bantu.php';

wajib_login('../');

$sp = sistem_pakar();
// hanya riwayat milik user yang sedang login
$r = mysqli_fetch_assoc(mysqli_execute_query(
    $koneksi,
    "SELECT * FROM riwayat WHERE id_riwayat = ? AND id_user = ?",
    [(int) ($_GET['id'] ?? 0), $_SESSION['id_user']]
));
$hasil = $r ? json_decode($r['hasil'], true) : null;

$judul = 'Hasil Konsultasi';
$aktif = 'konsultasi';
$dasar = '../';

if (!$hasil) {
    require __DIR__ . '/partials/header.php';
    echo '<h1 class="judul-halaman">Hasil tidak ditemukan</h1><p class="kosong"><a href="konsultasi.php">Kembali ke halaman konsultasi</a></p>';
    require __DIR__ . '/partials/footer.php';
    exit;
}

$normal = $sp->penyakit[SistemPakar::KODE_NORMAL];
$terdiagnosa = array_values(array_filter(array_map(fn ($k) => $sp->penyakit[$k] ?? null, $hasil['penyakit'])));
$belumCukup = array_values(array_filter(array_map(fn ($k) => $sp->penyakit[$k] ?? null, $hasil['belumCukup'])));
$judulHasil = $sp->judulHasil($hasil, $r['metode'], $r['target']);

if ($terdiagnosa) {
    $penjelasan = 'Jawaban anda memenuhi aturan untuk gangguan berikut. Hasil ini adalah kecenderungan, bukan diagnosis; diagnosis hanya dapat ditegakkan oleh psikolog klinis atau psikiater.'
        . (count($terdiagnosa) > 1 ? ' Beberapa gangguan kecemasan memang dapat muncul bersamaan; profesional akan menentukan diagnosis utamanya.' : '');
} elseif ($r['metode'] === 'backward' && !$belumCukup) {
    $penjelasan = 'Tidak semua kriteria dari hipotesis tersebut terpenuhi. Coba hipotesis lain atau gunakan Forward Chaining.';
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
    ['jenis' => 'kecil', 'isi' => 'Metode: ' . SistemPakar::namaMetode($r['metode']) . ($r['target'] ? ' (hipotesis: ' . ($sp->penyakit[$r['target']]['nama_penyakit'] ?? $r['target']) . ')' : '')],
    ['jenis' => 'kecil', 'isi' => 'Nama: ' . ($_SESSION['nama_user'] ?? $_SESSION['username']) . ' - Tanggal: ' . format_tanggal($r['waktu'])],
    ['jenis' => 'judul', 'isi' => 'Kesimpulan'],
    ['jenis' => 'besar', 'isi' => $judulHasil],
];
if ($penjelasan) $blok[] = ['jenis' => 'teks', 'isi' => $penjelasan];
foreach ($catatanDurasi as $c) $blok[] = ['jenis' => 'teks', 'isi' => $c];
foreach ($terdiagnosa as $p) {
    $blok[] = ['jenis' => 'judul', 'isi' => "{$p['id_penyakit']} - {$p['nama_penyakit']}"];
    $blok[] = ['jenis' => 'kecil', 'isi' => "Kategori: {$p['kategori']}"];
    $blok[] = ['jenis' => 'teks', 'isi' => $p['deskripsi']];
    $blok[] = ['jenis' => 'tebal', 'isi' => 'Aturan yang terpenuhi:'];
    $aturan = array_map(fn ($k) => $sp->labelKriteria($k) . ': ' . implode('; ', array_map(fn ($g) => $sp->gejala[$g]['nama_gejala'], $k['gejala'])), $p['kriteria']);
    $aturan[] = 'Durasi: keluhan dialami minimal ' . SistemPakar::labelDurasi($p['durasi_minimal']) . ' (jawaban anda: ' . SistemPakar::labelOpsiDurasi((int) $hasil['durasi'][$p['id_penyakit']]) . ')';
    $blok[] = ['jenis' => 'daftar', 'isi' => $aturan];
    $blok[] = ['jenis' => 'tebal', 'isi' => 'Penanganan yang dapat dilakukan:'];
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
$blok[] = ['jenis' => 'teks', 'isi' => 'Hasil ini adalah gambaran awal dari sistem pakar untuk keperluan edukasi dan skrining mandiri, bukan diagnosis. Obat-obatan hanya boleh dikonsumsi sesuai resep dokter. Kunjungi psikolog klinis, psikiater, atau puskesmas terdekat untuk pemeriksaan lebih lanjut.'];
$blok[] = ['jenis' => 'tebal', 'isi' => 'Butuh bantuan segera? Hubungi layanan kesehatan jiwa Kemenkes 119 ext 8 (healing119.id).'];
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
    <p class="label-kecil"><?= $terdiagnosa ? 'Kecenderungan yang terdeteksi' : 'Hasil konsultasi' ?></p>
    <h1><?= e($judulHasil) ?></h1>
    <?php if ($penjelasan) { ?><p><?= e($penjelasan) ?></p><?php } ?>
    <p class="meta"><?= e(SistemPakar::namaMetode($r['metode'])) ?> · <?= e(format_tanggal($r['waktu'])) ?></p>
    <div class="aksi-hasil">
        <button class="tombol-utama" type="button" id="tombol-pdf">Unduh PDF</button>
        <a class="tombol-kedua" href="forward.php">Konsultasi lagi</a>
    </div>
</div>

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
                <h4>Penanganan yang dapat dilakukan<?= rujukan(array_diff($p['sumber'], ['dsm5tr', 'icd11', 'ppdgj3']), '../') ?></h4>
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
                <h4>Aturan <?= e($p['nama_penyakit']) ?></h4>
                <?php $kodePenyakit = $p['id_penyakit']; require __DIR__ . '/partials/kriteria.php'; ?>
            </section>
        <?php } ?>
        <p class="catatan-penting">
            <strong>Catatan penting:</strong> hasil ini adalah gambaran awal, bukan diagnosis. Obat-obatan hanya boleh dikonsumsi sesuai resep dokter.
            Kunjungi psikolog klinis, psikiater, atau puskesmas terdekat untuk pemeriksaan lebih lanjut.
            Butuh bantuan segera? Hubungi <strong>119 ext 8</strong>.<?= rujukan(['healing119'], '../') ?>
        </p>
    </div>
</div>

<script src="../assets/vendor/jspdf.umd.min.js"></script>
<script src="../assets/pdf-hasil.js"></script>
<script>
    document.getElementById("tombol-pdf").addEventListener("click", function () {
        unduhPdfHasil(<?= json_encode($dataPdf, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>);
    });
</script>
<?php require __DIR__ . '/partials/footer.php'; ?>
