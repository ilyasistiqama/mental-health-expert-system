import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { muatBasisPengetahuan } from "./lib/sistemPakar";
import "./assets/main.css";

muatBasisPengetahuan()
    .then(() => createApp(App).use(router).mount("#app"))
    .catch((e) => {
        console.error(e);
        document.getElementById("app").innerHTML = `<p class="empty" style="margin: 48px 16px;">Basis pengetahuan gagal dimuat. Periksa file data/penyakit.json dan data/gejala.json.</p>`;
    });
