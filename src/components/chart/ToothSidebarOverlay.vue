<script setup lang="ts">
import ToothSidebar from "./ToothSidebar.vue";

defineProps<{
  isOpen: boolean;
  toothId: string | number | null;
  toothData: any;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "update-note", payload: { id: string | number; note: string }): void;
}>();
</script>

<template>
  <Teleport to="body">
    <Transition name="sidebar-focus">
      <aside
        v-if="isOpen && toothId"
        class="fixed top-0 right-0 z-[60] w-[360px] h-full shadow-[-20px_0_50px_-15px_rgba(0,0,0,0.15)]"
      >
        <ToothSidebar
          :toothId="toothId"
          :toothData="toothData"
          @close="emit('close')"
          @update-note="($event) => emit('update-note', $event)"
        />
      </aside>
    </Transition>
  </Teleport>
</template>
