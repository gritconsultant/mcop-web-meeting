<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2 border-l-4 border-[#0066DA] pl-2">
      <h1 class="text-lg font-bold text-gray-900">
        {{ title }}
      </h1>
    </div>

    <UCard>
      <div
        class="flex flex-col items-center justify-center gap-3 py-16 text-center"
      >
        <div
          class="flex size-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700"
        >
          <UIcon :name="icon" class="size-7" />
        </div>
        <p v-if="subtitle" class="max-w-md text-sm text-gray-500">
          {{ subtitle }}
        </p>
        <UBadge color="neutral" variant="subtle"> อยู่ระหว่างพัฒนา </UBadge>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
  icon: string;
}>();
</script>
