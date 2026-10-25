<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
    GEJALA, OPSI_DURASI, ambilSesi, batalkan, buatHasil, daftarJawaban, dengarPerubahanTabLain, hapusSesi,
    jawab, langkahBerikutnya, muatUlangSesi, sesiBaru, sesiSama, simpanSesi, teksDurasi
} from "@/lib/sistemPakar";
import { konfirmasi } from "@/lib/dialog";

const props = defineProps({
    metode: { type: String, required: true },
    target: { type: String, default: null }
});

const router = useRouter();

function lanjutkanAtauBaru(tersimpan) {
    return tersimpan && tersimpan.target === props.target ? tersimpan : sesiBaru(props.metode, props.target);
}

const sesi = ref(lanjutkanAtauBaru(ambilSesi(props.metode)));
// petunjuk pengisian tampil sebelum pertanyaan pertama; dilewati jika melanjutkan konsultasi
const siap = ref(sesi.value.urutan.length > 0);

const petunjuk = [
    "Jawablah dengan jujur sesuai yang benar-benar anda rasakan, bukan yang menurut anda seharusnya atau yang diharapkan orang lain. Tidak ada jawaban benar atau salah.",
    "Pikirkan apa yang biasanya anda alami belakangan ini, bukan hanya perasaan hari ini atau satu kejadian saja.",
    "Baca setiap pertanyaan dengan teliti. Jika ragu, pilih jawaban yang paling mendekati keadaan anda.",
    "Isilah di tempat yang tenang tanpa terburu-buru. Anda boleh berhenti kapan saja; jawaban tersimpan dan bisa dilanjutkan.",
    "Jawaban hanya disimpan sementara di perangkat ini dan tidak dikirim ke mana pun."
];
const langkah = computed(() => langkahBerikutnya(sesi.value));
const progres = computed(() => (sesi.value.urutan.length / (sesi.value.urutan.length + (langkah.value.sisa ?? 0))) * 100);
const jawaban = computed(() => daftarJawaban(sesi.value));

watch(sesi, simpanSesi, { immediate: true });

// hasil hanya disimpan di memori; progres dihapus begitu hasil keluar
watch(langkah, (l) => {
    if (l.jenis !== "selesai") return;
    buatHasil(sesi.value, l);
    hapusSesi(props.metode);
    router.push("/hasil");
}, { immediate: true });

function pilih(nilai) {
    if (langkah.value.jenis !== "selesai") sesi.value = jawab(sesi.value, nilai);
}

async function ulang() {
    const yakin = sesi.value.urutan.length === 0 || await konfirmasi({
        judul: "Mulai ulang konsultasi?",
        pesan: `${sesi.value.urutan.length} jawaban yang sudah anda isi akan dihapus dan pertanyaan dimulai dari awal.`,
        ya: "Ya, mulai ulang",
        tidak: "Lanjutkan menjawab",
        bahaya: true
    });
    if (yakin) sesi.value = sesiBaru(props.metode, props.target);
}

// Tab yang lama tidak aktif (misalnya browser HP ditinggal ke aplikasi lain, atau ada tab kedua)
// bisa menampilkan progres usang. Saat tab aktif kembali, progres dibaca ulang dari penyimpanan.
async function sinkronkan() {
    const tersimpan = await muatUlangSesi(props.metode);
    if (tersimpan?.target !== props.target && tersimpan) return;
    const terbaru = lanjutkanAtauBaru(tersimpan);
    if (!sesiSama(terbaru, sesi.value)) sesi.value = terbaru;
    // konsultasi sudah dimulai di tab lain, petunjuk tidak perlu ditampilkan lagi
    if (terbaru.urutan.length > 0) siap.value = true;
}

function onVisibility() {
    if (document.visibilityState === "visible") sinkronkan();
}

