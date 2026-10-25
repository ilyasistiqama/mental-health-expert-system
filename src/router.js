import { createRouter, createWebHashHistory } from "vue-router";

const JUDUL = "Sistem Pakar Kecemasan";

// hash history (#/konsultasi) supaya bisa langsung dibuka di hosting/Apache biasa tanpa konfigurasi rewrite
const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: "/", component: () => import("./views/BerandaView.vue"), meta: { menu: "home", judul: "Sistem Pakar Gangguan Kecemasan" } },
        { path: "/artikel", component: () => import("./views/ArtikelView.vue"), meta: { menu: "artikel", judul: `Artikel · ${JUDUL}` } },
        { path: "/konsultasi", component: () => import("./views/KonsultasiView.vue"), meta: { menu: "konsultasi", judul: `Konsultasi · ${JUDUL}` } },
        { path: "/forward", component: () => import("./views/ForwardView.vue"), meta: { menu: "konsultasi", judul: `Forward Chaining · ${JUDUL}` } },
        { path: "/backward", component: () => import("./views/BackwardView.vue"), meta: { menu: "konsultasi", judul: `Backward Chaining · ${JUDUL}` } },
        { path: "/hasil", component: () => import("./views/HasilView.vue"), meta: { menu: "konsultasi", judul: `Hasil Konsultasi · ${JUDUL}` } },
        { path: "/:pathMatch(.*)*", redirect: "/" }
    ],
    scrollBehavior: () => ({ top: 0 })
});

router.afterEach((to) => {
    document.title = to.meta.judul ?? JUDUL;
});

export default router;
