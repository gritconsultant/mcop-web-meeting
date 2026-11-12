<template>
  <div>
    <UPopover v-model:open="showOptions" :dismissible="false" :ui="popoverUi">
      <template #anchor>
        <div
          :id="id"
          ref="containerRef"
          :class="localCustomInputClass"
          @click="toggleDropdown"
        >
          <div class="flex items-center gap-1 relative">
            <div
              v-if="!showOptions"
              class="text-sm w-full overflow-hidden flex items-center justify-between"
              :class="props.disabled ? 'text-gray-500' : ''"
            >
              <div
                class="w-full"
                :class="customClassRight"
                v-if="localSelect.id || localSelect.name"
              >
                <div class="flex items-center gap-1 pr-10 min-w-0">
                  <div
                    v-if="localSelect.status"
                    class="px-1 py-1 flex items-center gap-1 group"
                    :class="[
                      props.disabled ? 'opacity-50' : '',
                      localSelect.customClassStatus
                        ? localSelect.customClassStatus
                        : 'text-xs text-[#008E6D] font-bold',
                    ]"
                  >
                    <svg
                      xmlns="http://www.w3.org/w3.org/2000/svg"
                      width="8"
                      height="8"
                      viewBox="0 0 8 8"
                      fill="none"
                    >
                      <circle
                        cx="4"
                        cy="4"
                        r="4"
                        :fill="
                          localSelect.iconStatusColor
                            ? localSelect.iconStatusColor
                            : '#008E6D'
                        "
                      />
                    </svg>
                    <span
                      :class="[
                        localSelect.customClassStatus
                          ? localSelect.customClassStatus
                          : 'text-xs text-[#008E6D] font-bold',
                      ]"
                    >
                      {{ localSelect.status }}
                    </span>
                  </div>
                  <div
                    v-if="localSelect.urlImage && props.isImage"
                    class="w-5 h-5"
                  >
                    <div class="w-5 h-5">
                      <img
                        :src="localSelect.urlImage"
                        alt="image"
                        class="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>
                  <div
                    v-if="localSelect.headerName"
                    :class="[
                      props.disabled ? 'opacity-50' : '',
                      localSelect.customClassHeader
                        ? localSelect.customClassHeader
                        : 'bg-[#811919] text-white rounded-[4px] text-xs w-fit px-1 py-1',
                    ]"
                  >
                    <span>
                      {{ localSelect.headerName }}
                    </span>
                  </div>
                  <div
                    v-if="localSelect.middleName"
                    :class="[
                      props.disabled ? 'opacity-50' : '',
                      localSelect.customClassMiddleName
                        ? localSelect.customClassMiddleName
                        : 'bg-[#F582F1] text-white rounded-3xl text-xs w-fit px-1 py-1',
                      'min-w-0',
                    ]"
                  >
                    <span class="truncate block">
                      {{ localSelect.middleName }}
                    </span>
                  </div>
                  <div
                    v-if="localSelect.tagName"
                    :class="[
                      props.disabled ? 'opacity-50' : '',
                      localSelect.customClassTagName
                        ? localSelect.customClassTagName
                        : 'bg-[#EDECEC] text-darkTextHover group-hover:text-darkTextHover min-w-24 rounded-[4px] text-xs text-center py-1',
                      'min-w-0',
                    ]"
                  >
                    <span class="truncate block">
                      {{ localSelect.tagName }}
                    </span>
                  </div>
                  <div class="min-w-0">
                    <span
                      class="text-nowrap truncate block"
                      :class="
                        localSelect.customClassName
                          ? localSelect.customClassName
                          : ''
                      "
                    >
                      {{ localSelect.name }}
                    </span>
                  </div>
                  <!-- ค่าใหม่ที่ user พิมพ์เอง (allowCreate) -->
                  <span
                    v-if="localSelect.isNew"
                    class="shrink-0 rounded-full border border-[#fedf89] bg-[#fff4e5] px-2 text-[11px] text-[#b54708]"
                  >
                    ใหม่
                  </span>
                </div>
              </div>
              <div v-else class="truncate">
                <span
                  v-if="placeholder"
                  :class="
                    props.customClassPlaceholder
                      ? props.customClassPlaceholder
                      : 'text-gray-400'
                  "
                  >{{ placeholder }}</span
                >
              </div>
            </div>
            <div v-else class="w-full">
              <div v-if="props.isSearch" class="w-full">
                <input
                  type="text"
                  v-model="search"
                  :placeholder="props.searchPlaceholder || 'ค้นหา'"
                  @input="onChangeSearch"
                  @keydown.enter.prevent="onCreateNew"
                  class="w-full outline-none"
                  :class="[
                    props.customClass
                      ? props.customClass
                      : 'bg-white border-color',
                  ]"
                  ref="searchInputRef"
                  @click.stop="handleClickSearch"
                />
              </div>
            </div>
            <div class="w-5 flex justify-center items-center relative">
              <Icon
                v-if="
                  !props.disabled &&
                  !props.isClose &&
                  (localSelect.id || localSelect.name) &&
                  !showOptions
                "
                name="material-symbols:close-small-rounded"
                class="cursor-pointer hover:text-red-500"
                size="20"
                @click.stop="onChange(selectItemDefuailt)"
              />
            </div>
            <div
              v-if="!props.disabled"
              class="w-5 flex justify-center items-center relative"
              :class="props.disabled ? 'text-gray-400' : ''"
            >
              <Icon
                :name="props.icon"
                size="20"
                class="text-[#7C7C7C]"
                :class="[{ 'rotate-180': showOptions }]"
              />
            </div>
          </div>
        </div>
      </template>

      <template #content>
        <!-- <ul ref="scrollBoxSelect" class="max-h-60 overflow-y-auto rounded-md">
          <li
            v-if="!props.loading"
            v-for="(item, index) in options"
            :key="item.id"
            @click="onChange(item)"
            class="px-3 py-2 text-sm truncate text-black"
            :class="[
              checkOption(item) && !checkIsDisabled(item)
                ? 'bg-graySelect text-white cursor-default'
                : checkIsDisabled(item)
                  ? 'text-[#222222] font-normal opacity-50'
                  : 'hover:bg-[#b5b5b5] hover:text-white cursor-pointer',
              { 'rounded-b-md': index === options.length - 1 },
            ]"
          >
            <div class="flex items-center gap-2 text-wrap wrap-break-word">
              <div v-if="item.urlImage && props.isImage" class="w-5 h-5">
                <div class="w-5 h-5">
                  <img
                    :src="item.urlImage"
                    alt="image"
                    class="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <div
                v-if="item.headerName"
                class="px-1 py-1"
                :class="[
                  props.disabled ? 'opacity-50' : '',
                  item.customClassHeader
                    ? item.customClassHeader
                    : 'bg-[#811919] rounded-[4px] text-white group-hover:text-white text-xs',
                ]"
              >
                <span>
                  {{ item.headerName }}
                </span>
              </div>
              <div
                v-if="item.middleName"
                class="px-1 py-1"
                :class="[
                  props.disabled ? 'opacity-50' : '',
                  item.customClassMiddleName
                    ? item.customClassMiddleName
                    : 'bg-[#F582F1] rounded-3xl text-white group-hover:text-white text-xs',
                ]"
              >
                <span>
                  {{ item.middleName }}
                </span>
              </div>
              <div
                v-if="item.tagName"
                class="px-1 py-1"
                :class="[
                  props.disabled ? 'opacity-50' : '',
                  item.customClassTagName
                    ? item.customClassTagName
                    : 'bg-[#EDECEC] rounded-[4px] text-[#222222] min-w-24 group-hover:text-[#222222] text-xs text-center',
                ]"
              >
                <span>
                  {{ item.tagName }}
                </span>
              </div>
              <div class="min-w-0">
                <span
                  v-if="!props.isShowingAllOptions"
                  :class="item.customClassName ? item.customClassName : ''"
                >
                  {{ item.name }}
                </span>
                <span v-else> {{ item.id }} {{ item.name }} </span>
              </div>
            </div>
          </li>
          <li v-if="props.loading" class="px-3 py-2 text-graySelect">
            <div class="flex items-center justify-center truncate">
              <div class="w-5 h-5">
                <Icon
                  name="mingcute:loading-line"
                  size="20"
                  class="text-[#7C7C7C] animate-spin"
                />
              </div>
              <span class="text-sm text-gray-400">กำลังโหลดข้อมูล...</span>
            </div>
          </li>
          <li
            v-if="options.length === 0 && !props.loading"
            class="px-3 py-2 text-graySelect"
          >
            <div class="flex items-center justify-center">
              <span class="text-sm text-gray-400">ไม่พบข้อมูล</span>
            </div>
          </li>
        </ul> -->
        <div ref="scrollBoxSelect" class="max-h-60 overflow-y-auto rounded-md">
          <ul v-if="props.loading" class="px-3 py-2 text-graySelect">
            <li class="flex items-center justify-center truncate">
              <div class="w-5 h-5">
                <Icon
                  name="mingcute:loading-line"
                  size="20"
                  class="text-[#7C7C7C] animate-spin"
                />
              </div>
              <span class="text-sm text-gray-400">กำลังโหลดข้อมูล...</span>
            </li>
          </ul>

          <ul
            v-else-if="options.length === 0 && !props.loading"
            class="px-3 py-2 text-graySelect"
          >
            <li class="flex items-center justify-center">
              <span class="text-sm text-gray-400">ไม่พบข้อมูล</span>
            </li>
          </ul>

          <!-- options list -->
          <ul v-else class="select-none rounded-md">
            <li
              v-if="!props.loading"
              v-for="(item, index) in options"
              :key="item.id"
              :ref="(el) => setOptionRef(el, item.id)"
              @click="onChange(item)"
              class="px-3 py-2 text-sm text-darkTextHover"
              :class="[
                checkOption(item) && !checkIsDisabled(item)
                  ? 'bg-[#edecec]  cursor-default'
                  : checkIsDisabled(item)
                    ? 'text-darkTextHover font-normal opacity-50'
                    : 'hover:bg-[#F9F9F9]  cursor-pointer',
                {
                  'rounded-b-md': index === options.length - 1,
                  'rounded-t-md': index === 0,
                },
              ]"
            >
              <div class="flex items-center gap-2 text-wrap wrap-break-word">
                <div
                  v-if="item.status"
                  class="px-1 py-1 flex items-center gap-1 group"
                  :class="[props.disabled ? 'opacity-50' : '']"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                  >
                    <circle
                      cx="4"
                      cy="4"
                      r="4"
                      :fill="
                        item.iconStatusColor ? item.iconStatusColor : '#008E6D'
                      "
                    />
                  </svg>
                  <span
                    :class="
                      item.customClassStatus
                        ? item.customClassStatus
                        : ' text-xs text-[#008E6D] font-bold'
                    "
                  >
                    {{ item.status }}
                  </span>
                </div>
                <div v-if="item.urlImage && props.isImage" class="w-5 h-5">
                  <div class="w-5 h-5">
                    <img
                      :src="item.urlImage"
                      alt="image"
                      class="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
                <div
                  v-if="item.headerName"
                  class="px-1 py-1"
                  :class="[
                    props.disabled ? 'opacity-50' : '',
                    item.customClassHeader
                      ? item.customClassHeader
                      : 'bg-[#811919] rounded-[4px] text-white group-hover:text-white text-xs',
                  ]"
                >
                  <span>
                    {{ item.headerName }}
                  </span>
                </div>
                <div
                  v-if="item.middleName"
                  class="px-1 py-1"
                  :class="[
                    props.disabled ? 'opacity-50' : '',
                    item.customClassMiddleName
                      ? item.customClassMiddleName
                      : 'bg-[#F582F1] rounded-3xl text-white group-hover:text-white text-xs',
                  ]"
                >
                  <span>
                    {{ item.middleName }}
                  </span>
                </div>
                <div
                  v-if="item.tagName"
                  class="px-1 py-1"
                  :class="[
                    props.disabled ? 'opacity-50' : '',
                    item.customClassTagName
                      ? item.customClassTagName
                      : 'bg-[#EDECEC] rounded-[4px] text-darkTextHover min-w-24 group-hover:text-darkTextHover text-xs text-center',
                  ]"
                >
                  <span>
                    {{ item.tagName }}
                  </span>
                </div>
                <div class="min-w-0 text-wrap">
                  <span
                    v-if="!props.isShowingAllOptions"
                    :class="item.customClassName ? item.customClassName : ''"
                  >
                    {{ item.name }}
                  </span>
                  <span v-else> {{ item.id }} {{ item.name }} </span>
                </div>
              </div>
            </li>
          </ul>

          <!-- ค้นหาไม่เจอ → เก็บคำค้นเป็นค่าใหม่ (ไม่มี id) -->
          <div
            v-if="canCreate"
            class="flex cursor-pointer items-center gap-2 rounded-b-md px-3 py-2 text-sm text-[#0066DA] hover:bg-[#E7F0FF]"
            @click="onCreateNew"
          >
            <Icon name="material-symbols:add" size="20" class="shrink-0" />
            <span class="min-w-0 break-words">
              เพิ่ม “{{ search.trim() }}” เป็นรายการใหม่
            </span>
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>

