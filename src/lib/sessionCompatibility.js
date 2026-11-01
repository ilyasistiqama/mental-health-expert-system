// Batas kompatibilitas: nama lama hanya dipakai untuk format progres browser yang sudah ada.
// Kode aplikasi selalu menerima sesi dengan field bahasa Inggris.
const LEGACY_FIELDS = {
    method: "metode", facts: "fakta", duration: "durasi",
    order: "urutan", questionOrder: "acak", ageGroup: "usia"
};
const CURRENT_FIELDS = Object.fromEntries(Object.entries(LEGACY_FIELDS).map(([current, legacy]) => [legacy, current]));

export function decodeStoredSession(record) {
    if (!record || typeof record !== "object" || Array.isArray(record)) return record;
    const session = Object.fromEntries(Object.entries(record).map(([key, value]) => [CURRENT_FIELDS[key] ?? key, value]));
    if (Array.isArray(session.order)) {
        session.order = session.order.map(key => typeof key === "string" ? key.replace(/^durasi:/, "duration:") : key);
    }
    if (session.ageGroup === "remaja") session.ageGroup = "minor";
    if (session.ageGroup === "dewasa") session.ageGroup = "adult";
    return session;
}

export function encodeStoredSession(session) {
    const record = Object.fromEntries(Object.entries(session).map(([key, value]) => [LEGACY_FIELDS[key] ?? key, value]));
    record["urutan"] = session.order.map(key => key.replace(/^duration:/, "durasi:"));
    if (session.ageGroup) record["usia"] = session.ageGroup === "minor" ? "remaja" : "dewasa";
    return record;
}
