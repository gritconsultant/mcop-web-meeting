<template>
  <Transition name="fade-fast">
    <div
      v-if="loading"
      class="absolute inset-0 z-50 flex flex-col items-center justify-center"
      :class="bgClass"
    >
      <slot>
        <Icon :name="icon" :class="iconClass" />
        <span :class="['mt-3', textClass]">
          {{ title }}
        </span>
      </slot>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  loading: boolean
  title?: string
  icon?: string
  iconClass?: string
  textClass?: string
  bgClass?: string
}

withDefaults(defineProps<Props>(), {
  title: 'กำลังโหลดข้อมูล...',
  icon: 'lucide:loader-circle',
  iconClass: 'size-12 animate-spin text-[#0066DA]',
  textClass: 'font-noto-sans-thai text-base font-bold text-black-900',
  bgClass: 'rounded-2xl bg-white/80 backdrop-blur-sm',
})
</script>

<style scoped>
.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 150ms ease-out;
}

.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}
</style>
