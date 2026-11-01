<script setup>
import { t } from "@/lib/i18n";
import { computed } from "vue";
import { REFERENCES } from "@/lib/knowledgeBase";

const props = defineProps({
    ids: { type: Array, required: true }
});

const list = computed(() => props.ids.filter((id) => REFERENCES[id]).map((id) => REFERENCES[id]).sort((a, b) => a.number - b.number));
</script>

<template>
    <sup v-if="list.length" class="ml-0.5 text-[.7em] font-bold whitespace-nowrap">
        [<template v-for="(s, i) in list" :key="s.id"><RouterLink :to="{ path: '/sumber', hash: t(&quot;#{0}&quot;, [s.id]) }" :title="s.title" class="no-underline hover:underline">{{ s.number }}</RouterLink><template v-if="i < list.length - 1">, </template></template>]
    </sup>
</template>
