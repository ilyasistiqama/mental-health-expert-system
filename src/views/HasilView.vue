<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import CatatanPenting from "@/components/CatatanPenting.vue";
import DaftarKriteria from "@/components/DaftarKriteria.vue";
import Rujukan from "@/components/Rujukan.vue";
import { KODE_NORMAL, PENYAKIT, ambilRiwayat, formatTanggal, judulHasil, labelDurasi, namaMetode } from "@/lib/sistemPakar";

const route = useRoute();

// ?r=<waktu> menunjuk entri riwayat, tanpa parameter tampilkan hasil terakhir
const entri = computed(() => {
    const riwayat = ambilRiwayat();
    return riwayat.find((e) => String(e.waktu) === route.query.r) ?? (route.query.r ? null : riwayat[0] ?? null);
});

const terdiagnosa = computed(() => entri.value.penyakit.filter((k) => PENYAKIT[k]).map((k) => PENYAKIT[k]));
const belumCukup = computed(() => entri.value.belumCukup.filter((k) => PENYAKIT[k]).map((k) => PENYAKIT[k]));

const membuatPdf = ref(false);
const gagalPdf = ref(false);

async function unduhPdf() {
    membuatPdf.value = true;
    gagalPdf.value = false;
    try {
        const { unduhPdfHasil } = await import("@/lib/pdf");
        await unduhPdfHasil(entri.value);
    } catch (e) {
        console.error(e);
        gagalPdf.value = true;
    } finally {
        membuatPdf.value = false;
    }
}
</script>

