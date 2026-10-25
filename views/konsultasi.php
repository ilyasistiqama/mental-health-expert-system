<?php

require __DIR__ . '/../lib/bantu.php';

wajib_login('../');

$sp = sistem_pakar();
$sesiForward = $_SESSION['sesi']['forward'] ?? null;
$sesiBackward = $_SESSION['sesi']['backward'] ?? null;

$judul = 'Konsultasi';
$aktif = 'konsultasi';
$dasar = '../';
require __DIR__ . '/partials/header.php';
?>
<h1 class="judul-halaman">Selamat Datang <?= e($_SESSION['nama_user'] ?? $_SESSION['username']) ?></h1>
<h2 class="sub-judul">Pilih Jenis Pemeriksaan:</h2>

<?php if ($sp->sesiValid($sesiForward, 'forward') && $sesiForward['urutan']) { ?>
    <div class="kartu lanjutkan">
        <p>Anda sudah menjawab <?= count($sesiForward['urutan']) ?> pertanyaan pada Cek Menyeluruh sebelumnya.</p>
        <a class="tombol-utama" href="forward.php">Lanjutkan</a>
    </div>
<?php } ?>
<?php if ($sp->sesiValid($sesiBackward, 'backward') && $sesiBackward['urutan'] && isset($sp->penyakit[$sesiBackward['target']])) { ?>
    <div class="kartu lanjutkan">
        <p>Anda sudah menjawab <?= count($sesiBackward['urutan']) ?> pertanyaan pada cek <?= e($sp->penyakit[$sesiBackward['target']]['nama_penyakit']) ?>.</p>
        <a class="tombol-utama" href="backward.php?id_penyakit=<?= e(urlencode($sesiBackward['target'])) ?>">Lanjutkan</a>
    </div>
<?php } ?>

<div class="grid-metode">
    <div class="kartu">
        <h3>Cek Menyeluruh</h3>
        <p>Belum tahu apa yang anda alami? Jawab pertanyaan seputar keluhan anda, lalu sistem mencari kemungkinan gangguannya. Bisa menemukan lebih dari satu gangguan.</p>
        <a class="tombol-utama" href="forward.php">Mulai Cek Menyeluruh</a>
        <p class="kecil">Metode sistem pakar: forward chaining</p>
    </div>
    <div class="kartu">
        <h3>Cek Gangguan Tertentu</h3>
        <p>Sudah menduga gangguan tertentu? Pilih gangguannya, lalu sistem memastikan apakah gejala anda sesuai dengan kriterianya.</p>
        <a class="tombol-utama" href="backward.php">Mulai Cek Gangguan Tertentu</a>
        <p class="kecil">Metode sistem pakar: backward chaining</p>
    </div>
</div>

<p class="catatan-penting">
    <strong>Privasi:</strong> hasil diagnosa tidak disimpan di mana pun dan hanya ditampilkan sekali setelah konsultasi selesai.
    Unduh PDF jika ingin menyimpannya.
</p>
<?php require __DIR__ . '/partials/footer.php'; ?>
