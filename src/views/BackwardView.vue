<script setup>
import { t } from "@/lib/i18n";
import { computed } from "vue";
import { useRoute } from "vue-router";
import ConsultationSession from "@/components/ConsultationSession.vue";
import { CONDITIONS, listConditions } from "@/lib/knowledgeBase";

const route = useRoute();
const target = computed(() => (listConditions().includes(route.query.id) ? route.query.id : null));
</script>

<template>
    <div class="container-page max-w-3xl py-8 sm:py-10 2xl:max-w-3xl">
        <header class="mb-6">
            <span class="eyebrow">{{ t("Skrining Topik Tertentu") }}</span>
            <h1 class="mb-3 text-3xl font-extrabold sm:text-4xl">{{ t("Pilih topik yang ingin anda skrining") }}</h1>
            <p class="text-muted">{{ t("Pilih satu topik untuk mengenali keluhan yang ingin anda bicarakan dengan profesional. Memilih topik tidak berarti anda memiliki gangguan tersebut.") }}</p>
        </header>

        <nav class="mb-7 flex flex-wrap gap-2" :aria-label="t('Pilih topik')">
            <RouterLink
                v-for="k in listConditions()"
                :key="k"
                :to="{ query: { id: k } }"
                class="rounded-full border px-4 py-2 text-[.95rem] font-semibold no-underline transition"
                :class="k === target ? 'border-primary bg-primary text-on-primary' : 'border-line bg-surface text-ink hover:border-primary'"
                :aria-current="k === target ? 'true' : undefined"
            >
                {{ t(CONDITIONS[k].name) }}
            </RouterLink>
        </nav>

        <p v-if="!target" class="empty">{{ t("Pilih salah satu topik di atas untuk mulai skrining.") }}</p>

        <template v-else>
            <section class="card mb-5">
                <span class="eyebrow">{{ t("Topik skrining") }}</span>
                <h2 class="mb-2 text-xl font-extrabold">{{ t(CONDITIONS[target].name) }}</h2>
                <p class="text-muted">{{ t("Topik ini hanya mengarahkan pertanyaan. Skrining tidak memastikan diagnosis, dan anda dapat mencari bantuan profesional tanpa menyelesaikannya.") }}</p>
            </section>

            <ConsultationSession :key="target" method="backward" :target="target" />
        </template>
    </div>
</template>
