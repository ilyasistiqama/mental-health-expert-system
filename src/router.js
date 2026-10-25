import { createRouter, createWebHashHistory } from "vue-router";

const JUDUL = "Sistem Pakar Kecemasan";

// hash history (#/konsultasi) supaya bisa langsung dibuka di hosting/Apache/GitHub Pages tanpa konfigurasi rewrite
const router = createRouter({
    history: createWebHashHistory(),
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
    scrollBehavior: (to) => (to.hash && !to.hash.startsWith("#/") ? { el: to.hash, top: 80 } : { top: 0 })
});

router.afterEach((to) => {
    document.title = to.meta.judul ?? JUDUL;
});

export default router;
