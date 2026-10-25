<?php

require __DIR__ . '/../lib/bantu.php';

$sp = sistem_pakar();
$judul = 'Tentang & Batasan';
$aktif = 'tentang';
$dasar = '../';

$batasan = [
    'Sistem ini bukan alat diagnosis dan hasilnya tidak dapat dijadikan rujukan medis maupun surat rujukan ke dokter. Diagnosis hanya dapat ditegakkan oleh psikolog klinis atau psikiater melalui pemeriksaan langsung.',
    'Sistem ini hanya memeriksa kecenderungan beberapa gangguan kecemasan (daftarnya di bawah). Masalah kesehatan mental lain, seperti depresi, gangguan bipolar, gangguan makan, atau penggunaan zat, tidak diperiksa.',
    'Hasil skrining bisa keliru. Jawaban dipengaruhi oleh suasana hati saat mengisi dan cara memahami pertanyaan. Hasil "tidak menunjukkan kecenderungan" tidak berarti anda pasti bebas dari gangguan.',
    'Pertanyaan merupakan penyederhanaan kriteria diagnosis untuk keperluan edukasi, bukan instrumen tes psikologi yang terstandar.',
    'Sistem ini tidak ditujukan untuk keadaan darurat. Jika anda atau orang di sekitar anda berada dalam bahaya, segera hubungi 119 ext 8 atau datang ke IGD terdekat.',
    'Sistem ini ditujukan untuk orang dewasa. Anak dan remaja di bawah 18 tahun sebaiknya mengisinya bersama orang tua atau wali, lalu berkonsultasi dengan psikolog anak.',
];

$privasi = [
    'Data akun (nama, username, dan password yang tersimpan dalam bentuk hash) disimpan di database untuk keperluan login.',
    'Jawaban yang belum selesai disimpan sementara di sesi server agar konsultasi bisa dilanjutkan, lalu dihapus begitu hasil keluar. Sesi berakhir saat anda logout atau setelah 7 hari tidak digunakan.',
    'Hasil pemeriksaan tidak pernah disimpan ke database. Hasil hanya ditampilkan sekali lalu dihapus, kecuali anda mengunduh PDF-nya sendiri.',
    'Tidak ada pelacak, iklan, maupun layanan analitik, dan tidak ada berkas yang dimuat dari server pihak ketiga.',
];

require __DIR__ . '/partials/header.php';
?>
<article class="artikel">
    <p class="label-kecil">Tentang</p>
    <h1 class="judul-halaman">Tentang & Batasan Sistem</h1>
    <p>
        Sistem Pakar Gangguan Kecemasan dibuat untuk keperluan akademik sebagai alat edukasi dan skrining mandiri. Tujuannya membantu anda
        mengenali kecenderungan gangguan kecemasan dan mendorong anda untuk berbicara dengan tenaga profesional.
    </p>

    <h2>Batasan yang perlu anda ketahui</h2>
    <ul>
        <?php foreach ($batasan as $i => $b) { ?>
            <li><?= e($b) ?><?= $i === count($batasan) - 2 ? rujukan(['healing119'], '../') : '' ?></li>
        <?php } ?>
    </ul>

    <h2>Gangguan yang diperiksa</h2>
    <ul>
        <?php foreach ($sp->daftarPenyakit() as $kode) { ?>
            <li><?= e($sp->penyakit[$kode]['nama_penyakit']) ?></li>
        <?php } ?>
    </ul>
    <p>
        Kriteria setiap gangguan disusun berdasarkan DSM-5-TR, ICD-11, dan PPDGJ-III, dan saran penanganan berdasarkan pedoman WHO, NICE,
        dan American Psychological Association.<?= rujukan(['dsm5tr', 'icd11', 'ppdgj3', 'who-anxiety-2026'], '../') ?>
        Daftar lengkapnya ada di halaman <a href="sumber.php">Sumber</a>.
    </p>

    <h2>Privasi anda</h2>
    <ul>
        <?php foreach ($privasi as $p) { ?>
            <li><?= e($p) ?></li>
        <?php } ?>
    </ul>

    <p class="catatan-sebelum">
        <strong>Butuh bantuan?</strong> Hubungi psikolog klinis, psikiater, atau puskesmas terdekat. Dalam kondisi darurat atau jika muncul
        pikiran untuk menyakiti diri sendiri, segera hubungi layanan kesehatan jiwa Kemenkes <strong>119 ext 8</strong>
        (<a href="https://www.healing119.id/" target="_blank" rel="noopener">healing119.id</a>).<?= rujukan(['healing119'], '../') ?>
    </p>
</article>
<?php require __DIR__ . '/partials/footer.php'; ?>
