<template>
  <div class="flex w-full items-center justify-between gap-4">
    <h2
      class="min-w-0 border-l-4 border-[#0066DA] pl-2 text-[20px] leading-7 font-bold text-black"
    >
      {{ title }}
    </h2>
    <UCButton
      v-if="editable && (mode === 'view' || mode === 'update')"
      type="edit-warning"
      label="แก้ไขข้อมูล"
      icon="i-lucide-square-pen"
      :active="mode === 'update'"
      @click="emit('toggle')"
    />
  </div>
</template>

<script setup lang="ts">
import type { ModalMode } from "~/composables/useModal";

withDefaults(
  defineProps<{
    title: string;
    mode: ModalMode;
    editable?: boolean;
  }>(),
  {
    editable: true,
  },
);

const emit = defineEmits<{ toggle: [] }>();
</script>
