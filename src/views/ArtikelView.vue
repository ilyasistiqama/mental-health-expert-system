<script setup>
import KartuPenyakit from "@/components/KartuPenyakit.vue";
import Rujukan from "@/components/Rujukan.vue";
import { daftarPenyakit } from "@/lib/sistemPakar";

const gejalaUmum = [
    "Sulit berkonsentrasi atau mengambil keputusan",
    "Mudah tersinggung, tegang, atau gelisah",
    "Mual atau rasa tidak nyaman di perut",
    "Jantung berdebar",
    "Berkeringat, gemetar, atau tubuh bergetar",
    "Gangguan tidur",
    "Perasaan akan terjadi bahaya, kepanikan, atau malapetaka"
];

const perawatanDiri = [
    "Kurangi alkohol dan hindari narkoba",
    "Berolahraga secara teratur",
    "Jaga pola makan dan tidur yang teratur",
    "Latih teknik relaksasi, misalnya pernapasan perlahan",
    "Biasakan meditasi mindfulness, walaupun hanya beberapa menit setiap hari"
];
</script>

<template>
    <article class="container-page max-w-3xl py-10 sm:py-12 2xl:max-w-3xl">
        <header class="mb-8">
            <span class="eyebrow">Artikel · Diperbarui Oktober 2026</span>
            <h1 class="mb-4 text-3xl font-extrabold sm:text-4xl lg:text-5xl">Memahami kecemasan dan gangguan kecemasan</h1>
            <p class="text-lg text-muted">Rangkuman informasi terbaru tentang kesehatan mental dan gangguan kecemasan dari WHO, pedoman klinis, serta survei nasional Indonesia.</p>
        </header>

        <div class="space-y-10 text-[1.05rem] leading-[1.8]">
            <section>
                <h2 class="mb-3 text-2xl font-extrabold">Apa itu kecemasan?</h2>
                <p class="mb-4">
                    Setiap orang dapat merasa cemas sesekali. Kecemasan adalah respons yang wajar terhadap ancaman, misalnya menjelang ujian,
                    wawancara kerja, atau saat menghadapi masalah kesehatan. Dalam kadar yang tepat, kecemasan bahkan bermanfaat karena membuat
                    kita lebih waspada dan terdorong untuk bersiap.
                </p>
                <p>
                    Kecemasan menjadi <strong>gangguan</strong> ketika rasa takut dan khawatir muncul secara berlebihan, tidak sebanding dengan
                    ancaman sebenarnya, sulit dikendalikan, berlangsung lama, dan mengganggu kehidupan sehari-hari, baik keluarga, hubungan sosial,
                    sekolah, maupun pekerjaan.<Rujukan :ids="['who-anxiety-2026', 'dsm5tr']" />
                </p>
            </section>

            <section>
                <h2 class="mb-3 text-2xl font-extrabold">Kondisi terkini di dunia</h2>
                <div class="mb-5 grid gap-3 sm:grid-cols-3">
                    <div class="card p-4 sm:p-5">
                        <p class="text-3xl font-extrabold text-primary">470 jt</p>
                        <p class="text-sm text-muted">orang hidup dengan gangguan kecemasan pada 2023<Rujukan :ids="['who-anxiety-2026']" /></p>
                    </div>
                    <div class="card p-4 sm:p-5">
                        <p class="text-3xl font-extrabold text-primary">5,8%</p>
                        <p class="text-sm text-muted">populasi dunia diperkirakan sedang mengalaminya<Rujukan :ids="['who-anxiety-2026']" /></p>
                    </div>
                    <div class="card p-4 sm:p-5">
                        <p class="text-3xl font-extrabold text-primary">27,6%</p>
                        <p class="text-sm text-muted">yang membutuhkan saja yang mendapat penanganan<Rujukan :ids="['who-anxiety-2026']" /></p>
                    </div>
                </div>
                <p class="mb-4">
                    Menurut WHO, gangguan kecemasan adalah gangguan mental yang paling umum di dunia. Perempuan lebih sering mengalaminya
                    dibanding laki-laki, dan gejalanya sering dimulai sejak masa kanak-kanak atau remaja. Hambatan penanganannya antara lain
                    kurangnya kesadaran, minimnya investasi layanan kesehatan jiwa, kurangnya tenaga terlatih, dan stigma.<Rujukan :ids="['who-anxiety-2026']" />
                </p>
                <p>
                    Secara keseluruhan, lebih dari satu miliar orang di dunia hidup dengan gangguan mental, dengan kecemasan dan depresi sebagai
                    yang paling umum.<Rujukan :ids="['who-wmht-2025']" />
                </p>
            </section>

            <section>
                <h2 class="mb-3 text-2xl font-extrabold">Kondisi di Indonesia</h2>
                <ul class="list-disc space-y-3 pl-5">
                    <li>
                        Survei kesehatan mental remaja nasional (I-NAMHS) menemukan 5,5% remaja usia 10–17 tahun mengalami gangguan mental dalam
                        12 bulan terakhir, dan <strong>gangguan kecemasan adalah yang paling banyak (3,7%)</strong>. Sebanyak 34,9% remaja
                        menunjukkan gejala gangguan mental.<Rujukan :ids="['inamhs-2022']" />
                    </li>
                    <li>
                        Survei Kesehatan Indonesia (SKI) 2023 mencatat prevalensi depresi tertinggi pada kelompok usia 15–24 tahun, dan hanya
                        10,4% anak muda dengan depresi yang mencari pengobatan.<Rujukan :ids="['ski-2023']" />
                    </li>
                    <li>
                        Sejak Juli 2025, Kementerian Kesehatan menyediakan layanan hotline kesehatan mental dan pencegahan bunuh diri
                        <strong>Healing119.id</strong> yang dapat dihubungi melalui <strong>119 ext 8</strong>.<Rujukan :ids="['healing119']" />
                    </li>
                </ul>
            </section>

            <section>
                <h2 class="mb-3 text-2xl font-extrabold">Gejala yang perlu dikenali</h2>
                <p class="mb-3">Selain rasa takut dan khawatir yang berlebihan, penderita gangguan kecemasan dapat mengalami:<Rujukan :ids="['who-anxiety-2026']" /></p>
                <ul class="grid gap-2 sm:grid-cols-2">
                    <li v-for="g in gejalaUmum" :key="g" class="rounded-xl border border-line bg-surface px-4 py-2.5 text-[.95rem]">{{ g }}</li>
                </ul>
            </section>

            <section>
                <h2 class="mb-3 text-2xl font-extrabold">Klasifikasi terbaru</h2>
                <p class="mb-4">
                    Pedoman diagnosis yang berlaku saat ini adalah DSM-5-TR (2022) dan ICD-11, sedangkan klinisi di Indonesia masih banyak
                    menggunakan PPDGJ-III.<Rujukan :ids="['dsm5tr', 'icd11', 'ppdgj3']" /> Kelompok gangguan kecemasan meliputi gangguan
                    kecemasan menyeluruh, gangguan panik, agorafobia, fobia spesifik, gangguan kecemasan sosial, gangguan kecemasan perpisahan,
                    dan mutisme selektif.<Rujukan :ids="['who-anxiety-2026']" />
                </p>
                <p class="mb-4">
                    Gangguan obsesif-kompulsif (OCD) dan gangguan stres pascatrauma (PTSD) kini dikelompokkan tersendiri dalam DSM-5-TR,
                    tetapi tetap dibahas di sistem ini karena kecemasan menjadi ciri utamanya, dan dalam PPDGJ-III keduanya masih berada pada
                    kelompok yang sama (F40–F48). Mutisme selektif tidak dimasukkan karena umumnya dialami anak-anak dan memerlukan observasi
                    langsung oleh profesional.
                </p>
                <p>
                    Pada Januari 2026, American Psychiatric Association merilis rencana revisi besar DSM. Sampai edisi baru terbit,
                    DSM-5-TR tetap menjadi acuan.<Rujukan :ids="['apa-dsm-2026']" />
                </p>
            </section>

            <section>
                <h2 class="mb-3 text-2xl font-extrabold">Penanganan</h2>
                <p class="mb-4">
                    Gangguan kecemasan dapat ditangani dengan efektif. Psikoterapi merupakan penanganan yang esensial, terutama terapi
                    kognitif perilaku (CBT). Pada orang dewasa, antidepresan golongan SSRI juga dapat membantu, sedangkan benzodiazepin
                    umumnya tidak direkomendasikan.<Rujukan :ids="['who-anxiety-2026', 'nice-cg113']" />
                </p>
                <p class="mb-3">Langkah perawatan diri yang dianjurkan WHO:<Rujukan :ids="['who-anxiety-2026']" /></p>
                <ul class="list-disc space-y-1 pl-5">
                    <li v-for="p in perawatanDiri" :key="p">{{ p }}</li>
                </ul>
            </section>

            <section class="rounded-2xl bg-accent-soft p-5 sm:p-6">
                <h2 class="mb-2 text-xl font-extrabold">Mencari bantuan</h2>
                <p>
                    Jika kecemasan mulai mengganggu aktivitas, jangan ragu menghubungi psikolog klinis, psikiater, atau puskesmas terdekat.
                    Dalam kondisi darurat atau jika muncul pikiran untuk menyakiti diri sendiri, segera hubungi <strong>119 ext 8</strong>
                    (<a href="https://www.healing119.id/" target="_blank" rel="noopener">healing119.id</a>).<Rujukan :ids="['healing119']" />
                </p>
            </section>
        </div>
    </article>

    <section class="py-10 sm:py-14">
        <div class="container-page">
            <div class="mb-7 max-w-3xl">
                <h2 class="mb-2 text-2xl font-extrabold sm:text-3xl">Gangguan yang dapat dikenali sistem ini</h2>
                <p class="text-muted">Pilih salah satu untuk membuktikannya dengan metode backward chaining.</p>
            </div>
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <KartuPenyakit v-for="id in daftarPenyakit()" :key="id" :id="id" />
            </div>
        </div>
    </section>

    <section class="pb-14">
        <div class="container-page">
            <div class="rounded-2xl bg-linear-to-br from-primary-soft to-accent-soft px-6 py-10 text-center">
                <h2 class="mb-2 text-2xl font-extrabold sm:text-3xl">Penasaran dengan kondisi anda?</h2>
                <p class="mx-auto mb-5 max-w-xl text-muted">Ikuti konsultasi singkat untuk mengetahui kecenderungan gangguan kecemasan yang mungkin anda alami.</p>
                <div class="flex flex-wrap justify-center gap-3">
                    <RouterLink class="btn btn-primary px-7 py-4" to="/konsultasi">Mulai Konsultasi</RouterLink>
                    <RouterLink class="btn btn-ghost px-7 py-4" to="/sumber">Lihat semua sumber</RouterLink>
                </div>
            </div>
        </div>
    </section>
</template>
