import type {
  CurrentlyFile,
  FileRemovePayload,
  UploadedFile,
} from "#shared/types/file";

type ApiFileLike = {
  id?: string;
  url?: string;
  file_name?: string;
  file_names?: string;
  size?: string | number;
  convert_size?: string;
};

/** แปลง response จาก API ให้เป็น shape ที่ `UCUpload` ใช้ได้ */
export const toCurrentlyFile = (file: ApiFileLike): CurrentlyFile => ({
  id: file.id ?? "",
  url: file.url ?? "",
  file_names: file.file_names ?? file.file_name ?? "",
  size: file.size != null ? String(file.size) : undefined,
  convert_size: file.convert_size,
});

export const toCurrentlyFiles = (files: ApiFileLike[] = []) =>
  files.map(toCurrentlyFile);

/** ดึง storage id จากไฟล์ที่อัปโหลดใหม่ เพื่อส่งต่อ API */
export const getUploadedFileIds = (files: UploadedFile[]) =>
  files.map((file) => file.id).filter(Boolean);

/** รวม id ไฟล์เดิม + ไฟล์ใหม่ หลังหักรายการที่ลบ */
export const mergeFileIds = ({
  existingIds = [],
  uploadedFiles = [],
  deletedIds = [],
}: {
  existingIds?: string[];
  uploadedFiles?: UploadedFile[];
  deletedIds?: string[];
}) => {
  const deleted = new Set(deletedIds);
  const keptExisting = existingIds.filter((id) => !deleted.has(id));
  const uploaded = getUploadedFileIds(uploadedFiles);

  return [...keptExisting, ...uploaded];
};

/** สร้าง state tracker สำหรับฟอร์มที่มี upload + ลบไฟล์เดิม */
export const createUploadFormState = (initialFiles: CurrentlyFile[] = []) => {
  const existingFiles = ref<CurrentlyFile[]>([...initialFiles]);
  const uploadedFiles = ref<UploadedFile[]>([]);
  const deletedFileIds = ref<string[]>([]);
  const isUploading = ref(false);

  const onUpload = (files: UploadedFile[]) => {
    uploadedFiles.value = files;
  };

  const onDelete = (payload: FileRemovePayload) => {
    if (!payload.id) return;
    if (!deletedFileIds.value.includes(payload.id)) {
      deletedFileIds.value.push(payload.id);
    }
  };

  const fileIdsForSubmit = computed(() =>
    mergeFileIds({
      existingIds: existingFiles.value.map((file) => file.id),
      uploadedFiles: uploadedFiles.value,
      deletedIds: deletedFileIds.value,
    }),
  );

  const reset = (files: CurrentlyFile[] = []) => {
    existingFiles.value = [...files];
    uploadedFiles.value = [];
    deletedFileIds.value = [];
    isUploading.value = false;
  };

  return reactive({
    existingFiles,
    uploadedFiles,
    deletedFileIds,
    isUploading,
    fileIdsForSubmit,
    onUpload,
    onDelete,
    reset,
  });
};
