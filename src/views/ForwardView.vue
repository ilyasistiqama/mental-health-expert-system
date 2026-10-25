<script setup>
import SesiKonsultasi from "@/components/SesiKonsultasi.vue";
</script>

<template>
    <div class="container-page max-w-3xl py-8 sm:py-10 2xl:max-w-3xl">
        <header class="mb-6">
            <span class="eyebrow">Cek Menyeluruh</span>
            <h1 class="mb-3 text-3xl font-extrabold sm:text-4xl">Jawab sesuai yang anda alami</h1>
            <p class="text-muted">
                Jawab pertanyaan seputar keluhan yang anda rasakan. Sistem akan mencocokkannya dengan kriteria semua gangguan untuk mencari kemungkinan gangguan yang anda alami.
                Beberapa pertanyaan menyinggung pengalaman yang tidak menyenangkan; anda boleh berhenti kapan saja.
            </p>
        </header>

        <SesiKonsultasi metode="forward" />
    </div>
</template>
