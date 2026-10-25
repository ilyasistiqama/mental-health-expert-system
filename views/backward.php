<?php
session_start();

require '../database/koneksi.php';

if (($_SESSION["hak_akses"] ?? null) != "user") {
    header("location: auth/login.php");
    exit;
}

if (isset($_GET['id_penyakit'])) {
    $iddi = $_GET['id_penyakit'];
} else {
    $iddi = 'P0';
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
                <li><a class="active" href="konsultasi.php">Konsultasi</a></li>
                <li><a href="../controllers/logout.php">Logout</a></li>
            </ul>
            <div id="content">
                <h1 style="text-align: center;">
                    Metode Backward Chaining
                </h1>
                <div id="before-box">
                    <div id="box">
                        <h2 style="text-align: center; font-style: italic;">
                            Pilih Penyakit:
                        </h2>
                        <?php
                        $query = mysqli_query($koneksi, "SELECT * from penyakit where id_penyakit != 'P0' and id_penyakit in (select id_penyakit from gjl_khusus) order by id_penyakit");
                        while ($row = mysqli_fetch_assoc($query)) {
                        ?>
                            <div style="display: block;">
                                <a href="backward.php?id_penyakit=<?= urlencode($row['id_penyakit']); ?>">
                                    <button>
                                        <?php echo htmlspecialchars($row['nama_penyakit']) ?>
                                    </button>
                                </a>
                            </div>
                        <?php
                        }
                        ?>
                        <hr>
                        <?php
                        if ($iddi == 'P0') {
                            echo "Pilih Penyakitnya Terlebih Dahulu";
                        } else {
                            $query10 = mysqli_execute_query($koneksi, "select * from gjl_khusus where id_penyakit = ?", [$iddi]);

                        ?>
                            <h4 style="margin-bottom: 15px;">
                                Dengan Gejala:
                            </h4>
                            <ul style="display: block;">
                                <?php
                                while ($panggil10 = mysqli_fetch_assoc($query10)) {
                                ?>
                                    <li style="margin-left: 15px;">
                                        <h4 style="font-style: italic; text-align: left;">
                                            -> <?php echo htmlspecialchars($panggil10['nama_gejalak']); ?>
                                        </h4>
                                    </li>
                                <?php
                                }
                                ?>
                            </ul>
                            <hr>
                            <p>
                                Jika gejala diatas telah diderita selama 2 minggu, maka penyakit tersebut <b>positif</b>.
                            </p>
                            <hr>

                            <div style="text-align: left;">
                            <?php
                            if ($iddi == "P1") {
                                echo "<h4>Pengobatan yang dapat di lakukan : </h4>
                                1. Dengan Melakukan terapi psikoterapi secara rutin. Psikoterapi yang sering digunakan adalah terapi kognitif perilaku 
                                (cognitive behavioral therapy).<br>
                                2. Dengan Mengonsumsi obat-obatan antiansietas (Selective serotonin reuptake inhibitors (SSRI), seperti fluoxetine atau sertraline),
                                (enzodiazepine, seperti alprazolam atau clonazepam), atau (Serotonin and norepinephrine reuptake inhibitors (SNRI), seperti venlafaxine)
                                 untuk mengurangi gejala gangguan panik sesuai dengan resep yang diberikan oleh dokter.<br><br>
                                Anda dapat mengunjungi Pusat Pelayanan Psikologi terdekat untuk pengobatan lebih lanjut.";
                            } elseif ($iddi == "P2") {
                                echo "<h4>Pengobatan yang dapat di lakukan : </h4>
                                1. Dengan Melakukan terapi psikoterapi secara rutin. Psikoterapi yang sering digunakan untuk pengobatan Gangguan Kecemasan Menyeluruh
                                adalah Terapi Perilaku Kognitif.<br>
                                2. Dengan Mengonsumsi obat-obatan untuk meringankan gejala yang dialami. Seperti, Antidepresan (escitalopram, paroxetine, 
                                sertraline, fluoxetine, dan citalopram.) dan Antikecemasan (escitalopram, paroxetine, sertraline, fluoxetine, dan citalopram) 
                                sesuai dengan resep yang diberikan oleh dokter.<br><br>
                                Anda dapat mengunjungi Pusat Pelayanan Psikologi terdekat untuk pengobatan lebih lanjut.";
                            } elseif ($iddi == "P3") {
                                echo "<h4>Pengobatan yang dapat di lakukan : </h4>
                                1. Dengan Melakukan terapi psikoterapi secara rutin. Psikoterapi yang paling efektif untuk pengobatan Gangguan Fobia
                                adalah Terapi Perilaku Kognitif.<br>
                                2. Dengan Melakukan terapi mengendalikan diri. Misalkan teknik relaksasi dan juga teknik visualisasi.<br>
                                3. Dengan Mengonsumsi obat-obatan untuk meringankan gejala yang dialami. Seperti, Penghambat pelepasan serotonin (SSRIs),
                                Penghambat beta (beta blockers), dan Benzodiazepine sesuai dengan resep yang diberikan oleh dokter.<br><br>
                                Anda dapat mengunjungi Pusat Pelayanan Psikologi terdekat untuk pengobatan lebih lanjut.";
                            } elseif ($iddi == "P4") {
                                echo "<h4>Pengobatan yang dapat di lakukan : </h4>
                                1. Dengan Melakukan terapi psikoterapi secara rutin. Psikoterapi yang sering digunakan untuk pengobatan Gangguan Obsesif-Kompulsif
                                adalah Terapi Perilaku Kognitif.<br>
                                2. Dengan Mengonsumsi obat-obatan untuk mengontrol gejala yang dialami. Seperti, antidepresan atau obat pengurang stress (
                                  Clomipramine (Anafranil), Fluvoxamine (Luvox CR), Fluoxetine (Prozac), Paroxetine (Paxil, Pexeva), Sertraline (Zoloft))
                              sesuai dengan resep yang diberikan oleh dokter.<br><br>
                                Anda dapat mengunjungi Pusat Pelayanan Psikologi terdekat untuk pengobatan lebih lanjut.";
                            } elseif ($iddi == "P5") {
                                echo "<h4>Pengobatan yang dapat di lakukan : </h4>
                                1. Dengan Melakukan terapi psikoterapi secara rutin. Psikoterapi untuk pengobatan Gangguan Stres Traumatis
                                terdiri dari terapi perilaku kognitif atau cognitive behavioural threapy (CBT), 
                                Terapi desensitisasi gerakan mata dan pemrosesan ulang atau eye movement desensitisation and reprocessing (EMDR),
                                Terapi penyingkapan (exposure therapy), dan Terapi kelompok.<br>
                                2. Dengan Mengonsumsi obat-obatan untuk mengontrol gejala yang dialami. Seperti, Antidepresan (mirtazapine, amitriptyline, dan phenelzine),
                                Prazosin, dan Antiansietas sesuai dengan resep yang diberikan oleh dokter.<br><br>
                                Anda dapat mengunjungi Pusat Pelayanan Psikologi terdekat untuk pengobatan lebih lanjut.";
                            }
                            ?>
                            </div>
                        <?php
                        }
                        ?>
                    </div>
                </div>
            </div>

        </div>
    </div>
</body>

</html>