<?php
  session_start();

    require '../koneksi.php';
    if($_SESSION["hak_akses"]!="user"){
        header("location: login.php");
       exit;
    }
    require '../koneksi.php';
    
    if(isset($_GET['id'])){
        $id = $_GET['id'];
        if($_GET['id'] == 12){
            echo"<script>location.href='../hasil.php?id=P0'</script>";
        }
    } else {
        $id = 1;
        $id_penyakit = 'P0';
    }

    $panggil = mysqli_query($koneksi,"select * from gjl_khusus where id_gjl_khusus = $id");

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
  height: 50px;
  width: 100px;
}
.merah {
  background-color: red;
  color: white;
  height: 50px;
  width: 100px;
}
</style>

 <link rel="stylesheet" href="../assets/cssmenu.css">
    <title>Sistem Pakar</title>
  </head>
  <body background="../assets/background.jpg">
      <div id="bingkai">
          <div id="margin">
            <div id="judul"><font color="white">Metode Forward Chaining</font></div>

              <ul>
                
                <li><a class="active" href="">Konsultasi</a></li>
                <li><a href="../diagnosa.php">Pilih Metode</a></li>
                <li><a href="../logout.php">Logout</a></li>
              </ul>

              <div id="konten" style="margin-left:18%;padding:1px 16px;height:695px;"><br>
              
                <br><h1>Jawablah pertanyaan sesuai dengan gejala-gejala yang anda alami :</h1>
                
                  <?php 
                  if(mysqli_num_rows($panggil) > 0) {
                  $data = mysqli_fetch_assoc($panggil);?>
                  <br><br><br><h2><?php echo $data['pertanyaank'];?></h2>
                 <? $id_penyakit = $data['id_penyakit'];
                      ?>
                      <br><br>
                     <a href="aksiya.php?id_ya=<?=$data['ya'];?>&id=<?=$id;?>"><button class="tombol hijau" id="tmbl_ya">Ya</button></a>
                     <a href="aksitidak.php?id_tidak=<?=$data['tidak'];?>&id=<?=$id;?>"> <button class="tombol merah" id="tmbl_tdk">Tidak</button></a>
                  <?php } ?>
              </div>
            </div>
          </div>
      </div>

 
  </body>
</html>