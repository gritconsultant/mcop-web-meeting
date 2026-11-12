<template>
  <UFormField v-bind="$attrs" :eager-validation="eagerValidation">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </UFormField>
</template>

<script setup lang="ts">
import { formErrorsInjectionKey } from "@nuxt/ui/composables";
import { formValidationInjectionKey } from "~/composables/useFormValidation";

const emit = defineEmits<{
  errorChange: [name: string, error: string | undefined];
}>();
withDefaults(
  defineProps<{
    eagerValidation?: boolean;
  }>(),
  {
    eagerValidation: true,
  },
);

const attrs = useAttrs();
const formErrors = inject(formErrorsInjectionKey, undefined);
const formValidation = inject(formValidationInjectionKey, null);

const currentError = computed(() => {
  const name = attrs.name as string | undefined;
  if (!name || !formErrors?.value) return undefined;
  return formErrors.value.find((error) => error.name === name)?.message;
});

watch(currentError, (error) => {
  const name = attrs.name as string | undefined;
  if (!name) return;
  emit("errorChange", name, error);
  formValidation?.onErrorChange(name, error);
});
</script>
