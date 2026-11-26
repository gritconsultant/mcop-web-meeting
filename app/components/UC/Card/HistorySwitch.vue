<template>
  <div>
    <div class="flex items-center gap-1 p-1 border border-[#D9D9D9] rounded-lg">
      <button
        class="w-[78px] text-center text-sm py-1 text-nowrap rounded-md"
        :class="[
          isSwitch == 'old' ? 'bg-[#515151] text-white' : ' text-grayText',
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:opacity-90',
        ]"
        type="button"
        :aria-pressed="isSwitch == 'old'"
        :disabled="disabled"
        @click="emit('update:isSwitch', 'old')"
      >
        {{ mainTitle }}
      </button>
      <button
        class="w-[78px] text-center text-sm py-1 text-nowrap rounded-md"
        :class="[
          isSwitch == 'new' ? 'bg-[#515151] text-white' : ' text-grayText',
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:opacity-90',
        ]"
        type="button"
        :aria-pressed="isSwitch == 'new'"
        :disabled="disabled"
        @click="emit('update:isSwitch', 'new')"
      >
        {{ subTitle }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  isSwitch: {
    type: String as PropType<"old" | "new">,
    required: true,
  },
  mainTitle: {
    type: String,
    required: true,
  },
  subTitle: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
    required: false,
  },
});

const emit = defineEmits<{
  (e: "update:isSwitch", value: "old" | "new"): void;
}>();
</script>

<style></style>
