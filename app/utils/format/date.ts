const BKK_TZ = "Asia/Bangkok";

export type DateFormatType =
  | "th_dmy_datetime_full"
  | "th"
  | "ymd"
  | "dmy"
  | "time"
  | "th_datetime"
  | "th_dmy"
  | "iso-datetime"
  | "th_dmy_time"
  | "th_short_datetime_fulltime"
  | "th_full_text_time"
  | "dd"
  | "mm"
  | "yyyy"
  | "th_yyyy";

export type CalculateAgeType =
  | "year"
  | "month"
  | "day"
  | "year_month"
  | "all";

export type DateInput = string | number | Date;

const toValidDate = (input: DateInput): Date | null => {
  if (input === "" || input == null) return null;
  const d = input instanceof Date ? input : new Date(input);
  return isNaN(d.getTime()) ? null : d;
};

const DATE_FORMAT_TYPES = new Set<string>([
  "th_dmy_datetime_full",
  "th",
  "ymd",
  "dmy",
  "time",
  "th_datetime",
  "th_dmy",
  "iso-datetime",
  "th_dmy_time",
  "th_short_datetime_fulltime",
  "th_full_text_time",
  "dd",
  "mm",
  "yyyy",
  "th_yyyy",
]);

const isDateFormatType = (value: string): value is DateFormatType =>
  DATE_FORMAT_TYPES.has(value);

