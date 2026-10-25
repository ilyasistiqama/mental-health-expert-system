<?php

require __DIR__ . '/../../lib/bantu.php';

if (sudah_login()) {
    header('location: ../konsultasi.php');
    exit;
}

$judul = 'Login';
$aktif = 'login';
$dasar = '../../';
require __DIR__ . '/../partials/header.php';
?>
<div id="before-box">
    <div id="box">
        <h2>Login</h2>
        <hr>
        <?php require __DIR__ . '/../partials/pesan-kilat.php'; ?>
        <form action="../../controllers/cek_login.php" method="POST" id="form">
            <div class="form-content">
                <label class="form-control" for="username">Username : </label>
                <input class="form-control" type="text" id="username" name="username" maxlength="20" value="<?= e(isian_lama('username')) ?>" required>
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
        <a href="daftar.php" class="link"><span>BELUM PUNYA AKUN? DAFTAR DISINI</span></a>
    </div>
</div>
<?php require __DIR__ . '/../partials/cek-cookie.php'; ?>
<?php unset($_SESSION['isian']); ?>
<?php require __DIR__ . '/../partials/footer.php'; ?>
