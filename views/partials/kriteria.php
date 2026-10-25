<?php
// variabel: $sp, $kodePenyakit
$p = $sp->penyakit[$kodePenyakit];
?>
<ol class="daftar-kriteria">
    <?php foreach ($p['kriteria'] as $k) { ?>
        <li>
            <strong><?= e($sp->labelKriteria($k)) ?></strong>
            <ul>
                <?php foreach ($k['gejala'] as $g) { ?>
                    <li><?= e($sp->gejala[$g]['nama_gejala']) ?></li>
                <?php } ?>
            </ul>
        </li>
    <?php } ?>
    <?php if ($p['durasi_minimal'] > 0) { ?>
        <li><strong>Durasi</strong>: keluhan dialami minimal <?= e(SistemPakar::labelDurasi($p['durasi_minimal'])) ?></li>
    <?php } ?>
</ol>
