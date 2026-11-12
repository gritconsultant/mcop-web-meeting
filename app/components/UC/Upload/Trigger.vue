<template>
  <label :for="inputId" class="block">
    <div
      class="flex h-[130px] w-[130px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-[#3181ED]"
      :class="hasError ? 'border-red-500' : 'border-[#449cff]'"
    >
      <input
        :id="inputId"
        type="file"
        class="hidden"
        :accept="accept"
        :multiple="multiple"
        @change="$emit('change', $event)"
      />

      <div v-if="loading" class="flex items-center justify-center text-gray-700">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin" />
      </div>

      <div v-else class="flex flex-col items-center justify-center">
        <UIcon name="i-lucide-upload" class="size-[18px]" />
        <span class="text-[10px]">{{ placeholder }}</span>
      </div>
    </div>
  </label>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    inputId: string;
    accept: string;
    placeholder?: string;
    multiple?: boolean;
    loading?: boolean;
    hasError?: boolean;
  }>(),
  {
    placeholder: "Upload file",
    multiple: false,
    loading: false,
    hasError: false,
  },
);

defineEmits<{
  change: [event: Event];
}>();
</script>
