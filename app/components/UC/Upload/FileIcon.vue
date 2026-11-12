<template>
  <UIcon
    v-if="type === 'pdf'"
    name="i-lucide-file-text"
    class="size-12 text-red-500"
  />
  <UIcon
    v-else-if="type === 'xlsx'"
    name="i-lucide-file-spreadsheet"
    class="size-12 text-emerald-600"
  />
  <UIcon
    v-else-if="type === 'docx'"
    name="i-lucide-file-text"
    class="size-12 text-blue-600"
  />
  <UIcon v-else name="i-lucide-file" class="size-12 text-neutral-400" />
</template>

<script setup lang="ts">
defineProps<{
  type: string;
}>();
</script>
