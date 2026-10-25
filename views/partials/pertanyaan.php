<?php
// variabel: $sp, $sesi, $langkah, $metode
$jumlahDijawab = count($sesi['urutan']);
$progres = $jumlahDijawab / max(1, $jumlahDijawab + $langkah['sisa']) * 100;
$jawaban = $sp->daftarJawaban($sesi);
?>
<div class="kartu-pertanyaan">
    <div class="progres" role="progressbar" aria-valuenow="<?= round($progres) ?>" aria-valuemin="0" aria-valuemax="100">
        <span style="width: <?= round($progres, 1) ?>%"></span>
    </div>
    <p class="meta-pertanyaan">
        <span>Pertanyaan ke-<?= $jumlahDijawab + 1 ?></span>
        <span class="tag"><?= $langkah['jenis'] === 'durasi' ? 'Durasi keluhan' : e($sp->gejala[$langkah['kode']]['nama_gejala']) ?></span>
    </p>
    <h3 class="teks-pertanyaan">
        <?= e($langkah['jenis'] === 'durasi' ? $sp->teksDurasi($langkah['penyakit']) : $sp->gejala[$langkah['kode']]['pertanyaan']) ?>
    </h3>

    <form action="../controllers/jawab.php" method="POST">
        <input type="hidden" name="csrf" value="<?= e(token_csrf()) ?>">
        <input type="hidden" name="metode" value="<?= e($metode) ?>">
        <input type="hidden" name="langkah" value="<?= $jumlahDijawab ?>">
        <input type="hidden" name="aksi" value="jawab">
        <?php if ($langkah['jenis'] === 'durasi') { ?>
            <div class="opsi-durasi">
                <?php foreach (SistemPakar::OPSI_DURASI as $o) { ?>
                    <button class="tombol-opsi" type="submit" name="nilai" value="<?= $o['hari'] ?>"><?= e($o['label']) ?></button>
                <?php } ?>
            </div>
        <?php } else { ?>
            <div class="tombol-jawab">
                <button class="tombol hijau" id="tmbl_ya" type="submit" name="nilai" value="ya">Ya</button>
                <button class="tombol merah" id="tmbl_tdk" type="submit" name="nilai" value="tidak">Tidak</button>
            </div>
        <?php } ?>
    </form>

    <div class="aksi-sesi">
        <form action="../controllers/jawab.php" method="POST">
            <input type="hidden" name="csrf" value="<?= e(token_csrf()) ?>">
            <input type="hidden" name="metode" value="<?= e($metode) ?>">
            <input type="hidden" name="langkah" value="<?= $jumlahDijawab ?>">
            <button class="tombol-teks" type="submit" name="aksi" value="kembali" <?= $jumlahDijawab === 0 ? 'disabled' : '' ?>>&larr; Kembali</button>
        </form>
        <form action="../controllers/jawab.php" method="POST" onsubmit="return <?= $jumlahDijawab === 0 ? 'true' : "confirm('Mulai ulang konsultasi? Jawaban yang sudah diisi akan dihapus.')" ?>">
            <input type="hidden" name="csrf" value="<?= e(token_csrf()) ?>">
            <input type="hidden" name="metode" value="<?= e($metode) ?>">
            <input type="hidden" name="langkah" value="<?= $jumlahDijawab ?>">
            <button class="tombol-teks" type="submit" name="aksi" value="ulang">Mulai ulang</button>
        </form>
    </div>
</div>

<?php if ($jawaban) { ?>
    <h4 class="judul-log">Jawaban anda sejauh ini</h4>
    <ol class="log-jawaban">
        <?php foreach ($jawaban as $j) { ?>
            <li>
                <span><?= e($j['pertanyaan']) ?></span>
                <span class="lencana <?= $j['ya'] === false ? 'tidak' : 'ya' ?>"><?= e($j['jawaban']) ?></span>
            </li>
        <?php } ?>
    </ol>
<?php } ?>
