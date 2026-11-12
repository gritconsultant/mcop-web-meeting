<template>
  <div
    class="hrm-skeleton"
    :class="[roundedClass, props.class]"
    :style="skeletonStyle"
  />
</template>

<script setup lang="ts">
type SkeletonVariant = 'text' | 'title' | 'avatar' | 'button' | 'badge' | 'block' | 'line'
type SkeletonRounded = 'none' | 'sm' | 'md' | 'lg' | 'full'

const VARIANT_SIZE: Record<SkeletonVariant, { width: string, height: string }> = {
  text: { width: '100%', height: '14px' },
  title: { width: '40%', height: '20px' },
  avatar: { width: '40px', height: '40px' },
  button: { width: '96px', height: '36px' },
  badge: { width: '80px', height: '32px' },
  block: { width: '100%', height: '40px' },
  line: { width: '32px', height: '10px' },
}

const ROUNDED_CLASS: Record<SkeletonRounded, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

const props = withDefaults(defineProps<{
  variant?: SkeletonVariant
  width?: string | number
  height?: string | number
  rounded?: SkeletonRounded
  delay?: number
  class?: string
}>(), {
  variant: 'block',
  rounded: 'md',
})

const roundedClass = computed(() => ROUNDED_CLASS[props.rounded])

const skeletonStyle = computed(() => {
  const preset = VARIANT_SIZE[props.variant]
  const width = props.width ?? preset.width
  const height = props.height ?? preset.height

  return {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    animationDelay: props.delay ? `${props.delay}ms` : undefined,
  }
})
</script>
