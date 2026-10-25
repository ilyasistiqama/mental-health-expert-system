// localStorage bisa diblokir (mode privat, cookie diblokir), jadi semua akses dibungkus try/catch

export function penyimpananAktif() {
    try {
        const kunci = "sispak.cek";
        localStorage.setItem(kunci, "1");
        const aktif = localStorage.getItem(kunci) === "1";
        localStorage.removeItem(kunci);
        return aktif;
    } catch (e) {
        return false;
    }
}

export function baca(key, fallback) {
    try {
        const nilai = localStorage.getItem(key);
        return nilai ? JSON.parse(nilai) : fallback;
    } catch (e) {
        return fallback;
    }
}

export function simpan(key, nilai) {
    try {
        localStorage.setItem(key, JSON.stringify(nilai));
    } catch (e) {
        // abaikan, misalnya kuota penuh
    }
}

export function hapus(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        // abaikan
    }
}
