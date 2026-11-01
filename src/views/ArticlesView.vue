<script setup>
import { t } from "@/lib/i18n";
import ConditionCard from "@/components/ConditionCard.vue";
import ReferenceLink from "@/components/ReferenceLink.vue";
import { listConditions } from "@/lib/knowledgeBase";

const commonSymptoms = [
    "Sulit berkonsentrasi atau mengambil keputusan",
    "Mudah tersinggung, tegang, atau gelisah",
    "Mual atau rasa tidak nyaman di perut",
    "Jantung berdebar",
    "Berkeringat, gemetar, atau tubuh bergetar",
    "Gangguan tidur",
    "Perasaan akan terjadi bahaya, kepanikan, atau malapetaka"
];

// gejala depresi menurut WHO, selain suasana hati murung atau hilangnya minat
const depressionSymptoms = [
    "Sulit berkonsentrasi",
    "Merasa bersalah berlebihan atau tidak berharga",
    "Putus asa tentang masa depan",
    "Pikiran tentang kematian atau bunuh diri",
    "Tidur terganggu",
    "Perubahan nafsu makan atau berat badan",
    "Sangat lelah atau kehabisan tenaga"
];

const selfCare = [
    "Kurangi alkohol dan hindari narkoba",
    "Berolahraga secara teratur",
    "Jaga pola makan dan tidur yang teratur",
    "Latih teknik relaksasi, misalnya pernapasan perlahan",
    "Biasakan meditasi mindfulness, walaupun hanya beberapa menit setiap hari",
    "Tetap melakukan kegiatan yang dulu disukai dan tetap terhubung dengan keluarga serta teman",
    "Ceritakan perasaan anda kepada orang yang anda percaya"
];
</script>

