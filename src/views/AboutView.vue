<script setup>
import { t } from "@/lib/i18n";
import ConsultationGuide from "@/components/ConsultationGuide.vue";
import ReferenceLink from "@/components/ReferenceLink.vue";
import { APP_NAME } from "@/lib/appName";
import { CONTACTS_REVIEWED_AT } from "@/lib/supportMessages";
import { CONDITIONS, listConditions } from "@/lib/knowledgeBase";

const limitations = [
    "Sistem ini bukan alat diagnosis dan hasilnya tidak dapat dijadikan rujukan medis maupun surat rujukan ke dokter. Diagnosis hanya dapat ditegakkan oleh psikolog klinis atau psikiater melalui pemeriksaan langsung.",
    "Skrining ini membahas keluhan terkait kecemasan, obsesif-kompulsif, trauma, depresi, penyesuaian, kesulitan tidur, mimpi buruk, dan jadwal tidur terlambat. Cakupannya terbatas dan tidak menilai semua kemungkinan masalah kesehatan mental.",
    { text: "Bagian skrining tentang depresi tidak dapat membedakan depresi dari gangguan bipolar, yang penanganannya berbeda. Jika anda pernah mengalami masa ketika suasana hati sangat meningkat atau hampir tidak butuh tidur, ceritakan kepada psikiater atau psikolog.", references: ["who-depression-2026"] },
    "Hasil skrining bisa keliru dan tidak dapat memastikan ada atau tidaknya gangguan. Jawaban dipengaruhi suasana hati dan pemahaman pertanyaan. Cari bantuan jika keluhan menetap atau mengganggu, meskipun tidak ada topik yang ditandai.",
    "Pertanyaan merupakan penyederhanaan kriteria diagnosis untuk keperluan edukasi, bukan instrumen tes psikologi yang terstandar.",
    "Pertanyaan dan aturan disusun oleh pengembang berdasarkan pedoman diagnosis dan pedoman klinis resmi, dan belum divalidasi oleh psikolog klinis atau psikiater. Karena itu, hasilnya perlu disikapi dengan lebih hati-hati.",
    { text: "Sistem ini tidak ditujukan untuk keadaan darurat. Jika anda atau orang di sekitar anda berada dalam bahaya, segera hubungi 119 ext 8 atau datang ke IGD terdekat.", references: ["healing119"] },
    "Sistem ini ditujukan untuk orang dewasa. Anak dan remaja di bawah 18 tahun sebaiknya mengisinya bersama orang tua atau wali, lalu berkonsultasi dengan psikolog anak."
];

const privacy = [
    "Tidak ada pendaftaran akun dan tidak ada data yang dikirim ke server mana pun.",
    "Jawaban yang belum selesai disimpan sementara hanya di perangkat anda agar skrining bisa dilanjutkan, lalu dihapus otomatis begitu hasil keluar.",
    "Hasil skrining hanya ada di memori halaman dan tidak disimpan sebagai riwayat. Tidak ada fitur unduh atau ekspor hasil.",
    "Tidak ada pelacak, iklan, maupun layanan analitik. Font dan seluruh berkas aplikasi dimuat dari situs ini sendiri.",
    "Pilihan bahasa disimpan di perangkat sebagai preferensi tampilan dan tidak berisi jawaban atau hasil skrining."
];
</script>

