<?php

// bisa diatur lewat environment variable, default sesuai XAMPP/Laragon
try {
    $koneksi = mysqli_connect(
        getenv('DB_HOST') ?: 'localhost',
        getenv('DB_USER') ?: 'root',
        getenv('DB_PASS') ?: '',
        getenv('DB_NAME') ?: 'sispak',
        (int) (getenv('DB_PORT') ?: 3306)
    );
    mysqli_set_charset($koneksi, "utf8mb4");
} catch (mysqli_sql_exception $e) {
    exit("Database tidak terkoneksi");
}
