<template>
  <div>
    <UPopover v-model:open="showPanel" :dismissible="false" :ui="popoverUi">
      <template #anchor>
        <div
          ref="anchorEl"
          class="relative flex"
          :class="[props.customClassHeader]"
        >
          <input
            ref="inputEl"
            type="text"
            :id="id"
            class="input-infomation border"
            :class="[
              hasError ? 'input-infomation-error' : 'border-[#AFAFAF]',
              { 'input-infomation-disabled': props.disabled },
              props.customClass,
            ]"
            v-model="displayValue"
            @input="onInput"
            @blur="onBlur"
            @keydown.enter="handleEnter"
            :placeholder="
              !props.disabled && !isViewMode
                ? (props.placeholder ?? placeholderText)
                : ''
            "
            :disabled="props.disabled"
          />

          <Icon
            v-if="!props.disabled && !isViewMode"
            :name="
              showDatePart
                ? 'ic:baseline-calendar-month'
                : 'ic:baseline-access-time'
            "
            class="absolute right-4 top-1/2 -translate-y-1/2 text-[1.1em] cursor-pointer text-gray-500 hover:text-black"
            @click="showPanel = !showPanel"
          />

          <Icon
            v-if="displayValue && !props.disabled && !isViewMode"
            name="material-symbols:close-small-rounded"
            class="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer text-sm font-bold hover:text-red-500"
            size="20"
            @click="clearDate"
          />
        </div>
      </template>

      <template #content>
        <div
          ref="panelEl"
          class="bg-white p-4 rounded-lg"
          :class="
            showDatePart && showTimePart
              ? 'w-[400px]'
              : showDatePart
                ? 'w-80'
                : 'w-[200px]'
          "
          @click="closeHeadDropdowns"
        >
          <template v-if="showTimePart && !showDatePart">
            <div
              class="flex justify-center gap-2"
              :class="showDatePart ? 'mb-2' : ''"
            >
              <!-- ชั่วโมง -->
              <div class="relative w-[80px]">
                <div
                  class="absolute -top-2 left-2 bg-gray-100 text-gray-700 text-xs px-1 rounded-md z-10"
                >
                  ชั่วโมง
                </div>
                <div
                  @click.stop="toggleDropdown('hour')"
                  class="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm cursor-pointer text-center"
                >
                  {{ pad(currentHour) }}
                </div>
                <div
                  ref="hourDropdownEl"
                  v-if="openDropdown === 'hour'"
                  class="absolute left-0 right-0 mt-[-100%] max-h-[25vh] overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-lg z-20 scrollbar-thin"
                >
                  <div
                    v-for="hour in 24"
                    :key="hour - 1"
                    :data-hour="hour - 1"
                    @click="selectHour(hour - 1)"
                    :class="[
                      'px-3 py-2 mx-1 cursor-pointer text-sm text-center rounded',
                      hour - 1 === currentHour
                        ? 'bg-blue-100 font-medium'
                        : 'hover:bg-blue-50',
                    ]"
                  >
                    {{ pad(hour - 1) }}
                  </div>
                </div>
              </div>

              <!-- นาที -->
              <div class="relative w-[80px]">
                <div
                  class="absolute -top-2 left-2 bg-gray-100 text-gray-700 text-xs px-1 rounded-md z-10"
                >
                  นาที
                </div>
                <div
                  @click.stop="toggleDropdown('minute')"
                  class="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm cursor-pointer text-center"
                >
                  {{ pad(currentMinute) }}
                </div>
                <div
                  ref="minuteDropdownEl"
                  v-if="openDropdown === 'minute'"
                  class="absolute left-0 right-0 mt-[-100%] max-h-[25vh] overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-lg z-20 scrollbar-thin"
                >
                  <div
                    v-for="minute in 60"
                    :key="minute - 1"
                    :data-minute="minute - 1"
                    @click="selectMinute(minute - 1)"
                    :class="[
                      'px-3 py-2 mx-1 cursor-pointer text-sm text-center rounded',
                      minute - 1 === currentMinute
                        ? 'bg-blue-100 font-medium'
                        : 'hover:bg-blue-50',
                    ]"
                  >
                    {{ pad(minute - 1) }}
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-if="showDatePart">
            <div class="flex justify-center gap-2 mb-2">
              <!-- เดือน -->
              <div class="relative w-[110px]">
                <div
                  class="absolute -top-2 left-2 bg-gray-100 text-gray-700 text-xs px-1 rounded-md z-10"
                >
                  เดือน
                </div>
                <div
                  @click.stop="toggleMonthDropdown"
                  class="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm cursor-pointer text-center"
                >
                  {{ months[currentMonth] }}
                </div>
                <div
                  v-if="showMonthDropdown"
                  class="absolute left-0 right-0 mt-[-100%] max-h-[25vh] overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-lg z-20 scrollbar-thin"
                >
                  <div
                    v-for="(month, index) in months"
                    :key="month"
                    @click="selectMonth(index)"
                    :class="[
                      'px-3 py-2 mx-1 cursor-pointer text-sm text-center rounded',
                      index === currentMonth
                        ? 'bg-blue-100 font-base'
                        : 'hover:bg-blue-50',
                      isMonthDisabled(index)
                        ? 'pointer-events-none opacity-50'
                        : '',
                    ]"
                  >
                    {{ month }}
                  </div>
                </div>
              </div>

              <!-- ปี -->
              <div class="relative w-[110px]">
                <div
                  class="absolute -top-2 left-2 bg-gray-100 text-gray-700 text-xs px-1 rounded-md z-10"
                >
                  ปี
                </div>
                <div
                  @click.stop="toggleYearDropdown"
                  class="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm cursor-pointer text-center"
                >
                  {{ currentYear + 543 }}
                </div>
                <div
                  ref="yearDropdownEl"
                  v-if="showYearDropdown"
                  class="absolute left-0 right-0 mt-[-100%] max-h-[25vh] overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-lg z-20 scrollbar-thin"
                >
                  <div
                    v-for="year in yearsRange"
                    :key="year"
                    :data-year="year"
                    @click="selectYear(year)"
                    :class="[
                      'px-3 py-2 mx-1 cursor-pointer text-sm text-center rounded',
                      year === currentYear
                        ? 'bg-blue-100 font-base'
                        : 'hover:bg-blue-50',
                      isYearDisabled(year)
                        ? 'pointer-events-none opacity-50'
                        : '',
                    ]"
                  >
                    {{ year + 543 }}
                  </div>
                </div>
              </div>

              <div
                v-if="showTimePart"
                class="flex justify-center gap-2"
                :class="showDatePart ? 'mb-2' : ''"
              >
                <!-- ชั่วโมง -->
                <div class="relative w-[80px]">
                  <div
                    class="absolute -top-2 left-2 bg-gray-100 text-gray-700 text-xs px-1 rounded-md z-10"
                  >
                    ชั่วโมง
                  </div>
                  <div
                    @click.stop="toggleDropdown('hour')"
                    class="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm cursor-pointer text-center"
                  >
                    {{ pad(currentHour) }}
                  </div>
                  <div
                    v-if="openDropdown === 'hour'"
                    class="absolute left-0 right-0 mt-[-100%] max-h-[25vh] overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-lg z-20 scrollbar-thin"
                  >
                    <div
                      v-for="hour in 24"
                      :key="hour - 1"
                      @click="selectHour(hour - 1)"
                      :class="[
                        'px-3 py-2 mx-1 cursor-pointer text-sm text-center rounded',
                        hour - 1 === currentHour
                          ? 'bg-blue-100 font-medium'
                          : 'hover:bg-blue-50',
                      ]"
                    >
                      {{ pad(hour - 1) }}
                    </div>
                  </div>
                </div>

                <!-- นาที -->
                <div class="relative w-[80px]">
                  <div
                    class="absolute -top-2 left-2 bg-gray-100 text-gray-700 text-xs px-1 rounded-md z-10"
                  >
                    นาที
                  </div>
                  <div
                    @click.stop="toggleDropdown('minute')"
                    class="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm cursor-pointer text-center"
                  >
                    {{ pad(currentMinute) }}
                  </div>
                  <div
                    v-if="openDropdown === 'minute'"
                    class="absolute left-0 right-0 mt-[-100%] max-h-[25vh] overflow-y-auto border border-gray-300 rounded-lg bg-white shadow-lg z-20 scrollbar-thin"
                  >
                    <div
                      v-for="minute in 60"
                      :key="minute - 1"
                      @click="selectMinute(minute - 1)"
                      :class="[
                        'px-3 py-2 mx-1 cursor-pointer text-sm text-center rounded',
                        minute - 1 === currentMinute
                          ? 'bg-blue-100 font-medium'
                          : 'hover:bg-blue-50',
                      ]"
                    >
                      {{ pad(minute - 1) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-7 text-center font-bold">
              <div
                v-for="(day, i) in days"
                :key="i"
                :class="[
                  i % 7 === 0 ? 'text-red-500 font-bold' : '',
                  i % 7 === 6 ? 'text-gray-400' : '',
                ]"
              >
                {{ day }}
              </div>
            </div>

            <div class="grid grid-cols-7 gap-1 text-center mt-1">
              <div
                v-for="blank in firstDayOfMonth"
                :key="'b' + blank"
                class="text-transparent"
              >
                •
              </div>

              <div
                v-for="day in daysInMonth"
                :key="day"
                :class="[
                  'cursor-pointer rounded p-1',
                  currentDay == day && 'bg-blue-200',
                  getDayClass(day),
                  isDayDisabled(day) ? 'pointer-events-none opacity-50' : '',
                ]"
                @click="selectDay(day)"
              >
                {{ day }}
              </div>
            </div>
          </template>
        </div>
      </template>
    </UPopover>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import { formFieldInjectionKey } from "@nuxt/ui/composables";
