<template>
  <div
    class="relative flex size-[130px] flex-col items-center justify-end gap-1.5 rounded-lg border-[0.7px] border-[#afafaf] bg-white p-2 text-[#3181ED]"
    :class="cardClass"
  >
    <button
      v-if="removable"
      type="button"
      class="absolute -top-2.5 -right-2 z-10 flex size-[21px] items-center justify-center rounded-full bg-[#f95454] text-white transition-transform hover:scale-110"
      @click.stop="$emit('remove')"
    >
      <UIcon name="i-lucide-x" class="size-3" />
    </button>

    <a
      :href="href"
      target="_blank"
      rel="noopener noreferrer"
      class="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden border-none outline-none"
    >
      <img
        v-if="isImage"
        :src="href"
        class="size-full rounded object-cover"
        @error="onImageError"
      />
      <UCUploadFileIcon v-else :type="resolvedType" />
    </a>

    <div v-if="showMeta" class="flex w-full flex-col items-start justify-center">
      <span
        v-if="name"
        class="address-cell w-full text-left text-[10px] text-[#1A1E24]"
      >
        {{ name }}
      </span>
      <span
        v-if="sizeLabel"
        class="address-cell w-full text-left text-[10px] text-[#7c7c7c]"
      >
        {{ sizeLabel }}
      </span>
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
const showMeta = computed(() => Boolean(props.name || props.sizeLabel));

const onImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = FALLBACK_IMAGE_SRC;
};
</script>

<style scoped>
.address-cell {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
