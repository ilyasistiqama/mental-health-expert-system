import { ref, watch } from "vue";
import englishMessages from "../locales/en.json" with { type: "json" };

export const SUPPORTED_LANGUAGES = [
    { code: "id", flag: "🇮🇩", label: "Bahasa Indonesia" },
    { code: "en", flag: "🇬🇧", label: "English" }
];
const LANGUAGE_KEY = "sispak.language";
const normalize = text => text.trim().replace(/\s+/g, " ");
const english = Object.fromEntries(Object.entries(englishMessages).map(([key, value]) => [normalize(key), value]));

export function readLanguage(storage) {
    try { return storage?.getItem(LANGUAGE_KEY) === "en" ? "en" : "id"; } catch { return "id"; }
}

function browserStorage() {
    try { return globalThis.localStorage; } catch { return undefined; }
}

export const language = ref(readLanguage(browserStorage()));

export function setLanguage(code) {
    if (!SUPPORTED_LANGUAGES.some(option => option.code === code)) return;
    language.value = code;
    try { browserStorage()?.setItem(LANGUAGE_KEY, code); } catch { /* App remains usable if preferences cannot be saved. */ }
}

// Translation changes presentation only. Codes, rules, answers, and progress stay unchanged.
export function translate(message, values = [], code = language.value) {
    if (Array.isArray(message)) return message.map(item => translate(item, [], code));
    if (typeof message !== "string") return message;
    const template = code === "en" ? (english[normalize(message)] ?? message) : message;
    return template.replace(/\{(\d+)\}/g, (placeholder, index) => {
        const value = values[Number(index)];
        return value === undefined ? placeholder : String(translate(value, [], code));
    });
}
export const t = translate;
export function getDateLocale() { return language.value === "en" ? "en-GB" : "id-ID"; }

watch(language, code => {
    if (typeof document !== "undefined") document.documentElement.lang = code;
}, { immediate: true });
