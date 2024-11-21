<?php

include '../koneksi.php';
session_start();
if (isset($_GET["id_tidak"])) {

    if ($_GET['id_tidak'] == 'f') {
        $d = mysqli_fetch_assoc(mysqli_query($koneksi, "SELECT * FROM temporary"));
        echo "<script>location.href='../hasil.php?id=$d[id_penyakit]'</script>";
    } else if ($_GET['id_tidak'] == 13) {

        $d = mysqli_fetch_assoc(mysqli_query($koneksi, "SELECT * FROM gjl_khusus WHERE tidak=$_GET[id_tidak] AND id_gjl_khusus=$_GET[id]"));

        $cek = mysqli_query($koneksi, "SELECT * FROM temporary WHERE id_penyakit = '$d[id_penyakit]'");

        //$input2 = "INSERT INTO temporary VALUES ('','$d[id_penyakit]')";

        if (mysqli_num_rows($cek) > 1) {
            echo "<script>location.href='pertanyaan1.php';</script>";
        } else if ($d['id_penyakit'] != 'P0'  && $d['ya'] != 'f') {
            $id = $d['ya'];
            //mysqli_query($koneksi, "DELETE FROM temporary");
            //mysqli_query($koneksi,$input2);
            //var_dump($id); die();
            echo "<script>location.href='pertanyaan1.php?id=$id'</script>";
        } else {
            echo "<script>location.href='pertanyaan1.php';</script>";
        }
    } else {

        $da = mysqli_fetch_assoc(mysqli_query($koneksi, "SELECT * FROM gjl_khusus WHERE tidak=$_GET[id_tidak]"));

        $cek = mysqli_query($koneksi, "SELECT * FROM temporary WHERE id_penyakit = '$da[id_penyakit]'");

        $input2 = "INSERT INTO temporary VALUES ('','$da[id_penyakit]')";

        if (mysqli_num_rows($cek) > 1) {

            echo "<script>location.href='pertanyaan1.php';</script>";
        } else if ($da['id_penyakit'] != 'P0' && $da['tidak'] != 'f') {
            $id = $da['tidak'];
            mysqli_query($koneksi, "DELETE FROM temporary");
            mysqli_query($koneksi, $input2);
            //var_dump($id); die();
            echo "<script>location.href='pertanyaan1.php?id=$id'</script>";
        } else if ($da['tidak'] == 'f') {
            echo "<script>location.href='../hasil.php?id=$da[id_penyakit]'</script>";
        } else {
            echo "<script>location.href='pertanyaan1.php';</script>";
        }
    }
} else {
    echo "Gagal Masuk";
}
