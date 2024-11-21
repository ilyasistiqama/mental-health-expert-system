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
.kotak {
    margin-top: 200px !important;
    width: 300px;
    height: auto;
}
.link {
    text-decoration: none;
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
  <li><a href="index.php">Home</a></li>
  <li><a class="active" href="">Login</a></li>
  <li><a href="artikel.php">Artikel</a></li>
</ul>


<div style="margin-left:18%;padding:1px 16px;height:695px;">
    <center>
        <div class="kotak">
            <hr>
            <h2>Login</h2>
            <hr>
            <form action="cek_login.php" method="POST">
                <label>Username : </label>
                <input type="text" name="username" required><br><br>
                <label>Password : </label>
                <input type="password" name="password" required><hr>
                <button style="width: 200px;height: 50px;" type="submit">Login</button>
            </form><hr>
            <a href="daftar.php" class="link"><span>ingin mendaftar?</span></a> 
        </div>
    </center>
</div>
    
</div>

  </div>
  </div>
  </body>
</html>