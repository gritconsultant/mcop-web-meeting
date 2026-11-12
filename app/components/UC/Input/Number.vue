<template>
  <div
    v-if="leadingText || trailingText"
    class="flex w-full overflow-hidden rounded-lg border border-[#AFAFAF] focus-within:border-neutral-300 aria-invalid:border-error aria-invalid:focus-within:border-error has-aria-invalid:border-error has-aria-invalid:focus-within:border-error aria-invalid:[&>span]:border-error has-aria-invalid:[&>span]:border-error"
  >
    <span
      v-if="leadingText"
      class="flex shrink-0 items-center justify-center border-r border-[#AFAFAF] bg-[#F6F6F6] px-2 text-sm text-[#7C7C7C] select-none whitespace-nowrap"
      :style="{ width: leadingTextWidth }"
    >
      {{ leadingText }}
    </span>
    <UInput
      type="text"
      inputmode="decimal"
      color="neutral"
      size="lg"
      class="min-w-0 flex-1"
      :disabled="isDisabled"
      v-bind="inputAttrs"
      :model-value="textValue"
      :ui="affixUi"
      @keydown="onKeydown"
      @focus="onFocus"
      @blur="onBlur"
      @update:model-value="onUpdate"
    />
    <span
      v-if="trailingText"
      class="flex shrink-0 items-center justify-center border-l border-[#AFAFAF] bg-[#F6F6F6] px-2 text-sm text-[#7C7C7C] select-none whitespace-nowrap"
      :style="{ width: trailingTextWidth }"
    >
      {{ trailingText }}
    </span>
  </div>

  <UInput
    v-else
    type="text"
    inputmode="decimal"
    color="neutral"
    size="lg"
    class="w-full"
    :disabled="isDisabled"
    v-bind="inputAttrs"
    :model-value="textValue"
    :ui="defaultUi"
    @keydown="onKeydown"
    @focus="onFocus"
    @blur="onBlur"
    @update:model-value="onUpdate"
  />
</template>

<script setup lang="ts">
import {
  formBusInjectionKey,
  formFieldInjectionKey,
} from "@nuxt/ui/composables";
import { appInputUi } from "~/utils/ui/input";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    leadingText?: string;
    trailingText?: string;
    leadingTextWidth?: string;
    trailingTextWidth?: string;
    ui?: Record<string, unknown>;
    formatOptions?: Intl.NumberFormatOptions;
    isDecimal?: number;
    min?: number;
    max?: number;
    disabled?: boolean;
    textAlign?: "left" | "right";
  }>(),
  {
    leadingTextWidth: "5rem",
    trailingTextWidth: "5rem",
    textAlign: "right",
  },
);

const modelValue = defineModel<number | null | undefined>();
const attrs = useAttrs();
const textValue = ref("");
const isFocused = ref(false);

const formBus = inject(formBusInjectionKey, undefined);
const formField = inject(formFieldInjectionKey, undefined);

const allowDecimal = computed(() => props.isDecimal !== undefined);

const isDisabled = computed(() => props.disabled || Boolean(attrs.disabled));

const inputAttrs = computed(() => {
  const {
    class: _class,
    disabled: _disabled,
    type: _type,
    step: _step,
    placeholder,
    ...rest
  } = attrs;
  return {
    ...rest,
    placeholder: isDisabled.value
      ? undefined
      : (placeholder as string | undefined),
  };
});

const parseNumber = (value: string) => parseFloat(value.replace(/,/g, ""));

const formatNumber = (value: number) =>
  value.toLocaleString("en-US", {
    useGrouping: true,
    minimumFractionDigits: props.isDecimal ?? 0,
    maximumFractionDigits: props.isDecimal ?? 0,
    ...props.formatOptions,
  });

const syncTextFromModel = (value: number | null | undefined) => {
  if (value == null) {
    textValue.value = "";
    return;
  }
  textValue.value = isFocused.value ? String(value) : formatNumber(value);
};

watch(
  modelValue,
  (value) => {
    if (isFocused.value) {
      const raw = textValue.value.replace(/,/g, "");
      if (value == null) {
        if (raw === "" || raw === ".") return;
        textValue.value = "";
        return;
      }
      if (Number(raw) === value) return;
      textValue.value = String(value);
      return;
    }
    syncTextFromModel(value);
  },
  { immediate: true },
);

