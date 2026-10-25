<?php

require __DIR__ . '/../lib/bantu.php';

$sp = sistem_pakar();
$judul = 'Artikel';
$aktif = 'artikel';
$dasar = '../';
$r = fn (string ...$ids) => rujukan($ids, '../');
require __DIR__ . '/partials/header.php';
?>
<article class="artikel">
    <p class="label-kecil">Artikel · Diperbarui Oktober 2026</p>
    <h1 class="judul-halaman">Memahami Kecemasan dan Gangguan Kecemasan</h1>

    <h2>Apa itu kecemasan?</h2>
    <p>
        Setiap orang dapat merasa cemas sesekali. Kecemasan adalah respons yang wajar terhadap ancaman, misalnya menjelang ujian,
        wawancara kerja, atau saat menghadapi masalah kesehatan. Dalam kadar yang tepat, kecemasan bahkan bermanfaat karena membuat
        kita lebih waspada dan terdorong untuk bersiap.
    </p>
    <p>
        Kecemasan menjadi <strong>gangguan</strong> ketika rasa takut dan khawatir muncul secara berlebihan, tidak sebanding dengan
        ancaman sebenarnya, sulit dikendalikan, berlangsung lama, dan mengganggu kehidupan sehari-hari, baik keluarga, hubungan sosial,
        sekolah, maupun pekerjaan.<?= $r('who-anxiety-2026', 'dsm5tr') ?>
    </p>

    <h2>Kondisi terkini di dunia</h2>
    <ul>
        <li>Gangguan kecemasan adalah gangguan mental yang paling umum di dunia, dialami sekitar <strong>470 juta orang pada 2023</strong> atau sekitar 5,8% populasi dunia.<?= $r('who-anxiety-2026') ?></li>
        <li>Hanya sekitar <strong>27,6%</strong> (1 dari 4) orang yang membutuhkan yang mendapat penanganan. Hambatannya antara lain kurangnya kesadaran, minimnya investasi layanan, kurangnya tenaga terlatih, dan stigma.<?= $r('who-anxiety-2026') ?></li>
        <li>Perempuan lebih sering mengalaminya dibanding laki-laki, dan gejalanya sering dimulai sejak masa kanak-kanak atau remaja.<?= $r('who-anxiety-2026') ?></li>
        <li>Lebih dari satu miliar orang di dunia hidup dengan gangguan mental, dengan kecemasan dan depresi sebagai yang paling umum.<?= $r('who-wmht-2025') ?></li>
    </ul>

    <h2>Kondisi di Indonesia</h2>
    <ul>
        <li>Survei kesehatan mental remaja nasional (I-NAMHS) menemukan 5,5% remaja usia 10–17 tahun mengalami gangguan mental dalam 12 bulan terakhir, dan <strong>gangguan kecemasan adalah yang paling banyak (3,7%)</strong>. Sebanyak 34,9% remaja menunjukkan gejala gangguan mental.<?= $r('inamhs-2022') ?></li>
        <li>Survei Kesehatan Indonesia (SKI) 2023 mencatat prevalensi depresi tertinggi pada kelompok usia 15–24 tahun, dan hanya 10,4% anak muda dengan depresi yang mencari pengobatan.<?= $r('ski-2023') ?></li>
        <li>Sejak Juli 2025, Kementerian Kesehatan menyediakan layanan hotline kesehatan mental dan pencegahan bunuh diri <strong>Healing119.id</strong> yang dapat dihubungi melalui <strong>119 ext 8</strong>.<?= $r('healing119') ?></li>
    </ul>

    <h2>Gejala yang perlu dikenali</h2>
    <p>Selain rasa takut dan khawatir yang berlebihan, penderita gangguan kecemasan dapat mengalami sulit berkonsentrasi atau mengambil keputusan, mudah tersinggung atau gelisah, mual, jantung berdebar, berkeringat atau gemetar, gangguan tidur, serta perasaan akan terjadi bahaya atau malapetaka.<?= $r('who-anxiety-2026') ?></p>

    <h2>Klasifikasi terbaru</h2>
    <p>
        Pedoman diagnosis yang berlaku saat ini adalah DSM-5-TR (2022) dan ICD-11, sedangkan klinisi di Indonesia masih banyak menggunakan
        PPDGJ-III.<?= $r('dsm5tr', 'icd11', 'ppdgj3') ?> Kelompok gangguan kecemasan meliputi gangguan kecemasan menyeluruh, gangguan panik,
        agorafobia, fobia spesifik, gangguan kecemasan sosial, gangguan kecemasan perpisahan, dan mutisme selektif.<?= $r('who-anxiety-2026') ?>
    </p>
    <p>
        Gangguan obsesif-kompulsif (OCD) dan gangguan stres pascatrauma (PTSD) kini dikelompokkan tersendiri dalam DSM-5-TR, tetapi tetap
        dibahas di sistem ini karena kecemasan menjadi ciri utamanya, dan dalam PPDGJ-III keduanya masih berada pada kelompok yang sama (F40–F48).
        Mutisme selektif tidak dimasukkan karena umumnya dialami anak-anak dan memerlukan observasi langsung oleh profesional.
    </p>
    <p>Pada Januari 2026, American Psychiatric Association merilis rencana revisi besar DSM. Sampai edisi baru terbit, DSM-5-TR tetap menjadi acuan.<?= $r('apa-dsm-2026') ?></p>

    <h2>Penanganan</h2>
    <p>
        Gangguan kecemasan dapat ditangani dengan efektif. Psikoterapi merupakan penanganan yang esensial, terutama terapi kognitif perilaku (CBT).
        Pada orang dewasa, antidepresan golongan SSRI juga dapat membantu, sedangkan benzodiazepin umumnya tidak direkomendasikan.<?= $r('who-anxiety-2026', 'nice-cg113') ?>
        WHO juga menganjurkan perawatan diri: mengurangi alkohol dan menghindari narkoba, berolahraga teratur, menjaga pola makan dan tidur,
        berlatih relaksasi seperti pernapasan perlahan, serta membiasakan meditasi mindfulness.<?= $r('who-anxiety-2026') ?>
    </p>

    <h2>Tipe-tipe gangguan yang dapat dikenali sistem ini</h2>
    <div class="grid-penyakit">
        <?php foreach ($sp->daftarPenyakit() as $kode) {
            $p = $sp->penyakit[$kode]; ?>
            <div class="kartu">
                <p><span class="tag"><?= e($kode) ?></span> <span class="tag abu"><?= e($p['kategori']) ?></span></p>
                <h4><?= e($p['nama_penyakit']) ?></h4>
                <p><?= e($p['deskripsi']) ?><?= rujukan(array_slice($p['sumber'], 0, 2), '../') ?></p>
            </div>
        <?php } ?>
    </div>

    <p class="catatan-penting">
        <strong>Mencari bantuan:</strong> jika kecemasan mulai mengganggu aktivitas, hubungi psikolog klinis, psikiater, atau puskesmas terdekat.
        Dalam kondisi darurat atau jika muncul pikiran untuk menyakiti diri sendiri, segera hubungi <strong>119 ext 8</strong>
        (<a href="https://www.healing119.id/" target="_blank" rel="noopener">healing119.id</a>).<?= $r('healing119') ?>
    </p>
</article>
<?php require __DIR__ . '/partials/footer.php'; ?>
