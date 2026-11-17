<template>
  <div ref="root" class="relative inline-block">
    <button
      ref="trigger"
      :disabled="props.disabled"
      type="button"
      :class="[
        'flex items-center justify-center gap-2 px-4 py-2 rounded-full border font-bold text-xs transition min-h-10 whitespace-nowrap',
        props.disabled
          ? 'bg-[#F9F9F9] text-[#AFAFAF] border-[#AFAFAF] cursor-not-allowed'
          : 'border-[#66A9FF] bg-[#EAF4FF] text-[#0066DA] hover:bg-[#DDEEFF] cursor-pointer',
      ]"
      @click="toggleSelect"
    >
      {{ props.label ? props.label : "ดาวน์โหลดไฟล์" }}
      <Icon
        name="material-symbols:keyboard-arrow-down-rounded"
        class="text-lg transition-transform"
        :class="openDropdown ? 'rotate-180' : ''"
      />
    </button>

    <Teleport to="body">
      <div
        v-if="openDropdown"
        ref="menu"
        class="fixed z-[9999] min-w-40 w-max rounded-lg border bg-white shadow"
        :style="[dropdownStyle, customDropdownStyle]"
      >
        <div
          v-for="item in options"
          :key="item.id"
          class="px-2 py-3 cursor-pointer hover:bg-gray-100 text-sm text-nowrap"
          @click="onSelect(item)"
        >
          {{ item.name }}
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Select } from "~~/shared/types/global";

const props = defineProps<{
  options: Select[];
  disabled?: boolean;
  label?: string;
  customDropdownStyle?: string;
}>();

const emit = defineEmits<{
  (e: "select", type: string): void;
}>();

const openDropdown = ref(false);
const dropdownStyle = ref<Record<string, string>>({});
const root = ref<HTMLElement | null>(null);
const trigger = ref<HTMLButtonElement | null>(null);
const menu = ref<HTMLElement | null>(null);

// anchor to the nearer viewport edge so the menu never overflows
const updatePosition = () => {
  if (!openDropdown.value || !trigger.value) return;
  const rect = trigger.value.getBoundingClientRect();
  const alignRight = rect.left > window.innerWidth / 2;
  dropdownStyle.value = {
    top: `${rect.bottom + 4}px`,
    minWidth: `${rect.width}px`,
    ...(alignRight
      ? { right: `${window.innerWidth - rect.right}px` }
      : { left: `${rect.left}px` }),
  };
};

const toggleSelect = () => {
  if (props.disabled) return;
  openDropdown.value = !openDropdown.value;
  updatePosition();
};

const onSelect = (item: Select) => {
  openDropdown.value = false;
  emit("select", item.id);
};

const handleClickOutside = (e: MouseEvent) => {
  const t = e.target as Node;
  if (!root.value?.contains(t) && !menu.value?.contains(t))
    openDropdown.value = false;
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("scroll", updatePosition, true);
  window.addEventListener("resize", updatePosition);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("scroll", updatePosition, true);
  window.removeEventListener("resize", updatePosition);
});
</script>
