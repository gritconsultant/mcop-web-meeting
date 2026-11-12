<template>
  <NuxtLink
    :to="to"
    class="relative flex h-24 w-full shrink-0 items-center gap-3 overflow-hidden p-3 text-white"
  >
    <img
      :src="backgroundUrl"
      alt=""
      class="pointer-events-none absolute inset-0 size-full object-cover"
    />

    <img
      :src="logoUrl"
      alt="โลโก้สหกรณ์"
      class="relative h-[50px] w-[46px] shrink-0 object-contain"
    />
    <div class="relative min-w-0 flex-1">
      <div class="truncate text-xl font-bold leading-normal">{{ title }}</div>
      <div class="text-sm font-normal leading-normal">{{ subtitle }}</div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import logoUrl from "~/assets/images/logo.png";
import backgroundUrl from "~/assets/images/sidebar-brand-background.png";
import { DEFAULT_ROUTE } from "~/composables/useNavigation";

withDefaults(
  defineProps<{
    to?: string;
    title?: string;
    subtitle?: string;
  }>(),
  {
    to: DEFAULT_ROUTE,
    title: "ระเบียบวาระที่ประชุม",
    subtitle: "สหกรณ์ออมทรัพย์ตำรวจแห่งชาติ",
  },
);
</script>
