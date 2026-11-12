const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "jfif",
  "webp",
  "bmp",
  "tiff",
  "tif",
  "heif",
  "heic",
  "avif",
  "svg",
]);

export const DEFAULT_FILE_ACCEPT =
  "application/pdf,image/png,image/jpg,image/jpeg,image/jfif";

export const isImageExtension = (ext: string) => IMAGE_EXTENSIONS.has(ext);

export const findFileExtension = (url: string, fileName?: string) => {
  if (!url) return "";

  const match = url.match(/\.(pdf|jpg|jfif|jpeg|png|xlsx|docx)/i);
  if (match?.[1]) return match[1].toLowerCase();

  if (fileName) {
    const ext = fileName.split(".").pop();
    if (ext) return ext.toLowerCase();
  }

  return "";
};

export const formatFileSizeKb = (size: number) =>
  `${(size / 1024).toFixed(2)} KB`;

/** บล็อกเฉพาะชื่อว่าง — อักขระพิเศษจะถูกแทนด้วย `_` ตอนอัปโหลด */
export const isValidFileName = (name: string) => name.trim() !== "";

export const isFileAllowedByRule = (file: File, rule?: string) => {
  if (!rule?.trim()) return true;

  const tokens = rule
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (!tokens.length) return true;

  const mime = (file.type || "").toLowerCase();
  const extension = `.${(file.name.split(".").pop() || "").toLowerCase()}`;

  return tokens.some((token) => {
    if (token.startsWith(".")) return token === extension;
    if (token.includes("/")) return token === mime;
    return token === mime || `.${token}` === extension;
  });
};

const resolveStorageType = (
  mime: string,
  extension: string,
): { type: string; ext: string } | null => {
  if (
    mime === "application/pdf" ||
    mime === "application/x-pdf" ||
    extension === "pdf"
  ) {
    return { type: "pdf", ext: "pdf" };
  }

  if (
    mime === "image/jpeg" ||
    mime === "image/jpg" ||
    extension === "jpg" ||
    extension === "jpeg"
  ) {
    return { type: "jpg", ext: "jpg" };
  }

  if (mime === "image/png" || mime === "image/x-png" || extension === "png") {
    return { type: "png", ext: "png" };
  }

  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mime === "application/vnd.ms-excel" ||
    extension === "xlsx" ||
    extension === "xls" ||
    extension === "csv"
  ) {
    return {
      type: extension === "csv" ? "csv" : "xlsx",
      ext: extension === "csv" ? "csv" : "xlsx",
    };
  }

  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "application/msword" ||
    extension === "docx" ||
    extension === "doc"
  ) {
    return { type: "docx", ext: "docx" };
  }

  return null;
};


export const structureUploadedFile = (file: File) => {
  const extension = (file.name.split(".").pop() || "").toLowerCase();
  const mime = (file.type || "").toLowerCase();
  const mapped = resolveStorageType(mime, extension);
  if (!mapped) return null;

  let name = (file.name || "")
    .normalize("NFC")
    .replace(/[\\/:*?"<>|＼／：＊？＂＜＞｜]/g, "_");

  if (!/\.[^.]+$/.test(name)) {
    name = `${name}.${mapped.ext}`;
  }

  return { name, type: mapped.type };
};

export const FALLBACK_IMAGE_SRC =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0f0f0"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
