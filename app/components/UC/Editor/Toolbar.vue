<template>
  <div
    class="uc-editor-toolbar inline-flex w-fit max-w-full shrink-0 items-stretch self-start overflow-visible rounded-[3px] border-[0.5px] border-[#afafaf]"
    role="toolbar"
    aria-label="จัดรูปแบบข้อความ"
  >
    <button
      v-for="(action, index) in actions"
      :key="action.id"
      type="button"
      class="uc-editor-toolbar__btn relative inline-flex size-[35px] shrink-0 items-center justify-center"
      :class="[
        index > 0 ? 'border-l-[0.5px] border-[#afafaf]' : '',
        isActive(action) ? 'bg-[#edecec]' : '',
      ]"
      :title="action.label"
      :aria-label="action.label"
      :aria-pressed="isActive(action)"
      :disabled="!editor"
      @mousedown.prevent="onRun(action)"
    >
      <img
        :src="action.icon"
        alt=""
        class="pointer-events-none size-[35px] max-w-none"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import type { UCEditorAction } from "~/utils/editor/toolbar";
import { UC_EDITOR_ACTIONS } from "~/utils/editor/toolbar";

const props = withDefaults(
  defineProps<{
    editor: Editor | null;
    actions?: UCEditorAction[];
  }>(),
  {
    actions: () => UC_EDITOR_ACTIONS,
  },
);

/** tick ให้ปุ่ม active ตาม selection ของ TipTap */
const tick = ref(0);
watch(
  () => props.editor,
  (editor, _prev, onCleanup) => {
    if (!editor) return;
    const bump = () => {
      tick.value += 1;
    };
    editor.on("selectionUpdate", bump);
    editor.on("transaction", bump);
    onCleanup(() => {
      editor.off("selectionUpdate", bump);
      editor.off("transaction", bump);
    });
  },
  { immediate: true },
);

const isActive = (action: UCEditorAction) => {
  void tick.value;
  if (!props.editor) return false;
  return action.isActive(props.editor);
};

const onRun = (action: UCEditorAction) => {
  if (!props.editor) return;
  action.run(props.editor);
};
</script>
