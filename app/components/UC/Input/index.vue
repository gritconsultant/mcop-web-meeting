<template>
  <!-- textarea ขยายหลายบรรทัดเมื่อพิมพ์ยาว -->
  <UTextarea
    v-if="multiline"
    color="neutral"
    size="lg"
    class="w-full"
    :class="{ 'hrm-input-view': isReadonly }"
    :rows="rows"
    :autoresize="autoresize"
    :readonly="isReadonly"
    :disabled="isDisabled"
    v-bind="inputAttrs"
    :model-value="modelValue"
    :ui="mergedUi"
    @update:model-value="onUpdate"
    @beforeinput="onBeforeInput"
    @keydown="onKeydown"
    @paste="onPaste"
    @focus="onFocus"
    @blur="onBlur"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </UTextarea>

  <div
    v-else-if="leadingText || trailingText"
    class="flex w-full overflow-hidden rounded-lg border border-[#AFAFAF] focus-within:border-neutral-300 aria-invalid:border-error aria-invalid:focus-within:border-error has-aria-invalid:border-error has-aria-invalid:focus-within:border-error aria-invalid:[&>span]:border-error has-aria-invalid:[&>span]:border-error"
  >
    <!-- prefix ด้านหน้า -->
    <span
      v-if="leadingText"
      class="flex shrink-0 items-center justify-center border-r border-[#AFAFAF] bg-[#F6F6F6] px-2 text-sm text-[#7C7C7C] select-none whitespace-nowrap"
      :style="{ width: leadingTextWidth }"
    >
      {{ leadingText }}
    </span>
    <UInput
      color="neutral"
      size="lg"
      class="min-w-0 flex-1"
      :class="{ 'hrm-input-view': isReadonly }"
      :readonly="isReadonly"
      :disabled="isDisabled"
      v-bind="inputAttrs"
      :model-value="modelValue"
      :ui="affixUi"
      @update:model-value="onUpdate"
      @beforeinput="onBeforeInput"
      @keydown="onKeydown"
      @paste="onPaste"
      @focus="onFocus"
      @blur="onBlur"
    >
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </UInput>
    <!-- suffix ด้านหลัง -->
    <span
      v-if="trailingText"
      class="flex shrink-0 items-center justify-center border-l border-[#AFAFAF] bg-[#F6F6F6] px-2 text-sm text-[#7C7C7C] select-none whitespace-nowrap"
      :style="{ width: trailingTextWidth }"
    >
      {{ trailingText }}
    </span>
  </div>

  <!-- input ธรรมดา -->
  <UInput
    v-else
    color="neutral"
    size="lg"
    class="w-full"
    :class="{ 'hrm-input-view': isReadonly }"
    :readonly="isReadonly"
    :disabled="isDisabled"
    v-bind="inputAttrs"
    :model-value="modelValue"
    :ui="mergedUi"
    @update:model-value="onUpdate"
    @beforeinput="onBeforeInput"
    @keydown="onKeydown"
    @paste="onPaste"
    @focus="onFocus"
    @blur="onBlur"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </UInput>
</template>

