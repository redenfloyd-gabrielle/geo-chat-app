import { createApp } from "vue";
import "./style.css";
import "./assets/style-responsive.css"
import App from "./App.vue";
import "leaflet/dist/leaflet.css";
import { createPinia } from "pinia";
import router from "./router";
const app = createApp(App);

app.use(createPinia());
app.use(router);
app.mount("#app");
