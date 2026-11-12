<template>
  <div>
    <USelectMenu
      :id="id"
      :label="label"
      v-model="localSelect"
      :items="items"
      :search-input="false"
      placeholder="เลือกบัญชี"
      :ui="{ item: 'flex  w-full  rounded-md' }"
      class="w-full min-h-10"
      :disabled="meta?.readOnly"
    >
      <!-- custom trigger -->
      <template #default>
        <div class="flex gap-2 w-full">
          <div
            v-if="localSelect.headerName"
            :class="[
              meta?.readOnly ? 'opacity-50' : '',
              localSelect.customClassHeader
                ? localSelect.customClassHeader
                : 'bg-[#811919] text-white rounded-[4px] text-xs w-fit px-1 py-1',
            ]"
          >
            <span>
              {{ localSelect.headerName }}
            </span>
          </div>
          <div
            v-if="localSelect.middleName"
            :class="[
              meta?.readOnly ? 'opacity-50' : '',
              localSelect.customClassMiddleName
                ? localSelect.customClassMiddleName
                : 'bg-[#F582F1] text-white rounded-3xl text-xs w-fit px-1 py-1',
              'min-w-0',
            ]"
          >
            <span class="truncate block">
              {{ localSelect.middleName }}
            </span>
          </div>
          <div
            v-if="localSelect.tagName"
            :class="[
              meta?.readOnly ? 'opacity-50' : '',
              localSelect.customClassTagName
                ? localSelect.customClassTagName
                : 'bg-[#EDECEC] text-[#222222] group-hover:text-[#222222] min-w-24 rounded-[4px] text-xs text-center py-1',
              'min-w-0',
            ]"
          >
            <span class="truncate block">
              {{ localSelect.tagName }}
            </span>
          </div>
          <div class="min-w-0">
            <span
              class="text-nowrap truncate block"
              :class="
                localSelect.customClassName ? localSelect.customClassName : ''
              "
            >
              {{ localSelect.name }}
            </span>
          </div>
        </div>
      </template>
      <!-- custom item -->
      <template #item="{ item }">
        <div
          class="flex w-full p-2"
          :class="[
            checkOption(item) && !checkIsDisabled(item)
              ? 'bg-[#767676] text-white cursor-default'
              : checkIsDisabled(item)
                ? 'text-[#222222] font-normal opacity-50'
                : 'hover:bg-[#b5b5b5] hover:text-[#222222] cursor-pointer',
          ]"
        >
          <div
            v-if="item.headerName"
            :class="[
              meta?.readOnly ? 'opacity-50' : '',
              item.customClassHeader
                ? item.customClassHeader
                : 'bg-[#811919] text-white rounded-[4px] text-xs w-fit px-1 py-1',
            ]"
          >
            <span>
              {{ item.headerName }}
            </span>
          </div>
          <div
            v-if="item.middleName"
            :class="[
              meta?.readOnly ? 'opacity-50' : '',
              item.customClassMiddleName
                ? item.customClassMiddleName
                : 'bg-[#F582F1] text-white rounded-3xl text-xs w-fit px-1 py-1',
              'min-w-0',
            ]"
          >
            <span class="truncate block">
              {{ item.middleName }}
            </span>
          </div>
          <div
            v-if="item.tagName"
            :class="[
              meta?.readOnly ? 'opacity-50' : '',
              item.customClassTagName
                ? item.customClassTagName
                : 'bg-[#EDECEC] text-darkTextHover group-hover:text-darkTextHover min-w-24 rounded-[4px] text-xs text-center py-1',
              'min-w-0',
            ]"
          >
            <span class="truncate block">
              {{ item.tagName }}
            </span>
          </div>
          <div class="min-w-0">
            <span
              class="text-nowrap truncate block"
              :class="item.customClassName ? item.customClassName : ''"
            >
              {{ item.name }}
            </span>
          </div>
        </div>
      </template>
    </USelectMenu>
  </div>
</template>

<script lang="ts" setup>
import type { SelectMenuItem } from "@nuxt/ui";

interface InputMeta {
  readOnly?: boolean;
  customClass?: string;
  textClass?: string;
  placeholderClass?: string;
  required?: boolean;
  isSearch?: boolean;
}

type SelectItem = SelectMenuItem & {
  id: string;
  name: string;
  headerName?: string;
  middleName?: string;
  tagName?: string;
  value?: unknown;
  urlImage?: string;
  customClassHeader?: string;
  customClassMiddleName?: string;
  customClassTagName?: string;
  customClassName?: string;
  isDisabled?: boolean;
  isSelected?: boolean;
};

type Select = {
  id: string;
  name: string;
  headerName?: string;
  middleName?: string;
  tagName?: string;
  value?: unknown;
  urlImage?: string;
  customClassHeader?: string;
  customClassMiddleName?: string;
  customClassTagName?: string;
  customClassName?: string;
  isDisabled?: boolean;
  isSelected?: boolean;
};

const props = defineProps<{
  id: string;
  label: string;
  items: SelectItem[];
  value: Select;
  meta?: InputMeta;
}>();

const emit = defineEmits<{
  (e: "update:value", value: Select): void;
}>();

const localSelect = computed({
  get: () => props.value,
  set: (value) => emit("update:value", value),
});

const checkOption = (item: SelectItem): boolean => {
  return item.id === localSelect.value.id;
};

const checkIsDisabled = (item: SelectItem): boolean => {
  return item.isDisabled || false;
};
</script>

<style>
div.isolate {
  padding: 0px !important;
}

/* ตัวอย่างการ override class ของ reka-combobox-item */
:deep([data-slot="group"]) {
  padding: 0px !important;
}
</style>
