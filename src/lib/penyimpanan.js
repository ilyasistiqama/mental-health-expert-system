// Progres konsultasi (jawaban yang belum selesai) disimpan di IndexedDB perangkat pengguna.
// IndexedDB dengan durability "strict" menjamin data sudah tertulis ke disk sebelum dianggap
// tersimpan, sehingga progres tidak hilang walaupun browser ditutup paksa (localStorage ditulis
// ke disk secara tertunda dan bisa hilang). Hasil diagnosa tidak pernah disimpan.

const NAMA_DB = "sispak";
const STORE = "sesi";

let db = null;

function buka() {
    return new Promise((ok, gagal) => {
        const permintaan = indexedDB.open(NAMA_DB, 1);
        permintaan.onupgradeneeded = () => permintaan.result.createObjectStore(STORE);
        permintaan.onsuccess = () => ok(permintaan.result);
        permintaan.onerror = () => gagal(permintaan.error);
        permintaan.onblocked = () => gagal(new Error("IndexedDB diblokir"));
    });
}

function transaksi(mode, kerja) {
    return new Promise((ok, gagal) => {
        const tx = db.transaction(STORE, mode, { durability: "strict" });
        const hasil = kerja(tx.objectStore(STORE));
        tx.oncomplete = () => ok(hasil?.result);
        tx.onerror = () => gagal(tx.error);
        tx.onabort = () => gagal(tx.error);
    });
}

// membuka database dan memastikan bisa menulis; false jika penyimpanan diblokir browser
export async function siapkanPenyimpanan() {
    try {
        if (!globalThis.indexedDB) return false;
        db = await buka();
        await simpan("sispak.cek", 1);
        await hapus("sispak.cek");
        return true;
    } catch (e) {
        return false;
    }
}

export function baca(key) {
    return transaksi("readonly", (store) => store.get(key)).catch(() => undefined);
}

export function simpan(key, nilai) {
    return transaksi("readwrite", (store) => store.put(nilai, key));
}

export function hapus(key) {
    return transaksi("readwrite", (store) => store.delete(key));
}

// Versi sebelumnya menyimpan progres dan riwayat hasil di localStorage. Progres dipindahkan,
// sedangkan riwayat hasil dihapus karena hasil diagnosa bersifat rahasia.
export async function bersihkanDataLama(kunciSesi) {
    let localStorageAman;
    try {
        localStorageAman = globalThis.localStorage;
        localStorageAman?.getItem("x");
    } catch (e) {
        return;
    }
    if (!localStorageAman) return;

    for (const kunci of kunciSesi) {
        try {
            const lama = localStorageAman.getItem(kunci);
            if (lama && (await baca(kunci)) === undefined) {
                await simpan(kunci, JSON.parse(lama));
            }
        } catch (e) {
            // data lama rusak, abaikan
        }
        localStorageAman.removeItem(kunci);
    }
    localStorageAman.removeItem("sispak.riwayat");
}