/** พ.ศ. ยาว + timezone (ค่าเริ่มต้น Asia/Bangkok) */
const formatDateWithTz = (
  input: DateInput,
  tz = BKK_TZ,
  withTime = false,
): string => {
  const d = toValidDate(input);
  if (!d) return " ";

  const dateStr = d.toLocaleDateString("th-TH-u-ca-buddhist", {
    timeZone: tz,
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!withTime) return dateStr;

  const timeStr = d.toLocaleTimeString("th-TH", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${dateStr} เวลา ${timeStr}`;
};

/**
 * จัดรูปแบบวันที่
 * @example formatDate(date)                              → "13 พฤศจิกายน 2568"
 * @example formatDate(date, "th_dmy")                     → "13/11/2568"
 * @example formatDate(date, "th_dmy_datetime_full")       → "13/11/2568 16:51:00"
 * @example formatDate(date, "Asia/Bangkok", "time")       → "13 พฤศจิกายน 2568 เวลา 16:51"
 */
export const formatDate = (
  input: DateInput,
  typeOrTz: DateFormatType | string = "th",
  maybeTime?: "time",
): string => {
  // legacy: formatDate(date, "Asia/Bangkok" | tz, "time"?)
  if (typeOrTz.includes("/")) {
    return formatDateWithTz(input, typeOrTz, maybeTime === "time");
  }

  if (isDateFormatType(typeOrTz)) {
    return formatDateByType(input, typeOrTz);
  }

  return formatDateWithTz(input, BKK_TZ, typeOrTz === "time");
};

/**
 * alias ของ formatDate(date, type) — จัดรูปแบบตาม type
 * @example formatDateByType(date, "th")        → "13 พฤศจิกายน 2568"
 * @example formatDateByType(date, "ymd")       → "2025-11-13"
 * @example formatDateByType(date, "th_dmy")    → "13/11/2568"
 * @example formatDateByType(date, "th_dmy_time") → "13/11/2568 00:00"
 */
export const formatDateByType = (
  input: DateInput,
  type: DateFormatType = "th",
): string => {
  const date = toValidDate(input);
  if (!date) return " ";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  switch (type) {
    case "th_dmy_datetime_full": {
      // 18/08/2568 09:38:34
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${day}/${month}/${year + 543} ${hours}:${minutes}:${seconds}`;
    }

    case "th":
      // 13 พฤศจิกายน 2568
      return new Intl.DateTimeFormat("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);

    case "ymd":
      // 2025-11-13
      return `${year}-${month}-${day}`;

    case "dmy":
      // 13/11/2025
      return `${day}/${month}/${year}`;

    case "time":
      // 00:00
      return `${hours}:${minutes}`;

    case "th_datetime": {
      // 13 พ.ย. 2568 00:00 น.
      const datePart = new Intl.DateTimeFormat("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
      return `${datePart} ${hours}:${minutes} น.`;
    }

    case "th_dmy":
      // 13/11/2568
      return `${day}/${month}/${year + 543}`;

    case "th_dmy_time":
      // 13/11/2568 00:00
      return `${day}/${month}/${year + 543} ${hours}:${minutes}`;

    case "iso-datetime":
      // 2025-11-13T00:00:00
      return `${year}-${month}-${day}T${hours}:${minutes}:00`;

    case "th_short_datetime_fulltime": {
      // 26 ส.ค. 2568 10:17:51
      const seconds = String(date.getSeconds()).padStart(2, "0");
      const datePart = new Intl.DateTimeFormat("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
      return `${datePart} ${hours}:${minutes}:${seconds}`;
    }

    case "th_full_text_time": {
      // 10 กุมภาพันธ์ 2569 เวลา 16:13 น.
      const datePart = new Intl.DateTimeFormat("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
      return `${datePart} เวลา ${hours}:${minutes} น.`;
    }

    case "dd":
      return day;

    case "mm":
      return month;

    case "yyyy":
      return year.toString();

    case "th_yyyy":
      return String(year + 543);

    default:
      return date.toISOString();
  }
};

export const padZero = (num: number): string =>
  num.toString().padStart(2, "0");

export const calculateAgeYears = (date: DateInput): number => {
  const birth = toValidDate(date);
  if (!birth) return 0;

  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  const dayDiff = today.getDate() - birth.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years -= 1;
  }

  return Math.max(years, 0);
};

export const calculateAge = (
  date: DateInput,
  type: CalculateAgeType = "all",
): string => {
  const birth = toValidDate(date);
  if (!birth) return "0";

  const today = new Date();

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  switch (type) {
    case "all":
      return `${years} ปี ${months} เดือน ${days} วัน`;
    case "year_month":
      return `${years} ปี ${months} เดือน`;
    case "year":
      return `${years} ปี`;
    case "month":
      return `${months} เดือน`;
    case "day":
      return `${days} วัน`;
    default:
      return "0";
  }
};

/**
 * ระยะเวลาจาก start ถึง end (ค่าเริ่มต้น = วันนี้) แบบตัดหน่วยนำหน้าที่เป็น 0 ออก
 * @example calculateDuration("2026-07-05")  → "15 วัน"            (ไม่ถึง 1 เดือน)
 * @example calculateDuration("2026-05-20")  → "1 เดือน 30 วัน"     (ไม่ถึง 1 ปี)
 * @example calculateDuration("2024-04-06")  → "2 ปี 3 เดือน 14 วัน" (เกิน 1 ปี)
 */
export const calculateDuration = (
  start: DateInput,
  end: DateInput = new Date(),
): string => {
  const from = toValidDate(start);
  const to = toValidDate(end);
  if (!from || !to) return "-";

  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  // start เป็นวันในอนาคต
  if (years < 0) return "-";

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ปี`);
  if (years > 0 || months > 0) parts.push(`${months} เดือน`);
  parts.push(`${days} วัน`);

  return parts.join(" ");
};

export type DurationParts = { years?: number; months?: number; days?: number };

/**
 * แปลงระยะเวลาที่ API ส่งมา ({ years, months, days } หรือ string) เป็นข้อความ ตัดหน่วยนำหน้าที่เป็น 0
 * @example formatDurationParts({ years: 0, months: 1, days: 6 }) → "1 เดือน 6 วัน"
 */
export const formatDurationParts = (
  value: DurationParts | string | null | undefined,
): string => {
  if (value == null || value === "") return "-";
  if (typeof value === "string") return value;
  const { years = 0, months = 0, days = 0 } = value;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ปี`);
  if (years > 0 || months > 0) parts.push(`${months} เดือน`);
  parts.push(`${days} วัน`);
  return parts.join(" ");
};

export const addDate = (
  date: DateInput,
  value: number,
  type: "day" | "month" | "year",
  inclusive: boolean = true,
): Date => {
  const result = toValidDate(date) ?? new Date();
  const adjustedValue = inclusive && value > 0 ? value - 1 : value;

  switch (type) {
    case "day":
      result.setDate(result.getDate() + adjustedValue);
      break;
    case "month":
      result.setMonth(result.getMonth() + adjustedValue);
      break;
    case "year":
      result.setFullYear(result.getFullYear() + adjustedValue);
      break;
  }

  return result;
};

/** Date → "2025-11-13" */
export const convertDateToString = (date: Date): string => {
  return date.toISOString().split("T")[0]!;
};
