import { shallowRef } from "vue";

// dialog konfirmasi yang sedang tampil; dirender oleh DialogKonfirmasi.vue di App.vue
export const dialogAktif = shallowRef(null);

// pengganti confirm() bawaan browser, mengembalikan Promise<boolean>
export function konfirmasi({ judul, pesan, ya = "Ya", tidak = "Batal", bahaya = false }) {
    // jika masih ada dialog terbuka, anggap dibatalkan lalu ganti dengan yang baru
    dialogAktif.value?.selesai(false);
    return new Promise((selesai) => {
        dialogAktif.value = {
            judul,
            pesan,
            ya,
            tidak,
            bahaya,
            selesai: (jawaban) => {
                dialogAktif.value = null;
                selesai(jawaban);
            }
        };
    });
}
