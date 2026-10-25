<?php

require __DIR__ . '/../lib/bantu.php';

wajib_login('../');

$metode = $_POST['metode'] ?? '';
if (!in_array($metode, ['forward', 'backward'], true) || !csrf_valid()) {
    header('location: ../views/konsultasi.php');
    exit;
}

$sp = sistem_pakar();
$sesi = $_SESSION['sesi'][$metode] ?? null;
$kembali = $metode === 'forward'
    ? '../views/forward.php'
    : '../views/backward.php?id_penyakit=' . urlencode($sesi['target'] ?? '');

// form lama yang dikirim ulang (tombol back/refresh browser) diabaikan agar jawaban tidak tercatat dua kali
if (!$sp->sesiValid($sesi, $metode) || (string) count($sesi['urutan']) !== ($_POST['langkah'] ?? '')) {
    header("location: $kembali");
    exit;
}

$aksi = $_POST['aksi'] ?? '';
$nilai = $_POST['nilai'] ?? '';
$langkah = $sp->langkahBerikutnya($sesi);

if ($aksi === 'mulai') {
    $_SESSION['petunjuk'][$metode] = $sesi['target'] ?? '';
} elseif ($aksi === 'kembali') {
    $sesi = $sp->batalkan($sesi);
} elseif ($aksi === 'ulang') {
    $sesi = $sp->sesiBaru($metode, $sesi['target']);
} elseif ($aksi === 'jawab' && $langkah['jenis'] === 'gejala' && in_array($nilai, ['ya', 'tidak'], true)) {
    $sesi = $sp->jawab($sesi, $nilai === 'ya');
} elseif ($aksi === 'jawab' && $langkah['jenis'] === 'durasi' && in_array($nilai, array_map('strval', array_column(SistemPakar::OPSI_DURASI, 'hari')), true)) {
    $sesi = $sp->jawab($sesi, (int) $nilai);
}

$_SESSION['sesi'][$metode] = $sesi;

$langkah = $sp->langkahBerikutnya($sesi);
if ($langkah['jenis'] === 'selesai') {
    selesaikan_konsultasi($metode, $sesi, $langkah, '../');
}

header("location: $kembali");
