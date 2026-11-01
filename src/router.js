import { watchEffect } from "vue";
import { t } from "./lib/i18n.js";
import { createRouter, createWebHistory } from "vue-router";
import { BASE_PATH } from "./lib/basePath";
import { SHORT_APP_NAME, APP_NAME } from "./lib/appName";

const PAGE_TITLE = SHORT_APP_NAME;

// alamat bersih (/artikel); GitHub Pages memakai salinan per halaman + 404.html, nginx memakai try_files
const router = createRouter({
    history: createWebHistory(BASE_PATH),
    routes: [
        { path: "/", component: () => import("./views/HomeView.vue"), meta: { menu: "home", title: APP_NAME } },
        { path: "/artikel", component: () => import("./views/ArticlesView.vue"), meta: { menu: "artikel", title: "Artikel" } },
        { path: "/konsultasi", component: () => import("./views/ConsultationView.vue"), meta: { menu: "konsultasi", title: "Skrining" } },
        { path: "/cek-menyeluruh", component: () => import("./views/ForwardView.vue"), meta: { menu: "konsultasi", title: "Skrining Menyeluruh" } },
        { path: "/cek-gangguan", component: () => import("./views/BackwardView.vue"), meta: { menu: "konsultasi", title: "Skrining Topik Tertentu" } },
        { path: "/hasil", component: () => import("./views/ResultView.vue"), meta: { menu: "konsultasi", title: "Hasil Skrining" } },
        { path: "/sumber", component: () => import("./views/ReferencesView.vue"), meta: { menu: "sumber", title: "Sumber & Rujukan" } },
        { path: "/tentang", component: () => import("./views/AboutView.vue"), meta: { menu: "tentang", title: "Tentang & Batasan" } },
        { path: "/faq", component: () => import("./views/FaqView.vue"), meta: { menu: "faq", title: "Pertanyaan yang sering diajukan" } },
        // alamat lama tetap bisa dibuka
        { path: "/forward", redirect: "/cek-menyeluruh" },
        { path: "/backward", redirect: (to) => ({ path: "/cek-gangguan", query: to.query }) },
        { path: "/:pathMatch(.*)*", redirect: "/" }
    ],
    // gulir ke anchor (misalnya /sumber#dsm5tr) hanya untuk id yang valid
    scrollBehavior: (to) => (/^#[\w-]+$/.test(to.hash) ? { el: to.hash, top: 80 } : { top: 0 })
});

watchEffect(() => {
    const title = router.currentRoute.value.meta.title ?? PAGE_TITLE;
    if (typeof document !== "undefined") {
        document.title = t(title) + (title === APP_NAME || title === PAGE_TITLE ? "" : ` · ${t(PAGE_TITLE)}`);
    }
});

export default router;
