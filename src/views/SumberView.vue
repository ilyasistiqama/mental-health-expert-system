<script setup>
import { DAFTAR_SUMBER } from "@/lib/sistemPakar";
</script>

<template>
    <div class="container-page max-w-4xl py-10 sm:py-12 2xl:max-w-4xl">
        <header class="mb-8">
            <span class="eyebrow">Sumber & Rujukan</span>
            <h1 class="mb-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">Daftar pustaka</h1>
            <p class="text-muted">
                Kriteria diagnosis, saran penanganan, dan isi artikel pada sistem ini disusun dari sumber-sumber berikut.
                Nomor di sini sama dengan nomor rujukan [n] di seluruh halaman.
            </p>
        </header>

        <ol class="grid list-none gap-3 p-0">
            <li v-for="s in DAFTAR_SUMBER" :id="s.id" :key="s.id" class="card flex scroll-mt-24 gap-4 p-4 sm:p-5">
                <span class="grid size-8 flex-none place-items-center rounded-lg bg-primary-soft text-sm font-extrabold text-primary-strong">{{ s.nomor }}</span>
                <div class="min-w-0 text-[.95rem]">
                    <p>{{ s.penulis }} ({{ s.tahun }}). <em>{{ s.judul }}</em>. {{ s.penerbit }}.</p>
                    <p v-if="s.url" class="mt-1 text-sm break-all text-muted">
                        <a :href="s.url" target="_blank" rel="noopener">{{ s.url }}</a> · diakses {{ s.diakses }}
                    </p>
                </div>
            </li>
        </ol>

        <div class="mt-8 rounded-2xl bg-warn-soft p-5 text-[.95rem]">
            <p>
                <strong class="text-warn">Catatan:</strong> pertanyaan pada sistem ini merupakan penyederhanaan kriteria diagnosis untuk
                keperluan skrining mandiri dan edukasi, dan belum divalidasi oleh psikolog klinis atau psikiater. Diagnosis hanya dapat
                ditegakkan oleh psikolog klinis atau psikiater melalui pemeriksaan langsung.
            </p>
        </div>
    </div>
</template>
