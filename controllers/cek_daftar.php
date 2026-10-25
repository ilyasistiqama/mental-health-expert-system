<?php
session_start();

include '../database/koneksi.php';

$nama = trim($_POST["nama"] ?? '');
$username = trim($_POST["username"] ?? '');
$password = $_POST["password"] ?? '';

if ($nama == '' || $username == '' || $password == '') {
    exit("<script>alert('Error! Please Insert Again');history.go(-1);</script>");
}

if (mb_strlen($nama) > 20 || mb_strlen($username) > 20) {
    exit("<script>alert('Nama dan Username maksimal 20 karakter!');history.go(-1);</script>");
}

try {
    $count = mysqli_execute_query($koneksi, "SELECT * FROM user WHERE username = ?", [$username]);

    if (mysqli_num_rows($count) > 0) {
        echo "<script>alert('Username Sudah Ada!');history.go(-1);</script>";
    } else {
        mysqli_execute_query($koneksi, "INSERT INTO user VALUES (NULL, ?, ?, ?, 'user')", [$nama, $username, password_hash($password, PASSWORD_DEFAULT)]);
        echo "<script>alert('Username Berhasil Di Tambahkan');window.location.replace('../views/auth/login.php');</script>";
    }
} catch (mysqli_sql_exception $e) {
    error_log($e->getMessage());
    echo "<script>alert('Error! Please Insert Again');history.go(-1);</script>";
}
