<?php

require __DIR__ . '/lib/bantu.php';

$judul = 'Home';
$aktif = 'home';
$dasar = '';
require __DIR__ . '/views/partials/header.php';
?>
<h1 class="judul-halaman">Selamat Datang</h1>
<p>
    Selamat datang di sistem pakar berbasis web untuk mendiagnosa psikologi kecenderungan gangguan kecemasan. Sistem dapat membantu anda
    untuk mengetahui kecenderungan gangguan kecemasan yang dihadapi melalui proses diagnosa dengan metode forward chaining dan backward chaining.
</p>
<p>
    Gangguan kecemasan adalah gangguan mental yang paling umum di dunia, dialami sekitar 470 juta orang pada 2023, namun hanya sekitar
    1 dari 4 yang mendapat penanganan.<?= rujukan(['who-anxiety-2026'], '') ?>
    Aturan pada sistem ini disusun berdasarkan kriteria DSM-5-TR, ICD-11, dan PPDGJ-III.<?= rujukan(['dsm5tr', 'icd11', 'ppdgj3'], '') ?>
</p>
<p class="aksi-hasil">
    <a class="tombol-utama" href="<?= sudah_login() ? 'views/konsultasi.php' : 'views/auth/login.php' ?>">Mulai Konsultasi</a>
    <a class="tombol-kedua" href="views/artikel.php">Pelajari Kecemasan</a>
</p>
<p class="catatan-penting">
    <strong>Catatan penting:</strong> hasil dari sistem ini hanya gambaran awal, bukan diagnosis. Untuk diagnosis yang tepat,
    konsultasikan dengan psikolog klinis atau psikiater.
</p>
<?php require __DIR__ . '/views/partials/footer.php'; ?>
