<template>
  <nav v-if="resolvedItems.length" aria-label="Breadcrumb" class="uc-breadcrumb">
    <ol class="uc-breadcrumb__list">
      <li
        v-for="(item, index) in resolvedItems"
        :key="`${item.label}-${index}`"
        class="uc-breadcrumb__item"
      >
        <NuxtLink
          v-if="item.to && index < resolvedItems.length - 1"
          :to="item.to"
          class="uc-breadcrumb__link"
        >
          {{ item.label }}
        </NuxtLink>
        <span
          v-else
          class="uc-breadcrumb__current"
          :aria-current="index === resolvedItems.length - 1 ? 'page' : undefined"
        >
          {{ item.label }}
        </span>
        <span
          v-if="index < resolvedItems.length - 1"
          class="uc-breadcrumb__sep"
          aria-hidden="true"
        >
          &gt;
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from "#shared/types/breadcrumb";
import { findRouteTitle } from "~/utils/route/title";

const props = withDefaults(
  defineProps<{
    items?: BreadcrumbItem[];
    /** สร้างจาก path ปัจจุบันเมื่อไม่ส่ง items */
    auto?: boolean;
  }>(),
  {
    items: () => [],
    auto: false,
  },
);

const route = useRoute();

const resolvedItems = computed<BreadcrumbItem[]>(() => {
  if (props.items.length) return props.items;
  if (!props.auto) return [];

  const segments = route.path.replace(/\/+$/, "").split("/").filter(Boolean);
  const crumbs: BreadcrumbItem[] = [];
  let path = "";

  for (const segment of segments) {
    path += `/${segment}`;
    crumbs.push({
      label: findRouteTitle(path) ?? segment,
      to: path,
    });
  }

  return crumbs;
});
</script>
