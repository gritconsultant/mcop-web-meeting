<template>
  <UCButton
    v-if="mode === 'view'"
    type="outline"
    label="ปิด"
    @click="emit('close')"
  />
  <template v-else>
    <UCButton
      type="outline"
      label="ยกเลิก"
      @click="emit('close')"
    />
    <UCButton
      type="primary"
      :label="submitLabel"
      :disabled="!isValid"
      @click="emit('submit')"
    />
  </template>
</template>

<script setup lang="ts">
import type { ModalMode } from '~/composables/useModal'

const props = withDefaults(
  defineProps<{
    mode: ModalMode
    createLabel?: string
    updateLabel?: string
    isValid?: boolean
  }>(),
  {
    isValid: true,
  },
)

const emit = defineEmits<{
  close: []
  submit: []
}>()

const submitLabel = computed(() =>
  props.mode === 'create'
    ? (props.createLabel ?? 'ยืนยัน')
    : (props.updateLabel ?? 'บันทึก'),
)
</script>
