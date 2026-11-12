import type { InjectionKey } from "vue";
import { onFieldErrorChange } from "~/utils/validate/errorField";

export type FormValidateEvent = "blur" | "input" | "change";

export type FormValidation = {
  errors: Record<string, string | undefined>;
  isDirty: boolean;
  isInvalid: boolean;
  /** alias ของ isInvalid — ใช้กับ :disabled ของปุ่มบันทึก */
  isValidate: boolean;
  validateOn: FormValidateEvent[];
  onErrorChange: (name: string, error: string | undefined) => void;
  onFormError: () => void;
  reset: () => void;
  removeErrorsByFieldIndex: (field: string, index: number) => void;
  removeErrorsByFieldName: (field: string) => void;
};

export const formValidationInjectionKey: InjectionKey<FormValidation> =
  Symbol("uc-form-validation");

const LIVE_VALIDATE_ON: FormValidateEvent[] = ["input", "change", "blur"];

/**
 * Validate หลังกดบันทึกก่อน แล้วค่อยเปิด live validate
 * ใช้คู่กับ `UCForm` — ส่งผ่าน prop `:validation`
 */
export const useFormValidation = (): FormValidation => {
  const errors = ref<Record<string, string | undefined>>({});
  const validateOn = ref<FormValidateEvent[]>([]);
  const isDirty = ref<boolean>(false);

  const isInvalid = computed(() =>
    Object.values(errors.value).some((error) => error !== undefined),
  );

  const onErrorChange = (name: string, error: string | undefined) => {
    onFieldErrorChange(errors, name, error);
  };

  const onFormError = () => {
    validateOn.value = LIVE_VALIDATE_ON;
  };

  const removeErrorsByFieldName = (field: string) => {
    delete errors.value[field];
  };

  const removeErrorsByFieldIndex = ( field: string, index: number) => {
    removeFieldErrorsByIndex(errors, field, index);
  };

  const reset = () => {
    errors.value = {};
    validateOn.value = [];
    isDirty.value = false;
  };

  return reactive({
    errors,
    isDirty,
    isInvalid,
    isValidate: isInvalid,
    validateOn,
    onErrorChange,
    onFormError,
    reset,
    removeErrorsByFieldIndex,
    removeErrorsByFieldName,
  }) as FormValidation;
};
