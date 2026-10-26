<script setup>
import Rujukan from "@/components/Rujukan.vue";
import { NAMA_SISTEM } from "@/lib/nama";
import { KONTAK_DIPERIKSA } from "@/lib/pesanDukungan";
import { PENYAKIT, daftarPenyakit } from "@/lib/sistemPakar";

const batasan = [
    "Sistem ini bukan alat diagnosis dan hasilnya tidak dapat dijadikan rujukan medis maupun surat rujukan ke dokter. Diagnosis hanya dapat ditegakkan oleh psikolog klinis atau psikiater melalui pemeriksaan langsung.",
    "Sistem ini hanya memeriksa kecenderungan beberapa gangguan kecemasan, gangguan obsesif-kompulsif, PTSD, depresi, insomnia, dan gangguan penyesuaian (daftarnya di bawah). Masalah kesehatan mental lain, seperti gangguan bipolar, psikosis, gangguan makan, atau penggunaan zat, tidak diperiksa.",
    { teks: "Pemeriksaan depresi tidak dapat membedakan depresi dari gangguan bipolar, yang penanganannya berbeda. Jika anda pernah mengalami masa ketika suasana hati sangat meningkat atau hampir tidak butuh tidur, sampaikan kepada psikiater atau psikolog.", sumber: ["who-depression-2026"] },
    "Hasil skrining bisa keliru. Jawaban dipengaruhi oleh suasana hati saat mengisi dan cara memahami pertanyaan. Hasil \"tidak menunjukkan kecenderungan\" tidak berarti anda pasti bebas dari gangguan.",
    "Pertanyaan merupakan penyederhanaan kriteria diagnosis untuk keperluan edukasi, bukan instrumen tes psikologi yang terstandar.",
    "Pertanyaan dan aturan disusun oleh pengembang berdasarkan pedoman diagnosis dan pedoman klinis resmi, dan belum divalidasi oleh psikolog klinis atau psikiater. Karena itu, hasilnya perlu disikapi dengan lebih hati-hati.",
    { teks: "Sistem ini tidak ditujukan untuk keadaan darurat. Jika anda atau orang di sekitar anda berada dalam bahaya, segera hubungi 119 ext 8 atau datang ke IGD terdekat.", sumber: ["healing119"] },
    "Sistem ini ditujukan untuk orang dewasa. Anak dan remaja di bawah 18 tahun sebaiknya mengisinya bersama orang tua atau wali, lalu berkonsultasi dengan psikolog anak."
];

const privasi = [
    "Tidak ada pendaftaran akun dan tidak ada data yang dikirim ke server mana pun.",
    "Jawaban yang belum selesai disimpan sementara hanya di perangkat anda agar konsultasi bisa dilanjutkan, lalu dihapus otomatis begitu hasil keluar.",
    "Hasil pemeriksaan tidak pernah disimpan. Hasil hanya tampil di layar dan hilang saat halaman ditutup, kecuali anda mengunduh PDF-nya sendiri.",
    "Tidak ada pelacak, iklan, maupun layanan analitik. Font dan seluruh berkas aplikasi dimuat dari situs ini sendiri."
];
</script>

<template>
    <div class="container-page max-w-3xl py-10 sm:py-12 2xl:max-w-3xl">
        <header class="mb-8">
            <span class="eyebrow">Tentang</span>
            <h1 class="mb-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">Tentang & batasan sistem</h1>
            <p class="text-lg text-muted">
                {{ NAMA_SISTEM }} dibuat untuk keperluan akademik sebagai alat edukasi dan skrining mandiri. Tujuannya membantu anda
                mengenali kecenderungan gangguan-gangguan tersebut serta mendorong anda untuk berbicara dengan tenaga profesional.
            </p>
        </header>

        <div class="space-y-10 text-[1.05rem] leading-[1.8]">
            <section>
                <h2 class="mb-3 text-2xl font-extrabold">Batasan yang perlu anda ketahui</h2>
                <ul class="list-disc space-y-3 pl-5">
                    <li v-for="(b, i) in batasan" :key="i">
                        {{ b.teks ?? b }}<Rujukan v-if="b.sumber" :ids="b.sumber" />
                    </li>
                </ul>
            </section>

            <section>
                <h2 class="mb-3 text-2xl font-extrabold">Gangguan yang diperiksa</h2>
                <ul class="grid gap-2 sm:grid-cols-2">
                    <li v-for="k in daftarPenyakit()" :key="k" class="rounded-xl border border-line bg-surface px-4 py-2.5 text-[.95rem]">{{ PENYAKIT[k].nama }}</li>
                </ul>
                <p class="mt-3 text-[.95rem] text-muted">
                    Kriteria setiap gangguan disusun berdasarkan DSM-5-TR, ICD-11, dan PPDGJ-III, dan saran penanganan berdasarkan pedoman
                    WHO, NICE, dan American Psychological Association.<Rujukan :ids="['dsm5tr', 'icd11', 'ppdgj3', 'who-anxiety-2026', 'who-depression-2026']" />
                    Pertanyaan depresi mengikuti sembilan kriteria DSM-5-TR, yang juga menjadi dasar kuesioner skrining PHQ-9 yang telah
                    tervalidasi.<Rujukan :ids="['kroenke-phq9-2001']" />
                    Daftar lengkapnya ada di halaman <RouterLink to="/sumber">Sumber</RouterLink>.
                </p>
            </section>

            <section>
                <h2 class="mb-3 text-2xl font-extrabold">Pertanyaan tentang pikiran menyakiti diri</h2>
                <p class="mb-3">
                    Pada Cek Menyeluruh dan cek depresi, sistem selalu menanyakan apakah anda berulang kali berpikir tentang kematian atau
                    menyakiti diri, walaupun jawaban lain sudah cukup untuk menentukan hasil. Penelitian menunjukkan bahwa menanyakan hal ini
                    tidak meningkatkan risiko.<Rujukan :ids="['dazzi-2014']" />
                </p>
                <p>
                    Jika dijawab <em>Ya</em>, sistem langsung menampilkan kontak bantuan sebelum pertanyaan berikutnya, dan kontak tersebut
                    diletakkan paling atas pada halaman hasil maupun PDF.<Rujukan :ids="['who-media-suicide-2023', 'healing119-faq']" />
                </p>
            </section>

            <section>
                <h2 class="mb-3 text-2xl font-extrabold">Privasi anda</h2>
                <ul class="list-disc space-y-3 pl-5">
                    <li v-for="(p, i) in privasi" :key="i">{{ p }}</li>
                </ul>
            </section>

            <section class="rounded-2xl bg-primary-soft p-5 sm:p-6">
                <h2 class="mb-2 text-xl font-extrabold">Butuh bantuan?</h2>
                <p>
                    Hubungi psikolog klinis, psikiater, atau puskesmas terdekat. Jika muncul pikiran untuk menyakiti diri sendiri, segera hubungi
                    layanan kesehatan jiwa Kemenkes <strong>119 ext 8</strong> (gratis, 24 jam) atau chat lewat
                    <a href="https://www.healing119.id/" target="_blank" rel="noopener">healing119.id</a>.<Rujukan :ids="['healing119', 'healing119-faq']" />
                    Dalam keadaan gawat darurat, datang ke IGD terdekat atau telepon 112 atau 119.
                    <span class="mt-2 block text-sm text-muted">Kontak layanan terakhir diperiksa {{ KONTAK_DIPERIKSA }}.</span>
                </p>
            </section>
        </div>
    </div>
</template>
