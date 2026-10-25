<?php
// disclaimer dan pesan dukungan; kalimat ada di lib/pesan_dukungan.php
?>
<section class="pesan-dukungan" aria-labelledby="judul-dukungan">
    <h2 id="judul-dukungan">&#9825; <?= e(JUDUL_DISCLAIMER) ?></h2>
    <?php foreach (ISI_DISCLAIMER as $i => $paragraf) { ?>
        <p><?= $i === 0 ? '<strong>' . e($paragraf) . '</strong>' : e($paragraf) ?><?= $i === 2 ? rujukan(['who-anxiety-2026'], '../') : '' ?></p>
    <?php } ?>
    <h3>Langkah yang bisa anda ambil</h3>
    <ol>
        <?php foreach (LANGKAH_SELANJUTNYA as $i => $langkah) { ?>
            <li><?= e($langkah) ?><?= $i === count(LANGKAH_SELANJUTNYA) - 1 ? rujukan(['healing119'], '../') : '' ?></li>
        <?php } ?>
    </ol>
    <p class="pesan-tenang"><?= e(PESAN_TENANG) ?></p>
</section>
