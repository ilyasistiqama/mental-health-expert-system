<?php

require __DIR__ . '/../lib/bantu.php';

$nama = trim($_POST["nama"] ?? '');
$username = trim($_POST["username"] ?? '');
$password = $_POST["password"] ?? '';

function kembali_ke_daftar(string $pesan, string $nama, string $username): never
{
    pesan_kilat('gagal', $pesan, ['nama' => $nama, 'username' => $username]);
    header('location: ../views/auth/daftar.php');
    exit;
}

if ($nama == '' || $username == '' || $password == '') {
    kembali_ke_daftar('Nama, username, dan password wajib diisi.', $nama, $username);
}

if (mb_strlen($nama) > 20 || mb_strlen($username) > 20) {
    kembali_ke_daftar('Nama dan username maksimal 20 karakter.', $nama, $username);
}

try {
    $count = mysqli_execute_query($koneksi, "SELECT * FROM user WHERE username = ?", [$username]);

    if (mysqli_num_rows($count) > 0) {
        kembali_ke_daftar("Username \"{$username}\" sudah dipakai. Silakan pilih username lain.", $nama, '');
    }

    mysqli_execute_query($koneksi, "INSERT INTO user VALUES (NULL, ?, ?, ?, 'user')", [$nama, $username, password_hash($password, PASSWORD_DEFAULT)]);
    pesan_kilat('berhasil', 'Akun berhasil dibuat. Silakan masuk dengan username dan password anda.', ['username' => $username]);
    header('location: ../views/auth/login.php');
} catch (mysqli_sql_exception $e) {
    error_log($e->getMessage());
    kembali_ke_daftar('Akun gagal dibuat karena gangguan sistem. Silakan coba lagi.', $nama, $username);
}
