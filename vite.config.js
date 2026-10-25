import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// membuang skrip pengalih ke dist/ dari index.html sumber saat build
const hapusPetunjukSumber = {
    name: "hapus-petunjuk-sumber",
    apply: "build",
    transformIndexHtml: (html) => html.replace(/\s*<!-- petunjuk-sumber -->[\s\S]*?<!-- \/petunjuk-sumber -->/, "")
};

export default defineConfig({
    // path relatif supaya hasil build bisa ditaruh di subfolder mana pun (termasuk GitHub Pages)
    base: "./",
    plugins: [
        vue(),
        tailwindcss(),
        hapusPetunjukSumber,
        // cache offline lewat service worker
        VitePWA({
            // jangan memuat ulang halaman otomatis saat ada versi baru: hasil konsultasi hanya ada di memori
            registerType: "prompt",
            injectRegister: false,
            manifest: false,
            workbox: {
                // tampilan aplikasi (termasuk pembuat PDF) disimpan penuh agar bisa dibuka offline
                globPatterns: ["**/*.{js,css,html,svg}"],
                navigateFallback: "index.html",
                clientsClaim: true,
                runtimeCaching: [
                    {
                        // basis pengetahuan: selalu ambil versi terbaru saat online, pakai salinan terakhir saat offline
                        urlPattern: ({ url }) => url.pathname.includes("/data/") && url.pathname.endsWith(".json"),
                        handler: "NetworkFirst",
                        options: { cacheName: "sispak-data", networkTimeoutSeconds: 5, cacheableResponse: { statuses: [200] } }
                    },
                    {
                        urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com",
                        handler: "StaleWhileRevalidate",
                        options: { cacheName: "google-fonts-css" }
                    },
                    {
                        urlPattern: ({ url }) => url.origin === "https://fonts.gstatic.com",
                        handler: "CacheFirst",
                        options: {
                            cacheName: "google-fonts",
                            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                            cacheableResponse: { statuses: [0, 200] }
                        }
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url))
        }
    }
});
