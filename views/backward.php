<?php

require __DIR__ . '/../lib/bantu.php';

wajib_login('../');

$sp = sistem_pakar();
$metode = 'backward';
$target = $_GET['id_penyakit'] ?? null;
if (!in_array($target, $sp->daftarPenyakit(), true)) {
    $target = null;
}

if ($target !== null) {
    $sesi = $_SESSION['sesi'][$metode] ?? null;
    // gangguan yang dicek berganti, mulai dari awal
    if (!$sp->sesiValid($sesi, $metode) || $sesi['target'] !== $target) {
        $sesi = $_SESSION['sesi'][$metode] = $sp->sesiBaru($metode, $target);
    }
    $langkah = $sp->langkahBerikutnya($sesi);
    if ($langkah['jenis'] === 'selesai') {
        selesaikan_konsultasi($metode, $sesi, $langkah, '../');
    }
}

$judul = 'Cek Gangguan Tertentu';
$aktif = 'konsultasi';
$dasar = '../';
require __DIR__ . '/partials/header.php';
?>
<h1 class="judul-halaman">Cek Gangguan Tertentu</h1>
<p class="pengantar">
    Sudah menduga gangguan tertentu? Pilih gangguannya, lalu sistem akan menanyakan kriterianya satu per satu untuk memastikan
    apakah gejala anda sesuai.
</p>

<div class="wadah-sempit">
    <div class="pilihan-penyakit">
        <?php foreach ($sp->daftarPenyakit() as $kode) { ?>
            <a class="chip <?= $kode === $target ? 'aktif' : '' ?>" href="backward.php?id_penyakit=<?= e(urlencode($kode)) ?>"><?= e($sp->penyakit[$kode]['nama_penyakit']) ?></a>
        <?php } ?>
    </div>

    <?php if ($target === null) { ?>
        <p class="kosong">Pilih salah satu gangguan di atas untuk mulai mengecek.</p>
    <?php } else { ?>
        <details class="kartu hipotesis">
            <summary>
                <span class="label-kecil">Gangguan yang dicek</span>
                <strong><?= e($sp->penyakit[$target]['nama_penyakit']) ?></strong>
                <span class="tautan-kecil">Lihat kriteria gangguan ini</span>
            </summary>
            <?php $kodePenyakit = $target; require __DIR__ . '/partials/kriteria.php'; ?>
        </details>

        <?php require __DIR__ . (perlu_petunjuk($metode, $sesi) ? '/partials/petunjuk.php' : '/partials/pertanyaan.php'); ?>
    <?php } ?>
</div>
<?php require __DIR__ . '/partials/footer.php'; ?>
