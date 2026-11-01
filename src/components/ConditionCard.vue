<script setup>
import { t } from "@/lib/i18n";
import ReferenceLink from "@/components/ReferenceLink.vue";
import { CONDITIONS } from "@/lib/knowledgeBase";

const props = defineProps({
    id: { type: String, required: true }
});

const conditions = CONDITIONS[props.id];
</script>

<template>
    <article class="card flex flex-col">
        <div class="mb-3 flex flex-wrap gap-1.5">
            <span class="pill bg-accent-soft text-accent">{{ t(id) }}</span>
            <span class="pill bg-surface-2 text-muted">{{ t(conditions.category) }}</span>
        </div>
        <h3 class="mb-2 text-lg font-bold">{{ t(conditions.name) }}</h3>
        <p class="mb-4 flex-1 text-[.95rem] text-muted">
            {{ t(conditions.description) }}<ReferenceLink :ids="conditions.references.slice(0, 2)" />
        </p>
        <RouterLink class="font-bold no-underline hover:underline" :to="{ path: '/cek-gangguan', query: { id } }">
            {{ t("Skrining topik ini →") }}
        </RouterLink>
    </article>
</template>
