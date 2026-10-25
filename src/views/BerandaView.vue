<script setup>
import CatatanPenting from "@/components/CatatanPenting.vue";
import KartuPenyakit from "@/components/KartuPenyakit.vue";
import { daftarPenyakit } from "@/lib/sistemPakar";
</script>

<template>
    <section class="hero">
        <div class="container hero-grid">
            <div>
                <span class="eyebrow">Sistem Pakar · Psikologi</span>
                <h1>Kenali kecenderungan gangguan kecemasan anda</h1>
                <p class="lead">Jawab beberapa pertanyaan sederhana tentang apa yang anda rasakan. Sistem akan menelusuri gejala dan memberikan gambaran kecenderungan gangguan kecemasan beserta saran penanganannya.</p>
                <div class="btn-group">
                    <RouterLink class="btn btn-primary btn-lg" to="/forward">Mulai Konsultasi</RouterLink>
                    <RouterLink class="btn btn-ghost btn-lg" to="/artikel">Pelajari Kecemasan</RouterLink>
                </div>
            </div>
            <div class="card hero-demo" aria-hidden="true">
                <span class="demo-step">Pertanyaan ke-2</span>
                <h3>Ketika anda merasa cemas, apakah anda sering merasakan tegang berlebih?</h3>
                <div class="demo-actions">
                    <span class="demo-pill ya">Ya</span>
                    <span class="demo-pill tidak">Tidak</span>
                </div>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="section-head">
                <span class="eyebrow">Cara kerja</span>
                <h2>Tiga langkah, kurang dari 3 menit</h2>
            </div>
            <div class="grid steps">
                <div class="card step">
                    <h3>Pilih metode</h3>
                    <p>Forward chaining menelusuri dari gejala, backward chaining memeriksa satu gangguan tertentu.</p>
                </div>
                <div class="card step">
                    <h3>Jawab dengan jujur</h3>
                    <p>Pilih Ya atau Tidak sesuai kondisi anda. Jawaban bisa dibatalkan kapan saja.</p>
                </div>
                <div class="card step">
                    <h3>Lihat hasil & saran</h3>
                    <p>Dapatkan gambaran kecenderungan dan saran penanganan. Riwayat tersimpan di perangkat anda.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="section-head">
                <span class="eyebrow">Basis pengetahuan</span>
                <h2>Lima jenis gangguan kecemasan</h2>
                <p>Sistem ini dapat mengenali kecenderungan dari lima jenis gangguan kecemasan berikut.</p>
            </div>
            <div class="grid">
                <KartuPenyakit v-for="id in daftarPenyakit()" :key="id" :id="id" />
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <CatatanPenting>hasil dari sistem ini hanya gambaran awal. Data konsultasi hanya disimpan di browser anda dan tidak dikirim ke mana pun. Untuk diagnosis yang tepat, konsultasikan dengan psikolog atau psikiater.</CatatanPenting>
        </div>
    </section>
</template>
