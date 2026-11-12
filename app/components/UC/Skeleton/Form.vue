<template>
  <div class="space-y-4">
    <div
      v-for="row in rows"
      :key="`skeleton-form-${row}`"
      class="grid gap-4"
      :class="columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1'"
    >
      <div
        v-for="col in columns"
        :key="`skeleton-form-${row}-${col}`"
      >
        <UCSkeleton
          variant="text"
          width="30%"
          height="12px"
          :delay="(row * columns + col) * 60"
        />
        <UCSkeleton
          class="mt-2"
          variant="block"
          height="40px"
          :delay="(row * columns + col) * 60 + 30"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  rows?: number
  columns?: 1 | 2 | 3 | 4
}>(), {
  rows: 2,
  columns: 2,
})
</script>
