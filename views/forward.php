<?php

require __DIR__ . '/../lib/bantu.php';

wajib_login('../');

$sp = sistem_pakar();
$metode = 'forward';
$sesi = $_SESSION['sesi'][$metode] ?? null;
if (!$sp->sesiValid($sesi, $metode)) {
    $sesi = $_SESSION['sesi'][$metode] = $sp->sesiBaru($metode);
}

$langkah = $sp->langkahBerikutnya($sesi);
if ($langkah['jenis'] === 'selesai') {
    selesaikan_konsultasi($metode, $sesi, $langkah, '../');
}

$judul = 'Forward Chaining';
$aktif = 'konsultasi';
$dasar = '../';
require __DIR__ . '/partials/header.php';
?>
<h1 class="judul-halaman">Metode Forward Chaining</h1>
<p class="pengantar">
    Sistem mengumpulkan gejala yang anda alami, lalu mencocokkannya dengan seluruh aturan untuk menarik kesimpulan.
    Beberapa pertanyaan menyinggung pengalaman yang tidak menyenangkan; anda boleh berhenti kapan saja.
</p>

<div class="wadah-sempit">
    <?php require __DIR__ . '/partials/pertanyaan.php'; ?>
</div>
<?php require __DIR__ . '/partials/footer.php'; ?>
