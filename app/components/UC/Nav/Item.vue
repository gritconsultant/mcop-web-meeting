<template>
  <NuxtLink
    :to="to"
    class="sidebar-item"
    :class="{ 'is-active': active }"
  >
    <span class="sidebar-item__icon">
      <img :src="icon" alt="" />
    </span>
    <span class="sidebar-item__label">{{ label }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string;
  label: string;
  icon: string;
  active?: boolean;
}>();
</script>
