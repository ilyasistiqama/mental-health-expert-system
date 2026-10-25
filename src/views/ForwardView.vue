<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { GEJALA } from "@/data/pengetahuan";
import { ambilSesi, batalkan, catatHasil, hapusSesi, jawab, ruteHasil, sesiBaru, simpanSesi } from "@/lib/sistemPakar";

const router = useRouter();
const sesi = ref(ambilSesi() ?? sesiBaru());
const gejala = computed(() => GEJALA[sesi.value.id]);

watch(sesi, simpanSesi, { immediate: true });

function pilih(jawaban) {
    const hasil = jawab(sesi.value, jawaban);
    if (hasil.selesai) {
        hapusSesi();
        const entri = catatHasil(hasil.selesai, "Forward Chaining", hasil.langkah.map(({ id, jawaban }) => ({ id, jawaban })));
        router.push(ruteHasil(entri));
        return;
    }
    sesi.value = hasil;
}

function onKeydown(e) {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key.toLowerCase();
    if (key === "y") pilih("ya");
    else if (key === "t") pilih("tidak");
}

onMounted(() => document.addEventListener("keydown", onKeydown));
onUnmounted(() => document.removeEventListener("keydown", onKeydown));
</script>

<template>
    <div class="container narrow quiz">
        <header class="page-head" style="padding-top: 8px;">
            <span class="eyebrow">Forward Chaining</span>
            <h1>Jawab sesuai yang anda alami</h1>
        </header>

        <div class="card question-card" aria-live="polite">
            <div :key="sesi.langkah.length" class="masuk">
                <div class="question-meta">
                    <span class="question-number">Pertanyaan ke-{{ sesi.langkah.length + 1 }}</span>
                    <span class="question-tag">{{ gejala.gejala }}</span>
                </div>
                <p class="question-text">{{ gejala.pertanyaan }}</p>
            </div>
            <div class="answer-buttons">
                <button class="btn btn-ya" type="button" @click="pilih('ya')">Ya</button>
                <button class="btn btn-tidak" type="button" @click="pilih('tidak')">Tidak</button>
            </div>
            <div class="question-footer">
                <button class="btn btn-text" type="button" :disabled="sesi.langkah.length === 0" @click="sesi = batalkan(sesi)">← Kembali</button>
                <span class="kbd-hint">Pintasan: <kbd>Y</kbd> Ya · <kbd>T</kbd> Tidak</span>
                <button class="btn btn-text" type="button" @click="sesi = sesiBaru()">Mulai ulang</button>
            </div>
        </div>

        <section v-if="sesi.langkah.length" class="section" style="padding-bottom: 0;">
            <h3>Jawaban anda sejauh ini</h3>
            <ol class="answer-log">
                <li v-for="(l, i) in sesi.langkah" :key="i">
                    <span>{{ GEJALA[l.id].pertanyaan }}</span>
                    <span class="badge" :class="`badge-${l.jawaban}`">{{ l.jawaban === "ya" ? "Ya" : "Tidak" }}</span>
                </li>
            </ol>
        </section>
    </div>
</template>
