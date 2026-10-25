<?php
session_start();

require '../database/koneksi.php';

if (($_SESSION["hak_akses"] ?? null) != "user") {
    header("location: auth/login.php");
    exit;
}

if (isset($_GET['id'])) {
    $id = (int) $_GET['id'];
    if ($id == 12) {
        header("location: hasil.php?id=P0");
        exit;
    }
} else {
    // konsultasi baru, buang hasil konsultasi sebelumnya
    $id = 1;
    unset($_SESSION['id_penyakit']);
}

$panggil = mysqli_execute_query($koneksi, "select * from gjl_khusus where id_gjl_khusus = ?", [$id]);

?>


<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="../assets/main.css">
    <title>Sistem Pakar</title>
</head>

<body>
    <div id="bingkai">
        <div id="margin">
            <div id="judul">
                <div>Sistem Pakar Psikologi Gangguan Kecemasan</div>
            </div>
            <ul>
                <li><a href="../index.php">Home</a></li>
                <li><a href="artikel.php">Artikel</a></li>
                <li><a class="active" href="konsultasi.php">Konsultasi</a></li>
                <li><a href="../controllers/logout.php">Logout</a></li>
            </ul>
            <div id="content">
                <h1 style="text-align: center;">
                    Metode Forward Chaining
                </h1>
                <h2 style="text-align: center; font-style: italic;">
                    Jawablah pertanyaan sesuai dengan gejala-gejala yang anda alami:
                </h2>

                <div id="before-box">
                    <div id="box">
                        <?php

                        if (mysqli_num_rows($panggil) > 0) {
                            $data = mysqli_fetch_assoc($panggil); ?>

                            <h3>
                                <?php echo htmlspecialchars($data['pertanyaank']); ?>
                            </h3>

                            <a href="../controllers/action_ya.php?id=<?= $id; ?>">
                                <button class="tombol hijau" id="tmbl_ya">
                                    Ya
                                </button>
                            </a>
                            <a href="../controllers/action_tidak.php?id=<?= $id; ?>">
                                <button class="tombol merah" id="tmbl_tdk">
                                    Tidak
                                </button>
                            </a>
                        <?php } ?>
                    </div>
                </div>
            </div>

        </div>
    </div>
</body>

</html>