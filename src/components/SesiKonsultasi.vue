<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import PanelKrisis from "@/components/PanelKrisis.vue";
import {
    GEJALA, OPSI_DURASI, ambilSesi, batalkan, buatHasil, daftarJawaban, dengarPerubahanTabLain, hapusSesi,
    jawab, langkahBerikutnya, muatUlangSesi, sesiBaru, sesiSama, simpanSesi, teksDurasi
} from "@/lib/sistemPakar";
import { konfirmasi } from "@/lib/dialog";
import { ISI_REMAJA, JUDUL_REMAJA } from "@/lib/pesanDukungan";
import Rujukan from "@/components/Rujukan.vue";

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
    "Beberapa pertanyaan menyangkut perasaan sedih, peristiwa yang menyakitkan, atau pikiran tentang menyakiti diri. Jika terasa berat, anda boleh berhenti kapan saja dan menghubungi layanan kesehatan jiwa 119 ext 8.",
    "Isilah di tempat yang tenang tanpa terburu-buru. Anda boleh berhenti kapan saja; jawaban tersimpan dan bisa dilanjutkan.",
    "Jawaban disimpan sementara hanya di perangkat ini dan tidak dikirim ke mana pun. Jika perangkat ini dipakai bersama orang lain, tekan \"Hapus jawaban saya\" saat berhenti di tengah jalan."
];

// pengguna di bawah 18 tahun mendapat pesan khusus sebelum pertanyaan pertama
const tampilRemaja = ref(false);

function mulai(usia) {
    sesi.value = { ...sesi.value, usia };
    if (usia === "remaja") tampilRemaja.value = true;
    else siap.value = true;
}
// pesan bantuan tampil begitu pertanyaan krisis (pikiran menyakiti diri) dijawab Ya
const tampilKrisis = ref(false);

const langkah = computed(() => langkahBerikutnya(sesi.value));
const progres = computed(() => (sesi.value.urutan.length / (sesi.value.urutan.length + (langkah.value.sisa ?? 0))) * 100);
const jawaban = computed(() => daftarJawaban(sesi.value));
const teksPertanyaan = ref(null);

// Di layar kecil, tombol jawaban sering berada di bawah kartu. Setelah menjawab, pertanyaan
// berikutnya bisa berada di luar pandangan sehingga hanya tombol yang terlihat. Gulirkan teks
// pertanyaan baru ke area pandang, tanpa mengganggu pengguna desktop.
function gulirKePertanyaan() {
    if (typeof window === "undefined" || window.innerWidth >= 1024) return;
    const elemen = teksPertanyaan.value;
    if (!elemen) return;
    const perilaku = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    elemen.scrollIntoView({ behavior: perilaku, block: "nearest" });
}

watch(
    [() => sesi.value.urutan.length, () => langkah.value.jenis, siap, tampilRemaja, tampilKrisis],
    async () => {
        await nextTick();
        if (!siap.value || tampilRemaja.value || tampilKrisis.value || langkah.value.jenis === "selesai") return;
        gulirKePertanyaan();
    }
);

watch(sesi, simpanSesi, { immediate: true });

// hasil hanya disimpan di memori; progres dihapus begitu hasil keluar
watch(langkah, (l) => {
    if (l.jenis !== "selesai") return;
    buatHasil(sesi.value, l);
    hapusSesi(props.metode);
    router.push("/hasil");
}, { immediate: true });

function pilih(nilai) {
    if (langkah.value.jenis === "selesai") return;
    if (langkah.value.jenis === "gejala" && !GEJALA[langkah.value.kode]) return;
    const krisis = langkah.value.jenis === "gejala" && GEJALA[langkah.value.kode]?.krisis && nilai === true;
    sesi.value = jawab(sesi.value, nilai);
    if (krisis) tampilKrisis.value = true;
}

async function ulang() {
    const yakin = sesi.value.urutan.length === 0 || await konfirmasi({
        judul: "Mulai ulang konsultasi?",
        pesan: `${sesi.value.urutan.length} jawaban yang sudah anda isi akan dihapus dan pertanyaan dimulai dari awal.`,
        ya: "Ya, mulai ulang",
        tidak: "Lanjutkan menjawab",
        bahaya: true
    });
    if (yakin) sesi.value = { ...sesiBaru(props.metode, props.target), usia: sesi.value.usia };
}

