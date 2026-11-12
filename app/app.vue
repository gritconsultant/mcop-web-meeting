<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import logoUrl from "~/assets/images/logo.svg";

const route = useRoute();

useHead({
  title: computed(() => {
    const title = findRouteTitle(route.path);
    return title ? `${title} | ${APP_TITLE}` : APP_TITLE;
  }),
  link: [{ rel: "icon", type: "image/svg+xml", href: logoUrl }],
});
</script>
