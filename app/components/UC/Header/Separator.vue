<template>
  <span
    class="app-header__sep"
    :class="{ 'app-header__sep--light': light }"
    aria-hidden="true"
  >
    |
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    light?: boolean;
  }>(),
  {
    light: false,
  },
);
</script>
