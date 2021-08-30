import "./registerServiceWorker";

import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";
import { store, storeKey } from "./store";

const app = createApp(App);

app.use(store, storeKey);
app.use(router);

app.mount("#app");
