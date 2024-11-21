<?php
  session_start();

    require 'koneksi.php';
    if($_SESSION["hak_akses"]!="user"){
        header("location: login.php");
       exit;
    }
    
    if(isset($_GET['id'])){
        $id = $_GET['id'];
    } else {
        $id = 1;
        $id_penyakit = 'P0';
    }

    mysqli_query($koneksi, "DELETE FROM temporary");
    $panggil = mysqli_query($koneksi,"select * from penyakit where id_penyakit = '$id'");
    $data = mysqli_fetch_assoc($panggil);
?>

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="../assets/bootstrap/css/bootstrap.css">
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
  height: 695px;
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
.kotak {
  margin-top: 50px;
  font-size: 15pt;
  border: 4px solid purple;
  border-top: none;
  border-bottom: none;
  border-radius: 5px;
  padding: 20px !important;
}
.tombol {
  margin: 0 5px !important;
  padding: 0 10px !important;
  border: 1px solid white;
  border-radius: 3px;
}
.hijau {
  background-color: green;
  color: white;
}
.merah {
  background-color: red;
  color: white;
}
</style>

 <link rel="stylesheet" href="assets/cssmenu.css">
    <title>Sistem Pakar</title>
  </head>
  <body background="assets/background.jpg">
      <div id="bingkai">
          <div id="margin">
            <div id="judul"><font color="white">Metode Forward Chaining</font></div>

              <ul>
                
                <li><a class="active" href="pertanyaan/pertanyaan1.php">Konsultasi Lagi</a></li>
                <li><a href="diagnosa.php">Pilih Metode</a></li>
                <li><a href="logout.php">Logout</a></li>
              </ul>

              <div id="konten" style="margin-left:18%;padding:1px 16px;height:695px;"><br>
              
                <br><h2>Penyakit yang terdeteksi :</h2>
                <br>
                
                <h3><b><?= $data['nama_penyakit']; ?></b></h3>
                <br>
                <p>
                   <?php
                    if($data['nama_penyakit'] == "Gangguan Panik"){
                      echo "<h4>Pengobatan yang dapat di lakukan : </h4>
                      1. Dengan Melakukan terapi psikoterapi secara rutin. Psikoterapi yang sering digunakan adalah terapi kognitif perilaku 
                      (cognitive behavioral therapy).<br>
                      2. Dengan Mengonsumsi obat-obatan antiansietas (Selective serotonin reuptake inhibitors (SSRI), seperti fluoxetine atau sertraline),
                      (enzodiazepine, seperti alprazolam atau clonazepam), atau (Serotonin and norepinephrine reuptake inhibitors (SNRI), seperti venlafaxine)
                       untuk mengurangi gejala gangguan panik sesuai dengan resep yang diberikan oleh dokter.<br><br>
                      Anda dapat mengunjungi Pusat Pelayanan Psikologi terdekat untuk pengobatan lebih lanjut.";
                    }elseif($data['nama_penyakit'] == "Gangguan Kecemasan Menyeluruh"){
                      echo "<h4>Pengobatan yang dapat di lakukan : </h4>
                      1. Dengan Melakukan terapi psikoterapi secara rutin. Psikoterapi yang sering digunakan untuk pengobatan Gangguan Kecemasan Menyeluruh
                      adalah Terapi Perilaku Kognitif.<br>
                      2. Dengan Mengonsumsi obat-obatan untuk meringankan gejala yang dialami. Seperti, Antidepresan (escitalopram, paroxetine, 
                      sertraline, fluoxetine, dan citalopram.) dan Antikecemasan (escitalopram, paroxetine, sertraline, fluoxetine, dan citalopram) 
                      sesuai dengan resep yang diberikan oleh dokter.<br><br>
                      Anda dapat mengunjungi Pusat Pelayanan Psikologi terdekat untuk pengobatan lebih lanjut.";
                    }elseif($data['nama_penyakit'] == "Gangguan Fobia"){
                      echo "<h4>Pengobatan yang dapat di lakukan : </h4>
                      1. Dengan Melakukan terapi psikoterapi secara rutin. Psikoterapi yang paling efektif untuk pengobatan Gangguan Fobia
                      adalah Terapi Perilaku Kognitif.<br>
                      2. Dengan Melakukan terapi mengendalikan diri. Misalkan teknik relaksasi dan juga teknik visualisasi.<br>
                      3. Dengan Mengonsumsi obat-obatan untuk meringankan gejala yang dialami. Seperti, Penghambat pelepasan serotonin (SSRIs),
                      Penghambat beta (beta blockers), dan Benzodiazepine sesuai dengan resep yang diberikan oleh dokter.<br><br>
                      Anda dapat mengunjungi Pusat Pelayanan Psikologi terdekat untuk pengobatan lebih lanjut.";
                    }elseif($data['nama_penyakit'] == "Gangguan Obsesif-Kompulsif"){
                      echo "<h4>Pengobatan yang dapat di lakukan : </h4>
                      1. Dengan Melakukan terapi psikoterapi secara rutin. Psikoterapi yang sering digunakan untuk pengobatan Gangguan Obsesif-Kompulsif
                      adalah Terapi Perilaku Kognitif.<br>
                      2. Dengan Mengonsumsi obat-obatan untuk mengontrol gejala yang dialami. Seperti, antidepresan atau obat pengurang stress (
                        Clomipramine (Anafranil), Fluvoxamine (Luvox CR), Fluoxetine (Prozac), Paroxetine (Paxil, Pexeva), Sertraline (Zoloft))
                    sesuai dengan resep yang diberikan oleh dokter.<br><br>
                      Anda dapat mengunjungi Pusat Pelayanan Psikologi terdekat untuk pengobatan lebih lanjut.";
                    }elseif($data['nama_penyakit'] == "Gangguan Stres Traumatis"){
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

                   ?>
                </p>
              </div>
            </div>
          </div>
      </div>

 
  </body>
</html>