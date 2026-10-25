<script setup>
import Rujukan from "@/components/Rujukan.vue";
import { PENYAKIT, daftarPenyakit } from "@/lib/sistemPakar";

const batasan = [
    "Sistem ini bukan alat diagnosis dan hasilnya tidak dapat dijadikan rujukan medis maupun surat rujukan ke dokter. Diagnosis hanya dapat ditegakkan oleh psikolog klinis atau psikiater melalui pemeriksaan langsung.",
    "Sistem ini hanya memeriksa kecenderungan beberapa gangguan kecemasan (daftarnya di bawah). Masalah kesehatan mental lain, seperti depresi, gangguan bipolar, gangguan makan, atau penggunaan zat, tidak diperiksa.",
    "Hasil skrining bisa keliru. Jawaban dipengaruhi oleh suasana hati saat mengisi dan cara memahami pertanyaan. Hasil \"tidak menunjukkan kecenderungan\" tidak berarti anda pasti bebas dari gangguan.",
    "Pertanyaan merupakan penyederhanaan kriteria diagnosis untuk keperluan edukasi, bukan instrumen tes psikologi yang terstandar.",
    "Sistem ini tidak ditujukan untuk keadaan darurat. Jika anda atau orang di sekitar anda berada dalam bahaya, segera hubungi 119 ext 8 atau datang ke IGD terdekat.",
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
                Sistem Pakar Gangguan Kecemasan dibuat untuk keperluan akademik sebagai alat edukasi dan skrining mandiri. Tujuannya membantu
                anda mengenali kecenderungan gangguan kecemasan dan mendorong anda untuk berbicara dengan tenaga profesional.
            </p>
        </header>

        <div class="space-y-10 text-[1.05rem] leading-[1.8]">
            <section>
                <h2 class="mb-3 text-2xl font-extrabold">Batasan yang perlu anda ketahui</h2>
                <ul class="list-disc space-y-3 pl-5">
                    <li v-for="(b, i) in batasan" :key="i">
                        {{ b }}<Rujukan v-if="i === batasan.length - 2" :ids="['healing119']" />
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
                    WHO, NICE, dan American Psychological Association.<Rujukan :ids="['dsm5tr', 'icd11', 'ppdgj3', 'who-anxiety-2026']" />
                    Daftar lengkapnya ada di halaman <RouterLink to="/sumber">Sumber</RouterLink>.
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
                    Hubungi psikolog klinis, psikiater, atau puskesmas terdekat. Dalam kondisi darurat atau jika muncul pikiran untuk menyakiti
                    diri sendiri, segera hubungi layanan kesehatan jiwa Kemenkes <strong>119 ext 8</strong>
                    (<a href="https://www.healing119.id/" target="_blank" rel="noopener">healing119.id</a>).<Rujukan :ids="['healing119']" />
                </p>
            </section>
        </div>
    </div>
</template>
