<template>
  <button
    type="button"
    class="inline-flex shrink-0 items-center justify-center transition"
    :class="[sizeClass, toneClass, rounded ? 'rounded-md' : 'rounded-none']"
    :aria-label="label"
    :disabled="disabled"
    :title="label"
    @click="emit('click', $event)"
  >
    <UIcon :name="icon" :class="iconClass" />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    icon: string;
    label: string;
    size?: "sm" | "md" | "lg";
    tone?: "light" | "dark" | "muted";
    rounded?: boolean;
    disabled?: boolean;
  }>(),
  {
    size: "md",
    tone: "light",
    rounded: true,
    disabled: false,
  },
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const sizeClass = computed(() => {
  if (props.size === "sm") return "size-5";
  if (props.size === "lg") return "size-8";
  return "size-6";
});

const iconClass = computed(() => {
  if (props.size === "sm") return "size-4";
  if (props.size === "lg") return "size-6";
  return "size-6";
});

const toneClass = computed(() => {
  if (props.tone === "dark") {
    return "text-[#222] hover:bg-black/5 disabled:opacity-40";
  }
  if (props.tone === "muted") {
    return "text-[#7C7C7C] hover:bg-black/5 disabled:opacity-40";
  }
  return "text-white hover:bg-white/10 hover:opacity-90 disabled:opacity-40";
});
</script>