const { emitFormInput, emitFormChange } = useFormField();

type DatePickerMode = "date" | "datetime" | "time";

const props = defineProps<{
  modelValue: string | undefined;
  label?: string;
  id?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  customClass?: string;
  customClassHeader?: string;
  isFax?: boolean;
  maxDate?: Date;
  minDate?: Date;
  styleLabel?: string;
  mode?: DatePickerMode;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | undefined): void;
  (e: "isValid", value: boolean): void;
}>();

const formField = inject(formFieldInjectionKey, undefined);

const resolvedError = computed(() => {
  if (props.error) return props.error;
  const fieldError = formField?.value?.error;
  return typeof fieldError === "string" && fieldError.length > 0
    ? fieldError
    : undefined;
});

const hasError = computed(
  () => Boolean(resolvedError.value) && !props.disabled,
);

const mode = computed<DatePickerMode>(() => props.mode ?? "date");
const showDatePart = computed(() => mode.value !== "time");
const showTimePart = computed(() => mode.value !== "date");
const isViewMode = computed(() => props.disabled === true);

const placeholderText = computed(() => {
  if (mode.value === "time") return "เลือกเวลา";
  if (mode.value === "datetime") return "เลือก วัน-เดือน-ปี เวลา";
  return "เลือก วัน-เดือน-ปี";
});

