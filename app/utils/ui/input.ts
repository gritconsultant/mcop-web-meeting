export const APP_INPUT_BASE_CLASSES = [
  "!ring-0",
  "w-full",
  "rounded-lg",
  "border",
  "border-[#AFAFAF]",
  "bg-white",
  "px-4",
  "py-2",
  "text-sm",
  "text-[#222222]",
  "placeholder:text-[#7C7C7C]",
  "focus:outline-none",
  "focus:ring-0",
  "focus-visible:!ring-0",
  "focus-visible:outline-none",
  "aria-invalid:!ring-0",
  "aria-invalid:border-error",
  "disabled:cursor-not-allowed",
  "disabled:pointer-events-none",
  // ทับ disabled:opacity-75 ของ Nuxt UI ให้ select/textarea จางเท่ากับ UCInput (.hrm-input-view-field)
  "disabled:opacity-100",
  "disabled:border-[#AFAFAF]",
  "disabled:bg-[#F5F5F5]",
  "disabled:text-[#6B7280]",
  "disabled:placeholder:text-[#6B7280]",
].join(" ");

// Theme variants merge with Nuxt UI defaults, so override disabled:bg-default explicitly.
export const APP_SELECT_OUTLINE_CLASSES =
  "text-highlighted bg-default ring ring-inset ring-accented hover:bg-elevated disabled:bg-[#F5F5F5]";

export const appInputUi = {
  base: APP_INPUT_BASE_CLASSES,
} as const;
