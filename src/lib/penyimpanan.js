// localStorage bisa diblokir (mode privat, cookie diblokir), jadi semua akses dibungkus try/catch

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
        // abaikan, aplikasi tetap jalan tanpa penyimpanan
    }
}

export function hapus(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        // abaikan
    }
}