<script setup lang="ts">
import { appInputUi } from "~/utils/ui/input";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** ข้อความ prefix ด้านหน้า input */
    leadingText?: string;
    /** ข้อความ suffix ด้านหลัง input */
    trailingText?: string;
    /** ความกว้างของกล่อง prefix */
    leadingTextWidth?: string;
    /** ความกว้างของกล่อง suffix */
    trailingTextWidth?: string;
    isDecimal?: number;
    readonly?: boolean;
    disabled?: boolean;
    /** รับเฉพาะตัวเลข 0-9 */
    digitsOnly?: boolean;
    /** ไม่อนุญาตช่องว่างในข้อความ */
    noSpaces?: boolean;
    /** รับเฉพาะตัวอักษรภาษาอังกฤษ A-Z a-z และช่องว่าง / - / ' */
    englishOnly?: boolean;
    /** อนุญาตจุดเพิ่มเติมเมื่อใช้ englishOnly */
    allowDot?: boolean;
    /** รับเฉพาะภาษาอังกฤษ ตัวเลข และ + - _ @ . สำหรับอีเมล */
    emailOnly?: boolean;
    /** รับเฉพาะอักษรไทย + ช่องว่าง/เครื่องหมายทั่วไป (กันภาษาอังกฤษและตัวเลข) */
    thaiOnly?: boolean;
    /** รับเฉพาะตัวเลข 0-9 และตัวอักษรภาษาอังกฤษ A-Z a-z (ไม่รับช่องว่าง/สัญลักษณ์/ภาษาไทย) */
    alphanumericOnly?: boolean;
    /** แสดงเป็น textarea แทน input (เริ่มบรรทัดเดียวแล้วขยายเมื่อพิมพ์ยาว) */
    multiline?: boolean;
    /** จำนวนบรรทัดเริ่มต้นเมื่อ multiline */
    rows?: number;
    /** ขยายความสูงอัตโนมัติเมื่อ multiline */
    autoresize?: boolean;
    ui?: Record<string, unknown>;
  }>(),
  {
    leadingTextWidth: "5rem",
    trailingTextWidth: "5rem",
    readonly: false,
    disabled: false,
    digitsOnly: false,
    noSpaces: false,
    englishOnly: false,
    allowDot: false,
    emailOnly: false,
    thaiOnly: false,
    alphanumericOnly: false,
    multiline: false,
    rows: 1,
    autoresize: true,
  },
);

const modelValue = defineModel<string>();

const attrs = useAttrs();

const isReadonly = computed(() => props.readonly || Boolean(attrs.readonly));

const isDisabled = computed(() => props.disabled || Boolean(attrs.disabled));

const isReadonlyOrDisabled = computed(
  () => isReadonly.value || isDisabled.value,
);

const hasCharFilter = computed(
  () =>
    props.noSpaces ||
    props.digitsOnly ||
    props.englishOnly ||
    props.emailOnly ||
    props.thaiOnly ||
    props.alphanumericOnly,
);