const sanitizeNumericInput = (value: string) => {
  let cleaned = value.replace(/,/g, "");

  if (allowDecimal.value) {
    cleaned = cleaned.replace(/[^\d.]/g, "");
    const [integer = "", ...fractionParts] = cleaned.split(".");
    const fraction = fractionParts.join("").slice(0, props.isDecimal);
    cleaned = fractionParts.length > 0 ? `${integer}.${fraction}` : integer;
  } else {
    cleaned = cleaned.replace(/\D/g, "");
  }

  return cleaned;
};

const revalidateField = () => {
  const name = formField?.value?.name;
  if (!formBus || !name) return;
  formBus.emit({ type: "change", name });
};

const clampNumber = (value: number) => {
  let next = value;
  if (props.min != null && next < props.min) next = props.min;
  if (props.max != null && next > props.max) next = props.max;
  return next;
};

const wouldExceedMax = (candidate: string) => {
  if (props.max == null) return false;
  if (!candidate || candidate === "." || candidate.endsWith(".")) return false;
  const num = parseNumber(candidate);
  return !Number.isNaN(num) && num > props.max;
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const navigationKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
  ];
  if (navigationKeys.includes(event.key)) return;

  if (allowDecimal.value && (event.key === "." || event.key === ",")) {
    if (textValue.value.replace(/,/g, "").includes(".")) event.preventDefault();
    return;
  }

  if (!/^\d$/.test(event.key)) {
    event.preventDefault();
    return;
  }

  // บล็อกพิมพ์เกินจำนวนทศนิยมที่กำหนด (กัน DOM ค้างค่าเกินเพราะ Vue ไม่ re-render)
  const input = event.target as HTMLInputElement | null;
  if (!input || !allowDecimal.value) return;

  const start = input.selectionStart ?? textValue.value.length;
  const end = input.selectionEnd ?? textValue.value.length;
  const next = `${textValue.value.slice(0, start)}${event.key}${textValue.value.slice(end)}`;
  const cleanedNext = next.replace(/,/g, "").replace(/[^\d.]/g, "");
  if (sanitizeNumericInput(cleanedNext) !== cleanedNext) {
    event.preventDefault();
    return;
  }
  if (wouldExceedMax(sanitizeNumericInput(cleanedNext))) {
    event.preventDefault();
  }
};

const onFocus = async (event?: FocusEvent) => {
  isFocused.value = true;
  if (modelValue.value == null) {
    textValue.value = "";
    return;
  }
  if (modelValue.value === 0) {
    textValue.value = "";
    await nextTick();
    return;
  }
  textValue.value = String(modelValue.value);
  await nextTick();
  (event?.target as HTMLInputElement | null)?.select?.();
};

const onBlur = () => {
  isFocused.value = false;
  if (modelValue.value == null) {
    textValue.value = "";
    return;
  }
  textValue.value = formatNumber(modelValue.value);
};

const onUpdate = (value: string | number | null | undefined) => {
  const raw = value == null ? "" : String(value);
  let sanitized = sanitizeNumericInput(raw);

  if (!sanitized.includes(".") && sanitized !== "") {
    sanitized = sanitized.replace(/^0+(?=\d)/, "");
  }

  if (wouldExceedMax(sanitized)) {
    sanitized = String(props.max);
  }

  if (raw !== sanitized && textValue.value === sanitized) {
    textValue.value = "";
    nextTick(() => {
      textValue.value = sanitized;
    });
  } else {
    textValue.value = sanitized;
  }

  if (!sanitized || sanitized === ".") {
    modelValue.value = null;
    nextTick(revalidateField);
    return;
  }

  const num = parseNumber(sanitized);
  if (!Number.isNaN(num)) {
    modelValue.value = clampNumber(num);
  }
  nextTick(revalidateField);
};

const textAlignClass = computed(() =>
  props.textAlign === "left" ? "text-left" : "text-right",
);

const buildBase = (extra?: string) =>
  [appInputUi.base, textAlignClass.value, extra, props.ui?.base]
    .filter(Boolean)
    .join(" ");

const defaultUi = computed(() => ({
  ...props.ui,
  base: buildBase(),
}));

const affixUi = computed(() => ({
  ...props.ui,
  base: buildBase("!rounded-none !border-0 !ring-0 focus-visible:!ring-0"),
}));
</script>
