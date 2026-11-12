<template>
  <div
    class="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm"
  >
    <slot>
      <div class="flex items-center gap-2 text-sm text-neutral-600">
        <UIcon
          name="i-lucide-loader-circle"
          class="size-5 animate-spin"
        />
        {{ label }}
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
}>(), {
  label: 'กำลังโหลดข้อมูล...',
})
</script>
