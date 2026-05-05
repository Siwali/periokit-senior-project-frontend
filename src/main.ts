// src/main.ts
import { createApp } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import App from './App.vue'
import { apolloClient } from './services/apollo-client'
import router from './router'
import './assets/style.css'

const app = createApp(App)

app.provide(DefaultApolloClient, apolloClient)
app.use(router)

app.mount('#app')
