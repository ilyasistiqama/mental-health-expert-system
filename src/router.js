import { createRouter, createWebHistory } from "vue-router";
import { BASIS } from "./lib/basis";

const JUDUL = "Sistem Pakar Kecemasan";

// alamat bersih (/artikel); GitHub Pages memakai 404.html dan Apache memakai .htaccess sebagai fallback
const router = createRouter({
    history: createWebHistory(BASIS),
    routes: [
        { path: "/", component: () => import("./views/BerandaView.vue"), meta: { menu: "home", judul: "Sistem Pakar Gangguan Kecemasan" } },
        { path: "/artikel", component: () => import("./views/ArtikelView.vue"), meta: { menu: "artikel", judul: `Artikel · ${JUDUL}` } },
        { path: "/konsultasi", component: () => import("./views/KonsultasiView.vue"), meta: { menu: "konsultasi", judul: `Konsultasi · ${JUDUL}` } },
        { path: "/cek-menyeluruh", component: () => import("./views/ForwardView.vue"), meta: { menu: "konsultasi", judul: `Cek Menyeluruh · ${JUDUL}` } },
        { path: "/cek-gangguan", component: () => import("./views/BackwardView.vue"), meta: { menu: "konsultasi", judul: `Cek Gangguan Tertentu · ${JUDUL}` } },
        { path: "/hasil", component: () => import("./views/HasilView.vue"), meta: { menu: "konsultasi", judul: `Hasil Konsultasi · ${JUDUL}` } },
        { path: "/sumber", component: () => import("./views/SumberView.vue"), meta: { menu: "sumber", judul: `Sumber & Rujukan · ${JUDUL}` } },
        // alamat lama tetap bisa dibuka
        { path: "/forward", redirect: "/cek-menyeluruh" },
        { path: "/backward", redirect: (to) => ({ path: "/cek-gangguan", query: to.query }) },
        { path: "/:pathMatch(.*)*", redirect: "/" }
    ],
    // gulir ke anchor (misalnya /sumber#dsm5tr) hanya untuk id yang valid
    scrollBehavior: (to) => (/^#[\w-]+$/.test(to.hash) ? { el: to.hash, top: 80 } : { top: 0 })
});

router.afterEach((to) => {
    document.title = to.meta.judul ?? JUDUL;
});

export default router;