const pad = (n: number) => String(n).padStart(2, "0");
const toBuddhistYear = (year: number) => year + 543;
const toChristianYear = (year: number) => (year > 2400 ? year - 543 : year);

const popoverUi = {
  content: "z-[60] rounded-lg border border-color shadow-xl",
};

const inputEl = ref<HTMLInputElement | null>(null);
const anchorEl = ref<HTMLElement | null>(null);
const panelEl = ref<HTMLElement | null>(null);

const displayValue = ref("");
const showPanel = ref(false);
const openDropdown = ref<"hour" | "minute" | null>(null);
const showMonthDropdown = ref(false);
const showYearDropdown = ref(false);
const yearDropdownEl = ref<HTMLElement | null>(null);
const hourDropdownEl = ref<HTMLElement | null>(null);
const minuteDropdownEl = ref<HTMLElement | null>(null);

const months = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];
const days = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

const now = new Date();
const currentYear = ref(now.getFullYear());
const currentMonth = ref(now.getMonth());
const currentDay = ref(now.getDate());
const currentHour = ref(now.getHours());
const currentMinute = ref(now.getMinutes());

const selectedDate = ref<Date | null>(null);
const isInternalUpdate = ref(false);

const yearsRange = computed(() => {
  const base = new Date().getFullYear();
  const years: number[] = [];
  for (let y = base - 100; y <= base + 10; y++) years.push(y);
  return years;
});

