export type ModalMode = 'create' | 'update' | 'view'

const titleMap: Record<ModalMode, string> = {
  create: 'เพิ่ม',
  update: 'แก้ไข',
  view: 'รายละเอียด',
}

export const useModal = <T = unknown>(key = 'modal', resetFn?: () => void) => {
  const modalState = useState<boolean>(`${key}:modalState`, () => false)
  const isOpen = useState<boolean>(`${key}:isOpen`, () => false)
  const mode = useState<ModalMode>(`${key}:mode`, () => 'view')
  const id = useState<string>(`${key}:id`, () => '')
  const parentId = useState<string>(`${key}:parentId`, () => '')
  const item = useState<T | null>(`${key}:item`, () => null)
  const isConfirming = useState<boolean>(`${key}:isConfirming`, () => false)
  const visibility = computed(() =>
    isConfirming.value ? 'invisible pointer-events-none' : '',
  )

  const onChangeModal = (editing: boolean, reset?: () => void) => {
    if (!editing && reset) reset()
    mode.value = editing ? 'update' : 'view'
  }

  const toggleEditMode = (reset?: () => void) => {
    if (mode.value === 'update') {
      reset?.()
      mode.value = 'view'
      return
    }
    if (mode.value === 'view') {
      mode.value = 'update'
    }
  }

  const openModal = (
    type: ModalMode,
    recordId?: string,
    recordParentId?: string,
    record?: T,
  ) => {
    mode.value = type
    id.value = recordId ?? ''
    parentId.value = recordParentId ?? ''
    item.value = record ?? null
    modalState.value = true
  }

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
    id.value = ''
    parentId.value = ''
    item.value = null
    mode.value = 'view'
    modalState.value = false
    resetFn?.()
  }

  const route = useRoute()
  watch(
    () => route.fullPath,
    () => {
      if (isOpen.value || modalState.value) close()
    },
    { immediate: true },
  )

  const confirm = async (opts: Parameters<typeof showAlertConfirm>[0]) => {
    isConfirming.value = true
    const ok = await showAlertConfirm(opts)
    isConfirming.value = false
    return ok as boolean
  }

  const confirmed = async (
    opts: Parameters<typeof showAlertConfirm>[0],
    onConfirmed: () => void | Promise<void>,
  ) => {
    isConfirming.value = true
    const ok = await showAlertConfirm(opts)
    if (!ok) {
      isConfirming.value = false
      return false
    }

    try {
      await onConfirmed()
    }
    finally {
      isConfirming.value = false
    }

    return true
  }

  return {
    isOpen,
    isType: mode,
    mode,
    id,
    parentId,
    item,
    titleMap,
    isConfirming,
    visibility,
    modal: {
      id,
      parentId,
      state: modalState,
      onChangeModal,
      toggleEditMode,
      titleMap,
    },
    openModal,
    open,
    close,
    closeModal: close,
    confirm,
    confirmed,
  }
}

export const useFormState = <T extends object>(initial: T) => {
  const form = ref<T>({ ...initial })
  const original = ref<T>({ ...initial })

  const set = (data: Partial<T>) => {
    form.value = { ...form.value, ...data }
    original.value = JSON.parse(JSON.stringify(form.value))
  }

  const reset = () => {
    form.value = JSON.parse(JSON.stringify(original.value))
  }

  const clear = () => {
    form.value = { ...initial }
    original.value = { ...initial }
  }

  return { form, state: { set, reset, clear } }
}
