<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const menu = computed(() => route.meta.menu);
const tahun = new Date().getFullYear();
</script>

<template>
    <header class="nav">
        <div class="container nav-inner">
            <RouterLink class="brand" to="/">
                <svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
                    <rect width="32" height="32" rx="10" />
                    <path d="M7 18c2.6-4.5 5.4-4.5 8 0s5.4 4.5 10-1.5" fill="none" stroke-width="2.6" stroke-linecap="round" />
                </svg>
                Sistem Pakar Kecemasan
            </RouterLink>
            <nav class="nav-links" aria-label="Menu utama">
                <RouterLink to="/" :class="{ aktif: menu === 'home' }">Beranda</RouterLink>
                <RouterLink to="/artikel" :class="{ aktif: menu === 'artikel' }">Artikel</RouterLink>
                <RouterLink to="/konsultasi" :class="{ aktif: menu === 'konsultasi' }">Konsultasi</RouterLink>
            </nav>
        </div>
    </header>

    <main>
        <RouterView />
    </main>

    <footer class="footer">
        <div class="container">
            <p>Sistem pakar ini bersifat edukatif dan <strong>bukan pengganti diagnosis</strong> dari psikolog atau psikiater.</p>
            <p>Jika anda merasa dalam kondisi darurat, hubungi layanan kesehatan jiwa <strong>119 ext 8</strong> atau fasilitas kesehatan terdekat.</p>
            <p>&copy; {{ tahun }} Sistem Pakar Gangguan Kecemasan</p>
        </div>
    </footer>
</template>
