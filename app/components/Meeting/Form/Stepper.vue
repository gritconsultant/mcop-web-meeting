<template>
  <nav aria-label="ขั้นตอนการสร้างวาระ" class="meeting-form-stepper">
    <ol class="meeting-form-stepper__list">
      <li
        v-for="(step, index) in steps"
        :key="step.key"
        class="meeting-form-stepper__item"
        :class="{
          'is-active': index === current,
          'is-done': index < current,
        }"
      >
        <div
          v-if="index < steps.length - 1"
          class="meeting-form-stepper__line"
          :class="{ 'is-passed': index < current }"
          aria-hidden="true"
        />
        <button
          type="button"
          class="meeting-form-stepper__btn"
          :disabled="index > current"
          @click="emit('select', index)"
        >
          <span class="meeting-form-stepper__circle">
            {{ index + 1 }}
          </span>
          <span class="meeting-form-stepper__label">
            <template v-if="step.lines?.length">
              <span
                v-for="(line, lineIndex) in step.lines"
                :key="lineIndex"
                class="meeting-form-stepper__line-text"
              >
                {{ line }}
              </span>
            </template>
            <template v-else>{{ step.label }}</template>
          </span>
        </button>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import type { MeetingFormStep } from "#shared/types/meeting";

defineProps<{
  steps: MeetingFormStep[];
  current: number;
}>();

const emit = defineEmits<{
  select: [index: number];
}>();
</script>
