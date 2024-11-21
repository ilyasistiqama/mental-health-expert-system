<?php

$koneksi = mysqli_connect ("localhost", "root", "", "sispak") or die();

if (!$koneksi)
{
    echo "Database tidak terkoneksi";
}
?>