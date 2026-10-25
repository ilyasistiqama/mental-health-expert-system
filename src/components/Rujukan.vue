<script setup>
import { computed } from "vue";
import { SUMBER } from "@/lib/sistemPakar";

const props = defineProps({
    ids: { type: Array, required: true }
});

const daftar = computed(() => props.ids.filter((id) => SUMBER[id]).map((id) => SUMBER[id]).sort((a, b) => a.nomor - b.nomor));
</script>

<template>
    <sup v-if="daftar.length" class="ml-0.5 text-[.7em] font-bold whitespace-nowrap">
        [<template v-for="(s, i) in daftar" :key="s.id"><RouterLink :to="{ path: '/sumber', hash: `#${s.id}` }" :title="s.judul" class="no-underline hover:underline">{{ s.nomor }}</RouterLink><template v-if="i < daftar.length - 1">, </template></template>]
    </sup>
</template>
