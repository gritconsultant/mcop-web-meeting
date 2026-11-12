<template>
  <button
    type="button"
    class="hrm-action-btn cursor-pointer"
    :class="[
      `hrm-action-btn--${config.variant}`,
      filled ? `hrm-action-btn--${config.variant}-filled` : '',
      size === 'sm' ? 'hrm-action-btn--sm' : '',
      { 'is-disabled': disabled },
    ]"
    :disabled="disabled"
    :aria-label="config.label"
    :title="config.label"
    @click="emit('click')"
  >
    <UIcon :name="config.icon" class="size-4" />
  </button>
</template>

<script setup lang="ts">
import {
  ACTION_BUTTON_PRESETS,
  type ActionButtonPreset,
  type ActionButtonVariant,
} from '#shared/types/actionButton'

const props = withDefaults(
  defineProps<{
    action?: ActionButtonPreset
    icon?: string
    label?: string
    variant?: ActionButtonVariant
    disabled?: boolean
    filled?: boolean
    size?: 'md' | 'sm'
  }>(),
  {
    disabled: false,
    filled: false,
    size: 'md',
  },
)

const emit = defineEmits<{ click: [] }>()

const config = computed(() => {
  if (props.action) {
    return ACTION_BUTTON_PRESETS[props.action]
  }

  return {
    icon: props.icon ?? 'i-lucide-circle',
    label: props.label ?? 'ดำเนินการ',
    variant: props.variant ?? 'neutral',
  }
})
</script>
