<template>
  <div
    class="uc-editor flex flex-col gap-3 rounded-md border-[0.7px] border-[#afafaf] bg-white p-3"
    :class="{ 'uc-editor--readonly': readonly }"
  >
    <ClientOnly>
      <UCEditorToolbar
        v-if="!readonly && editor"
        class="self-start"
        :editor="editor"
        :actions="actions"
      />

      <EditorContent
        v-if="editor"
        :editor="editor"
        class="uc-editor__body min-h-[280px] w-full text-sm leading-normal text-[#222]"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { EditorContent, useEditor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import type { UCEditorAction } from "~/utils/editor/toolbar";
import { UC_EDITOR_ACTIONS } from "~/utils/editor/toolbar";

/**
 * Rich text editor กลางของระบบ (UC) — TipTap + toolbar ตาม Figma
 * ใช้ซ้ำได้ทุกหน้า: <UCEditor v-model="html" />
 */
const props = withDefaults(
  defineProps<{
    placeholder?: string;
    readonly?: boolean;
    /** ถ้าไม่ส่ง จะใช้ชุดเครื่องมือมาตรฐานตาม Figma */
    actions?: UCEditorAction[];
  }>(),
  {
    placeholder: "กรอกรายละเอียด",
    readonly: false,
    actions: () => UC_EDITOR_ACTIONS,
  },
);

const model = defineModel<string>({ default: "" });

const editor = useEditor({
  content: model.value || "",
  editable: !props.readonly,
  extensions: [
    StarterKit.configure({
      heading: false,
      code: false,
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
      strike: false,
    }),
    TextAlign.configure({
      types: ["paragraph"],
      alignments: ["left", "center", "right"],
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
  ],
  editorProps: {
    attributes: {
      class:
        "uc-editor__prose min-h-[280px] w-full outline-none text-sm leading-normal text-[#222]",
    },
  },
  onUpdate: ({ editor: ed }) => {
    const html = ed.getHTML();
    if (html !== model.value) model.value = html;
  },
});

watch(
  () => model.value,
  (value) => {
    if (!editor.value) return;
    const next = value || "";
    if (editor.value.getHTML() === next) return;
    editor.value.commands.setContent(next, { emitUpdate: false });
  },
);

watch(
  () => props.readonly,
  (readonly) => {
    editor.value?.setEditable(!readonly);
  },
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style scoped>
.uc-editor__body :deep(.tiptap) {
  min-height: 280px;
  outline: none;
}

.uc-editor__body :deep(.tiptap p) {
  margin: 0 0 0.75em;
}

.uc-editor__body :deep(.tiptap ul),
.uc-editor__body :deep(.tiptap ol) {
  margin: 0 0 0.75em;
  padding-left: 1.25rem;
}

.uc-editor__body :deep(.tiptap li) {
  margin: 0.15em 0;
}

.uc-editor__body :deep(.tiptap p.is-editor-empty:first-child::before) {
  color: #7c7c7c;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
