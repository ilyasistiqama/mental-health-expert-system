<?php
session_start();

include '../database/koneksi.php';

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

$login = mysqli_execute_query($koneksi, "SELECT * FROM user WHERE username = ?", [$username]);
$data = mysqli_fetch_assoc($login);

// akun lama masih menyimpan password tanpa hash
$valid = $data && (password_verify($password, $data['password'])
    || (password_get_info($data['password'])['algo'] === null && hash_equals($data['password'], $password)));

if ($valid && $data['hak_akses'] == "user") {
    session_regenerate_id(true);
    $_SESSION['username'] = $data['username'];
    $_SESSION['hak_akses'] = "user";

    header("location:../views/konsultasi.php");
} else {
    echo "<script>alert('Gagal Masuk, Username atau Password Salah!');history.go(-1);</script>";
}
