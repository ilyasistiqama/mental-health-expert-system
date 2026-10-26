<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import CatatanPenting from "@/components/CatatanPenting.vue";
import DaftarKriteria from "@/components/DaftarKriteria.vue";
import PanelKrisis from "@/components/PanelKrisis.vue";
import PesanDukungan from "@/components/PesanDukungan.vue";
import Rujukan from "@/components/Rujukan.vue";
import { konfirmasi } from "@/lib/dialog";
import { ISI_REMAJA, JUDUL_REMAJA } from "@/lib/pesanDukungan";
import { KODE_NORMAL, PENYAKIT, formatTanggal, hasilTerakhir, judulHasil, labelDurasi, namaMetode } from "@/lib/sistemPakar";

// hasil hanya ada di memori halaman, tidak pernah disimpan
const entri = hasilTerakhir;

const terdiagnosa = computed(() => entri.value.penyakit.filter((k) => PENYAKIT[k]).map((k) => PENYAKIT[k]));
const belumCukup = computed(() => entri.value.belumCukup.filter((k) => PENYAKIT[k]).map((k) => PENYAKIT[k]));

const membuatPdf = ref(false);
const gagalPdf = ref(false);
const sudahDiunduh = ref(false);

async function unduhPdf() {
    membuatPdf.value = true;
    gagalPdf.value = false;
    try {
        const { unduhPdfHasil } = await import("@/lib/pdf");
        await unduhPdfHasil(entri.value);
        sudahDiunduh.value = true;
    } catch (e) {
        console.error(e);
        gagalPdf.value = true;
    } finally {
        membuatPdf.value = false;
    }
}

// Pindah halaman di dalam website: konfirmasi dengan dialog sendiri, lalu hasil dihapus dari memori
// agar tidak bisa dibuka lagi oleh orang lain yang memakai perangkat yang sama.
onBeforeRouteLeave(async () => {
    if (!entri.value) return true;
    const pergi = sudahDiunduh.value || await konfirmasi({
        judul: "Tinggalkan halaman hasil?",
        pesan: "Demi menjaga kerahasiaan, hasil ini tidak disimpan dan akan hilang setelah anda meninggalkan halaman ini. Unduh PDF terlebih dahulu jika ingin menyimpannya.",
        ya: "Tinggalkan",
        tidak: "Tetap di sini"
    });
    if (pergi) hasilTerakhir.value = null;
    return pergi;
});

// Menutup tab atau memuat ulang: browser hanya mengizinkan dialog bawaannya sendiri
function cegahTutup(e) {
    if (entri.value && !sudahDiunduh.value) {
        e.preventDefault();
        e.returnValue = "";
    }
}

onMounted(() => window.addEventListener("beforeunload", cegahTutup));
onUnmounted(() => window.removeEventListener("beforeunload", cegahTutup));
</script>

<template>
    <div class="container-page py-8 sm:py-10">
        <div v-if="!entri">
            <header class="mb-6 max-w-2xl">
                <h1 class="mb-2 text-3xl font-extrabold sm:text-4xl">Hasil tidak tersedia</h1>
                <p class="text-muted">
                    Demi menjaga kerahasiaan, hasil konsultasi tidak disimpan di mana pun dan hanya tampil sekali setelah konsultasi selesai.
                    Hasil hilang jika halaman dimuat ulang atau ditutup. Silakan lakukan konsultasi kembali.
                </p>
            </header>
            <RouterLink class="btn btn-primary px-7 py-4" to="/konsultasi">Mulai Konsultasi</RouterLink>
        </div>

        <div v-else>
            <!-- bantuan segera didahulukan dari hasil apa pun -->
            <PanelKrisis v-if="entri.krisis" class="mb-5" />

            <section
                class="mb-5 rounded-2xl border border-line bg-linear-to-br to-surface px-5 py-8 sm:px-8 sm:py-9"
                :class="terdiagnosa.length ? 'from-accent-soft' : 'from-primary-soft'"
            >
                <span class="eyebrow" :class="terdiagnosa.length ? 'text-accent' : ''">
                    Hasil pemeriksaan awal
                </span>
                <h1 class="mb-3 text-2xl font-extrabold sm:text-3xl lg:text-4xl">{{ judulHasil(entri) }}</h1>
                <p v-if="terdiagnosa.length" class="mb-3 max-w-3xl text-muted">
                    Kesesuaian ini hanya berdasarkan jawaban anda dan <strong class="text-ink">bukan diagnosis</strong>. Diagnosis hanya dapat ditegakkan
                    oleh psikolog klinis atau psikiater setelah bertemu dan berbicara langsung dengan anda.
                    <template v-if="terdiagnosa.length > 1">Beberapa gangguan memang sering muncul bersamaan; profesional akan menentukan mana yang paling sesuai.</template>
                </p>
                <p v-else-if="entri.metode === 'backward' && belumCukup.length === 0" class="mb-3 max-w-3xl text-muted">
                    Tidak semua kriteria gangguan tersebut terpenuhi. Hasil ini tidak menjamin anda bebas dari gangguan tersebut; jika anda tetap
                    merasa terganggu, sebaiknya tetap berbicara dengan psikolog. Anda juga bisa mengecek gangguan lain atau memakai Cek Menyeluruh.
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
                    <RouterLink class="btn btn-ghost flex-1 sm:flex-none" to="/konsultasi">Konsultasi lagi</RouterLink>
                </div>
                <p v-if="gagalPdf" class="mt-3 text-sm text-no" role="alert">PDF gagal dibuat. Periksa koneksi internet anda lalu coba lagi.</p>
            </section>

            <PesanDukungan class="mb-5" />

            <section v-if="entri.remaja" class="mb-5 rounded-2xl bg-accent-soft px-5 py-5 sm:px-7" aria-labelledby="judul-remaja">
                <h2 id="judul-remaja" class="mb-2 text-xl font-extrabold text-accent">{{ JUDUL_REMAJA }}</h2>
                <p v-for="(p, i) in ISI_REMAJA" :key="i" class="mb-2 last:mb-0">
                    {{ p }}<Rujukan v-if="i === ISI_REMAJA.length - 1" :ids="['healing119-faq']" />
                </p>
            </section>

            <div class="mb-5 flex items-start gap-3 rounded-2xl border border-line bg-surface px-5 py-4 text-[.95rem] print:hidden" role="note">
                <svg class="mt-0.5 size-5 flex-none text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                <p>
                    <strong>Hasil ini tidak disimpan di mana pun</strong> demi menjaga kerahasiaan anda, dan akan hilang jika halaman ditutup,
                    dimuat ulang, atau anda berpindah halaman. Unduh PDF jika ingin menyimpannya.
                </p>
            </div>

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
                        <p v-if="p.catatan" class="mb-5 rounded-xl bg-surface-2 px-4 py-3 text-[.95rem]">{{ p.catatan }}</p>
                        <h3 class="mb-2 font-bold">Penanganan yang umumnya dilakukan oleh profesional<Rujukan :ids="p.sumber.filter((s) => !['dsm5tr', 'icd11', 'ppdgj3'].includes(s))" /></h3>
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
                        <h3 class="mb-4 font-bold">Kriteria {{ p.nama }}</h3>
                        <DaftarKriteria :kode="p.kode" />
                    </section>
                    <CatatanPenting>
                        saran penanganan di halaman ini adalah informasi umum dari pedoman klinis, bukan resep. Jangan mengonsumsi obat
                        tanpa resep dan pengawasan dokter. Psikolog atau psikiater akan menentukan penanganan yang sesuai untuk anda.
                    </CatatanPenting>
                </div>
            </div>
        </div>
    </div>
</template>
