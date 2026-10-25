<?php

require __DIR__ . '/../lib/bantu.php';

$sp = sistem_pakar();
$judul = 'Sumber & Rujukan';
$aktif = 'sumber';
$dasar = '../';
require __DIR__ . '/partials/header.php';
?>
<h1 class="judul-halaman">Sumber & Rujukan</h1>
<p class="pengantar">
    Kriteria diagnosis, aturan, saran penanganan, dan isi artikel pada sistem ini disusun dari sumber-sumber berikut.
    Nomor di sini sama dengan nomor rujukan [n] di seluruh halaman.
</p>

<ol class="daftar-sumber">
    <?php foreach ($sp->sumber as $s) { ?>
        <li id="<?= e($s['id_sumber']) ?>">
            <span class="nomor"><?= (int) $s['nomor'] ?></span>
            <div>
                <p><?= e($s['penulis']) ?> (<?= e($s['tahun']) ?>). <em><?= e($s['judul']) ?></em>. <?= e($s['penerbit']) ?>.</p>
                <?php if ($s['url']) { ?>
                    <p class="kecil"><a href="<?= e($s['url']) ?>" target="_blank" rel="noopener"><?= e($s['url']) ?></a> · diakses <?= e($s['diakses']) ?></p>
                <?php } ?>
            </div>
        </li>
    <?php } ?>
</ol>

<p class="catatan-penting">
    <strong>Catatan:</strong> pertanyaan pada sistem ini merupakan penyederhanaan kriteria diagnosis untuk keperluan skrining mandiri dan edukasi.
    Diagnosis hanya dapat ditegakkan oleh psikolog klinis atau psikiater melalui pemeriksaan langsung.
</p>
<?php require __DIR__ . '/partials/footer.php'; ?>