<template>
    <div class="container-page max-w-3xl py-10 sm:py-12 2xl:max-w-3xl">
        <header class="mb-8">
            <span class="eyebrow">{{ t("Tentang") }}</span>
            <h1 class="mb-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">{{ t("Tentang & batasan sistem") }}</h1>
            <p class="text-lg text-muted">
                {{ t(APP_NAME) }} {{ t("adalah alat edukasi dan skrining awal untuk membantu anda merefleksikan keluhan dan mencari bantuan profesional. Sistem ini tidak menyediakan diagnosis, konsultasi profesional, atau surat rujukan.") }}
            </p>
        </header>

        <p class="mb-6"><RouterLink to="/faq">{{ t("Baca FAQ") }}</RouterLink></p>

        <div class="space-y-10 text-[1.05rem] leading-[1.8]">
            <section>
                <h2 class="mb-3 text-2xl font-extrabold">{{ t("Batasan yang perlu anda ketahui") }}</h2>
                <ul class="list-disc space-y-3 pl-5">
                    <li v-for="(b, i) in limitations" :key="i">
                        {{ t(b.text ?? b) }}<ReferenceLink v-if="b.references" :ids="b.references" />
                    </li>
                </ul>
            </section>

            <section>
                <h2 class="mb-3 text-2xl font-extrabold">{{ t("Cakupan topik skrining") }}</h2>
                <ul class="grid gap-2 sm:grid-cols-2">
                    <li v-for="k in listConditions()" :key="k" class="rounded-xl border border-line bg-surface px-4 py-2.5 text-[.95rem]">{{ t(CONDITIONS[k].name) }}</li>
                </ul>
                <p class="mt-3 text-[.95rem] text-muted">
                    {{ t("Dasar tiap pertanyaan ditautkan ke sumbernya. Aturan lama ditinjau menggunakan ringkasan DSM, sedangkan topik tidur baru merujuk pada AASM dan NIH. Pertanyaan merupakan adaptasi pengembang; keberadaan sumber tidak membuktikan ketepatan hasil skrining ini.") }}<ReferenceLink :ids="['samhsa-panic', 'va-ptsd-criteria', 'aasm-nightmare', 'nhlbi-circadian-assessment']" />
                    {{ t("Pertanyaan depresi merujuk pada kriteria DSM-5-TR. Sistem ini bukan kuesioner PHQ-9, dan tidak mewarisi validitas PHQ-9 hanya karena membahas gejala serupa.") }}<ReferenceLink :ids="['kroenke-phq9-2001']" />
                    {{ t("Daftar lengkapnya ada di halaman") }} <RouterLink to="/sumber">{{ t("Sumber") }}</RouterLink>.
                </p>
            </section>

            <section>
                <h2 class="mb-3 text-2xl font-extrabold">{{ t("Pertanyaan tentang pikiran menyakiti diri") }}</h2>
                <p class="mb-3">
                    {{ t("Pada Skrining Menyeluruh dan cek depresi, sistem selalu menanyakan apakah anda berulang kali berpikir tentang kematian atau menyakiti diri, walaupun jawaban lain sudah cukup untuk menentukan hasil. Penelitian menunjukkan bahwa menanyakan hal ini tidak meningkatkan risiko.") }}<ReferenceLink :ids="['dazzi-2014']" />
                </p>
                <p>
                    {{ t("Jika dijawab") }} <em>{{ t("Ya") }}</em>{{ t(", sistem langsung menampilkan kontak bantuan sebelum pertanyaan berikutnya dan di bagian paling atas hasil skrining.") }}<ReferenceLink :ids="['who-media-suicide-2023', 'healing119-faq']" />
                </p>
            </section>

            <section>
                <h2 class="mb-3 text-2xl font-extrabold">{{ t("Privasi anda") }}</h2>
                <ul class="list-disc space-y-3 pl-5">
                    <li v-for="(p, i) in privacy" :key="i">{{ t(p) }}</li>
                </ul>
            </section>

            <ConsultationGuide />

            <section id="professional-help" class="scroll-mt-24 rounded-2xl bg-primary-soft p-5 sm:p-6">
                <h2 class="mb-2 text-xl font-extrabold">{{ t("Butuh bantuan?") }}</h2>
                <p class="mb-3">{{ t("Anda dapat menghubungi puskesmas, klinik psikologi, atau layanan psikiatri rumah sakit untuk menanyakan jadwal pemeriksaan. Ceritakan keluhan dan dampaknya pada keseharian; tidak perlu membawa hasil skrining.") }}</p>
                <p>
                    {{ t("Hubungi psikolog klinis, psikiater, atau puskesmas terdekat. Jika muncul pikiran untuk menyakiti diri sendiri, segera hubungi layanan kesehatan jiwa Kemenkes") }} <strong>119 ext 8</strong> {{ t("(gratis, 24 jam) atau chat lewat") }}
                    <a href="https://www.healing119.id/" target="_blank" rel="noopener">healing119.id</a>.<ReferenceLink :ids="['healing119', 'healing119-faq']" />
                    {{ t("Dalam keadaan gawat darurat, datang ke IGD terdekat atau telepon 112 atau 119.") }}
                    <span class="mt-2 block text-sm text-muted">{{ t("Kontak layanan terakhir diperiksa") }} {{ t(CONTACTS_REVIEWED_AT) }}.</span>
                </p>
            </section>
        </div>
    </div>
</template>
