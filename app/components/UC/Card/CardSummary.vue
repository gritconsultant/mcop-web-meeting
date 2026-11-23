<template>
  <div
    class="flex items-center justify-between gap-3 rounded-xl border border-[#AFAFAF] px-5 py-4"
  >
    <img :src="icon" alt="" class="size-10 shrink-0" />
    <div class="text-right">
      <p class="text-sm font-medium">{{ label }}</p>
      <p class="text-xl font-bold">{{ value }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  value: string | number;
}>();
</script>