<template>
    <article class="container-page max-w-3xl py-10 sm:py-12 2xl:max-w-3xl">
        <header class="mb-8">
            <span class="eyebrow">{{ t("Artikel · Diperbarui Oktober 2026") }}</span>
            <h1 class="mb-4 text-3xl font-extrabold sm:text-4xl lg:text-5xl">{{ t("Memahami kecemasan dan depresi") }}</h1>
            <p class="text-lg text-muted">{{ t("Rangkuman informasi terbaru tentang gangguan kecemasan dan depresi dari WHO, pedoman klinis, serta survei nasional Indonesia.") }}</p>
        </header>

        <div class="space-y-10 text-[1.05rem] leading-[1.8]">
            <section>
                <h2 class="mb-3 text-2xl font-extrabold">{{ t("Apa itu kecemasan?") }}</h2>
                <p class="mb-4">
                    {{ t("Setiap orang dapat merasa cemas sesekali. Kecemasan adalah respons yang wajar terhadap ancaman, misalnya menjelang ujian, wawancara kerja, atau saat menghadapi masalah kesehatan. Dalam kadar yang tepat, kecemasan bahkan bermanfaat karena membuat kita lebih waspada dan terdorong untuk bersiap.") }}
                </p>
                <p>
                    {{ t("Kecemasan menjadi") }} <strong>{{ t("gangguan") }}</strong> {{ t("ketika rasa takut dan khawatir muncul secara berlebihan, tidak sebanding dengan ancaman sebenarnya, sulit dikendalikan, berlangsung lama, dan mengganggu kehidupan sehari-hari, baik keluarga, hubungan sosial, sekolah, maupun pekerjaan.") }}<ReferenceLink :ids="['who-anxiety-2026', 'dsm5tr']" />
                </p>
            </section>

            <section>
                <h2 class="mb-3 text-2xl font-extrabold">{{ t("Apa itu depresi?") }}</h2>
                <p class="mb-4">
                    {{ t("Sedih adalah perasaan yang wajar, misalnya setelah kehilangan atau kegagalan. Depresi berbeda: suasana hati sedih, hampa, atau mudah tersinggung, atau hilangnya minat dan kesenangan pada hampir semua kegiatan, berlangsung hampir sepanjang hari, hampir setiap hari, selama minimal dua minggu.") }}<ReferenceLink :ids="['who-depression-2026', 'dsm5tr']" />
                </p>
                <p>
                    {{ t("Depresi bukan tanda kelemahan dan bukan sesuatu yang bisa diatasi hanya dengan \"berpikir positif\". Depresi muncul dari interaksi berbagai faktor sosial, psikologis, dan biologis, dan dapat ditangani secara efektif, baik yang ringan maupun yang berat.") }}<ReferenceLink :ids="['who-depression-2026']" />
                </p>
            </section>

            <section>
                <h2 class="mb-3 text-2xl font-extrabold">{{ t("Kondisi terkini di dunia") }}</h2>
                <div class="mb-5 grid gap-3 sm:grid-cols-3">
                    <div class="card p-4 sm:p-5">
                        <p class="text-3xl font-extrabold text-primary">{{ t("470 jt") }}</p>
                        <p class="text-sm text-muted">{{ t("orang hidup dengan gangguan kecemasan pada 2023") }}<ReferenceLink :ids="['who-anxiety-2026']" /></p>
                    </div>
                    <div class="card p-4 sm:p-5">
                        <p class="text-3xl font-extrabold text-primary">{{ t("5,8%") }}</p>
                        <p class="text-sm text-muted">{{ t("populasi dunia diperkirakan sedang mengalaminya") }}<ReferenceLink :ids="['who-anxiety-2026']" /></p>
                    </div>
                    <div class="card p-4 sm:p-5">
                        <p class="text-3xl font-extrabold text-primary">{{ t("27,6%") }}</p>
                        <p class="text-sm text-muted">{{ t("yang membutuhkan saja yang mendapat penanganan") }}<ReferenceLink :ids="['who-anxiety-2026']" /></p>
                    </div>
                </div>
                <p class="mb-4">
                    {{ t("Menurut WHO, gangguan kecemasan adalah gangguan mental yang paling umum di dunia. Perempuan lebih sering mengalaminya dibanding laki-laki, dan gejalanya sering dimulai sejak masa kanak-kanak atau remaja. Hambatan penanganannya antara lain kurangnya kesadaran, minimnya investasi layanan kesehatan jiwa, kurangnya tenaga terlatih, dan stigma.") }}<ReferenceLink :ids="['who-anxiety-2026']" />
                </p>
                <p class="mb-4">
                    {{ t("Depresi dialami sekitar 322 juta orang di dunia dan lebih sering dialami perempuan. Bahkan di negara berpenghasilan tinggi, hanya sekitar sepertiga orang dengan depresi yang mendapat penanganan kesehatan jiwa.") }}<ReferenceLink :ids="['who-depression-2026']" />
                </p>
                <p>
                    {{ t("Secara keseluruhan, lebih dari satu miliar orang di dunia hidup dengan gangguan mental, dengan kecemasan dan depresi sebagai yang paling umum.") }}<ReferenceLink :ids="['who-wmht-2025']" />
                </p>
            </section>

            <section>
                <h2 class="mb-3 text-2xl font-extrabold">{{ t("Kondisi di Indonesia") }}</h2>
                <ul class="list-disc space-y-3 pl-5">
                    <li>
                        {{ t("Survei kesehatan mental remaja nasional (I-NAMHS) menemukan 5,5% remaja usia 10–17 tahun mengalami gangguan mental dalam 12 bulan terakhir, dan") }} <strong>{{ t("gangguan kecemasan adalah yang paling banyak (3,7%)") }}</strong>{{ t(". Sebanyak 34,9% remaja menunjukkan gejala gangguan mental.") }}<ReferenceLink :ids="['inamhs-2022']" />
                    </li>
                    <li>
                        {{ t("Survei Kesehatan Indonesia (SKI) 2023 mencatat prevalensi depresi tertinggi pada kelompok usia 15–24 tahun, dan hanya 10,4% anak muda dengan depresi yang mencari pengobatan.") }}<ReferenceLink :ids="['ski-2023']" />
                    </li>
                    <li>
                        {{ t("Sejak Juli 2025, Kementerian Kesehatan menyediakan layanan hotline kesehatan mental dan pencegahan bunuh diri") }}
                        <strong>Healing119.id</strong> {{ t("yang dapat dihubungi melalui") }} <strong>119 ext 8</strong>.<ReferenceLink :ids="['healing119']" />
                    </li>
                </ul>
            </section>

            <section>
                <h2 class="mb-3 text-2xl font-extrabold">{{ t("Gejala yang perlu dikenali") }}</h2>
                <p class="mb-3">{{ t("Selain rasa takut dan khawatir yang berlebihan, orang dengan gangguan kecemasan dapat mengalami:") }}<ReferenceLink :ids="['who-anxiety-2026']" /></p>
                <ul class="mb-6 grid gap-2 sm:grid-cols-2">
                    <li v-for="g in commonSymptoms" :key="g" class="rounded-xl border border-line bg-surface px-4 py-2.5 text-[.95rem]">{{ t(g) }}</li>
                </ul>
                <p class="mb-3">{{ t("Selain suasana hati murung atau hilangnya minat, orang dengan depresi dapat mengalami:") }}<ReferenceLink :ids="['who-depression-2026']" /></p>
                <ul class="grid gap-2 sm:grid-cols-2">
                    <li v-for="g in depressionSymptoms" :key="g" class="rounded-xl border border-line bg-surface px-4 py-2.5 text-[.95rem]">{{ t(g) }}</li>
                </ul>
            </section>

            <section>
                <h2 class="mb-3 text-2xl font-extrabold">{{ t("Klasifikasi terbaru") }}</h2>
                <p class="mb-4">
                    {{ t("Pedoman diagnosis yang berlaku saat ini adalah DSM-5-TR (2022) dan ICD-11, sedangkan klinisi di Indonesia masih banyak menggunakan PPDGJ-III.") }}<ReferenceLink :ids="['dsm5tr', 'icd11', 'ppdgj3']" /> {{ t("Kelompok gangguan kecemasan meliputi gangguan kecemasan menyeluruh, gangguan panik, agorafobia, fobia spesifik, gangguan kecemasan sosial, gangguan kecemasan perpisahan, dan mutisme selektif.") }}<ReferenceLink :ids="['who-anxiety-2026']" />
                </p>
                <p class="mb-4">
                    {{ t("Gangguan obsesif-kompulsif (OCD) dan gangguan stres pascatrauma (PTSD) kini dikelompokkan tersendiri dalam DSM-5-TR, tetapi tetap dibahas di sistem ini karena kecemasan menjadi ciri utamanya, dan dalam PPDGJ-III keduanya masih berada pada kelompok yang sama (F40–F48). Mutisme selektif tidak dimasukkan karena umumnya dialami anak-anak dan memerlukan observasi langsung oleh profesional.") }}
                </p>
                <p class="mb-4">
                    {{ t("Depresi termasuk kelompok gangguan depresi dalam DSM-5-TR dan gangguan suasana perasaan (F30–F39) dalam PPDGJ-III. Gangguan bipolar juga dapat diawali episode depresi, tetapi penanganannya berbeda. Karena itu, sistem ini tidak memeriksa gangguan bipolar, dan profesional akan menanyakan riwayat suasana hati anda sebelum menentukan diagnosis.") }}<ReferenceLink :ids="['dsm5tr', 'ppdgj3', 'who-depression-2026']" />
                </p>
                <p class="mb-4">
                    {{ t("Materi edukasi ini juga membahas dua topik yang sering berkaitan dengan kecemasan dan depresi.") }} <strong>{{ t("Gangguan insomnia") }}</strong> {{ t("adalah kesulitan tidur minimal 3 malam seminggu selama minimal 3 bulan walaupun ada kesempatan untuk tidur; dalam ICD-11 gangguan ini masuk kelompok gangguan tidur-bangun.") }} <strong>{{ t("Gangguan penyesuaian") }}</strong> {{ t("adalah reaksi berlebihan terhadap peristiwa hidup yang berat, yang muncul dalam beberapa bulan setelah peristiwa dan umumnya membaik dalam 6 bulan.") }}<ReferenceLink :ids="['dsm5tr', 'icd11']" />
                </p>
                <p>
                    {{ t("Pada Januari 2026, American Psychiatric Association merilis rencana revisi besar DSM. Sampai edisi baru terbit, DSM-5-TR tetap menjadi acuan.") }}<ReferenceLink :ids="['apa-dsm-2026']" />
                </p>
            </section>

            <section>
                <h2 class="mb-3 text-2xl font-extrabold">{{ t("Penanganan") }}</h2>
                <p class="mb-4">
                    {{ t("Gangguan kecemasan dapat ditangani dengan efektif. Psikoterapi merupakan penanganan yang esensial, terutama terapi kognitif perilaku (CBT). Bila diperlukan, psikiater atau dokter dapat meresepkan obat yang sesuai; jangan mengonsumsi obat apa pun, termasuk obat penenang, tanpa resep dan pengawasan dokter.") }}<ReferenceLink :ids="['who-anxiety-2026', 'nice-cg113']" />
                </p>
                <p class="mb-4">
                    {{ t("Depresi juga dapat ditangani dengan efektif. Psikoterapi merupakan penanganan pertama, misalnya terapi kognitif perilaku, aktivasi perilaku, psikoterapi interpersonal, atau terapi pemecahan masalah. Pada depresi sedang hingga berat, dokter dapat mempertimbangkan obat bersama psikoterapi.") }}<ReferenceLink :ids="['who-depression-2026', 'nice-ng222']" />
                </p>
                <p class="mb-3">{{ t("Langkah perawatan diri yang dianjurkan WHO:") }}<ReferenceLink :ids="['who-anxiety-2026', 'who-depression-2026']" /></p>
                <ul class="list-disc space-y-1 pl-5">
                    <li v-for="p in selfCare" :key="p">{{ t(p) }}</li>
                </ul>
            </section>

            <section class="rounded-2xl bg-accent-soft p-5 sm:p-6">
                <h2 class="mb-2 text-xl font-extrabold">{{ t("Mencari bantuan") }}</h2>
                <p>
                    {{ t("Jika kecemasan atau rasa sedih mulai mengganggu aktivitas, jangan ragu menghubungi psikolog klinis, psikiater, atau puskesmas terdekat. Dalam kondisi darurat atau jika muncul pikiran untuk menyakiti diri sendiri, segera hubungi") }} <strong>119 ext 8</strong>
                    (<a href="https://www.healing119.id/" target="_blank" rel="noopener">healing119.id</a>).<ReferenceLink :ids="['healing119']" />
                </p>
            </section>
        </div>
    </article>

    <section class="py-10 sm:py-14">
        <div class="container-page">
            <div class="mb-7 max-w-3xl">
                <h2 class="mb-2 text-2xl font-extrabold sm:text-3xl">{{ t("Topik yang dibahas dalam skrining") }}</h2>
                <p class="text-muted">{{ t("Pilih topik untuk mengenali keluhan dan mempersiapkan percakapan dengan profesional. Skrining tidak menetapkan gangguan.") }}</p>
            </div>
            <p class="mb-5 max-w-3xl rounded-xl bg-surface-2 px-4 py-3 text-sm text-muted">{{ t("Nama gangguan di bagian ini adalah topik edukasi, bukan label untuk anda. Keluhan yang mirip dapat memiliki penyebab berbeda dan perlu dibicarakan dengan profesional.") }}</p>
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <ConditionCard v-for="id in listConditions()" :key="id" :id="id" />
            </div>
        </div>
    </section>

    <section class="pb-14">
        <div class="container-page">
            <div class="rounded-2xl bg-linear-to-br from-primary-soft to-accent-soft px-6 py-10 text-center">
                <h2 class="mb-2 text-2xl font-extrabold sm:text-3xl">{{ t("Ingin memahami keluhan anda?") }}</h2>
                <p class="mx-auto mb-5 max-w-xl text-muted">{{ t("Ikuti skrining singkat untuk mengenali keluhan dan langkah mencari bantuan. Anda juga dapat langsung menghubungi profesional tanpa mengikuti skrining.") }}</p>
                <div class="flex flex-wrap justify-center gap-3">
                    <RouterLink class="btn btn-primary px-7 py-4" to="/konsultasi">{{ t("Mulai Skrining") }}</RouterLink>
                    <RouterLink class="btn btn-ghost px-7 py-4" to="/sumber">{{ t("Lihat semua sumber") }}</RouterLink>
                </div>
            </div>
        </div>
    </section>
</template>
