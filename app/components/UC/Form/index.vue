<template>
  <UForm
    ref="uc-form-ref"
    v-bind="attrs"
    :validate-on="resolvedValidateOn"
    @error="onError"
    @submit="onSubmit"
  >
    <slot />
  </UForm>
</template>

<script setup lang="ts">
import {
  formValidationInjectionKey,
  useFormValidation,
  type FormValidation,
  type FormValidateEvent,
} from "~/composables/useFormValidation";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    validation?: FormValidation;
    validateMode?: "submit-first" | "live";
    focusOnError?: boolean;
  }>(),
  {
    validateMode: "submit-first",
    focusOnError: true,
  },
);

const emit = defineEmits<{
  submit: [event: unknown];
  error: [event: unknown];
}>();

const attrs = useAttrs();
const formRef = useTemplateRef("uc-form-ref");
const localValidation = useFormValidation();
const validationApi = props.validation ?? localValidation;

provide(formValidationInjectionKey, validationApi);

const LIVE_VALIDATE_ON: FormValidateEvent[] = ["input", "change", "blur"];

const resolvedValidateOn = computed(() => {
  if (props.validateMode === "live") return LIVE_VALIDATE_ON;
  return validationApi.validateOn;
});

const focusFirstInvalidField = async () => {
  await nextTick();

  const root = (formRef.value as { $el?: HTMLElement } | null)?.$el;
  const errorEl = root?.querySelector<HTMLElement>('[data-slot="error"]');
  if (!errorEl) return;

  const field = errorEl.closest<HTMLElement>('[data-slot="root"]') ?? errorEl;
  field.scrollIntoView({ behavior: "smooth", block: "center" });

  const focusable = field.querySelector<HTMLElement>(
    'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  focusable?.focus({ preventScroll: true });
};

const onError = (event: unknown) => {
  if (props.validateMode === "submit-first") {
    validationApi.onFormError();
  }
  if (props.focusOnError) {
    focusFirstInvalidField();
  }
  emit("error", event);
};

const onSubmit = (event: unknown) => {
  emit("submit", event);
};

defineExpose({
  isInvalid: validationApi.isInvalid,
  isValidate: validationApi.isValidate,
  reset: validationApi.reset,
  clear: (name?: string) => formRef.value?.clear(name),
  validate: (opts?: any) => formRef.value?.validate(opts),
  validation: validationApi,
});
</script>
