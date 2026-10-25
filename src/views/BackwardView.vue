<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { GEJALA, PENYAKIT } from "@/data/pengetahuan";
import { ID_DUA_MINGGU, catatHasil, daftarPenyakit, gejalaPenyakit, penyakitValid, ruteHasil } from "@/lib/sistemPakar";

const route = useRoute();
const router = useRouter();

const id = computed(() => (penyakitValid(route.query.id) && route.query.id !== "P0" ? route.query.id : null));
const daftarGejala = computed(() => id.value
    ? [...gejalaPenyakit(id.value), { id: ID_DUA_MINGGU, gejala: "Sudah dialami selama 2 minggu atau lebih", pertanyaan: "Gejala-gejala di atas sudah saya alami selama minimal 2 minggu." }]
    : []);

const dicentang = ref([]);
const kurang = ref(null);
const kotakHasil = ref(null);

watch(id, () => {
    dicentang.value = [];
    kurang.value = null;
});

async function periksa() {
    const jawaban = daftarGejala.value.map((g) => ({ id: g.id, jawaban: dicentang.value.includes(g.id) ? "ya" : "tidak" }));

    // hipotesis terbukti jika semua gejala dan syarat 2 minggu terpenuhi
    if (jawaban.every((j) => j.jawaban === "ya")) {
        router.push(ruteHasil(catatHasil(id.value, "Backward Chaining", jawaban)));
        return;
    }

    kurang.value = jawaban.filter((j) => j.jawaban === "tidak").map((j) => (j.id === ID_DUA_MINGGU ? "Durasi minimal 2 minggu" : GEJALA[j.id].gejala));
    await nextTick();
    kotakHasil.value?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
</script>

<template>
    <div class="container narrow quiz">
        <header class="page-head" style="padding-top: 8px;">
            <span class="eyebrow">Backward Chaining</span>
            <h1>Pilih gangguan yang ingin diperiksa</h1>
            <p>Sistem akan memeriksa apakah gejala dari gangguan tersebut terpenuhi.</p>
        </header>

        <nav class="chips" aria-label="Pilih gangguan">
            <RouterLink v-for="k in daftarPenyakit()" :key="k" class="chip" :class="{ aktif: k === id }" :to="{ query: { id: k } }">
                {{ PENYAKIT[k].nama }}
            </RouterLink>
        </nav>

        <p v-if="!id" class="empty">Pilih salah satu gangguan di atas terlebih dahulu.</p>

        <div v-else class="card">
            <h2>{{ PENYAKIT[id].nama }}</h2>
            <p class="muted">{{ PENYAKIT[id].deskripsi }}</p>
            <form @submit.prevent="periksa">
                <h3>Centang gejala yang anda alami:</h3>
                <div class="check-list">
                    <label v-for="g in daftarGejala" :key="g.id" class="check">
                        <input v-model="dicentang" type="checkbox" :value="g.id">
                        <span>
                            <strong>{{ g.gejala }}</strong>
                            <small>{{ g.pertanyaan }}</small>
                        </span>
                    </label>
                </div>
                <button class="btn btn-primary btn-lg" type="submit">Periksa</button>
            </form>

            <div v-if="kurang" ref="kotakHasil" class="result-inline" role="status">
                <h3>Hipotesis belum terbukti</h3>
                <p>Gejala untuk <strong>{{ PENYAKIT[id].nama }}</strong> belum terpenuhi semuanya. Yang belum terpenuhi:</p>
                <ul>
                    <li v-for="k in kurang" :key="k">{{ k }}</li>
                </ul>
                <p>Coba periksa gangguan lain, atau gunakan <RouterLink to="/forward">Forward Chaining</RouterLink> untuk ditelusuri dari gejala.</p>
            </div>
        </div>
    </div>
</template>