<script lang="ts" setup>
import { onClickOutside } from "@vueuse/core";
import { formFieldInjectionKey } from "@nuxt/ui/composables";

const props = defineProps({
  modelValue: {
    type: Object as PropType<Select>,
    required: true,
  },
  id: {
    type: String,
    default: "",
  },
  options: {
    type: Array<Select>,
    required: true,
  },
  placeholder: {
    type: String,
    default: "กรุณาเลือก",
  },
  customClassPlaceholder: {
    type: String,
    default: "",
  },
  searchPlaceholder: {
    type: String,
    default: "ค้นหา",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  customClass: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  isImage: {
    type: Boolean,
    default: false,
  },
  isClose: {
    type: Boolean,
    default: false,
  },
  isShowingAllOptions: {
    type: Boolean,
    default: false,
  },
  parentId: {
    type: String,
    default: "",
  },
  error: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  isSearch: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: "mingcute:down-line",
  },
  // ค้นหาไม่เจอ → มีปุ่ม "เพิ่ม" เก็บคำค้นเป็นค่าใหม่ { id: "", name, isNew: true }
  // ใช้คู่กับ isSearch (ไม่ส่ง = ทำงานแบบเดิม)
  allowCreate: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: Select): void;
  (e: "update:search", value: string): void;
  (e: "change", value: Select): void;
}>();

