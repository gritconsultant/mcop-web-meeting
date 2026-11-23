<template>
  <label :for="inputId" class="block">
    <div
      class="flex size-[130px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed"
      :class="hasError ? 'border-red-500 text-red-500' : 'border-[#449cff] text-[#0066da]'"
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

      <div v-else class="flex flex-col items-center justify-center gap-1.5">
        <img :src="uploadIcon" alt="" class="size-6" />
        <span class="text-xs text-[#0066da]">{{ placeholder }}</span>
      </div>
    </div>
  </label>
</template>

<script setup lang="ts">
import uploadIcon from "~/assets/icon/file/upload.svg";

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
