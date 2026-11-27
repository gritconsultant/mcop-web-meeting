<template>
  <div>
    <div class="relative flex border-b border-color my-2 gap-1">
      <button
        v-for="(menu, index) in menusWithActive"
        :key="index"
        :ref="(el) => setTabRef(el, index)"
        type="button"
        class="relative btn-md rounded-t-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimsonedYellow/40 transition-colors"
        :class="[
          menu.active ? 'bg-[#444444] cursor-default' : 'hover:bg-gray-100/60',
          menu.disabled
            ? 'cursor-not-allowed opacity-50'
            : menu.active
              ? ''
              : 'cursor-pointer active:scale-[0.97]',
        ]"
        :disabled="menu.disabled"
        @click="!menu.disabled && !menu.active && changeMenu(index)"
      >
        <span
          class="font-bold text-sm relative"
          :class="menu.active ? 'text-white' : 'text-[#1A1E24]'"
        >
          {{ menu.label }}
        </span>
      </button>

      <div
        aria-hidden="true"
        class="absolute -bottom-px h-0.5 bg-[#444444] rounded-full pointer-events-none transition-all duration-[420ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        :style="{
          left: `${indicatorLeft}px`,
          width: `${indicatorWidth}px`,
          opacity: indicatorWidth > 0 ? 1 : 0,
        }"
      ></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface MainMenu {
  label: string;
  page?: string;
  link?: string;
  active?: boolean;
  disabled?: boolean;
}

interface Props {
  menus: MainMenu[];
  type?: string | "page" | "link" | "tab";
  manualNavigate?: boolean;
}

const props = defineProps<Props>();
const router = useRouter();
const route = useRoute();
const emit = defineEmits<{
  (e: "changeMenu", menu: MainMenu): void;
}>();

const resolveInitialIndex = () => {
  const t = props.type;
  if (!t || t === "tab") {
    return props.menus.findIndex((m) => m.active === true);
  }
  if (t === "page") {
    const byActive = props.menus.findIndex((m) => m.active === true);
    if (byActive !== -1) return byActive;
    return props.menus.findIndex((m) => m.page === route.path);
  }
  return -1;
};

const initial = resolveInitialIndex();
const activeIndex = ref<number | null>(initial === -1 ? null : initial);

const tabRefs = ref<HTMLElement[]>([]);
const indicatorLeft = ref(0);
const indicatorWidth = ref(0);

const setTabRef = (el: any, index: number) => {
  if (el) tabRefs.value[index] = el as HTMLElement;
};

const menusWithActive = computed(() => {
  return props.menus.map((menu, index) => ({
    ...menu,
    active:
      activeIndex.value === index ||
      (activeIndex.value === null && menu.active),
  }));
});

const updateIndicator = () => {
  const idx = menusWithActive.value.findIndex((m) => m.active);
  const el = idx >= 0 ? tabRefs.value[idx] : null;
  if (!el) {
    indicatorWidth.value = 0;
    return;
  }
  indicatorLeft.value = el.offsetLeft;
  indicatorWidth.value = el.offsetWidth;
};

const changeMenu = async (index: number) => {
  const menu = props.menus[index];
  if (!menu || menusWithActive.value[index]?.active) return;

  if (props.manualNavigate) {
    emit("changeMenu", menu);
    return;
  }

  activeIndex.value = index;
  emit("changeMenu", menu);
  await nextTick();
  updateIndicator();

  if (!props.type) {
    return;
  } else if (props.type === "page") {
    try {
      await router.push(menu.page as string);
    } catch (error) {
      console.warn("Navigation prevented:", error);
    }
  } else if (props.type === "link") {
    try {
      await router.push(menu.link as string);
    } catch (error) {
      console.warn("Navigation prevented:", error);
    }
  }
};

const onCheckMenu = () => {
  let foundIndex = null;
  if (!props.type || props.type === "tab") {
    foundIndex = props.menus.findIndex((menu) => menu.active === true);
  } else if (props.type === "page" || props.type === "link") {
    const key = props.type === "page" ? "page" : "link";
    const path = route.path.replace(/\/$/, "") || "/";
    foundIndex = props.menus.findIndex((menu) => menu.active === true);
    if (foundIndex === -1) {
      foundIndex = props.menus.findIndex((menu) => menu[key] === path);
    }
  }
  if (foundIndex !== null && foundIndex !== -1) {
    activeIndex.value = foundIndex;
  } else {
    activeIndex.value = null;
  }
  nextTick(() => updateIndicator());
};

onMounted(() => {
  onCheckMenu();
  window.addEventListener("resize", updateIndicator);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateIndicator);
});

watch(
  () => route.path,
  () => {
    onCheckMenu();
  },
);

watch(
  () => props.menus,
  () => {
    if (props.type === "tab") {
      onCheckMenu();
    } else {
      nextTick(() => updateIndicator());
    }
  },
  { deep: true },
);
</script>