const { emitFormChange } = useFormField();

const modalContentId = inject("modalContentId", null);
const formField = inject(formFieldInjectionKey, undefined);
const containerRef = ref<HTMLElement | null>(null);
const showOptions = ref<boolean>(false);
const search = ref<string>("");
const selectItemDefuailt = ref<Select>({
  name: "",
  id: "",
});

const searchInputRef = useTemplateRef<HTMLInputElement>("searchInputRef");
const scrollBoxSelect = ref<HTMLDivElement | null>(null);
const lockedElements = ref<{ el: HTMLElement; overflow: string }[]>([]);

// เก็บ element ของแต่ละ option ไว้ เพื่อ scroll ไปยังรายการที่เลือก
const optionRefs = new Map<string, HTMLElement>();

const localSelect = computed({
  get: () => props.modelValue,
  set: (value: Select) => emit("update:modelValue", value),
});

const resolvedError = computed(() => {
  if (typeof props.error === "string" && props.error.length > 0) {
    return props.error;
  }
  const fieldError = formField?.value?.error;
  if (typeof fieldError === "string" && fieldError.length > 0) {
    return fieldError;
  }
  return fieldError ? "invalid" : undefined;
});

const localCustomInputClass = computed(() => {
  const { headerName, middleName, tagName } = props.modelValue;
  const hasValue = localSelect.value.id || props.placeholder;

  const isHaveValue = headerName || middleName || tagName;
  const isNormalError = Boolean(resolvedError.value) && !props.disabled;

  return [
    isHaveValue ? "input-infomation-tag" : "input-infomation",
    props.disabled
      ? "input-infomation-disabled border-color h-[38px]"
      : isNormalError
        ? "input-infomation-error !border-[#EF4444]"
        : "border-color",
    "cursor-pointer",
    "justify-between",
    !hasValue && "h-[38px]",
    !props.customClass && "bg-white",
    props.customClass && !props.disabled && !isNormalError && props.customClass,
  ]
    .filter(Boolean)
    .join(" ");
});

