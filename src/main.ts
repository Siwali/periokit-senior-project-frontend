// src/main.ts
import { createApp } from "vue";
import { createPinia } from "pinia";
import { DefaultApolloClient } from "@vue/apollo-composable";
import App from "./App.vue";
import { apolloClient } from "./services/apollo-client";
import router from "./router";
import "./assets/style.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.provide(DefaultApolloClient, apolloClient);
app.use(router);

app.mount("#app");
