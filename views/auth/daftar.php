<?php

require __DIR__ . '/../../lib/bantu.php';

if (sudah_login()) {
    header('location: ../konsultasi.php');
    exit;
}

$judul = 'Daftar';
$aktif = 'daftar';
$dasar = '../../';
require __DIR__ . '/../partials/header.php';
?>
<div id="before-box">
    <div id="box">
        <h2>Daftar</h2>
        <hr>
        <form action="../../controllers/cek_daftar.php" method="POST" id="form">
            <div class="form-content">
                <label class="form-control" for="nama">Nama : </label>
                <input class="form-control" type="text" id="nama" name="nama" maxlength="20" required>
            </div>
            <div class="form-content">
                <label class="form-control" for="username">Username : </label>
                <input class="form-control" type="text" id="username" name="username" maxlength="20" required>
            </div>
            <div class="form-content">
                <label class="form-control" for="password">Password : </label>
                <input class="form-control" type="password" id="password" name="password" required>
            </div>
            <div class="form-content">
                <button class="tombol-utama" type="submit">Submit</button>
            </div>
        </form>
        <hr>
        <a href="login.php" class="link"><span>SUDAH PUNYA AKUN? LOGIN DISINI</span></a>
    </div>
</div>
<?php require __DIR__ . '/../partials/cek-cookie.php'; ?>
<?php require __DIR__ . '/../partials/footer.php'; ?>
