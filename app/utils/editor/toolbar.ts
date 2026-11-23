import boldIcon from "~/assets/icon/editor/bold.svg";
import italicIcon from "~/assets/icon/editor/italic.svg";
import underlineIcon from "~/assets/icon/editor/underline.svg";
import alignLeftIcon from "~/assets/icon/editor/align-left.svg";
import alignCenterIcon from "~/assets/icon/editor/align-center.svg";
import alignRightIcon from "~/assets/icon/editor/align-right.svg";
import listBulletIcon from "~/assets/icon/editor/list-bullet.svg";
import listOrderedIcon from "~/assets/icon/editor/list-ordered.svg";
import type { Editor } from "@tiptap/vue-3";

export type UCEditorActionId =
  | "bold"
  | "italic"
  | "underline"
  | "alignLeft"
  | "alignCenter"
  | "alignRight"
  | "bulletList"
  | "orderedList";

export type UCEditorAction = {
  id: UCEditorActionId;
  label: string;
  icon: string;
  isActive: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
};

/** ชุดเครื่องมือมาตรฐานตาม Figma — ใช้ร่วมกันได้ทุกหน้า */
export const UC_EDITOR_ACTIONS: UCEditorAction[] = [
  {
    id: "bold",
    label: "ตัวหนา",
    icon: boldIcon,
    isActive: (editor) => editor.isActive("bold"),
    run: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    id: "italic",
    label: "ตัวเอียง",
    icon: italicIcon,
    isActive: (editor) => editor.isActive("italic"),
    run: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    id: "underline",
    label: "ขีดเส้นใต้",
    icon: underlineIcon,
    isActive: (editor) => editor.isActive("underline"),
    run: (editor) => editor.chain().focus().toggleUnderline().run(),
  },
  {
    id: "alignLeft",
    label: "ชิดซ้าย",
    icon: alignLeftIcon,
    isActive: (editor) => editor.isActive({ textAlign: "left" }),
    run: (editor) => editor.chain().focus().setTextAlign("left").run(),
  },
  {
    id: "alignCenter",
    label: "จัดกลาง",
    icon: alignCenterIcon,
    isActive: (editor) => editor.isActive({ textAlign: "center" }),
    run: (editor) => editor.chain().focus().setTextAlign("center").run(),
  },
  {
    id: "alignRight",
    label: "ชิดขวา",
    icon: alignRightIcon,
    isActive: (editor) => editor.isActive({ textAlign: "right" }),
    run: (editor) => editor.chain().focus().setTextAlign("right").run(),
  },
  {
    id: "bulletList",
    label: "รายการหัวข้อ",
    icon: listBulletIcon,
    isActive: (editor) => editor.isActive("bulletList"),
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: "orderedList",
    label: "รายการลำดับ",
    icon: listOrderedIcon,
    isActive: (editor) => editor.isActive("orderedList"),
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
];
