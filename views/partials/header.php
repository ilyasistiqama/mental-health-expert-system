<?php
// variabel: $judul (judul tab), $aktif (menu aktif), $dasar (path relatif ke root, misalnya '../')
$menu = [
    'home' => ['index.php', 'Home'],
    'artikel' => ['views/artikel.php', 'Artikel'],
];
if (sudah_login()) {
    $menu['konsultasi'] = ['views/konsultasi.php', 'Konsultasi'];
}
$menu['sumber'] = ['views/sumber.php', 'Sumber'];
if (sudah_login()) {
    $menu['logout'] = ['controllers/logout.php', 'Logout'];
} elseif ($aktif === 'daftar') {
    $menu['daftar'] = ['views/auth/daftar.php', 'Daftar'];
} else {
    $menu['login'] = ['views/auth/login.php', 'Login'];
}
?>
<!doctype html>
<html lang="id">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/svg+xml" href="<?= e($dasar) ?>assets/favicon.svg">
    <link rel="stylesheet" href="<?= e($dasar) ?>assets/main.css">
    <title><?= e($judul) ?> · Sistem Pakar</title>
</head>

<body>
    <div id="bingkai">
        <div id="margin">
            <div id="judul">
                <div>Sistem Pakar Psikologi Gangguan Kecemasan</div>
            </div>
            <ul class="menu">
                <?php foreach ($menu as $id => [$tautan, $label]) { ?>
                    <li><a <?= $id === $aktif ? 'class="active" aria-current="page"' : '' ?> href="<?= e($dasar . $tautan) ?>"><?= e($label) ?></a></li>
                <?php } ?>
            </ul>
            <div id="content">