const daysInMonth = computed(() =>
  new Date(currentYear.value, currentMonth.value + 1, 0).getDate(),
);

const firstDayOfMonth = computed(() =>
  new Date(currentYear.value, currentMonth.value, 1).getDay(),
);

const isYearDisabled = (year: number) => {
  if (props.maxDate && year > props.maxDate.getFullYear()) return true;
  if (props.minDate && year < props.minDate.getFullYear()) return true;
  return false;
};

const isMonthDisabled = (index: number) => {
  if (
    props.maxDate &&
    currentYear.value === props.maxDate.getFullYear() &&
    index > props.maxDate.getMonth()
  )
    return true;
  if (
    props.minDate &&
    currentYear.value === props.minDate.getFullYear() &&
    index < props.minDate.getMonth()
  )
    return true;
  if (props.maxDate && currentYear.value > props.maxDate.getFullYear())
    return true;
  if (props.minDate && currentYear.value < props.minDate.getFullYear())
    return true;
  return false;
};

const getDayClass = (day: number) => {
  const weekday = new Date(currentYear.value, currentMonth.value, day).getDay();
  const isSelected =
    selectedDate.value &&
    selectedDate.value.getFullYear() === currentYear.value &&
    selectedDate.value.getMonth() === currentMonth.value &&
    selectedDate.value.getDate() === day;
  if (isSelected) return "bg-blue-500 text-white";
  if (weekday === 0) return "text-red-500";
  if (weekday === 6) return "text-gray-400";
  return "";
};

const scrollToCurrentYear = () => {
  nextTick(() => {
    const el = yearDropdownEl.value?.querySelector(
      `[data-year="${currentYear.value}"]`,
    );
    el?.scrollIntoView({ block: "center" });
  });
};

const scrollToCurrentDropdown = () => {
  nextTick(() => {
    const el =
      openDropdown.value === "hour"
        ? hourDropdownEl.value?.querySelector(
            `[data-hour="${currentHour.value}"]`,
          )
        : minuteDropdownEl.value?.querySelector(
            `[data-minute="${currentMinute.value}"]`,
          );
    el?.scrollIntoView({ block: "center" });
  });
};

const closeHeadDropdowns = () => {
  openDropdown.value = null;
  showMonthDropdown.value = false;
  showYearDropdown.value = false;
};

const toggleDropdown = (name: "hour" | "minute") => {
  showMonthDropdown.value = false;
  showYearDropdown.value = false;
  openDropdown.value = openDropdown.value === name ? null : name;
  scrollToCurrentDropdown();
};

const toggleMonthDropdown = () => {
  openDropdown.value = null;
  showYearDropdown.value = false;
  showMonthDropdown.value = !showMonthDropdown.value;
};

const toggleYearDropdown = () => {
  openDropdown.value = null;
  showMonthDropdown.value = false;
  showYearDropdown.value = !showYearDropdown.value;
  if (showYearDropdown.value) scrollToCurrentYear();
};

const selectMonth = (index: number) => {
  currentMonth.value = index;
  showMonthDropdown.value = false;
  const maxDay = new Date(currentYear.value, index + 1, 0).getDate();
  if (currentDay.value > maxDay) currentDay.value = maxDay;
};

const selectYear = (year: number) => {
  currentYear.value = year;
  showYearDropdown.value = false;
  if (props.maxDate && year === props.maxDate.getFullYear()) {
    if (currentMonth.value > props.maxDate.getMonth())
      currentMonth.value = props.maxDate.getMonth();
  }
  if (props.minDate && year === props.minDate.getFullYear()) {
    if (currentMonth.value < props.minDate.getMonth())
      currentMonth.value = props.minDate.getMonth();
  }
  const maxDay = new Date(year, currentMonth.value + 1, 0).getDate();
  if (currentDay.value > maxDay) currentDay.value = maxDay;
};

