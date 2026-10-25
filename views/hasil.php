<?php
session_start();

require '../database/koneksi.php';

if (($_SESSION["hak_akses"] ?? null) != "user") {
    header("location: auth/login.php");
    exit;
}

$id = $_GET['id'] ?? 'P0';

unset($_SESSION['id_penyakit']);
$panggil = mysqli_execute_query($koneksi, "select * from penyakit where id_penyakit = ?", [$id]);
$data = mysqli_fetch_assoc($panggil) ?: ['nama_penyakit' => 'Penyakit tidak ditemukan'];
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
                <?php
                if (isset($_SESSION["hak_akses"])) {
                ?>
                    <li><a class="active" href="konsultasi.php">Konsultasi</a></li>
                    <li><a href="../controllers/logout.php">Logout</a></li>
                <?php
                } else {
                ?>
                    <li><a href="auth/login.php">Login</a></li>
                <?php
                }
                ?>
            </ul>
            <div id="content">
                <h1 style="text-align: center;">Penyakit yang terdeteksi:</h1>

                <h3 style="font-weight: bold; margin-bottom: 15px;">
                    <?= htmlspecialchars($data['nama_penyakit']); ?>
                </h3>
                <p>
                    <?php
                    if ($data['nama_penyakit'] == "Gangguan Panik") {
                        echo "<h4>Pengobatan yang dapat di lakukan : </h4>
                      1. Dengan Melakukan terapi psikoterapi secara rutin. Psikoterapi yang sering digunakan adalah terapi kognitif perilaku 
                      (cognitive behavioral therapy).<br>
                      2. Dengan Mengonsumsi obat-obatan antiansietas (Selective serotonin reuptake inhibitors (SSRI), seperti fluoxetine atau sertraline),
                      (enzodiazepine, seperti alprazolam atau clonazepam), atau (Serotonin and norepinephrine reuptake inhibitors (SNRI), seperti venlafaxine)
                       untuk mengurangi gejala gangguan panik sesuai dengan resep yang diberikan oleh dokter.<br><br>
                      Anda dapat mengunjungi Pusat Pelayanan Psikologi terdekat untuk pengobatan lebih lanjut.";
                    } elseif ($data['nama_penyakit'] == "Gangguan Kecemasan Menyeluruh") {
                        echo "<h4>Pengobatan yang dapat di lakukan : </h4>
                      1. Dengan Melakukan terapi psikoterapi secara rutin. Psikoterapi yang sering digunakan untuk pengobatan Gangguan Kecemasan Menyeluruh
                      adalah Terapi Perilaku Kognitif.<br>
                      2. Dengan Mengonsumsi obat-obatan untuk meringankan gejala yang dialami. Seperti, Antidepresan (escitalopram, paroxetine, 
                      sertraline, fluoxetine, dan citalopram.) dan Antikecemasan (escitalopram, paroxetine, sertraline, fluoxetine, dan citalopram) 
                      sesuai dengan resep yang diberikan oleh dokter.<br><br>
                      Anda dapat mengunjungi Pusat Pelayanan Psikologi terdekat untuk pengobatan lebih lanjut.";
                    } elseif ($data['nama_penyakit'] == "Gangguan Fobia") {
                        echo "<h4>Pengobatan yang dapat di lakukan : </h4>
                      1. Dengan Melakukan terapi psikoterapi secara rutin. Psikoterapi yang paling efektif untuk pengobatan Gangguan Fobia
                      adalah Terapi Perilaku Kognitif.<br>
                      2. Dengan Melakukan terapi mengendalikan diri. Misalkan teknik relaksasi dan juga teknik visualisasi.<br>
                      3. Dengan Mengonsumsi obat-obatan untuk meringankan gejala yang dialami. Seperti, Penghambat pelepasan serotonin (SSRIs),
                      Penghambat beta (beta blockers), dan Benzodiazepine sesuai dengan resep yang diberikan oleh dokter.<br><br>
                      Anda dapat mengunjungi Pusat Pelayanan Psikologi terdekat untuk pengobatan lebih lanjut.";
                    } elseif ($data['nama_penyakit'] == "Gangguan Obsesif-Kompulsif") {
                        echo "<h4>Pengobatan yang dapat di lakukan : </h4>
                      1. Dengan Melakukan terapi psikoterapi secara rutin. Psikoterapi yang sering digunakan untuk pengobatan Gangguan Obsesif-Kompulsif
                      adalah Terapi Perilaku Kognitif.<br>
                      2. Dengan Mengonsumsi obat-obatan untuk mengontrol gejala yang dialami. Seperti, antidepresan atau obat pengurang stress (
                        Clomipramine (Anafranil), Fluvoxamine (Luvox CR), Fluoxetine (Prozac), Paroxetine (Paxil, Pexeva), Sertraline (Zoloft))
                    sesuai dengan resep yang diberikan oleh dokter.<br><br>
                      Anda dapat mengunjungi Pusat Pelayanan Psikologi terdekat untuk pengobatan lebih lanjut.";
                    } elseif ($data['nama_penyakit'] == "Gangguan Stres Traumatis") {
                        echo "<h4>Pengobatan yang dapat di lakukan : </h4>
                      1. Dengan Melakukan terapi psikoterapi secara rutin. Psikoterapi untuk pengobatan Gangguan Stres Traumatis
                      terdiri dari terapi perilaku kognitif atau cognitive behavioural threapy (CBT), 
                      Terapi desensitisasi gerakan mata dan pemrosesan ulang atau eye movement desensitisation and reprocessing (EMDR),
                      Terapi penyingkapan (exposure therapy), dan Terapi kelompok.<br>
                      2. Dengan Mengonsumsi obat-obatan untuk mengontrol gejala yang dialami. Seperti, Antidepresan (mirtazapine, amitriptyline, dan phenelzine),
                      Prazosin, dan Antiansietas sesuai dengan resep yang diberikan oleh dokter.<br><br>
                      Anda dapat mengunjungi Pusat Pelayanan Psikologi terdekat untuk pengobatan lebih lanjut.";
                    } else {
                        echo " ";
                    }

                    ?>
                </p>

            </div>

        </div>
    </div>
</body>

</html>