<template>
  <button
    :type="buttonType"
    class="hrm-btn"
    :class="buttonClass"
    :disabled="disabled"
    @click="emit('click')"
  >
    <UIcon
      v-if="icon && !trailingIcon"
      :name="icon"
      class="size-4 shrink-0"
    />
    <span v-if="label">{{ label }}</span>
    <UIcon
      v-if="icon && trailingIcon"
      :name="icon"
      class="size-4 shrink-0"
    />
  </button>
</template>

<script setup lang="ts">
import type { UCButtonType } from '#shared/types/button'

const props = withDefaults(
  defineProps<{
    type?: UCButtonType
    label?: string
    icon?: string
    trailingIcon?: boolean
    disabled?: boolean
    active?: boolean
    buttonType?: 'button' | 'submit'
  }>(),
  {
    type: 'outline',
    disabled: false,
    active: false,
    trailingIcon: false,
    buttonType: 'button',
  },
)

const emit = defineEmits<{ click: [] }>()

const buttonClass = computed(() => {
  if (props.type === 'primary') return 'hrm-btn--primary'
  if (props.type === 'search') return 'hrm-btn--search'
  if (props.type === 'add') return 'hrm-btn--add'
  if (props.type === 'edit' || props.type === 'edit-warning') {
    return props.active ? 'hrm-btn--edit-warning-active' : 'hrm-btn--edit-warning'
  }
  if (props.type === 'delete') return 'hrm-btn--delete'
  return 'hrm-btn--outline'
})
</script>
