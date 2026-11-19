<template>
  <dl class="flex flex-wrap gap-x-8 gap-y-1 text-sm">
    <div v-for="item in items" :key="item.label" class="flex gap-2">
      <dt class="text-neutral-500">{{ item.label }} :</dt>
      <dd class="font-bold">{{ item.value }}</dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
defineProps<{
  items: { label: string; value: string }[];
}>();
</script>
