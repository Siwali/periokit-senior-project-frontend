// src/main.ts
import { createApp } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import App from './App.vue'
import { apolloClient } from '../apollo-client'
import './style.css' // (ถ้ามี)

const app = createApp(App)

// Provide Apollo Client ให้กับโปรเจกต์ Vue
app.provide(DefaultApolloClient, apolloClient)

app.mount('#app')
