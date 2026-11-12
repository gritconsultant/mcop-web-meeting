<template>
  <UDropdownMenu :items="items" :content="{ align: 'end' }">
    <button type="button" class="app-header__user">
      <span>{{ displayName }}</span>
      <UIcon name="i-lucide-chevron-down" class="size-4 shrink-0" />
    </button>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

defineProps<{
  displayName: string;
  items: DropdownMenuItem[][];
}>();
</script>
