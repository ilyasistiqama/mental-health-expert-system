<?php
// pesan sekali tampil dari controller (pengganti alert bawaan browser)
$kilat = ambil_pesan_kilat();
if ($kilat) { ?>
    <div class="pesan-kilat <?= $kilat['jenis'] === 'berhasil' ? 'berhasil' : 'gagal' ?>" role="<?= $kilat['jenis'] === 'berhasil' ? 'status' : 'alert' ?>">
        <?= e($kilat['teks']) ?>
    </div>
<?php } ?>
