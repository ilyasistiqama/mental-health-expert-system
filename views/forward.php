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

$judul = 'Cek Menyeluruh';
$aktif = 'konsultasi';
$dasar = '../';
require __DIR__ . '/partials/header.php';
?>
<h1 class="judul-halaman">Cek Menyeluruh</h1>
<p class="pengantar">
    Jawab pertanyaan seputar keluhan yang anda rasakan. Sistem akan mencocokkannya dengan kriteria semua gangguan untuk mencari kemungkinan gangguan yang anda alami.
    Beberapa pertanyaan menyinggung pengalaman yang tidak menyenangkan; anda boleh berhenti kapan saja.
</p>

<div class="wadah-sempit">
    <?php require __DIR__ . (perlu_petunjuk($metode, $sesi) ? '/partials/petunjuk.php' : '/partials/pertanyaan.php'); ?>
</div>
<?php require __DIR__ . '/partials/footer.php'; ?>
