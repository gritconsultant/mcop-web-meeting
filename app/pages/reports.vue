<template>
  <div class="space-y-4">
    <template v-if="isTab">
      <UCPageHeader title="รายงานการประชุม" />
      <NavigationNavbarLayout :menus="menus" type="page" />
    </template>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
const menus = [
  { label: "รายงาน", page: "/reports" },
  { label: "ประวัติการแก้ไข", page: "/reports/history" },
];

// [id] is also a child route but has its own header, so show tabs only on tab pages
const route = useRoute();
const isTab = computed(() =>
  menus.some((m) => m.page === route.path.replace(/\/$/, "")),
);
</script>
