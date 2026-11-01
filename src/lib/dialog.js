import { shallowRef } from "vue";

// dialog konfirmasi yang sedang tampil; dirender oleh ConfirmationDialog.vue di App.vue
export const activeDialog = shallowRef(null);

// pengganti confirm() bawaan browser, mengembalikan Promise<boolean>
export function confirmAction({ title, message, yes = "Ya", no = "Batal", danger = false }) {
    // jika masih ada dialog terbuka, anggap dibatalkan lalu ganti dengan yang baru
    activeDialog.value?.resolve(false);
    return new Promise((resolve) => {
        activeDialog.value = {
            title,
            message,
            yes,
            no,
            danger,
            resolve: (answers) => {
                activeDialog.value = null;
                resolve(answers);
            }
        };
    });
}
