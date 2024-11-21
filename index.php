<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <link rel="stylesheet" href="assets/main.css">
  <title>Sistem Pakar</title>
</head>

<body>
  <div id="bingkai">
    <div id="margin">
      <div id="judul">
        <div>Sistem Pakar Psikologi Gangguan Kecemasan</div>
      </div>
      <ul>
        <li><a class="active" href="">Home</a></li>
        <li><a href="views/artikel.php">Artikel</a></li>
        <?php
        session_start();

        if (isset($_SESSION['hak_akses'])) {
        ?>
          <li><a href="views/konsultasi.php">Konsultasi</a></li>
          <li><a href="controllers/logout.php">Logout</a></li>
        <?php
        } else {
        ?>
          <li><a href="views/auth/login.php">Login</a></li>
        <?php
        }
        ?>
      </ul>
      <div id="content">
        <h1>Selamat Datang</h1>
        <p>Selamat datang di sistem pakar berbasis web untuk mendiagnosa psikologi kecenderungan gangguan kecemasan. sistem dapat membantu anda
          untuk mengetahui kecenderungan gangguan mental yang dihadapi melalui proses diagnosa pada sistem ini.
        </p>
      </div>

    </div>
  </div>
</body>

</html>