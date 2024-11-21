<?php
session_start();

require '../koneksi.php';
if($_SESSION["hak_akses"]!="user"){
    header("location: login.php");
   exit;
}

if(isset($_GET['id_penyakit'])) {
    $iddi = $_GET['id_penyakit'];
} else {
    $iddi = 'P0';
}

?>

<!doctype html>
<html lang="en">

<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="../assets/css/bootstrap.min.css">
    <title> SISTEM PAKAR </title>

    <?php

include('../koneksi.php');

?>
    <!doctype html>
    <html lang="en">

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <style>
            body {
                margin: 0;
            }

            ul {
                list-style-type: none;
                margin: 0;
                padding: 0;
                width: 15%;
                background-color: #f1f1f1;
                position: absolute;
                height: 1000px;
                overflow: auto;
            }

            li a {
                display: block;
                color: #000;
                padding: 8px 16px;
                text-decoration: none;
            }

            li a.active {
                background-color: blueviolet;
                color: white;
            }

            li a:hover:not(.active) {
                background-color: #555;
                color: white;
            }

        </style>

        <link rel="stylesheet" href="../assets/cssmenu.css">
        <title>Sistem Pakar</title>
    </head>

<body background="../assets/background.jpg">
    <div id="bingkai">
        <div id="margin">
            <div id="judul">
                <font color="white">Metode Backward Chaining</font>
            </div>
            <ul>
                
                <li><a class="active" href="backward.php">Konsultasi Lagi</a></li>
                <li><a href="../diagnosa.php">Pilih Metode</a></li>
                <li><a href="../logout.php">Logout</a></li>
              </ul>
            <div style="margin-left:18%;padding:1px 16px;height:1000px;">
            <h1>Pilih Penyakit :</h1>
                        <?php
                            $query = mysqli_query($koneksi,"SELECT * from gjl_khusus inner join penyakit on penyakit.id_penyakit = gjl_khusus.id_penyakit where gjl_khusus.id_penyakit!='P0' group by gjl_khusus.id_penyakit");
                            while ($row = mysqli_fetch_assoc($query)){
                                ?> <a href="backward.php?id_penyakit=<?=$row['id_penyakit'];?>"><br><button><?php echo $row['nama_penyakit'] ?></button></a><br>
                            
                        <?php
                            }
                        ?>
                            <br><br><hr>
                            <?php
                            if($iddi=='P0'){
                                echo "Pilih Penyakitnya Terlebih Dahulu";
                            }
                            else {   
                                $query10 = mysqli_query($koneksi,"select * from gjl_khusus where id_penyakit='$iddi'");
                                
                            ?>
                            <h4>Dengan Gejala :</h4><br>
                            <?php 
                                while($panggil10 = mysqli_fetch_assoc($query10)){
                                    ?> <b>* <?php echo $panggil10['nama_gejalak'];?></b><br> <?php
                                }
                                ?>
                                <hr>
                                <p>
                                Jika gejala diatas telah diderita selama 2 minggu, maka penyakit tersebut <b>positif</b>.        
                                </p>
                                <hr>
                                
                            <?php
                             $query11 = mysqli_query($koneksi,"select * from gjl_khusus where id_penyakit='$iddi'");
                            $panggil11 = mysqli_fetch_assoc($query11);
                            //   echo $panggil10['id_penyakit'];
                              if($panggil11['id_penyakit'] == "P1"){
                                echo "<h4>Pengobatan yang dapat di lakukan : </h4>
                                1. Dengan Melakukan terapi psikoterapi secara rutin. Psikoterapi yang sering digunakan adalah terapi kognitif perilaku 
                                (cognitive behavioral therapy).<br>
                                2. Dengan Mengonsumsi obat-obatan antiansietas (Selective serotonin reuptake inhibitors (SSRI), seperti fluoxetine atau sertraline),
                                (enzodiazepine, seperti alprazolam atau clonazepam), atau (Serotonin and norepinephrine reuptake inhibitors (SNRI), seperti venlafaxine)
                                 untuk mengurangi gejala gangguan panik sesuai dengan resep yang diberikan oleh dokter.<br><br>
                                Anda dapat mengunjungi Pusat Pelayanan Psikologi terdekat untuk pengobatan lebih lanjut.";
                              }elseif($panggil11['id_penyakit'] == "P2"){
                                echo "<h4>Pengobatan yang dapat di lakukan : </h4>
                                1. Dengan Melakukan terapi psikoterapi secara rutin. Psikoterapi yang sering digunakan untuk pengobatan Gangguan Kecemasan Menyeluruh
                                adalah Terapi Perilaku Kognitif.<br>
                                2. Dengan Mengonsumsi obat-obatan untuk meringankan gejala yang dialami. Seperti, Antidepresan (escitalopram, paroxetine, 
                                sertraline, fluoxetine, dan citalopram.) dan Antikecemasan (escitalopram, paroxetine, sertraline, fluoxetine, dan citalopram) 
                                sesuai dengan resep yang diberikan oleh dokter.<br><br>
                                Anda dapat mengunjungi Pusat Pelayanan Psikologi terdekat untuk pengobatan lebih lanjut.";
                              }elseif($panggil11['id_penyakit'] == "P3"){
                                echo "<h4>Pengobatan yang dapat di lakukan : </h4>
                                1. Dengan Melakukan terapi psikoterapi secara rutin. Psikoterapi yang paling efektif untuk pengobatan Gangguan Fobia
                                adalah Terapi Perilaku Kognitif.<br>
                                2. Dengan Melakukan terapi mengendalikan diri. Misalkan teknik relaksasi dan juga teknik visualisasi.
                                3. Dengan Mengonsumsi obat-obatan untuk meringankan gejala yang dialami. Seperti, Penghambat pelepasan serotonin (SSRIs),
                                Penghambat beta (beta blockers), dan Benzodiazepine sesuai dengan resep yang diberikan oleh dokter.<br><br>
                                Anda dapat mengunjungi Pusat Pelayanan Psikologi terdekat untuk pengobatan lebih lanjut.";
                              }elseif($panggil11['id_penyakit'] == "P4"){
                                echo "<h4>Pengobatan yang dapat di lakukan : </h4>
                                1. Dengan Melakukan terapi psikoterapi secara rutin. Psikoterapi yang sering digunakan untuk pengobatan Gangguan Obsesif-Kompulsif
                                adalah Terapi Perilaku Kognitif.<br>
                                2. Dengan Mengonsumsi obat-obatan untuk mengontrol gejala yang dialami. Seperti, antidepresan atau obat pengurang stress (
                                  Clomipramine (Anafranil), Fluvoxamine (Luvox CR), Fluoxetine (Prozac), Paroxetine (Paxil, Pexeva), Sertraline (Zoloft))
                              sesuai dengan resep yang diberikan oleh dokter.<br><br>
                                Anda dapat mengunjungi Pusat Pelayanan Psikologi terdekat untuk pengobatan lebih lanjut.";
                              }elseif($panggil11['id_penyakit'] == "P5"){
                                echo "<h4>Pengobatan yang dapat di lakukan : </h4>
                                1. Dengan Melakukan terapi psikoterapi secara rutin. Psikoterapi untuk pengobatan Gangguan Stres Traumatis
                                terdiri dari terapi perilaku kognitif atau cognitive behavioural threapy (CBT), 
                                Terapi desensitisasi gerakan mata dan pemrosesan ulang atau eye movement desensitisation and reprocessing (EMDR),
                                Terapi penyingkapan (exposure therapy), dan Terapi kelompok.<br>
                                2. Dengan Mengonsumsi obat-obatan untuk mengontrol gejala yang dialami. Seperti, Antidepresan (mirtazapine, amitriptyline, dan phenelzine),
                                Prazosin, dan Antiansietas sesuai dengan resep yang diberikan oleh dokter.<br><br>
                                Anda dapat mengunjungi Pusat Pelayanan Psikologi terdekat untuk pengobatan lebih lanjut.";
                              }else{
                                    echo " ";
                                }
                            }
                            
                            ?>
                           
                            <?php
                            ?>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
</body>
</html>
