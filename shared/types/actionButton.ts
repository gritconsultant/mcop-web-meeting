export type ActionButtonPreset = 'view' | 'delete' | 'edit' | 'print' | 'download' | 'next'

export type ActionButtonVariant =
  | 'view'
  | 'delete'
  | 'edit'
  | 'print'
  | 'download'
  | 'neutral'
  | 'success'
  | 'warning'

export interface ActionButtonPresetConfig {
  icon: string
  label: string
  variant: ActionButtonVariant
}

export const ACTION_BUTTON_PRESETS: Record<ActionButtonPreset, ActionButtonPresetConfig> = {
  view: {
    icon: 'i-lucide-eye',
    label: 'ดูรายละเอียด',
    variant: 'view',
  },
  delete: {
    icon: 'i-lucide-trash-2',
    label: 'ลบ',
    variant: 'delete',
  },
  edit: {
    icon: 'i-lucide-pencil',
    label: 'แก้ไข',
    variant: 'edit',
  },
  print: {
    icon: 'i-lucide-printer',
    label: 'พิมพ์',
    variant: 'print',
  },
  download: {
    icon: 'i-lucide-download',
    label: 'ดาวน์โหลด',
    variant: 'download',
  },
  next: {
    icon: 'i-lucide-search',
    label: 'ดูรายการถัดไป',
    variant: 'view',
  },
}
