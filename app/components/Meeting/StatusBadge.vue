<template>
  <span class="meeting-status" :class="`meeting-status--${status}`">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  MEETING_STATUS_LABEL,
  type MeetingStatus,
} from "#shared/types/meeting";

const props = defineProps<{
  status: MeetingStatus;
  statusName?: string;
}>();

const label = computed(
  () => props.statusName?.trim() || MEETING_STATUS_LABEL[props.status],
);
</script>
