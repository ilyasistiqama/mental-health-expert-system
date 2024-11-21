<?php
  session_start();

    require 'koneksi.php';
    if($_SESSION["hak_akses"]!="user"){
        header("location: login.php");
       exit;
    }
    require 'koneksi.php';
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
</style>

 <link rel="stylesheet" href="assets/cssmenu.css">
    <title>Sistem Pakar</title>
  </head>
  <body background="assets/background.jpg">
      <div id="bingkai">
          <div id="margin">
            <div id="judul"><font color="white">Sistem Pakar Psikologi Gangguan Kecemasan</font></div>

<ul>
  <li><a class="active" href="">Konsultasi</a></li>
 
  <li><a href="logout.php">Logout</a></li>
</ul>

<div style="margin-left:18%;padding:1px 16px;height:695px;"><br>

<br><br><br><br><br><br><br><br>
<center><b><p>Selamat Datang <?php echo $_SESSION['username'];?>,</b></p>
  <h1>Pilih Metode Yang Digunakan :</h1></center>
  <center><a href="pertanyaan/pertanyaan1.php"><button><h3>Forward Chaining</h3></button></a>
  <a href="pertanyaan/backward.php"><button><h3>Backward Chaining</h3></button></a></center>
</div>

  </div>
  </div>
  </body>
</html>