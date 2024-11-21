<?php

include '../database/koneksi.php';
session_start();

if (isset($_GET["id_ya"])) {

    if ($_GET['id_ya'] == 'f') {
        $d = mysqli_fetch_assoc(mysqli_query($koneksi, "SELECT * FROM temporary"));
        echo "<script>location.href='../views/hasil.php?id=$d[id_penyakit]'</script>";
    } else if ($_GET['id_ya'] == 13) {

        $d = mysqli_fetch_assoc(mysqli_query($koneksi, "SELECT * FROM gjl_khusus WHERE ya=$_GET[id_ya] AND id_gjl_khusus=$_GET[id]"));

        $cek = mysqli_query($koneksi, "SELECT * FROM temporary WHERE id_penyakit = '$d[id_penyakit]'");

        $input2 = "INSERT INTO temporary VALUES ('','$d[id_penyakit]')";

        if (mysqli_num_rows($cek) > 1) {
            echo "<script>location.href='../views/forward.php';</script>";
        } else if ($d['id_penyakit'] != 'P0'  && $d['ya'] != 'f') {
            $id = $d['ya'];
            mysqli_query($koneksi, "DELETE FROM temporary");
            mysqli_query($koneksi, $input2);
            
            echo "<script>location.href='../views/forward.php?id=$id'</script>";
        } else {
            echo "<script>location.href='../views/forward.php';</script>";
        }
    } else {

        $d = mysqli_fetch_assoc(mysqli_query($koneksi, "SELECT * FROM gjl_khusus WHERE ya=$_GET[id_ya]"));

        $cek = mysqli_query($koneksi, "SELECT * FROM temporary WHERE id_penyakit = '$d[id_penyakit]'");

        $input2 = "INSERT INTO temporary VALUES ('','$d[id_penyakit]')";

        if (mysqli_num_rows($cek) > 1) {
            echo "<script>location.href='../views/forward.php';</script>";
        } else if ($d['id_penyakit'] != 'P0'  && $d['ya'] != 'f') {
            $id = $d['ya'];
            mysqli_query($koneksi, "DELETE FROM temporary");
            mysqli_query($koneksi, $input2);
            echo "<script>location.href='../views/forward.php?id=$id'</script>";
        } else {
            echo "<script>location.href='../views/forward.php';</script>";
        }
    }
} else {
    echo "Gagal Masuk";
}
