<template>
  <MeetingForm mode="edit" :meeting-id="meetingId" />
</template>

<script setup lang="ts">
import { computed } from "vue";

const route = useRoute();
const meetingId = computed(() => String(route.params.id ?? ""));
</script>