const selectDay = (day: number) => {
  currentDay.value = day;
  commitFromParts();
  showPanel.value = false;
};

const selectHour = (hour: number) => {
  currentHour.value = hour;
  openDropdown.value = null;
  commitFromParts();
};

const selectMinute = (minute: number) => {
  currentMinute.value = minute;
  openDropdown.value = null;
  commitFromParts();
  showPanel.value = false;
};

const buildDate = () =>
  new Date(
    currentYear.value,
    currentMonth.value,
    currentDay.value,
    currentHour.value,
    currentMinute.value,
    0,
  );

const formatDisplay = (date: Date) => {
  if (mode.value === "time")
    return `${pad(currentHour.value)}:${pad(currentMinute.value)}`;

  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = toBuddhistYear(date.getFullYear());
  if (mode.value === "datetime")
    return `${d}/${m}/${y} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return `${d}/${m}/${y}`;
};

const buildEmitValue = (date: Date): string => {
  if (mode.value === "time")
    return `${pad(currentHour.value)}:${pad(currentMinute.value)}`;

  if (props.isFax) {
    return new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        0,
      ),
    )
      .toISOString()
      .replace(".000Z", "Z");
  }

  if (mode.value === "datetime")
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const commitFromParts = () => {
  const date = buildDate();
  if (isNaN(date.getTime())) {
    emit("update:modelValue", undefined);
    emit("isValid", false);
    emitFormChange();
    return;
  }
  selectedDate.value = date;
  isInternalUpdate.value = true;
  displayValue.value = formatDisplay(date);
  emit("update:modelValue", buildEmitValue(date));
  emit("isValid", true);
  nextTick(() => (isInternalUpdate.value = false));
  emitFormChange();
};

const resetToToday = () => {
  const today = new Date();
  currentYear.value = today.getFullYear();
  currentMonth.value = today.getMonth();
  currentDay.value = today.getDate();
  currentHour.value = today.getHours();
  currentMinute.value = today.getMinutes();
};

const clearDate = () => {
  displayValue.value = "";
  selectedDate.value = null;
  resetToToday();
  emit("update:modelValue", undefined);
  emit("isValid", true);
  emitFormChange();
};

const isDayDisabled = (day: number) => {
  const date = new Date(currentYear.value, currentMonth.value, day);
  date.setHours(0, 0, 0, 0);
  if (props.maxDate) {
    const max = new Date(props.maxDate);
    max.setHours(0, 0, 0, 0);
    if (date > max) return true;
  }
  if (props.minDate) {
    const min = new Date(props.minDate);
    min.setHours(0, 0, 0, 0);
    if (date < min) return true;
  }
  return false;
};

const formatTyped = (digits: string) => {
  if (mode.value === "time") {
    let out = digits.slice(0, 2);
    if (digits.length > 2) out += ":" + digits.slice(2, 4);
    return out;
  }
  let out = digits.slice(0, 2);
  if (digits.length > 2) out += "/" + digits.slice(2, 4);
  if (digits.length > 4) out += "/" + digits.slice(4, 8);
  if (mode.value === "datetime" && digits.length > 8)
    out += " " + digits.slice(8, 10);
  if (mode.value === "datetime" && digits.length > 10)
    out += ":" + digits.slice(10, 12);
  return out;
};

const onInput = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const rawDigits = input.value.replace(/\D/g, "");
  const maxDigits =
    mode.value === "time" ? 4 : mode.value === "datetime" ? 12 : 8;
  const digits = rawDigits.slice(0, maxDigits);

  displayValue.value = formatTyped(digits);

  if (mode.value === "time") {
    if (digits.length < 4) {
      isInternalUpdate.value = true;
      emit("update:modelValue", digits);
      emit("isValid", false);
      nextTick(() => (isInternalUpdate.value = false));
      emitFormInput();
      return;
    }
    const hour = Number(digits.slice(0, 2));
    const minute = Number(digits.slice(2, 4));
    if (hour > 23 || minute > 59) {
      emit("isValid", false);
      return;
    }
    currentHour.value = hour;
    currentMinute.value = minute;
    commitFromParts();
    return;
  }

  const requiredDigits = mode.value === "datetime" ? 12 : 8;
  if (digits.length < requiredDigits) {
    isInternalUpdate.value = true;
    emit("update:modelValue", digits);
    emit("isValid", false);
    nextTick(() => (isInternalUpdate.value = false));
    emitFormInput();
    return;
  }
  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = toChristianYear(Number(digits.slice(4, 8)));
  let hour = currentHour.value;
  let minute = currentMinute.value;
  if (mode.value === "datetime") {
    hour = Number(digits.slice(8, 10));
    minute = Number(digits.slice(10, 12));
  }

  const converted = new Date(year, month - 1, day, hour, minute, 0);
  if (
    isNaN(converted.getTime()) ||
    converted.getDate() !== day ||
    converted.getMonth() !== month - 1
  ) {
    emit("isValid", false);
    return;
  }

  currentYear.value = converted.getFullYear();
  currentMonth.value = converted.getMonth();
  currentDay.value = converted.getDate();
  currentHour.value = converted.getHours();
  currentMinute.value = converted.getMinutes();

  if (isDayDisabled(currentDay.value)) {
    emit("isValid", false);
    return;
  }

  commitFromParts();
};

const isValidDigits = (digits: string): boolean => {
  if (mode.value === "time") {
    if (digits.length < 4) return false;
    const hour = Number(digits.slice(0, 2));
    const minute = Number(digits.slice(2, 4));
    return hour <= 23 && minute <= 59;
  }

  if (digits.length < 8) return false;
  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = toChristianYear(Number(digits.slice(4, 8)));
  let hour = 0;
  let minute = 0;
  if (mode.value === "datetime") {
    if (digits.length < 12) return false;
    hour = Number(digits.slice(8, 10));
    minute = Number(digits.slice(10, 12));
    if (hour > 23 || minute > 59) return false;
  }

  const converted = new Date(year, month - 1, day, hour, minute, 0);
  return (
    !isNaN(converted.getTime()) &&
    converted.getDate() === day &&
    converted.getMonth() === month - 1
  );
};

const onBlur = () => {
  if (!displayValue.value) return;
  const digits = displayValue.value.replace(/\D/g, "");
  if (!isValidDigits(digits)) {
    resetToToday();
    commitFromParts();
  }
};

const handleEnter = (event: KeyboardEvent) => {
  const currentInput = event.target as HTMLInputElement;
  const inputs = currentInput.closest("#focus")?.querySelectorAll("input");
  if (!inputs) return;
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i] === currentInput && inputs[i + 1]) {
      (inputs[i + 1] as HTMLInputElement).focus();
      break;
    }
  }
};

watch(
  () => props.modelValue,
  (newVal) => {
    if (isInternalUpdate.value) return;

    if (!newVal) {
      displayValue.value = "";
      selectedDate.value = null;
      resetToToday();
      return;
    }

    if (mode.value === "time") {
      const match = newVal.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
      if (!match) return;
      const [, h, m] = match;
      currentHour.value = Number(h);
      currentMinute.value = Number(m);
      displayValue.value = `${h}:${m}`;
      return;
    }

    const date = new Date(newVal);
    if (isNaN(date.getTime())) return;

    selectedDate.value = date;
    currentYear.value = date.getFullYear();
    currentMonth.value = date.getMonth();
    currentDay.value = date.getDate();
    currentHour.value = date.getHours();
    currentMinute.value = date.getMinutes();
    displayValue.value = formatDisplay(date);
  },
  { immediate: true },
);

onClickOutside(
  anchorEl,
  () => {
    showPanel.value = false;
    closeHeadDropdowns();
  },
  { ignore: [panelEl] },
);

const focus = () => inputEl.value?.focus();
defineExpose({ focus });
</script>