const customClassRight = computed(() => {
  const { headerName, middleName, tagName } = props.modelValue;

  const isHaveValue = headerName || middleName || tagName;

  const right = isHaveValue ? "right-[10px]" : "right-[1px]";
  const top = props.disabled ? "top-2.5" : isHaveValue ? "top-1/2" : "top-2.5";

  return [`absolute ${right} ${top} -translate-y-1/2`];
});

const popoverUi = computed(() => ({
  content: [
    "z-[60] w-(--reka-popper-anchor-width) bg-white rounded-lg shadow border border-color p-0",
    props.options.length > 6 ? "" : "",
  ]
    .filter(Boolean)
    .join(" "),
}));

watch(showOptions, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    onLockScroll();
    scrollToActiveItem();
    if (props.searchPlaceholder) {
      searchInputRef.value?.focus({ preventScroll: true });
    }
  } else {
    onUnlockScroll();
  }
  onCheckIsSearch();
});

watch(
  () => props.parentId,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      emit("update:search", "");
    }
  },
);

const onCheckIsSearch = () => {
  if (search.value || (props.parentId && showOptions.value)) {
    search.value = "";
    emit("update:search", "");
  }
};

const setOptionRef = (el: unknown, id: string) => {
  if (el instanceof HTMLElement) {
    optionRefs.set(id, el);
  } else {
    optionRefs.delete(id);
  }
};