function onKeydown(e) {
    if (!siap.value || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key.toLowerCase();
    if (langkah.value.jenis === "gejala") {
        if (key === "y") pilih(true);
        else if (key === "t") pilih(false);
    } else if (langkah.value.jenis === "durasi" && OPSI_DURASI[Number(key) - 1]) {
        pilih(OPSI_DURASI[Number(key) - 1].hari);
    }
}

let berhentiMendengar = null;
onMounted(() => {
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", sinkronkan);
    berhentiMendengar = dengarPerubahanTabLain((metode) => metode === props.metode && sinkronkan());
});
onUnmounted(() => {
    document.removeEventListener("keydown", onKeydown);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pageshow", sinkronkan);
    berhentiMendengar?.();
});
</script>

<template>
    <section v-if="!siap && langkah.jenis !== 'selesai'" class="card px-5 py-7 sm:px-8 sm:py-9" aria-labelledby="judul-petunjuk">
        <h2 id="judul-petunjuk" class="mb-2 text-2xl font-extrabold">Sebelum mulai mengisi</h2>
        <p class="mb-4 text-muted">Agar hasilnya mendekati kondisi anda yang sebenarnya, perhatikan hal berikut:</p>
        <ol class="mb-5 space-y-3">
            <li v-for="(p, i) in petunjuk" :key="i" class="flex gap-3">
                <span class="grid size-7 flex-none place-items-center rounded-lg bg-primary-soft text-sm font-extrabold text-primary-strong">{{ i + 1 }}</span>
                <span>{{ p }}</span>
            </li>
        </ol>
        <p class="mb-6 rounded-xl bg-surface-2 px-4 py-3 text-[.95rem] text-muted">
            Sejujur apa pun jawaban anda, hasilnya tetap gambaran awal, bukan diagnosis.
        </p>
        <button class="btn btn-primary w-full py-4 text-lg sm:w-auto sm:px-8" type="button" @click="siap = true">Saya mengerti, mulai</button>
    </section>

    <div v-else-if="langkah.jenis !== 'selesai'">
        <div class="card px-5 py-7 sm:px-8 sm:py-9" aria-live="polite">
            <div class="mb-5 h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" :aria-valuenow="Math.round(progres)" aria-valuemin="0" aria-valuemax="100">
                <span class="block h-full rounded-full bg-primary transition-[width] duration-300" :style="{ width: `${progres}%` }"></span>
            </div>

            <div :key="sesi.urutan.length" class="animate-masuk">
                <div class="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span class="text-sm font-bold text-muted">Pertanyaan ke-{{ sesi.urutan.length + 1 }}</span>
                    <span class="pill bg-accent-soft text-[.8rem] text-accent">{{ langkah.jenis === "durasi" ? "Durasi keluhan" : GEJALA[langkah.kode].nama }}</span>
                </div>
                <p class="mb-7 text-xl font-bold sm:text-2xl lg:text-[1.65rem]">
                    {{ langkah.jenis === "durasi" ? teksDurasi(langkah.penyakit) : GEJALA[langkah.kode].pertanyaan }}
                </p>
            </div>

            <div v-if="langkah.jenis === 'durasi'" class="grid gap-2.5 sm:grid-cols-2">
                <button
                    v-for="(o, i) in OPSI_DURASI"
                    :key="o.hari"
                    class="btn btn-ghost justify-start rounded-2xl px-4 py-3.5 text-left whitespace-normal hover:border-primary"
                    type="button"
                    @click="pilih(o.hari)"
                >
                    <kbd class="hidden rounded-md border border-line bg-surface-2 px-1.5 text-xs md:inline">{{ i + 1 }}</kbd> {{ o.label }}
                </button>
            </div>
            <div v-else class="grid grid-cols-2 gap-3">
                <button class="btn btn-primary rounded-2xl py-4.5 text-lg" type="button" @click="pilih(true)">Ya</button>
                <button class="btn rounded-2xl border-no bg-surface py-4.5 text-lg text-no hover:bg-no-soft" type="button" @click="pilih(false)">Tidak</button>
            </div>

            <div class="mt-5 flex flex-wrap items-center justify-between gap-2">
                <button class="btn-text btn" type="button" :disabled="sesi.urutan.length === 0" @click="sesi = batalkan(sesi)">← Kembali</button>
                <span v-if="langkah.jenis === 'gejala'" class="hidden text-sm text-muted md:inline">
                    Pintasan: <kbd class="rounded-md border border-line bg-surface-2 px-1.5 text-xs font-bold">Y</kbd> Ya ·
                    <kbd class="rounded-md border border-line bg-surface-2 px-1.5 text-xs font-bold">T</kbd> Tidak
                </span>
                <button class="btn-text btn" type="button" @click="ulang">Mulai ulang</button>
            </div>
        </div>

        <section v-if="jawaban.length" class="pt-10">
            <h3 class="mb-1 text-lg font-bold">Jawaban anda sejauh ini</h3>
            <p class="mb-3 text-sm text-muted">Jawaban disimpan sementara hanya di perangkat ini agar bisa dilanjutkan, dan dihapus otomatis begitu hasil keluar.</p>
            <ol class="grid list-none gap-2 p-0">
                <li v-for="j in jawaban" :key="j.kode" class="flex flex-col gap-1.5 rounded-xl border border-line bg-surface px-4 py-3 text-[.95rem] sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <span>{{ j.pertanyaan }}</span>
                    <span class="pill flex-none self-start" :class="j.ya === false ? 'bg-no-soft text-no' : 'bg-primary-soft text-primary-strong'">{{ j.jawaban }}</span>
                </li>
            </ol>
        </section>
    </div>
</template>
