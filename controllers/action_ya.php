<?php
session_start();

include '../database/koneksi.php';

if (($_SESSION["hak_akses"] ?? null) != "user") {
    header("location:../views/auth/login.php");
    exit;
}

if (!isset($_GET["id"])) {
    exit("Gagal Masuk");
}

$d = mysqli_fetch_assoc(mysqli_execute_query($koneksi, "SELECT * FROM gjl_khusus WHERE id_gjl_khusus = ?", [(int) $_GET['id']]));

if (!$d) {
    header("location:../views/forward.php");
    exit;
}

// pertanyaan terakhir, tampilkan penyakit yang tersimpan selama konsultasi
if ($d['ya'] == 'f') {
    header("location:../views/hasil.php?id=" . urlencode($_SESSION['id_penyakit'] ?? 'P0'));
    exit;
}

if ($d['id_penyakit'] != 'P0') {
    $_SESSION['id_penyakit'] = $d['id_penyakit'];
}

header("location:../views/forward.php?id=" . urlencode($d['ya']));
