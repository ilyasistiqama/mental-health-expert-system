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
    // hipotesis berganti, mulai pembuktian dari awal
    if (!$sp->sesiValid($sesi, $metode) || $sesi['target'] !== $target) {
        $sesi = $_SESSION['sesi'][$metode] = $sp->sesiBaru($metode, $target);
    }
    $langkah = $sp->langkahBerikutnya($sesi);
    if ($langkah['jenis'] === 'selesai') {
        selesaikan_konsultasi($metode, $sesi, $langkah, '../');
    }
}

$judul = 'Backward Chaining';
$aktif = 'konsultasi';
$dasar = '../';
require __DIR__ . '/partials/header.php';
?>
<h1 class="judul-halaman">Metode Backward Chaining</h1>
<p class="pengantar">
    Pilih satu gangguan sebagai hipotesis. Sistem akan menanyakan kriterianya satu per satu untuk membuktikan hipotesis tersebut,
    dan berhenti begitu satu kriteria tidak terpenuhi.
</p>

<div class="wadah-sempit">
    <div class="pilihan-penyakit">
        <?php foreach ($sp->daftarPenyakit() as $kode) { ?>
            <a class="chip <?= $kode === $target ? 'aktif' : '' ?>" href="backward.php?id_penyakit=<?= e(urlencode($kode)) ?>"><?= e($sp->penyakit[$kode]['nama_penyakit']) ?></a>
        <?php } ?>
    </div>

    <?php if ($target === null) { ?>
        <p class="kosong">Pilih salah satu gangguan di atas sebagai hipotesis.</p>
    <?php } else { ?>
        <details class="kartu hipotesis">
            <summary>
                <span class="label-kecil">Hipotesis</span>
                <strong><?= e($sp->penyakit[$target]['nama_penyakit']) ?></strong>
                <span class="tautan-kecil">Lihat aturan pembuktian</span>
            </summary>
            <?php $kodePenyakit = $target; require __DIR__ . '/partials/kriteria.php'; ?>
        </details>

        <?php require __DIR__ . '/partials/pertanyaan.php'; ?>
    <?php } ?>
</div>
<?php require __DIR__ . '/partials/footer.php'; ?>
