<template>
  <span class="hrm-status" :class="`hrm-status--${status}`">
    {{ label ?? STATUS_LABEL[status] }}
  </span>
</template>

<script setup lang="ts">
import { STATUS_LABEL, type StatusTone } from "#shared/types/status";

defineProps<{
  status: StatusTone;
  label?: string;
}>();
</script>
