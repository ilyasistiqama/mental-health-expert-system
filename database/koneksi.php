<?php

try {
    $koneksi = mysqli_connect("localhost", "root", "", "sispak");
    mysqli_set_charset($koneksi, "utf8mb4");
} catch (mysqli_sql_exception $e) {
    exit("Database tidak terkoneksi");
}
