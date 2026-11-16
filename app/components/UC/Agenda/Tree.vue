<template>
  <div class="uc-agenda">
    <div v-if="title || $slots.actions" class="uc-agenda__header">
      <h3 v-if="title" class="uc-agenda__title">{{ title }}</h3>
      <div v-if="$slots.actions" class="uc-agenda__actions">
        <slot name="actions" />
      </div>
    </div>

    <ul v-if="items.length" class="uc-agenda__list" role="tree">
      <UCAgendaTreeItem
        v-for="node in items"
        :key="node.id"
        :node="node"
        :depth="0"
      />
    </ul>

    <div v-else class="uc-agenda__empty">
      <slot name="empty">ยังไม่มีระเบียบวาระ</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AgendaNode } from "#shared/types/agenda";

withDefaults(
  defineProps<{
    items: AgendaNode[];
    title?: string;
  }>(),
  {
    title: "ระเบียบวาระ",
  },
);
</script>