const THAI_TEXT_PATTERN = /^[\u0E00-\u0E7F\s.'-]*$/;
const ENGLISH_TEXT_PATTERN = /^[A-Za-z\s'-]*$/;
const EMAIL_TEXT_PATTERN = /^[A-Za-z0-9+_@.-]*$/;
const DIGITS_PATTERN = /^\d*$/;
const ALPHANUMERIC_PATTERN = /^[0-9A-Za-z_]*$/;

const inputAttrs = computed(() => {
  const {
    class: _class,
    readonly: _readonly,
    disabled: _disabled,
    placeholder: _placeholder,
    ...rest
  } = attrs;

  return {
    ...rest,
    placeholder:
      !isReadonly.value && typeof _placeholder === "string"
        ? _placeholder
        : undefined,
  };
});

const maxLength = computed(() => {
  const raw = attrs.maxlength ?? attrs.maxLength;
  if (raw == null || raw === "") return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
});

const isNumber = computed(
  () => attrs.type === "number" || props.isDecimal !== undefined,
);

const readonlyInputClass = "hrm-input-view-field";

const buildBase = (extra?: string) =>
  [
    appInputUi.base,
    isNumber.value && "text-right",
    isReadonlyOrDisabled.value && readonlyInputClass,
    extra,
    props.ui?.base,
  ]
    .filter(Boolean)
    .join(" ");

const mergedUi = computed(() => ({
  ...props.ui,
  base: buildBase(),
}));

const affixUi = computed(() => ({
  ...props.ui,
  base: buildBase("!rounded-none !border-0 !ring-0 focus-visible:!ring-0"),
}));

const isAllowedText = (text: string) => {
  if (props.noSpaces && /\s/.test(text)) return false;
  if (props.emailOnly && !EMAIL_TEXT_PATTERN.test(text)) return false;
  if (props.alphanumericOnly) return ALPHANUMERIC_PATTERN.test(text);
  if (props.digitsOnly) return DIGITS_PATTERN.test(text);
  if (props.englishOnly) {
    return ENGLISH_TEXT_PATTERN.test(props.allowDot ? text.replace(/\./g, "") : text);
  }
  if (props.thaiOnly) return THAI_TEXT_PATTERN.test(text);
  return true;
};

const sanitizeValue = (value: string) => {
  let next = value ?? "";
  if (props.emailOnly) next = next.replace(/[^A-Za-z0-9+_@.-]/g, "");
  if (props.alphanumericOnly) next = next.replace(/[^0-9A-Za-z_]/g, "");
  if (props.digitsOnly) next = next.replace(/\D/g, "");
  if (props.englishOnly) {
    next = next.replace(props.allowDot ? /[^A-Za-z\s.'-]/g : /[^A-Za-z\s'-]/g, "");
  }
  if (props.thaiOnly) next = next.replace(/[^\u0E00-\u0E7F\s.'-]/g, "");
  if (props.noSpaces) next = next.replace(/\s/g, "");
  if (maxLength.value != null) next = next.slice(0, maxLength.value);
  return next;
};

const onUpdate = (value: string) => {
  modelValue.value = sanitizeValue(value ?? "");
};

const onBeforeInput = (event: Event) => {
  if (!hasCharFilter.value) return;
  const inputEvent = event as InputEvent;
  const type = inputEvent.inputType ?? "";
  if (
    type.startsWith("delete") ||
    type === "historyUndo" ||
    type === "historyRedo"
  ) {
    return;
  }

  const data = inputEvent.data;

  // ภาษาไทยใช้ IME — ปล่อย composition ของอักษรไทย แล้วไป sanitize ตอน update
  // แต่ถ้า data เป็นตัวเลข/อังกฤษ ให้บล็อกทันที
  if (
    props.thaiOnly &&
    (inputEvent.isComposing ||
      type.includes("Composition") ||
      type === "insertCompositionText")
  ) {
    if (data != null && data !== "" && /[0-9A-Za-z]/.test(data)) {
      inputEvent.preventDefault();
    }
    return;
  }

  if (data == null || data === "") return;
  if (!isAllowedText(data)) {
    inputEvent.preventDefault();
  }
};

const onKeydown = (event: KeyboardEvent) => {
  if (!hasCharFilter.value) return;
  // อย่าบล็อก keydown ของช่องไทย — คีย์บอร์ดไทยยิงเป็น A-Z ระหว่าง IME
  if (props.thaiOnly) return;
  if (event.isComposing || event.key === "Process") return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const controlKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Enter",
    "Escape",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
  ];
  if (controlKeys.includes(event.key)) return;
  if (event.key.length !== 1) return;
  if (!isAllowedText(event.key)) {
    event.preventDefault();
  }
};

const onPaste = (event: ClipboardEvent) => {
  if (!hasCharFilter.value) return;
  const text = event.clipboardData?.getData("text") ?? "";
  event.preventDefault();
  const cleaned = sanitizeValue(text);
  if (!cleaned) return;

  const input = event.target as HTMLInputElement | null;
  if (!input || typeof input.selectionStart !== "number") {
    modelValue.value = sanitizeValue(`${modelValue.value ?? ""}${cleaned}`);
    return;
  }

  const start = input.selectionStart ?? 0;
  const end = input.selectionEnd ?? 0;
  const current = modelValue.value ?? "";
  const next = sanitizeValue(
    `${current.slice(0, start)}${cleaned}${current.slice(end)}`,
  );
  modelValue.value = next;
};

const parseNumber = (value: string) => parseFloat(value.replace(/,/g, ""));

const formatNumber = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: props.isDecimal,
    maximumFractionDigits: props.isDecimal,
  });

const onFocus = () => {
  if (props.isDecimal === undefined || !modelValue.value) return;
  const num = parseNumber(String(modelValue.value));
  if (isNaN(num)) return;
  modelValue.value = String(num);
};

const onBlur = () => {
  if (hasCharFilter.value && modelValue.value) {
    modelValue.value = sanitizeValue(modelValue.value);
  }
  if (props.isDecimal === undefined || !modelValue.value) return;
  const num = parseNumber(String(modelValue.value));
  if (isNaN(num)) return;
  modelValue.value = formatNumber(num);
};
</script>
