<?php
// variabel: $metode, $sesi — petunjuk tampil sebelum pertanyaan pertama
$petunjuk = [
    'Jawablah dengan jujur sesuai yang benar-benar anda rasakan, bukan yang menurut anda seharusnya atau yang diharapkan orang lain. Tidak ada jawaban benar atau salah.',
    'Pikirkan apa yang biasanya anda alami belakangan ini, bukan hanya perasaan hari ini atau satu kejadian saja.',
    'Baca setiap pertanyaan dengan teliti. Jika ragu, pilih jawaban yang paling mendekati keadaan anda.',
    'Isilah di tempat yang tenang tanpa terburu-buru. Anda boleh berhenti kapan saja; jawaban tersimpan dan bisa dilanjutkan.',
    'Jawaban hanya disimpan sementara selama konsultasi berlangsung dan dihapus begitu hasil keluar.',
];
?>
<div class="kartu-pertanyaan petunjuk" aria-labelledby="judul-petunjuk">
    <h2 id="judul-petunjuk">Sebelum mulai mengisi</h2>
    <p>Agar hasilnya mendekati kondisi anda yang sebenarnya, perhatikan hal berikut:</p>
    <ol>
        <?php foreach ($petunjuk as $p) { ?>
            <li><?= e($p) ?></li>
        <?php } ?>
    </ol>
    <p class="pesan-tenang">Sejujur apa pun jawaban anda, hasilnya tetap gambaran awal, bukan diagnosis.</p>
    <form action="../controllers/jawab.php" method="POST">
        <input type="hidden" name="csrf" value="<?= e(token_csrf()) ?>">
        <input type="hidden" name="metode" value="<?= e($metode) ?>">
        <input type="hidden" name="langkah" value="<?= count($sesi['urutan']) ?>">
        <button class="tombol-utama" type="submit" name="aksi" value="mulai">Saya mengerti, mulai</button>
    </form>
</div>
