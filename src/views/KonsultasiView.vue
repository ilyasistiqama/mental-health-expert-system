<script setup>
import { ref } from "vue";
import { PENYAKIT, ambilRiwayat, ambilSesi, formatTanggal, hapusRiwayat, judulHasil, namaMetode, ruteHasil } from "@/lib/sistemPakar";

const sesiForward = ambilSesi("forward");
const sesiBackward = ambilSesi("backward");
const riwayat = ref(ambilRiwayat());

const metode = [
    {
        judul: "Forward Chaining",
        tag: "Direkomendasikan",
        isi: "Penalaran dari fakta ke kesimpulan: sistem mengumpulkan gejala yang anda alami, lalu mencocokkannya dengan seluruh aturan.",
        poin: ["Cocok jika anda belum tahu gangguan apa yang dialami", "Bisa menemukan lebih dari satu gangguan"],
        ke: "/forward",
        utama: true
    },
    {
        judul: "Backward Chaining",
        tag: "Pembuktian",
        isi: "Penalaran dari tujuan ke fakta: pilih satu gangguan sebagai hipotesis, lalu sistem membuktikan kriterianya satu per satu.",
        poin: ["Cocok jika anda menduga gangguan tertentu", "Berhenti begitu satu kriteria tidak terpenuhi"],
        ke: "/backward",
        utama: false
    }
];

function hapusSemua() {
    if (confirm("Hapus semua riwayat konsultasi di perangkat ini?")) {
        hapusRiwayat();
        riwayat.value = [];
    }
}
</script>

<template>
    <div class="container-page py-10 sm:py-12">
        <header class="mb-8 max-w-3xl">
            <span class="eyebrow">Konsultasi</span>
            <h1 class="mb-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">Pilih metode konsultasi</h1>
            <p class="text-muted">Kedua metode memakai basis pengetahuan dan aturan yang sama. Setelah kriteria gejala sebuah gangguan terpenuhi, sistem menanyakan durasi keluhan sebagai akhir diagnosa.</p>
        </header>

        <div class="mb-6 grid gap-4">
            <div v-if="sesiForward?.urutan.length" class="card flex flex-col gap-3 border-primary sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 class="font-bold">Lanjutkan Forward Chaining?</h3>
                    <p class="text-muted">Anda sudah menjawab {{ sesiForward.urutan.length }} pertanyaan pada konsultasi sebelumnya.</p>
                </div>
                <RouterLink class="btn btn-primary" to="/forward">Lanjutkan</RouterLink>
            </div>
            <div v-if="sesiBackward?.urutan.length && PENYAKIT[sesiBackward.target]" class="card flex flex-col gap-3 border-primary sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 class="font-bold">Lanjutkan pembuktian {{ PENYAKIT[sesiBackward.target].nama }}?</h3>
                    <p class="text-muted">Anda sudah menjawab {{ sesiBackward.urutan.length }} pertanyaan pada konsultasi sebelumnya.</p>
                </div>
                <RouterLink class="btn btn-primary" :to="{ path: '/backward', query: { id: sesiBackward.target } }">Lanjutkan</RouterLink>
            </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
            <article v-for="m in metode" :key="m.ke" class="card flex flex-col">
                <span class="pill mb-2 self-start" :class="m.utama ? 'bg-primary-soft text-primary-strong' : 'bg-accent-soft text-accent'">{{ m.tag }}</span>
                <h2 class="mb-2 text-2xl font-extrabold">{{ m.judul }}</h2>
                <p class="mb-3 flex-1 text-muted">{{ m.isi }}</p>
                <ul class="mb-5 list-disc pl-5 text-[.95rem] text-muted">
                    <li v-for="p in m.poin" :key="p">{{ p }}</li>
                </ul>
                <RouterLink class="btn" :class="m.utama ? 'btn-primary' : 'btn-ghost'" :to="m.ke">Mulai {{ m.judul }}</RouterLink>
            </article>
        </div>

        <section class="pt-12">
            <div class="mb-1 flex items-center justify-between gap-3">
                <h2 class="text-2xl font-extrabold">Riwayat konsultasi</h2>
                <button v-if="riwayat.length" class="btn btn-text" type="button" @click="hapusSemua">Hapus riwayat</button>
            </div>
            <p class="mb-4 text-muted">Riwayat hanya tersimpan di browser ini.</p>

            <p v-if="riwayat.length === 0" class="empty">Belum ada riwayat konsultasi di perangkat ini.</p>
            <ul v-else class="grid list-none gap-2 p-0">
                <li v-for="entri in riwayat" :key="entri.waktu">
                    <RouterLink :to="ruteHasil(entri)" class="flex items-center gap-3.5 rounded-2xl border border-line bg-surface px-4 py-3.5 text-ink no-underline transition hover:border-primary sm:px-5">
                        <span class="size-2.5 flex-none rounded-full" :class="entri.penyakit.length ? 'bg-accent' : 'bg-primary'"></span>
                        <span class="flex min-w-0 flex-1 flex-col">
                            <strong>{{ judulHasil(entri) }}</strong>
                            <small class="text-muted">{{ namaMetode(entri.metode) }} · {{ formatTanggal(entri.waktu) }}</small>
                        </span>
                        <span class="text-muted" aria-hidden="true">→</span>
                    </RouterLink>
                </li>
            </ul>
        </section>
    </div>
</template>