// untuk perangkat yang dipakai bersama: jawaban dihapus dari perangkat lalu keluar dari konsultasi
async function hapusDanKeluar() {
    const yakin = await konfirmasi({
        judul: "Hapus jawaban anda?",
        pesan: "Semua jawaban yang sudah anda isi akan dihapus dari perangkat ini, sehingga tidak dapat dilihat orang lain yang memakai perangkat yang sama.",
        ya: "Ya, hapus",
        tidak: "Batal",
        bahaya: true
    });
    if (!yakin) return;
    sesi.value = sesiBaru(props.metode, props.target);
    hapusSesi(props.metode);
    router.push("/konsultasi");
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
    if (!siap.value || tampilKrisis.value || tampilRemaja.value || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
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
    <section v-if="!siap && !tampilRemaja && langkah.jenis !== 'selesai'" class="card px-5 py-7 sm:px-8 sm:py-9" aria-labelledby="judul-petunjuk">
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
        <p class="mb-3 font-bold">Berapa usia anda?</p>
        <div class="flex flex-wrap gap-3">
            <button class="btn btn-primary flex-1 py-4 sm:flex-none sm:px-8" type="button" @click="mulai('dewasa')">18 tahun ke atas, mulai</button>
            <button class="btn btn-ghost flex-1 py-4 sm:flex-none sm:px-8" type="button" @click="mulai('remaja')">Di bawah 18 tahun</button>
        </div>
    </section>

    <section v-else-if="tampilRemaja && langkah.jenis !== 'selesai'" class="card px-5 py-7 sm:px-8 sm:py-9" aria-labelledby="judul-remaja">
        <h2 id="judul-remaja" class="mb-4 text-2xl font-extrabold">{{ JUDUL_REMAJA }}</h2>
        <p v-for="(p, i) in ISI_REMAJA" :key="i" class="mb-3">
            {{ p }}<Rujukan v-if="i === ISI_REMAJA.length - 1" :ids="['healing119-faq']" />
        </p>
        <button class="btn btn-primary mt-3 w-full py-4 text-lg sm:w-auto sm:px-8" type="button" @click="tampilRemaja = false; siap = true">Saya mengerti, mulai</button>
    </section>

    <PanelKrisis v-else-if="tampilKrisis && langkah.jenis !== 'selesai'" lanjut="Saya mengerti, lanjutkan pertanyaan" @lanjut="tampilKrisis = false" />

    <div v-else-if="langkah.jenis !== 'selesai'">
        <div class="card px-5 py-7 sm:px-8 sm:py-9" aria-live="polite">
            <div class="mb-5 h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" :aria-valuenow="Math.round(progres)" aria-valuemin="0" aria-valuemax="100">
                <span class="block h-full rounded-full bg-primary transition-[width] duration-300" :style="{ width: `${progres}%` }"></span>
            </div>

            <div :key="sesi.urutan.length" class="animate-masuk">
                <div class="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span class="text-sm font-bold text-muted">Pertanyaan ke-{{ sesi.urutan.length + 1 }}</span>
                    <span class="pill bg-accent-soft text-[.8rem] text-accent">{{ langkah.jenis === "durasi" ? "Durasi keluhan" : (GEJALA[langkah.kode]?.nama || "Gejala") }}</span>
                </div>
                <p ref="teksPertanyaan" class="mb-7 scroll-mt-24 text-xl font-bold sm:text-2xl lg:text-[1.65rem]">
                    {{ langkah.jenis === "durasi" ? teksDurasi(langkah.penyakit) : (GEJALA[langkah.kode]?.pertanyaan || "Pertanyaan tidak tersedia. Silakan muat ulang halaman atau mulai ulang konsultasi.") }}
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
                <span class="flex gap-1">
                    <button class="btn-text btn" type="button" @click="ulang">Mulai ulang</button>
                    <button class="btn-text btn" type="button" @click="hapusDanKeluar">Hapus jawaban saya</button>
                </span>
            </div>
        </div>

        <!-- tertutup secara bawaan agar jawaban tidak langsung terlihat oleh orang di sekitar -->
        <details v-if="jawaban.length" class="pt-10">
            <summary class="cursor-pointer text-lg font-bold">Lihat jawaban anda sejauh ini ({{ jawaban.length }})</summary>
            <p class="mt-1 mb-3 text-sm text-muted">Jawaban disimpan sementara hanya di perangkat ini agar bisa dilanjutkan, dan dihapus otomatis begitu hasil keluar.</p>
            <ol class="grid list-none gap-2 p-0">
                <li v-for="j in jawaban" :key="j.kode" class="flex flex-col gap-1.5 rounded-xl border border-line bg-surface px-4 py-3 text-[.95rem] sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <span>{{ j.pertanyaan }}</span>
                    <span class="pill flex-none self-start" :class="j.ya === false ? 'bg-no-soft text-no' : 'bg-primary-soft text-primary-strong'">{{ j.jawaban }}</span>
                </li>
            </ol>
        </details>
    </div>
</template>
