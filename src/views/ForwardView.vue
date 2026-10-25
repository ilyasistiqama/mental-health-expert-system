<script setup>
import SesiKonsultasi from "@/components/SesiKonsultasi.vue";
</script>

<template>
    <div class="container narrow quiz">
        <header class="page-head" style="padding-top: 8px;">
            <span class="eyebrow">Forward Chaining</span>
            <h1>Jawab sesuai yang anda alami</h1>
            <p>Sistem mengumpulkan gejala yang anda alami, lalu mencocokkannya dengan seluruh aturan untuk menarik kesimpulan.</p>
        </header>

        <SesiKonsultasi metode="forward" />
    </div>
</template>
