<script setup>
import { t } from "@/lib/i18n";
import { computed } from "vue";
import { useRoute } from "vue-router";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";
import ConfirmationDialog from "@/components/ConfirmationDialog.vue";
import { SHORT_APP_NAME, APP_NAME } from "@/lib/appName";
import { updateAvailable, applyUpdate } from "@/lib/offline";

const route = useRoute();
const menu = computed(() => route.meta.menu);
const year = new Date().getFullYear();

const menuItems = [
    { id: "home", to: "/", label: "Beranda" },
    { id: "artikel", to: "/artikel", label: "Artikel" },
    { id: "konsultasi", to: "/konsultasi", label: "Skrining" },
    { id: "sumber", to: "/sumber", label: "Sumber" }
];
</script>

<template>
    <header class="sticky top-0 z-10 border-b border-line bg-bg/85 backdrop-blur-md print:hidden">
        <div class="container-page flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 md:min-h-16">
            <RouterLink class="inline-flex items-center gap-2.5 font-extrabold tracking-tight text-ink no-underline" to="/">
                <svg class="size-8 flex-none" viewBox="0 0 32 32" aria-hidden="true">
                    <rect class="fill-primary" width="32" height="32" rx="10" />
                    <path class="stroke-on-primary" d="M7 18c2.6-4.5 5.4-4.5 8 0s5.4 4.5 10-1.5" fill="none" stroke-width="2.6" stroke-linecap="round" />
                </svg>
                {{ t(SHORT_APP_NAME) }}
            </RouterLink>
            <LanguageSwitcher class="lg:order-last" />
            <nav class="order-last -mx-1 flex w-full gap-1 overflow-x-auto lg:order-none lg:mx-0 lg:w-auto" :aria-label="t(&quot;Menu utama&quot;)">
                <RouterLink
                    v-for="m in menuItems"
                    :key="m.id"
                    :to="m.to"
                    class="flex-1 rounded-full px-3 py-2 text-center text-sm font-semibold whitespace-nowrap no-underline transition md:flex-none md:px-4 md:text-[.95rem]"
                    :class="menu === m.id ? 'bg-primary-soft text-primary-strong' : 'text-muted hover:bg-surface-2 hover:text-ink'"
                    :aria-current="menu === m.id ? 'page' : undefined"
                >
                    {{ t(m.label) }}
                </RouterLink>
            </nav>
        </div>
    </header>

    <!-- disembunyikan di halaman hasil: memuat ulang akan menghapus hasil yang hanya ada di memori -->
    <div v-if="updateAvailable && route.path !== '/hasil'" class="border-b border-line bg-primary-soft print:hidden" role="status">
        <div class="container-page flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
            <span>{{ t("Versi baru tersedia. Pembaruan pertanyaan dapat mengharuskan anda memulai skrining baru.") }}</span>
            <button class="btn btn-primary px-4 py-1.5 text-sm" type="button" @click="applyUpdate">{{ t("Perbarui") }}</button>
        </div>
    </div>

    <main class="flex-1">
        <RouterView />
    </main>

    <footer class="border-t border-line py-8 text-sm text-muted print:hidden">
        <div class="container-page space-y-1.5">
            <p>{{ t("Sistem ini hanya untuk skrining awal dan edukasi, bukan diagnosis atau penilaian atas diri anda. Hasil tidak memberi label penyakit dan tidak menggantikan pemeriksaan profesional.") }}</p>
            <p>
                {{ t("Butuh bantuan segera? Hubungi layanan kesehatan jiwa Kemenkes") }} <strong class="text-ink">119 ext 8</strong>
                (<a href="https://www.healing119.id/" target="_blank" rel="noopener">healing119.id</a>{{ t(") atau fasilitas kesehatan terdekat.") }}
            </p>
            <p>
                &copy; {{ t(year) }} {{ t(APP_NAME) }} · <RouterLink to="/tentang">{{ t("Tentang & batasan") }}</RouterLink> ·
                <RouterLink to="/sumber">{{ t("Sumber & rujukan") }}</RouterLink> ·
                <RouterLink to="/faq">{{ t("Baca FAQ") }}</RouterLink>
            </p>
        </div>
    </footer>

    <ConfirmationDialog />
</template>
