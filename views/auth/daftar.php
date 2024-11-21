<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="../../assets/main.css">
    <title>Sistem Pakar</title>
</head>

<body>
    <div id="bingkai">
        <div id="margin">
            <div id="judul">
                <div>Sistem Pakar Psikologi Gangguan Kecemasan</div>
            </div>
            <ul>
                <li><a href="../../index.php" href="">Home</a></li>
                <li><a href="../artikel.php">Artikel</a></li>
                <li><a class="active">Daftar</a></li>
            </ul>
            <div id="content">
                <div id="before-box">
                    <div id="box">
                        <h2>Daftar</h2>
                        <hr>
                        <form action="../../controllers/cek_daftar.php" method="POST" id="form">
                            <div class="form-content">
                                <label class="form-control">Nama : </label>
                                <input class="form-control" type="text" name="nama" required>
                            </div>
                            <div class="form-content">
                                <label class="form-control">Username : </label>
                                <input class="form-control" type="text" name="username" required>
                            </div>
                            <div class="form-content">
                                <label class="form-control">Password : </label>
                                <input class="form-control" type="password" name="password" required>
                            </div>
                            <div class="form-content">
                                <button type="submit">Submit</button>
                            </div>
                        </form>
                        <hr>
                        <a href="login.php" class="link"><span>SUDAH PUNYA AKUN? LOGIN DISINI</span></a>
                    </div>
                </div>
            </div>
        </div>

    </div>
    </div>
</body>

</html>