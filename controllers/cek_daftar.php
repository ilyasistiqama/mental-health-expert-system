<?php
session_start();

include '../database/koneksi.php';

$nama = $_POST["nama"];
$username = $_POST["username"];
$password = $_POST["password"];

try {
    $count = mysqli_query($koneksi, "SELECT * from user where username = '$username'");
    $input = "INSERT INTO user values (NULL,'$nama','$username','$password','user')";


    if (mysqli_num_rows($count) > 0) {
        echo "<script>alert('Username Sudah Ada!');history.go(-1);</script>";
    } else if ($username != '') {
        mysqli_query($koneksi, $input);
        echo "<script>alert('Username Berhasil Di Tambahkan');window.location.replace('../views/auth/login.php');</script>";
    } else {
        echo "<script>alert('Error! Please Insert Again');history.go(-1);</script>";
    }
} catch (\Exception $e) {
    var_dump($e);
    die;
}
