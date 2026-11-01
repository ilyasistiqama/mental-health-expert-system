// Progres konsultasi (jawaban yang belum selesai) disimpan di IndexedDB perangkat pengguna.
// IndexedDB dengan durability "strict" menjamin data sudah tertulis ke disk sebelum dianggap
// tersimpan, sehingga progres tidak hilang walaupun browser ditutup paksa (localStorage ditulis
// ke disk secara tertunda dan bisa hilang). Hasil skrining tidak pernah disimpan.

const DATABASE_NAME = "sispak";
const STORE = "sesi";

let db = null;

function openDatabase() {
    return new Promise((ok, reject) => {
        const request = indexedDB.open(DATABASE_NAME, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE);
        request.onsuccess = () => ok(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error("IndexedDB diblokir"));
    });
}

function runTransaction(mode, operation) {
    return new Promise((ok, reject) => {
        const tx = db.transaction(STORE, mode, { durability: "strict" });
        const result = operation(tx.objectStore(STORE));
        tx.oncomplete = () => ok(result?.result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
}

// membuka database dan memastikan bisa menulis; false jika penyimpanan diblokir browser
export async function initializeStorage() {
    try {
        if (!globalThis.indexedDB) return false;
        db = await openDatabase();
        await write("sispak.cek", 1);
        await remove("sispak.cek");
        return true;
    } catch (e) {
        return false;
    }
}

export function read(key) {
    return runTransaction("readonly", (store) => store.get(key)).catch(() => undefined);
}

export function write(key, value) {
    return runTransaction("readwrite", (store) => store.put(value, key));
}

export function remove(key) {
    return runTransaction("readwrite", (store) => store.delete(key));
}

// Versi sebelumnya menyimpan progres dan riwayat hasil di localStorage. Progres dipindahkan,
// sedangkan riwayat hasil dihapus karena hasil skrining bersifat rahasia.
export async function migrateLegacyStorage(sessionKeys) {
    let availableLocalStorage;
    try {
        availableLocalStorage = globalThis.localStorage;
        availableLocalStorage?.getItem("x");
    } catch (e) {
        return;
    }
    if (!availableLocalStorage) return;

    for (const key of sessionKeys) {
        try {
            const legacy = availableLocalStorage.getItem(key);
            if (legacy && (await read(key)) === undefined) {
                await write(key, JSON.parse(legacy));
            }
        } catch (e) {
            // data lama rusak, abaikan
        }
        availableLocalStorage.removeItem(key);
    }
    availableLocalStorage.removeItem("sispak.riwayat");
}
