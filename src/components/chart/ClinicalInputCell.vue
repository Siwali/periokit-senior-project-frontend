<script setup lang="ts">
import { computed } from "vue";

interface Props {
  toothNumber: number | string;
  sitePosition: number; // 0, 1, 2
  fieldName: string;
  value: any;
  inputType: "numeric" | "toggle";
  validationState?: "valid" | "invalid" | "none";
  disabled?: boolean;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  validationState: "none",
  disabled: false,
  readonly: false,
});

const emit = defineEmits<{
  (e: "change", value: any): void;
}>();

// Determine if the text should be red (clinical threshold)
const isCriticalValue = computed(() => {
  if (props.inputType !== "numeric") return false;
  const val = parseInt(String(props.value));
  return !isNaN(val) && val >= 4;
});

const handleInput = (event: Event) => {
  if (props.disabled || props.readonly) return;
  const target = event.target as HTMLInputElement;
  emit("change", target.value);
};

const handleToggle = () => {
  if (props.disabled || props.readonly) return;
  emit("change", !props.value);
};

// Background colors for toggle fields
const toggleColorClass = computed(() => {
  if (props.inputType !== "toggle" || !props.value) return "";

  const name = props.fieldName.toLowerCase();
  if (name.includes("bop")) return "bg-red-500 shadow-inner";
  if (name.includes("pi") || name.includes("plaque"))
    return "bg-blue-500 shadow-inner";
  if (name.includes("suppuration")) return "bg-yellow-500 shadow-inner";

  return "bg-slate-500";
});

const containerClasses = computed(() => ({
  "opacity-50 pointer-events-none": props.disabled,
  "bg-slate-50/50": props.readonly,
  "ring-1 ring-inset ring-red-400 bg-red-50/50":
    props.validationState === "invalid",
  "hover:bg-slate-50/80":
    !props.disabled && !props.readonly && props.inputType === "numeric",
}));
</script>

<template>
  <div
    class="relative flex-1 h-full min-h-[24px] transition-all duration-200 border-r border-slate-100 last:border-r-0 group"
    :class="containerClasses"
  >
    <!-- Numeric Input -->
    <template v-if="inputType === 'numeric'">
      <input
        type="text"
        :value="value"
        :disabled="disabled"
        :readonly="readonly"
        @input="handleInput"
        class="w-full h-full text-center text-[10px] outline-none bg-transparent transition-colors focus:bg-white focus:ring-1 focus:ring-[#0052ff] focus:ring-inset z-10"
        :class="[
          isCriticalValue ? 'text-red-600 font-extrabold' : 'text-slate-700',
          readonly ? 'font-bold cursor-default' : 'cursor-text font-medium',
        ]"
      />
    </template>

    <!-- Toggle Input -->
    <template v-else-if="inputType === 'toggle'">
      <div
        @click="handleToggle"
        class="w-full h-full cursor-pointer transition-all duration-150 flex items-center justify-center"
        :class="[toggleColorClass, !value ? 'hover:bg-slate-100/50' : '']"
      ></div>
    </template>

    <!-- Focus Indicator (Subtle) -->
    <div
      v-if="!disabled && !readonly"
      class="absolute inset-0 border-b-2 border-transparent group-focus-within:border-[#0052ff] pointer-events-none transition-colors"
    ></div>
  </div>
</template>

<style scoped>
.group:focus-within {
  z-index: 20;
}
</style>
