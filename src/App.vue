<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import DialogKonfirmasi from "@/components/DialogKonfirmasi.vue";
import { adaVersiBaru, pakaiVersiBaru } from "@/lib/offline";

const route = useRoute();
const menu = computed(() => route.meta.menu);
const tahun = new Date().getFullYear();

const daftarMenu = [
    { id: "home", ke: "/", label: "Beranda" },
    { id: "artikel", ke: "/artikel", label: "Artikel" },
    { id: "konsultasi", ke: "/konsultasi", label: "Konsultasi" },
    { id: "sumber", ke: "/sumber", label: "Sumber" }
];
</script>

<template>
    <header class="sticky top-0 z-10 border-b border-line bg-bg/85 backdrop-blur-md print:hidden">
        <div class="container-page flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 md:h-16 md:py-0">
            <RouterLink class="inline-flex items-center gap-2.5 font-extrabold tracking-tight text-ink no-underline" to="/">
                <svg class="size-8 flex-none" viewBox="0 0 32 32" aria-hidden="true">
                    <rect class="fill-primary" width="32" height="32" rx="10" />
                    <path class="stroke-on-primary" d="M7 18c2.6-4.5 5.4-4.5 8 0s5.4 4.5 10-1.5" fill="none" stroke-width="2.6" stroke-linecap="round" />
                </svg>
                Sistem Pakar Kecemasan
            </RouterLink>
            <nav class="-mx-1 flex w-full gap-1 overflow-x-auto md:mx-0 md:w-auto" aria-label="Menu utama">
                <RouterLink
                    v-for="m in daftarMenu"
                    :key="m.id"
                    :to="m.ke"
                    class="flex-1 rounded-full px-3 py-2 text-center text-sm font-semibold whitespace-nowrap no-underline transition md:flex-none md:px-4 md:text-[.95rem]"
                    :class="menu === m.id ? 'bg-primary-soft text-primary-strong' : 'text-muted hover:bg-surface-2 hover:text-ink'"
                    :aria-current="menu === m.id ? 'page' : undefined"
                >
                    {{ m.label }}
                </RouterLink>
            </nav>
        </div>
    </header>

    <!-- disembunyikan di halaman hasil: memuat ulang akan menghapus hasil yang hanya ada di memori -->
    <div v-if="adaVersiBaru && route.path !== '/hasil'" class="border-b border-line bg-primary-soft print:hidden" role="status">
        <div class="container-page flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
            <span>Versi baru sistem tersedia. Jawaban anda tetap tersimpan.</span>
            <button class="btn btn-primary px-4 py-1.5 text-sm" type="button" @click="pakaiVersiBaru">Perbarui</button>
        </div>
    </div>

    <main class="flex-1">
        <RouterView />
    </main>

    <footer class="border-t border-line py-8 text-sm text-muted print:hidden">
        <div class="container-page space-y-1.5">
            <p>Sistem pakar ini bersifat edukatif dan <strong class="text-ink">bukan pengganti diagnosis</strong> dari psikolog klinis atau psikiater.</p>
            <p>
                Butuh bantuan segera? Hubungi layanan kesehatan jiwa Kemenkes <strong class="text-ink">119 ext 8</strong>
                (<a href="https://www.healing119.id/" target="_blank" rel="noopener">healing119.id</a>) atau fasilitas kesehatan terdekat.
            </p>
            <p>
                &copy; {{ tahun }} Sistem Pakar Gangguan Kecemasan · <RouterLink to="/tentang">Tentang & batasan</RouterLink> ·
                <RouterLink to="/sumber">Sumber & rujukan</RouterLink>
            </p>
        </div>
    </footer>

    <DialogKonfirmasi />
</template>
