<script setup>
import KartuPenyakit from "@/components/KartuPenyakit.vue";
import { daftarPenyakit } from "@/lib/sistemPakar";
</script>

<template>
    <div class="container narrow">
        <header class="page-head">
            <span class="eyebrow">Artikel</span>
            <h1>Memahami kecemasan</h1>
        </header>

        <article class="article">
            <p>Kecemasan adalah suatu keadaan aprehensi atau keadaan khawatir yang mengeluhkan bahwa sesuatu yang buruk akan terjadi. Banyak hal yang dapat dicemaskan, misalnya kesehatan kita, relasi sosial, ujian, karier, relasi internasional, dan kondisi lingkungan. Semua itu adalah beberapa hal yang dapat menjadi sumber kekhawatiran.</p>
            <p>Adalah normal, bahkan adaptif, untuk sedikit cemas mengenai aspek-aspek hidup tersebut. Kecemasan bermanfaat bila hal tersebut mendorong kita untuk melakukan pemeriksaan medis secara reguler atau memotivasi kita untuk belajar menjelang ujian.</p>
            <p>Kecemasan adalah respons yang tepat terhadap ancaman, tetapi kecemasan bisa menjadi abnormal bila tingkatannya tidak sesuai dengan proporsi ancaman, atau bila sepertinya datang tanpa ada penyebabnya, yaitu bila bukan merupakan respons terhadap perubahan lingkungan. Dalam bentuknya yang ekstrem, kecemasan dapat mengganggu fungsi kita sehari-hari.</p>
        </article>
    </div>

    <section class="section">
        <div class="container">
            <div class="section-head">
                <h2>Tipe-tipe gangguan kecemasan</h2>
            </div>
            <div class="grid">
                <KartuPenyakit v-for="id in daftarPenyakit()" :key="id" :id="id" />
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="cta-box">
                <h2>Penasaran dengan kondisi anda?</h2>
                <p>Ikuti konsultasi singkat untuk mengetahui kecenderungan gangguan kecemasan yang mungkin anda alami.</p>
                <div class="btn-group">
                    <RouterLink class="btn btn-primary btn-lg" to="/konsultasi">Mulai Konsultasi</RouterLink>
                </div>
            </div>
        </div>
    </section>
</template>
