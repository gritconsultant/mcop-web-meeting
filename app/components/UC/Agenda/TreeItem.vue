<template>
  <li class="uc-agenda__node">
    <div class="uc-agenda__row" :style="{ paddingLeft: `${depth * 20}px` }">
      <button
        v-if="hasChildren"
        type="button"
        class="uc-agenda__chevron"
        :aria-expanded="open"
        :aria-label="open ? 'ยุบวาระ' : 'ขยายวาระ'"
        @click="open = !open"
      >
        <UIcon
          name="i-lucide-chevron-right"
          class="size-4 transition-transform"
          :class="{ 'rotate-90': open }"
        />
      </button>
      <span v-else class="uc-agenda__chevron-spacer" />

      <span v-if="node.code" class="uc-agenda__code">{{ node.code }}</span>
      <span class="uc-agenda__label">{{ node.label }}</span>
      <span v-if="node.meta" class="uc-agenda__meta">{{ node.meta }}</span>
    </div>

    <ul v-if="hasChildren && open" class="uc-agenda__children">
      <UCAgendaTreeItem
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import type { AgendaNode } from "#shared/types/agenda";

const props = defineProps<{
  node: AgendaNode;
  depth?: number;
}>();

const depth = computed(() => props.depth ?? 0);
const hasChildren = computed(() => (props.node.children?.length ?? 0) > 0);
const open = ref(props.node.defaultOpen ?? depth.value < 1);
</script>
