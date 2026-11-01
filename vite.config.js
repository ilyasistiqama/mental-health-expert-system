import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// membuang skrip pengalih ke dist/ dari index.html sumber saat build
const removeSourceRedirect = {
    name: "hapus-petunjuk-sumber",
    apply: "build",
    transformIndexHtml: (html) => html.replace(/\s*<!-- petunjuk-sumber -->[\s\S]*?<!-- \/petunjuk-sumber -->/, "")
};

// GitHub Pages tidak punya fallback SPA. Setiap halaman dibuatkan salinan index.html (artikel.html, dst.)
// sehingga /artikel dilayani dengan status 200; 404.html menjadi cadangan untuk alamat lain.
// Daftar ini harus sama dengan rute di src/router.js.
const PAGE_ROUTES = ["artikel", "konsultasi", "cek-menyeluruh", "cek-gangguan", "hasil", "sumber", "tentang", "faq", "forward", "backward"];
let buildDirectory = "dist";
const copyRoutePages = {
    name: "salin-halaman",
    apply: "build",
    configResolved: (config) => {
        buildDirectory = resolve(config.root, config.build.outDir);
    },
    closeBundle: () => {
        for (const name of [...PAGE_ROUTES, "404"]) {
            copyFileSync(resolve(buildDirectory, "index.html"), resolve(buildDirectory, `${name}.html`));
        }
    }
};

export default defineConfig({
    // relatif supaya hasil build bisa ditaruh di subfolder mana pun; workflow GitHub Pages
    // mengisi BASE_PATH (misalnya /mental-health-expert-system/) agar alamat bersih selalu benar
    base: process.env.BASE_PATH || "./",
    plugins: [
        vue(),
        tailwindcss(),
        removeSourceRedirect,
        copyRoutePages,
        // cache offline lewat service worker
        VitePWA({
            // jangan memuat ulang halaman otomatis saat ada versi baru: hasil konsultasi hanya ada di memori
            registerType: "prompt",
            injectRegister: false,
            manifest: false,
            workbox: {
                cleanupOutdatedCaches: true,
                // tampilan aplikasi disimpan penuh agar bisa dibuka offline
                globPatterns: ["**/*.{js,css,html,svg,woff2}"],
                navigateFallback: "index.html",
                // fallback hanya untuk alamat halaman (/artikel), bukan file seperti data/conditions.json
                navigateFallbackDenylist: [/\/[^/?]+\.[^/?]+(\?.*)?$/],
                clientsClaim: true,
                runtimeCaching: [
                    {
                        // basis pengetahuan: selalu ambil versi terbaru saat online, pakai salinan terakhir saat offline
                        urlPattern: ({ url }) => url.pathname.includes("/data/") && url.pathname.endsWith(".json"),
                        handler: "NetworkFirst",
                        options: { cacheName: "sispak-data", networkTimeoutSeconds: 5, cacheableResponse: { statuses: [200] } }
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
