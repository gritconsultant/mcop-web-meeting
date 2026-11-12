import { APP_INPUT_BASE_CLASSES, APP_SELECT_OUTLINE_CLASSES } from "~/utils/ui/input";

export default defineAppConfig({
  ui: {
    colors: {
      primary: "amber",
      neutral: "neutral",
    },
    input: { slots: { base: APP_INPUT_BASE_CLASSES } },
    textarea: { slots: { base: APP_INPUT_BASE_CLASSES } },
    select: { slots: { base: APP_INPUT_BASE_CLASSES }, variants: { variant: { outline: APP_SELECT_OUTLINE_CLASSES } } },
    selectMenu: { slots: { base: APP_INPUT_BASE_CLASSES }, variants: { variant: { outline: APP_SELECT_OUTLINE_CLASSES } } },
    inputMenu: { slots: { base: APP_INPUT_BASE_CLASSES } },
    inputNumber: { slots: { base: APP_INPUT_BASE_CLASSES } },
    inputDate: { slots: { base: APP_INPUT_BASE_CLASSES } },
    formField: { slots: { error: "text-form-error text-error" } },
    // ตอน disabled ไม่จาง (opacity-75 ของ Nuxt UI) แต่ใช้สีเทาเดียวกับ input (#6B7280 / #F5F5F5 / #AFAFAF)
    checkbox: {
      variants: {
        disabled: {
          true: {
            root: "opacity-100",
            base: "cursor-not-allowed border-[#AFAFAF] bg-[#F5F5F5] data-[state=checked]:bg-[#F5F5F5] data-[state=checked]:text-[#6B7280]",
            label: "cursor-not-allowed text-[#6B7280]",
          },
        },
      },
    },
    switch: {
      variants: {
        color: {
          info: {
            base: "data-[state=checked]:bg-[#0066DA] focus-visible:outline-[#0066DA]",
          },
        },
      },
    },
  },
});
