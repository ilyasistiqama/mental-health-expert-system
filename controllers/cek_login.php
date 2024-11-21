<?php
session_start();

include '../database/koneksi.php';

$username = mysqli_real_escape_string($koneksi, $_POST['username']);
$password = mysqli_real_escape_string($koneksi, $_POST['password']);

$login = mysqli_query($koneksi, "select * from user where username='$username' and password='$password'");
$cek = mysqli_num_rows($login);

if ($cek > 0) {
    $data = mysqli_fetch_assoc($login);

    if ($data['hak_akses'] == "user") {
        $_SESSION['username'] = $username;
        $_SESSION['hak_akses'] = "user";

        header("location:../views/konsultasi.php");
    } else {
        echo "<script>alert('Gagal Masuk, Username atau Password Salah!');history.go(-1);</script>";
    }
} else {
    echo "<script>alert('Gagal Masuk, Username atau Password Salah!');history.go(-1);</script>";
}
