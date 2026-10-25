<script setup>
import { nextTick, ref, watch } from "vue";
import { dialogAktif } from "@/lib/dialog";

const elemen = ref(null);

// <dialog> bawaan HTML sudah mengurus fokus, tombol Esc, dan pembaca layar
watch(dialogAktif, async (d) => {
    await nextTick();
    if (d && !elemen.value?.open) elemen.value?.showModal();
    if (!d && elemen.value?.open) elemen.value.close();
});

function jawab(ya) {
    dialogAktif.value?.selesai(ya);
}

// klik di luar kotak dialog = batal
function klikLatar(e) {
    if (e.target === elemen.value) jawab(false);
}
</script>

<template>
    <dialog
        ref="elemen"
        class="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm open:animate-masuk"
        aria-labelledby="dialog-judul"
        aria-describedby="dialog-pesan"
        @cancel.prevent="jawab(false)"
        @click="klikLatar"
    >
        <div v-if="dialogAktif" class="p-6">
            <h2 id="dialog-judul" class="mb-2 text-xl font-extrabold">{{ dialogAktif.judul }}</h2>
            <p id="dialog-pesan" class="mb-6 text-muted">{{ dialogAktif.pesan }}</p>
            <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button class="btn btn-ghost" type="button" autofocus @click="jawab(false)">{{ dialogAktif.tidak }}</button>
                <button
                    class="btn"
                    :class="dialogAktif.bahaya ? 'border-no bg-no text-surface hover:opacity-90' : 'btn-primary'"
                    type="button"
                    @click="jawab(true)"
                >
                    {{ dialogAktif.ya }}
                </button>
            </div>
        </div>
    </dialog>
</template>
