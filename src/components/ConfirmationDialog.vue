<script setup>
import { t } from "@/lib/i18n";
import { nextTick, ref, watch } from "vue";
import { activeDialog } from "@/lib/dialog";

const element = ref(null);

// <dialog> bawaan HTML sudah mengurus fokus, tombol Esc, dan pembaca layar
watch(activeDialog, async (d) => {
    await nextTick();
    if (d && !element.value?.open) element.value?.showModal();
    if (!d && element.value?.open) element.value.close();
});

function answerQuestion(yes) {
    activeDialog.value?.resolve(yes);
}

// klik di luar kotak dialog = batal
function onBackdropClick(e) {
    if (e.target === element.value) answerQuestion(false);
}
</script>

<template>
    <dialog
        ref="element"
        class="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm open:animate-enter"
        aria-labelledby="dialog-judul"
        aria-describedby="dialog-pesan"
        @cancel.prevent="answerQuestion(false)"
        @click="onBackdropClick"
    >
        <div v-if="activeDialog" class="p-6">
            <h2 id="dialog-judul" class="mb-2 text-xl font-extrabold">{{ t(activeDialog.title) }}</h2>
            <p id="dialog-pesan" class="mb-6 text-muted">{{ t(activeDialog.message) }}</p>
            <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button class="btn btn-ghost" type="button" autofocus @click="answerQuestion(false)">{{ t(activeDialog.no) }}</button>
                <button
                    class="btn"
                    :class="activeDialog.danger ? 'border-no bg-no text-surface hover:opacity-90' : 'btn-primary'"
                    type="button"
                    @click="answerQuestion(true)"
                >
                    {{ t(activeDialog.yes) }}
                </button>
            </div>
        </div>
    </dialog>
</template>
