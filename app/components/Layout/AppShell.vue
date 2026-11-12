<template>
  <div class="app-shell">
    <aside
      class="app-shell__aside"
      :class="layout.isSidebarOpen ? 'is-open' : 'is-closed'"
    >
      <div class="app-shell__aside-inner">
        <NavigationSidebar />
      </div>
    </aside>

    <div
      v-if="layout.isSidebarOpen"
      class="app-shell__backdrop lg:hidden"
      @click="layout.setSidebar(false)"
    />

    <div
      class="app-shell__main"
      :class="{ 'is-offset': layout.isSidebarOpen }"
    >
      <NavigationHeader />
      <main class="app-shell__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const layout = useLayoutStore();
</script>
