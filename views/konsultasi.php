<?php

require __DIR__ . '/../lib/bantu.php';

wajib_login('../');

$sp = sistem_pakar();
$sesiForward = $_SESSION['sesi']['forward'] ?? null;
$sesiBackward = $_SESSION['sesi']['backward'] ?? null;
$riwayat = mysqli_execute_query($koneksi, "SELECT * FROM riwayat WHERE id_user = ? ORDER BY waktu DESC, id_riwayat DESC LIMIT 20", [$_SESSION['id_user']]);

$judul = 'Konsultasi';
$aktif = 'konsultasi';
$dasar = '../';
require __DIR__ . '/partials/header.php';
?>
<h1 class="judul-halaman">Selamat Datang <?= e($_SESSION['nama_user'] ?? $_SESSION['username']) ?></h1>
<h2 class="sub-judul">Pilih Metode Yang Digunakan:</h2>

<?php if ($sp->sesiValid($sesiForward, 'forward') && $sesiForward['urutan']) { ?>
    <div class="kartu lanjutkan">
        <p>Anda sudah menjawab <?= count($sesiForward['urutan']) ?> pertanyaan pada konsultasi Forward Chaining sebelumnya.</p>
        <a class="tombol-utama" href="forward.php">Lanjutkan</a>
    </div>
<?php } ?>
<?php if ($sp->sesiValid($sesiBackward, 'backward') && $sesiBackward['urutan'] && isset($sp->penyakit[$sesiBackward['target']])) { ?>
    <div class="kartu lanjutkan">
        <p>Anda sudah menjawab <?= count($sesiBackward['urutan']) ?> pertanyaan pada pembuktian <?= e($sp->penyakit[$sesiBackward['target']]['nama_penyakit']) ?>.</p>
        <a class="tombol-utama" href="backward.php?id_penyakit=<?= e(urlencode($sesiBackward['target'])) ?>">Lanjutkan</a>
    </div>
<?php } ?>

<div class="grid-metode">
    <div class="kartu">
        <h3>Forward Chaining</h3>
        <p>Penalaran dari fakta ke kesimpulan: sistem mengumpulkan gejala yang anda alami, lalu mencocokkannya dengan seluruh aturan. Bisa menemukan lebih dari satu gangguan.</p>
        <a class="tombol-utama" href="forward.php">Mulai Forward Chaining</a>
    </div>
    <div class="kartu">
        <h3>Backward Chaining</h3>
        <p>Penalaran dari tujuan ke fakta: pilih satu gangguan sebagai hipotesis, lalu sistem membuktikan kriterianya satu per satu.</p>
        <a class="tombol-utama" href="backward.php">Mulai Backward Chaining</a>
    </div>
</div>

<h2 class="sub-judul">Riwayat Konsultasi</h2>
<?php if (mysqli_num_rows($riwayat) === 0) { ?>
    <p class="kosong">Belum ada riwayat konsultasi.</p>
<?php } else { ?>
    <ul class="daftar-riwayat">
        <?php foreach ($riwayat as $r) {
            $hasil = json_decode($r['hasil'], true); ?>
            <li>
                <a href="hasil.php?id=<?= (int) $r['id_riwayat'] ?>">
                    <strong><?= e($sp->judulHasil($hasil, $r['metode'], $r['target'])) ?></strong>
                    <small><?= e(SistemPakar::namaMetode($r['metode'])) ?> · <?= e(format_tanggal($r['waktu'])) ?></small>
                </a>
            </li>
        <?php } ?>
    </ul>
<?php } ?>
<?php require __DIR__ . '/partials/footer.php'; ?>
