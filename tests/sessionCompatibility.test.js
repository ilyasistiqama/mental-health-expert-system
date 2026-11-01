import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeStoredSession, encodeStoredSession } from "../src/lib/sessionCompatibility.js";

const legacy = { metode: "backward", target: "P2", fakta: { G02: true }, durasi: { P2: 180 }, urutan: ["G02", "durasi:P2"], acak: ["G02", "G18"], usia: "remaja" };
const current = { method: "backward", target: "P2", facts: { G02: true }, duration: { P2: 180 }, order: ["G02", "duration:P2"], questionOrder: ["G02", "G18"], ageGroup: "minor" };

test("Legacy progress retains answers, order, duration, and minor notice", () => {
    const original = structuredClone(legacy);
    assert.deepEqual(decodeStoredSession(legacy), current);
    assert.deepEqual(legacy, original);
    assert.deepEqual(encodeStoredSession(current), legacy);
});

test("Current sessions and absent or malformed storage records remain readable", () => {
    assert.deepEqual(decodeStoredSession(current), current);
    assert.equal(decodeStoredSession(undefined), undefined);
    assert.equal(decodeStoredSession(null), null);
    assert.deepEqual(decodeStoredSession({ urutan: 42 }), { order: 42 });
    assert.equal(decodeStoredSession({ usia: "dewasa" }).ageGroup, "adult");
});
