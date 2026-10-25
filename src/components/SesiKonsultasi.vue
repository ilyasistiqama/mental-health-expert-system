<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
    GEJALA, KODE_DURASI, ambilSesi, batalkan, catatHasil, daftarJawaban, hapusSesi,
    jawab, langkahBerikutnya, ruteHasil, sesiBaru, simpanSesi, teksPertanyaan
} from "@/lib/sistemPakar";

const props = defineProps({
    metode: { type: String, required: true },
    target: { type: String, default: null }
});

const router = useRouter();

function mulai() {
    const tersimpan = ambilSesi(props.metode);
    return tersimpan && tersimpan.target === props.target ? tersimpan : sesiBaru(props.metode, props.target);
}

const sesi = ref(mulai());
const langkah = computed(() => langkahBerikutnya(sesi.value));
const nomor = computed(() => sesi.value.urutan.length + 1);
const progres = computed(() => (sesi.value.urutan.length / (sesi.value.urutan.length + (langkah.value.sisa ?? 0))) * 100);
const jawaban = computed(() => daftarJawaban(sesi.value));

watch(sesi, simpanSesi, { immediate: true });

// kesimpulan langsung dicatat begitu inferensi selesai
watch(langkah, (l) => {
    if (l.jenis !== "selesai") return;
    hapusSesi(props.metode);
    router.push(ruteHasil(catatHasil(sesi.value, l)));
}, { immediate: true });

function pilih(ya) {
    if (langkah.value.jenis !== "selesai") sesi.value = jawab(sesi.value, ya);
}

function onKeydown(e) {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key.toLowerCase();
    if (key === "y") pilih(true);
    else if (key === "t") pilih(false);
}

onMounted(() => document.addEventListener("keydown", onKeydown));
onUnmounted(() => document.removeEventListener("keydown", onKeydown));
</script>

<template>
    <div v-if="langkah.jenis !== 'selesai'">
        <div class="card question-card" aria-live="polite">
            <div class="progress" role="progressbar" :aria-valuenow="Math.round(progres)" aria-valuemin="0" aria-valuemax="100">
                <span :style="{ width: `${progres}%` }"></span>
            </div>
            <div :key="sesi.urutan.length" class="masuk">
                <div class="question-meta">
                    <span class="question-number">Pertanyaan ke-{{ nomor }}</span>
                    <span class="question-tag">{{ langkah.jenis === "durasi" ? "Durasi gejala" : GEJALA[langkah.kode].nama }}</span>
                </div>
                <p class="question-text">{{ teksPertanyaan(langkah.jenis === "durasi" ? KODE_DURASI : langkah.kode) }}</p>
            </div>
            <div class="answer-buttons">
                <button class="btn btn-ya" type="button" @click="pilih(true)">Ya</button>
                <button class="btn btn-tidak" type="button" @click="pilih(false)">Tidak</button>
            </div>
            <div class="question-footer">
                <button class="btn btn-text" type="button" :disabled="sesi.urutan.length === 0" @click="sesi = batalkan(sesi)">← Kembali</button>
                <span class="kbd-hint">Pintasan: <kbd>Y</kbd> Ya · <kbd>T</kbd> Tidak</span>
                <button class="btn btn-text" type="button" @click="sesi = sesiBaru(metode, target)">Mulai ulang</button>
            </div>
        </div>

        <section v-if="jawaban.length" class="section" style="padding-bottom: 0;">
            <h3>Jawaban anda sejauh ini</h3>
            <ol class="answer-log">
                <li v-for="j in jawaban" :key="j.kode">
                    <span>{{ teksPertanyaan(j.kode) }}</span>
                    <span class="badge" :class="j.ya ? 'badge-ya' : 'badge-tidak'">{{ j.ya ? "Ya" : "Tidak" }}</span>
                </li>
            </ol>
        </section>
    </div>
</template>
