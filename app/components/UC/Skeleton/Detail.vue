<template>
  <div
    class="grid grid-cols-1 gap-4"
    :class="columns === 2 ? 'sm:grid-cols-2' : ''"
  >
    <div
      v-for="field in fields"
      :key="`skeleton-field-${field}`"
    >
      <UCSkeleton
        variant="text"
        width="35%"
        height="12px"
        :delay="field * 70"
      />
      <UCSkeleton
        class="mt-2"
        variant="text"
        :width="field % 3 === 0 ? '90%' : '65%'"
        height="16px"
        :delay="field * 70 + 40"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  fields?: number
  columns?: 1 | 2
}>(), {
  fields: 6,
  columns: 2,
})
</script>
