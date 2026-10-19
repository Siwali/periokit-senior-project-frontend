<script setup lang="ts">
import { computed, onMounted } from "vue";
import { RouterView, useRoute } from "vue-router";
import NotificationToast from "./components/common/NotificationToast.vue";
import { useAuthStore } from "./stores/auth";

const authStore = useAuthStore();
const route = useRoute();
const isExportRenderer = computed(() => route.meta.exportRenderer === true);

onMounted(async () => {
  if (!isExportRenderer.value && authStore.isAuthenticated) {
    await authStore.fetchProfile();
  }
});
</script>

<template>
  <NotificationToast v-if="!isExportRenderer" />
  <RouterView />
</template>
