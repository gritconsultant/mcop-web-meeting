<template>
  <fieldset
    :class="[
      customClass,
      orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col',
    ]"
    :disabled="disabled"
  >
    <label
      v-for="(item, index) in items"
      :key="`${String(item.value)}-${index}`"
      class="flex items-center gap-2 text-sm"
      :class="[
        orientation === 'horizontal' ? 'w-fit' : 'w-full',
        disabled || item.disabled
          ? 'cursor-not-allowed'
          : 'cursor-pointer',
      ]"
    >
      <input
        v-bind="attrs"
        v-model="modelValue"
        type="radio"
        :name="resolvedName"
        :value="item.value"
        :disabled="disabled || item.disabled"
        :required="required"
        class="sr-only"
      />
      <!-- disabled ใช้สีเทาชุดเดียวกับ input (#F5F5F5 / #6B7280 / #AFAFAF) แทนการจาง opacity -->
      <span
        class="flex size-4 shrink-0 items-center justify-center rounded-full border-2"
        :class="
          disabled || item.disabled
            ? 'border-[#AFAFAF] bg-[#F5F5F5]'
            : modelValue === item.value
              ? 'border-[#0066DA]'
              : 'border-[#7C7C7C]'
        "
      >
        <span
          class="size-2 rounded-full transition-colors duration-200"
          :class="
            modelValue !== item.value
              ? 'bg-transparent'
              : disabled || item.disabled
                ? 'bg-[#6B7280]'
                : 'bg-[#0066DA]'
          "
        />
      </span>
      <slot name="label" :item="item">
        <span :class="disabled || item.disabled ? 'text-[#6B7280]' : 'text-gray-800'">{{ item.label }}</span>
      </slot>
    </label>
  </fieldset>
</template>

<script setup lang="ts">
export type RadioValue = string | number | boolean | null;
export type RadioItem = {
  label?: string;
  value: RadioValue;
  disabled?: boolean;
};

const props = withDefaults(
  defineProps<{
    items: RadioItem[];
    name?: string;
    orientation?: "horizontal" | "vertical";
    disabled?: boolean;
    required?: boolean;
    customClass?: string;
  }>(),
  {
    name: undefined,
    orientation: "vertical",
    disabled: false,
    required: false,
    customClass: "flex gap-2",
  },
);

const attrs = useAttrs();
const modelValue = defineModel<RadioValue>({ required: true });
const generatedName = useId();
const resolvedName = computed(
  () => props.name ?? `radio-group-${generatedName}`,
);
</script>