<template>
    <div class="container-page py-8 sm:py-10">
        <div v-if="!entri">
            <header class="mb-6">
                <h1 class="mb-2 text-3xl font-extrabold sm:text-4xl">Belum ada hasil</h1>
                <p class="text-muted">Hasil konsultasi tidak ditemukan di perangkat ini.</p>
            </header>
            <RouterLink class="btn btn-primary px-7 py-4" to="/konsultasi">Mulai Konsultasi</RouterLink>
        </div>

        <div v-else>
            <section
                class="mb-5 rounded-2xl border border-line bg-linear-to-br to-surface px-5 py-8 sm:px-8 sm:py-9"
                :class="terdiagnosa.length ? 'from-accent-soft' : 'from-primary-soft'"
            >
                <span class="eyebrow" :class="terdiagnosa.length ? 'text-accent' : ''">
                    {{ terdiagnosa.length ? "Kecenderungan yang terdeteksi" : "Hasil konsultasi" }}
                </span>
                <h1 class="mb-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">{{ judulHasil(entri) }}</h1>
                <p v-if="terdiagnosa.length" class="mb-3 max-w-3xl text-muted">
                    Jawaban anda memenuhi aturan untuk {{ terdiagnosa.length > 1 ? "gangguan-gangguan" : "gangguan" }} berikut. Hasil ini adalah
                    kecenderungan, bukan diagnosis; diagnosis hanya dapat ditegakkan oleh psikolog klinis atau psikiater.
                    <template v-if="terdiagnosa.length > 1">Beberapa gangguan kecemasan memang dapat muncul bersamaan; profesional akan menentukan diagnosis utamanya.</template>
                </p>
                <p v-else-if="entri.metode === 'backward' && belumCukup.length === 0" class="mb-3 max-w-3xl text-muted">
                    Tidak semua kriteria dari hipotesis tersebut terpenuhi. Coba hipotesis lain atau gunakan Forward Chaining.
                </p>
                <p v-else-if="belumCukup.length === 0" class="mb-3 max-w-3xl text-muted">{{ PENYAKIT[KODE_NORMAL].deskripsi }}</p>
                <p class="mb-5 text-sm text-muted">{{ namaMetode(entri.metode) }} · {{ formatTanggal(entri.waktu) }}</p>

                <div class="flex flex-wrap gap-3 print:hidden">
                    <button class="btn btn-primary flex-1 sm:flex-none" type="button" :disabled="membuatPdf" @click="unduhPdf">
                        <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" />
                        </svg>
                        {{ membuatPdf ? "Membuat PDF..." : "Unduh PDF" }}
                    </button>
                    <RouterLink class="btn btn-ghost flex-1 sm:flex-none" to="/forward">Konsultasi lagi</RouterLink>
                </div>
                <p v-if="gagalPdf" class="mt-3 text-sm text-no" role="alert">PDF gagal dibuat. Periksa koneksi internet anda lalu coba lagi.</p>
            </section>

            <div v-for="p in belumCukup" :key="p.kode" class="mb-5 rounded-2xl bg-accent-soft px-5 py-4 text-[.95rem]">
                <p>
                    <strong class="text-accent">Gejala {{ p.nama }} terpenuhi, tetapi durasinya belum mencapai {{ labelDurasi(p.durasiMinimal) }}</strong>
                    sehingga belum dapat disimpulkan. Pantau terus kondisi anda dan lakukan konsultasi ulang jika keluhan berlanjut.
                    <template v-if="p.catatanDurasi">{{ p.catatanDurasi }}</template>
                </p>
            </div>

            <div class="grid items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
                <div class="grid gap-5">
                    <section v-for="p in terdiagnosa" :key="p.kode" class="card">
                        <div class="mb-3 flex flex-wrap gap-1.5">
                            <span class="pill bg-accent-soft text-accent">{{ p.kode }}</span>
                            <span class="pill bg-surface-2 text-muted">{{ p.kategori }}</span>
                        </div>
                        <h2 class="mb-2 text-2xl font-extrabold">{{ p.nama }}</h2>
                        <p class="mb-5 text-muted">{{ p.deskripsi }}</p>
                        <h3 class="mb-2 font-bold">Penanganan yang dapat dilakukan<Rujukan :ids="p.sumber.filter((s) => !['dsm5tr', 'icd11', 'ppdgj3'].includes(s))" /></h3>
                        <ol class="list-decimal space-y-3 pl-5">
                            <li v-for="(t, i) in p.pengobatan" :key="i">{{ t }}</li>
                        </ol>
                        <p v-if="p.rujukan" class="mt-4 text-sm text-muted">Klasifikasi: {{ p.rujukan }}<Rujukan :ids="['dsm5tr', 'icd11', 'ppdgj3']" /></p>
                    </section>

                    <section v-if="terdiagnosa.length === 0" class="card">
                        <h2 class="mb-3 text-2xl font-extrabold">Tips menjaga kesehatan mental<Rujukan :ids="PENYAKIT[KODE_NORMAL].sumber" /></h2>
                        <ol class="list-decimal space-y-3 pl-5">
                            <li v-for="(t, i) in PENYAKIT[KODE_NORMAL].pengobatan" :key="i">{{ t }}</li>
                        </ol>
                    </section>

                    <section v-if="entri.jawaban.length" class="card">
                        <details>
                            <summary class="cursor-pointer font-bold">Lihat jawaban anda ({{ entri.jawaban.length }} pertanyaan)</summary>
                            <ol class="mt-4 grid list-none gap-2 p-0">
                                <li v-for="j in entri.jawaban" :key="j.kode" class="flex flex-col gap-1.5 rounded-xl border border-line px-4 py-3 text-[.95rem] sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                    <span>{{ j.pertanyaan }}</span>
                                    <span class="pill flex-none self-start" :class="j.ya === false ? 'bg-no-soft text-no' : 'bg-primary-soft text-primary-strong'">{{ j.jawaban }}</span>
                                </li>
                            </ol>
                        </details>
                    </section>
                </div>

                <div class="grid gap-5">
                    <section v-for="p in terdiagnosa" :key="p.kode" class="card">
                        <h3 class="mb-4 font-bold">Aturan {{ p.nama }}</h3>
                        <DaftarKriteria :kode="p.kode" />
                    </section>
                    <CatatanPenting>
                        hasil ini adalah gambaran awal, bukan diagnosis. Obat-obatan hanya boleh dikonsumsi sesuai resep dokter.
                        Kunjungi psikolog klinis, psikiater, atau puskesmas terdekat untuk pemeriksaan lebih lanjut.
                        Butuh bantuan segera? Hubungi <strong>119 ext 8</strong>.<Rujukan :ids="['healing119']" />
                    </CatatanPenting>
                    <RouterLink class="btn btn-ghost" to="/konsultasi">Lihat riwayat konsultasi</RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>
