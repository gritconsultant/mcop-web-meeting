import service from "~/service";
import type { ApiResponse } from "#shared/types/api";
import type {
  CurrentlyFile,
  FileRemovePayload,
  StorageObjectResponse,
  UploadedFile,
} from "#shared/types/file";
import {
  isFileAllowedByRule,
  isValidFileName,
  structureUploadedFile,
} from "~/utils/file/upload";

type UseFileUploadOptions = {
  currentlyFiles?: MaybeRefOrGetter<CurrentlyFile[] | undefined>;
  disabled?: MaybeRefOrGetter<boolean | undefined>;
  rule?: MaybeRefOrGetter<string | undefined>;
  maxSize?: MaybeRefOrGetter<number | undefined>;
  singleFile?: MaybeRefOrGetter<boolean | undefined>;
  multipleSingle?: MaybeRefOrGetter<boolean | undefined>;
  clearfile?: MaybeRefOrGetter<boolean | undefined>;
  onDelete?: (payload: FileRemovePayload) => void;
  onCallback?: (files: UploadedFile[]) => void;
  onLoading?: (loading: boolean) => void;
};

export const useStorageUpload = (options: UseFileUploadOptions) => {
  const loading = ref(false);
  const currentlyFiles = ref<CurrentlyFile[]>(toValue(options.currentlyFiles) ?? []);
  const files = ref<UploadedFile[]>([]);

  const setLoading = (value: boolean) => {
    loading.value = value;
    options.onLoading?.(value);
  };

  const removeFile = (id: string, source: "current" | "new") => {
    if (toValue(options.disabled)) return;

    if (source === "current") {
      const index = currentlyFiles.value.findIndex((file) => file.id === id);
      if (index === -1) return;

      currentlyFiles.value.splice(index, 1);
      options.onDelete?.({ id, index });
      return;
    }

    const index = files.value.findIndex((file) => file.id === id);
    if (index === -1) return;

    const fileToRemove = files.value[index];
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    files.value.splice(index, 1);
    options.onDelete?.({ id, index });
    options.onCallback?.(files.value);
  };

  const uploadFile = async (file: File) => {
    if (!isValidFileName(file.name)) {
      showAlert({
        type: "error",
        title: "ชื่อไฟล์ไม่ถูกต้อง",
        text: "กรุณาเลือกไฟล์ที่มีชื่อ",
        isToast: true,
      });
      return false;
    }

    const structured = structureUploadedFile(file);
    if (!structured) {
      console.log("Unsupported file type:", file.type);
      showAlert({
        type: "error",
        title: "ประเภทไฟล์ไม่ถูกต้อง",
        isToast: true,
      });
      return false;
    }

    const renamedFile = new File([file], structured.name, { type: file.type });
    const preview = URL.createObjectURL(renamedFile);

    const payload: UploadedFile = {
      id: "",
      name: structured.name,
      preview,
      type: structured.type,
      file: renamedFile,
      size: file.size,
    };

    try {
      const resp = (await service.storage.storageObject({
        filename: structured.name,
        visibility: "private",
      })) as ApiResponse<StorageObjectResponse>;

      if (String(resp.code) !== "200") {
        URL.revokeObjectURL(preview);
        showAlert({
          type: "error",
          title: "อัปโหลดไฟล์ไม่สำเร็จ",
          text: resp.message || "",
          isToast: true,
        });
        return false;
      }

      await $fetch(resp.data.presigned_url, {
        method: "PUT",
        body: payload.file,
      });

      payload.id = resp.data.id;

      if (toValue(options.singleFile) || toValue(options.multipleSingle)) {
        files.value.forEach((item) => {
          if (item.preview) URL.revokeObjectURL(item.preview);
        });
        files.value = [payload];
      } else {
        files.value.push(payload);
      }

      return true;
    } catch (error: any) {
      console.log("Error uploading file:", error);
      URL.revokeObjectURL(preview);
      showAlert({
        type: "error",
        title: "อัปโหลดไฟล์ไม่สำเร็จ",
        text: error?.message || error?.data?.message || "",
        isToast: true,
      });
      return false;
    }
  };

  const handleFileUpload = async (event: Event) => {
    if (toValue(options.disabled)) return;

    const target = event.target as HTMLInputElement;
    const selectedFiles = target.files;
    if (!selectedFiles?.length) return;

    setLoading(true);

    try {
      for (const file of selectedFiles) {
        const maxSize = toValue(options.maxSize);
        if (maxSize && file.size > maxSize) {
          showAlert({ type: "error", title: "ไฟล์มีขนาดใหญ่เกินกำหนด", text: `ขนาดไฟล์ต้องไม่เกิน ${maxSize / 1024 / 1024} MB`, isToast: true });
          continue;
        }
        if (!isFileAllowedByRule(file, toValue(options.rule))) {
          showAlert({
            type: "error",
            title: "ประเภทไฟล์ไม่ถูกต้อง",
            isToast: true,
          });
          return;
        }

        await uploadFile(file);

        if (toValue(options.singleFile) || toValue(options.multipleSingle)) break;
      }

      options.onCallback?.(files.value);
    } finally {
      setLoading(false);
      target.value = "";
    }
  };

  watch(
    () => toValue(options.currentlyFiles),
    (value) => {
      currentlyFiles.value = value ?? [];
    },
    { deep: true },
  );

  watch(
    () => toValue(options.clearfile),
    (value) => {
      if (!value) return;

      files.value.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
      files.value = [];
    },
  );

  return {
    loading,
    currentlyFiles,
    files,
    removeFile,
    handleFileUpload,
  };
};
