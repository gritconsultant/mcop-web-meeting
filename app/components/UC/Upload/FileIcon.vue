<template>
  <img
    v-if="type === 'pdf'"
    :src="pdfIcon"
    alt="PDF"
    class="size-8"
  />
  <img
    v-else-if="type === 'xlsx' || type === 'xls'"
    :src="excelIcon"
    alt="Excel"
    class="size-8"
  />
  <UIcon
    v-else-if="type === 'docx' || type === 'doc'"
    name="i-lucide-file-text"
    class="size-8 text-blue-600"
  />
  <UIcon v-else name="i-lucide-file" class="size-8 text-neutral-400" />
</template>

<script setup lang="ts">
import pdfIcon from "~/assets/icon/file/pdf.svg";
import excelIcon from "~/assets/icon/file/excel.svg";

defineProps<{
  type: string;
}>();
</script>
