<template>
  <div class="uc-upload">
    <h3
      v-if="title"
      class="mb-4 rounded-sm border border-[#afafaf] bg-[#f8f8f8] px-2 py-1 text-lg font-semibold"
    >
      {{ title }}
    </h3>

    <div
      class="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] justify-center gap-5"
      :class="title ? 'mt-2' : ''"
    >
      <div
        v-for="(file, index) in currentlyFiles"
        :key="`current-${file.id}-${index}`"
        class="flex flex-col items-center"
      >
        <UCUploadFileCard
          :href="file.url"
          :name="file.file_names"
          :size-label="file.convert_size"
          :file-type="findFileExtension(file.url, file.file_names)"
          :removable="!disabled"
          :card-class="file.classfile"
          @remove="removeFile(file.id, 'current')"
        />
        <span v-if="prefixName" class="mt-1">{{ prefixName }} {{ index + 1 }}</span>
      </div>

      <UCUploadFileCard
        v-for="(file, index) in files"
        :key="`new-${file.id || index}`"
        :href="file.preview"
        :name="file.name"
        :size-label="formatFileSizeKb(file.size)"
        :file-type="file.type"
        :removable="!disabled"
        @remove="removeFile(file.id, 'new')"
      />

      <UCUploadTrigger
        v-if="showUploadTrigger"
        :input-id="inputId"
        :accept="accept"
        :placeholder="placeholder"
        :multiple="multiple"
        :loading="loading"
        :has-error="error"
        @change="handleFileUpload"
      />
    </div>

    <!-- กล่องว่างตอน disabled ใช้สีเดียวกับ input disabled -->
    <p
      v-if="showEmptyState"
      class="mt-2 rounded-lg border border-[#AFAFAF] bg-[#F5F5F5] px-4 py-2 text-center text-sm text-[#6B7280]"
    >
      ไม่มีข้อมูล
    </p>

    <p
      v-if="error && errorMessage && isEmpty"
      class="mt-1 text-form-error text-error"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { CurrentlyFile, FileRemovePayload, UploadedFile } from "#shared/types/file";
import {
  DEFAULT_FILE_ACCEPT,
  findFileExtension,
  formatFileSizeKb,
} from "~/utils/file/upload";

const props = withDefaults(
  defineProps<{
    id?: string;
    title?: string;
    placeholder?: string;
    rule?: string;
    maxSize?: number;
    multiple?: boolean;
    currentlyFiles?: CurrentlyFile[];
    required?: boolean;
    errorMessage?: string;
    disabled?: boolean;
    multipleSingle?: boolean;
    error?: boolean;
    prefixName?: string;
    clearfile?: boolean;
  }>(),
  {
    placeholder: "Upload file",
    multiple: false,
    currentlyFiles: () => [],
    disabled: false,
    multipleSingle: false,
    error: false,
    clearfile: false,
  },
);

const emit = defineEmits<{
  delete: [payload: FileRemovePayload];
  callback: [files: UploadedFile[]];
  loading: [loading: boolean];
}>();

const generatedId = useId();
const inputId = computed(() => props.id || `uc-upload-${generatedId}`);

const accept = computed(() => props.rule || DEFAULT_FILE_ACCEPT);

const { loading, currentlyFiles, files, removeFile, handleFileUpload } =
  useStorageUpload({
    currentlyFiles: toRef(props, "currentlyFiles"),
    disabled: toRef(props, "disabled"),
    rule: toRef(props, "rule"),
    maxSize: toRef(props, "maxSize"),
    multipleSingle: toRef(props, "multipleSingle"),
    clearfile: toRef(props, "clearfile"),
    onDelete: (payload) => emit("delete", payload),
    onCallback: (uploadedFiles) => emit("callback", uploadedFiles),
    onLoading: (value) => emit("loading", value),
  });

const isEmpty = computed(
  () => currentlyFiles.value.length === 0 && files.value.length === 0,
);

const showUploadTrigger = computed(() => {
  if (props.disabled) return false;
  if (props.multipleSingle && !isEmpty.value) return false;
  return true;
});

const showEmptyState = computed(() => props.disabled && isEmpty.value);
</script>
