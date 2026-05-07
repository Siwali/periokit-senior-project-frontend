<script setup lang="ts">
import { RouterView } from 'vue-router'
import NotificationToast from './components/NotificationToast.vue'
</script>

<template>
  <NotificationToast />
  <RouterView />
</template>
