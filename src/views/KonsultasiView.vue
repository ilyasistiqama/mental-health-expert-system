<script setup>
import { METODE_INFO, PENYAKIT, ambilSesi, ruteMetode } from "@/lib/sistemPakar";

const sesiForward = ambilSesi("forward");
const sesiBackward = ambilSesi("backward");

const metode = [
    {
        id: "forward",
        tag: "Direkomendasikan",
        isi: "Belum tahu apa yang anda alami? Jawab pertanyaan seputar keluhan anda, lalu sistem mencari kemungkinan gangguannya.",
        poin: ["Cocok jika anda belum tahu gangguan apa yang dialami", "Bisa menemukan lebih dari satu gangguan"],
        utama: true
    },
    {
        id: "backward",
        tag: "Lebih singkat",
        isi: "Sudah menduga gangguan tertentu? Pilih gangguannya, lalu sistem memastikan apakah gejala anda sesuai dengan kriterianya.",
        poin: ["Cocok jika anda menduga satu gangguan tertentu", "Berhenti begitu ada kriteria yang tidak sesuai"],
        utama: false
    }
];
</script>

<template>
    <div class="container-page py-10 sm:py-12">
        <header class="mb-8 max-w-3xl">
            <span class="eyebrow">Konsultasi</span>
            <h1 class="mb-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">Pilih jenis pemeriksaan</h1>
            <p class="text-muted">
                Keduanya memakai kriteria yang sama. Setelah gejala sebuah gangguan terpenuhi, sistem menanyakan sudah berapa lama keluhan
                dialami sebagai penentu akhir. Hasil pemeriksaan tidak disimpan di mana pun demi menjaga kerahasiaan anda.
            </p>
        </header>

        <div class="mb-6 flex items-start gap-3 rounded-2xl border border-primary bg-primary-soft px-5 py-4 text-[.95rem]" role="note">
            <svg class="mt-0.5 size-5 flex-none text-primary-strong" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
            <p>
                <strong>Sebelum mulai:</strong> sistem ini adalah alat bantu untuk mengenali kecenderungan, bukan alat diagnosis dan bukan
                rujukan ke dokter. Apa pun hasilnya, anggaplah sebagai ajakan untuk lebih memperhatikan diri dan, bila perlu, berbicara
                dengan psikolog. Jawablah dengan santai dan jujur; anda boleh berhenti kapan saja.
                <RouterLink to="/tentang">Baca batasan sistem ini</RouterLink>.
            </p>
        </div>

        <div class="mb-6 grid gap-4">
            <div v-if="sesiForward?.urutan.length" class="card flex flex-col gap-3 border-primary sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 class="font-bold">Lanjutkan {{ METODE_INFO.forward.nama }}?</h3>
                    <p class="text-muted">Anda sudah menjawab {{ sesiForward.urutan.length }} pertanyaan sebelumnya.</p>
                </div>
                <RouterLink class="btn btn-primary" :to="ruteMetode('forward')">Lanjutkan</RouterLink>
            </div>
            <div v-if="sesiBackward?.urutan.length && PENYAKIT[sesiBackward.target]" class="card flex flex-col gap-3 border-primary sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 class="font-bold">Lanjutkan cek {{ PENYAKIT[sesiBackward.target].nama }}?</h3>
                    <p class="text-muted">Anda sudah menjawab {{ sesiBackward.urutan.length }} pertanyaan sebelumnya.</p>
                </div>
                <RouterLink class="btn btn-primary" :to="ruteMetode('backward', sesiBackward.target)">Lanjutkan</RouterLink>
            </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
            <article v-for="m in metode" :key="m.id" class="card flex flex-col">
                <span class="pill mb-2 self-start" :class="m.utama ? 'bg-primary-soft text-primary-strong' : 'bg-accent-soft text-accent'">{{ m.tag }}</span>
                <h2 class="mb-2 text-2xl font-extrabold">{{ METODE_INFO[m.id].nama }}</h2>
                <p class="mb-3 flex-1 text-muted">{{ m.isi }}</p>
                <ul class="mb-5 list-disc pl-5 text-[.95rem] text-muted">
                    <li v-for="p in m.poin" :key="p">{{ p }}</li>
                </ul>
                <RouterLink class="btn" :class="m.utama ? 'btn-primary' : 'btn-ghost'" :to="ruteMetode(m.id)">Mulai {{ METODE_INFO[m.id].nama }}</RouterLink>
                <p class="mt-3 text-center text-xs text-muted">Metode sistem pakar: {{ METODE_INFO[m.id].teknis }}</p>
            </article>
        </div>
    </div>
</template>
