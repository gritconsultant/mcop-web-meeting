<template>
  <div
    class="relative flex h-[130px] w-[130px] flex-col items-center justify-between rounded border border-[#afafaf] p-2 text-[#3181ED]"
    :class="cardClass"
  >
    <button
      v-if="removable"
      type="button"
      class="absolute -top-2.5 -right-2 flex size-4 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-125"
      @click.stop="$emit('remove')"
    >
      <UIcon name="i-lucide-x" class="size-3" />
    </button>

    <a
      :href="href"
      target="_blank"
      rel="noopener noreferrer"
      class="flex h-full w-full items-center justify-center overflow-hidden border-none outline-none"
    >
      <img
        v-if="isImage"
        :src="href"
        class="h-full w-full rounded object-cover"
        @error="onImageError"
      />
      <UCUploadFileIcon v-else :type="resolvedType" />
    </a>

    <div v-if="showMeta" class="flex flex-col gap-1 text-center">
      <span class="address-cell text-[10px] text-gray-500">{{ name }}</span>
      <span class="address-cell text-[10px] text-gray-500">{{ sizeLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  FALLBACK_IMAGE_SRC,
  findFileExtension,
  isImageExtension,
} from "~/utils/file/upload";

const props = defineProps<{
  href: string;
  name?: string;
  sizeLabel?: string;
  fileType?: string;
  removable?: boolean;
  cardClass?: string;
}>();

defineEmits<{
  remove: [];
}>();

const resolvedType = computed(
  () => props.fileType ?? findFileExtension(props.href, props.name),
);

const isImage = computed(() => isImageExtension(resolvedType.value));
const showMeta = computed(() => !isImage.value && (props.name || props.sizeLabel));

const onImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = FALLBACK_IMAGE_SRC;
};
</script>

<style scoped>
.address-cell {
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