const toggleDropdown = () => {
  if (props.disabled) return;
  showOptions.value = !showOptions.value;
  onCheckIsSearch();

  if (showOptions.value) {
    // ถ้ากำลังจะเปิด
    nextTick(() => {
      // calculateDropdownPosition();
      scrollToActiveItem();
      if (props.searchPlaceholder && searchInputRef.value) {
        // searchInputRef.value.focus();
        searchInputRef.value?.focus({ preventScroll: true });
      }
    });
  }
};

function debounce<F extends (...args: any[]) => any>(
  func: F,
  waitFor: number,
): F {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  }) as F;

  return debounced;
}

const debounceGetItemList = debounce(() => {
  emit("update:search", search.value);
}, 500);

const onChange = (item: Select) => {
  if (checkIsDisabled(item)) return;
  if (
    checkOption(item) &&
    localSelect.value.id !== "" &&
    localSelect.value.name !== ""
  )
    return;
  // clear all value
  Object.keys(localSelect.value as Select).forEach((key: string) => {
    delete localSelect.value[key as keyof Select];
  });
  // assign new value
  Object.assign(localSelect.value, {
    id: item.id,
    name: item.name,
    ...(item.value ? { value: item.value } : {}),
    ...(item.headerName && {
      headerName: item.headerName,
      customClassHeader: item.customClassHeader,
    }),
    ...(item.tagName && {
      tagName: item.tagName,
      customClassTagName: item.customClassTagName,
    }),
    ...(item.middleName && {
      middleName: item.middleName,
      customClassMiddleName: item.customClassMiddleName,
    }),
    ...(item.customClassName && {
      customClassName: item.customClassName,
    }),
    ...(props.isImage && { urlImage: item.urlImage }),
    ...(item.status && { status: item.status }),
    ...(item.iconStatusColor && { iconStatusColor: item.iconStatusColor }),
    ...(item.customClassStatus && {
      customClassStatus: item.customClassStatus,
    }),
  });

  emit("change", localSelect.value);
  showOptions.value = false;
  onCheckIsSearch();
  emitFormChange();
};

// ---------- allow create (ค่าใหม่ที่ไม่มี id) ----------
const canCreate = computed<boolean>(() => {
  if (!props.allowCreate || props.loading) return false;
  const q = search.value.trim().toLocaleLowerCase();
  if (!q) return false;
  return !props.options.some(
    (o) => (o.name ?? "").trim().toLocaleLowerCase() === q,
  );
});

