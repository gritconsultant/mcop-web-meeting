<template>
  <section
    class="uc-filter"
    :class="[
      variant === 'panel' ? 'uc-filter--panel' : 'uc-filter--inline',
      { 'is-collapsed': collapsible && !expanded },
    ]"
  >
    <header
      v-if="variant === 'panel'"
      class="uc-filter__header"
    >
      <h2 class="uc-filter__title">{{ title }}</h2>
      <button
        v-if="collapsible"
        type="button"
        class="uc-filter__toggle"
        :aria-expanded="expanded"
        :aria-label="expanded ? 'ยุบแผงค้นหา' : 'ขยายแผงค้นหา'"
        @click="expanded = !expanded"
      >
        <UIcon
          name="i-lucide-chevron-up"
          class="size-5 transition-transform"
          :class="{ 'rotate-180': !expanded }"
        />
      </button>
    </header>

    <div v-show="!collapsible || expanded" class="uc-filter__body">
      <div class="uc-filter__row">
        <div class="uc-filter__fields">
          <slot />
        </div>

        <div v-if="$slots.actions" class="uc-filter__actions">
          <slot name="actions" />
        </div>

        <div v-if="$slots.trailing" class="uc-filter__trailing">
          <slot name="trailing" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string;
    /** inline = แถวฟิลด์แบบหน้ารายการ, panel = การ์ดค้นหาแบบรายงาน */
    variant?: "inline" | "panel";
    collapsible?: boolean;
    defaultOpen?: boolean;
  }>(),
  {
    title: "ค้นหา",
    variant: "inline",
    collapsible: false,
    defaultOpen: true,
  },
);

const expanded = ref(props.defaultOpen);
</script>
