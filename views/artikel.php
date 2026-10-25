<?php session_start(); ?>
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
                <li><a class="active">Artikel</a></li>
                <?php
                if (isset($_SESSION["hak_akses"])) {
                ?>
                    <li><a href="konsultasi.php">Konsultasi</a></li>
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
                <h1 style="text-align: center;">Kecemasan</h1>
                <p>Kecemasan adalah suatu keadaan aprehensi atau keadaaan khawatir mengeluhkan bahwa sesuatu yang buruk akan terjadi.
                    banyak hal yang harus dicemaskan misalnya, kesehatan kita, relasi sosial, ujian, karir, relasi internasional, dan kondisi lingkungan
                    adalah beberapa hal yang dapat menjadi sumber kekhawatiran. Adalah normal, bahkan adaptif, untuk sedikit cemas mengenai aspek-aspek
                    hidup tersebut. kecemasan bermanfaat bila hal tersebut mendorong kita untuk melakukan pemeriksaan medis secara reguler atau memotivasi
                    kita untuk belajar menjelang ujian. Kecemasan adalah respons yang tepat terhadap ancaman, tetapi kecemasan bisa menjadi abnormal
                    bila tingkatannya tidak sesuai dengan proporsi ancaman, atau bila sepertinya datang tanpa ada penyebabnya-yaitu, bila bukan merupakan
                    respons terhadap perubahan lingkungan. Dalam bentuknya yang ekstrem, kecemasan dapat mengganggu fungsi kita sehari-hari.
                </p>
                <p>Tipe- Tipe Gangguan Kecemasan :</p>
                <p>1. Gangguan Panik <br>Terjadinya serangan panik berulang, yang merupakan episode teror yang luar biasa disertai dengan simtom fisiologis yang kuat,
                    pikiran-pikiran tentang bahaya yang segera datang atau malapetaka yang akan tiba, dan dorongan untuk melarikan diri.</p>
                <p>2. Gangguan Kecemasan Menyeluruh <br>Kecemasan yang persisten yang tidak terbatas pada suatu situasi tertentu.</p>
                <p>3. Gangguan Fobia <br>Ketakutan yang berlebihan terhadap objek atau situasi tertentu.</p>
                <p>4. Gangguan Obsesif-kompulsif <br>Obsesi berulang (pikiran intrusif yang berulang) dan atau kompulsi (tingkah laku repetitif yang dirasakan sebagai sesuatu yang harus dilakukan).</p>
                <p>5. Gangguan Stres Traumatis <br>Reaksi maladaptif akut yang segera timbul setelah peristiwa traumatis (gangguan stres akut) atau reaksi maladaptif berkelanjutanterhadap suatu peristiwa traumatis (gangguan stres pasca trauma).</p>
            </div>

        </div>
    </div>
</body>

</html>