const onCreateNew = () => {
  if (!canCreate.value) return;
  const name = search.value.trim();
  Object.keys(localSelect.value as Select).forEach((key: string) => {
    delete localSelect.value[key as keyof Select];
  });
  Object.assign(localSelect.value, { id: "", name, isNew: true });
  emit("change", localSelect.value);
  showOptions.value = false;
  onCheckIsSearch();
  emitFormChange();
};

const handleClickSearch = () => {
  showOptions.value = true;
};

const checkOption = (item: Select): boolean => {
  return item.id === localSelect.value.id;
};

const checkIsDisabled = (item: Select): boolean => {
  return item.isDisabled || false;
};

const onChangeSearch = () => {
  debounceGetItemList();
};

const cutLastCharacter = (str: string) => {
  return str.split("-").pop() || ""; // ตัดตัวสุดท้าย 3 ตัว
};

const isScrollable = (el: HTMLElement): boolean => {
  const style = window.getComputedStyle(el);
  const overflowY = style.overflowY;
  const overflowX = style.overflowX;

  const canScroll =
    overflowY === "auto" ||
    overflowY === "scroll" ||
    overflowX === "auto" ||
    overflowX === "scroll";

  return (
    canScroll &&
    (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)
  );
};

const onLockScroll = () => {
  const useName = modalContentId ? "modal" : "body";
  const scope = modalContentId
    ? document.getElementById(
        `modal-content-scroll-${cutLastCharacter(modalContentId)}`,
      )
    : document.body;
  const allElements = scope?.querySelectorAll<HTMLElement>("*") ?? [];
  allElements.forEach((el) => {
    if (!isScrollable(el)) return;
    // ไม่ lock ถ้าเป็นตัว dropdown หรือ parent ของ dropdown
    if (
      scrollBoxSelect.value &&
      (el === scrollBoxSelect.value || el.contains(scrollBoxSelect.value))
    ) {
      return;
    }
    lockedElements.value.push({
      el,
      overflow: el.style.overflow,
    });

    el.style.overflow = "hidden";
  });
  switch (useName) {
    case "body": {
      const scrollY = window.scrollY;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        const currentPaddingRight = parseFloat(
          window.getComputedStyle(document.body).paddingRight || "0",
        );
        document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
      }
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      break;
    }
    case "modal": {
      const modalEl = modalContentId
        ? document.getElementById(
            `modal-content-scroll-${cutLastCharacter(modalContentId)}`,
          )
        : null;
      if (modalEl) {
        const scrollbarWidth = modalEl.offsetWidth - modalEl.clientWidth;
        if (scrollbarWidth > 0) {
          const currentPaddingRight = parseFloat(
            window.getComputedStyle(modalEl).paddingRight || "0",
          );
          modalEl.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
        }
        modalEl.style.overflow = "hidden";
      }
      break;
    }
    default:
      break;
  }
};

const onUnlockScroll = () => {
  const useName = modalContentId ? "modal" : "body";
  lockedElements.value.forEach(({ el, overflow }) => {
    el.style.overflow = overflow; // restore ค่าเดิม
  });
  lockedElements.value = []; // clear array
  switch (useName) {
    case "body": {
      const top = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.paddingRight = "";
      window.scrollTo(0, -parseInt(top || "0"));
      break;
    }
    case "modal": {
      const modalEl = modalContentId
        ? document.getElementById(
            `modal-content-scroll-${cutLastCharacter(modalContentId)}`,
          )
        : null;
      if (modalEl) {
        modalEl.style.overflow = "";
        modalEl.style.paddingRight = "";
      }
      break;
    }
    default:
      break;
  }
};

const scrollToActiveItem = () => {
  if (!localSelect.value?.id || !props.options?.length) return;

  // เลื่อนไปยัง element ของรายการที่ถูกเลือกให้อยู่ในระยะที่มองเห็น
  nextTick(() => {
    const el = optionRefs.get(localSelect.value.id);
    el?.scrollIntoView({ block: "nearest" });
  });
};

onClickOutside(
  containerRef,
  () => {
    if (showOptions.value) {
      showOptions.value = false;
    }
  },
  { ignore: [scrollBoxSelect] },
);
</script>

<style scoped>
.bg-graySelect {
  background-color: #767676;
}
</style>
