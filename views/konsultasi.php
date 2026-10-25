<?php
session_start();

require '../database/koneksi.php';

if (($_SESSION["hak_akses"] ?? null) != "user") {
    header("location: auth/login.php");
    exit;
}
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
                <li><a class="active">Konsultasi</a></li>
                <li><a href="../controllers/logout.php">Logout</a></li>
            </ul>
            <div id="content">
                <h1 style="text-align: center;">
                    Selamat Datang <?php echo htmlspecialchars($_SESSION['username']); ?>
                </h1>
                <h2 style="text-align: center;">
                    Pilih Metode Yang Digunakan:
                </h2>

                <div id="box-button-pertanyaan">
                    <a href="forward.php">
                        <button>
                            <h3>Forward Chaining</h3>
                        </button>
                    </a>
                    <a href="backward.php">
                        <button>
                            <h3>Backward Chaining</h3>
                        </button>
                    </a>
                </div>
            </div>

        </div>
    </div>
</body>

</html>