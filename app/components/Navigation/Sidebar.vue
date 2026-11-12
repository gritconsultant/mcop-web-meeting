<template>
  <div class="sidebar">
    <NavigationSidebarBrand />

    <nav class="sidebar__nav">
      <UCNavItem
        v-for="item in items"
        :key="item.to ?? item.label"
        :to="item.to!"
        :label="item.label"
        :icon="item.icon"
        :active="isActive(item.to, topLevelPaths)"
      />
    </nav>

    <div class="sidebar__footer">
      <UCNavItem
        v-for="item in footerItems"
        :key="item.to ?? item.label"
        :to="item.to!"
        :label="item.label"
        :icon="item.icon"
        :active="isActive(item.to, footerPaths)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { items, footerItems, isActive } = useNavigation();

const topLevelPaths = computed(() =>
  items.value.filter((item) => item.to).map((item) => item.to!),
);

const footerPaths = computed(() =>
  footerItems.value.filter((item) => item.to).map((item) => item.to!),
);
</script>
