/** 1,234.56 */
export const formatNumber = (
  amount: number | string,
  defaultDigit: number = 2,
): string => {
  try {
    const decimalCount = Math.abs(defaultDigit);
    const decimal = ".";
    const thousands = ",";

    const parsedAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(parsedAmount)) throw new Error("Invalid input");

    const negativeSign = parsedAmount < 0 ? "-" : "";

    const integerPart = Math.abs(parsedAmount)
      .toFixed(decimalCount)
      .split(".")[0]!;
    const formattedInteger = integerPart.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      thousands,
    );

    let formattedDecimal = "";
    if (decimalCount > 0) {
      const decimalPart = Math.abs(parsedAmount - parseInt(integerPart, 10))
        .toFixed(decimalCount)
        .split(".")[1];
      formattedDecimal = decimal + (decimalPart || "0").slice(0, decimalCount);
    }

    return negativeSign + formattedInteger + formattedDecimal;
  } catch {
    return "0.00";
  }
};

export const convertToTwoDecimal = (value: number): string => {
  return value.toFixed(2);
};

/** "1,234.56" | 1234.56 → 1234.56 */
export const toNumber = (
  value: number | string | undefined | null,
): number => {
  if (value == null) return 0;

  if (typeof value === "string") {
    return Number(value.replace(/,/g, "")) || 0;
  }

  return value;
};

/**
 * แปลงตัวเลขเป็นข้อความภาษาไทย (จำนวนเงิน)
 * เช่น 1234.56 → "หนึ่งพันสองร้อยสามสิบสี่บาทห้าสิบหกสตางค์"
 * หากไม่มีสตางค์ เติม "ถ้วน" ท้าย เช่น 1000 → "หนึ่งพันบาทถ้วน"
 */
export const numberToThaiBahtText = (
  amount?: number | string | null,
): string => {
  if (amount === undefined || amount === null || amount === "") {
    return "ศูนย์บาทถ้วน";
  }

  const value =
    typeof amount === "string" ? Number(amount.replace(/,/g, "")) : amount;

  if (isNaN(value) || value < 0) {
    return "ศูนย์บาทถ้วน";
  }

  if (value === 0) {
    return "ศูนย์บาทถ้วน";
  }

  const numberText = [
    "ศูนย์",
    "หนึ่ง",
    "สอง",
    "สาม",
    "สี่",
    "ห้า",
    "หก",
    "เจ็ด",
    "แปด",
    "เก้า",
  ];
  const unitText = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน"];

  const readNumber = (num: number): string => {
    let result = "";
    const numStr = Math.floor(num).toString();
    const len = numStr.length;

    for (let i = 0; i < len; i++) {
      const digit = parseInt(numStr[i] || "0", 10);
      const pos = len - i - 1;

      if (digit === 0) continue;

      if (pos === 0 && digit === 1 && len > 1) {
        result += "เอ็ด";
      } else if (pos === 1 && digit === 2) {
        result += "ยี่";
      } else if (pos === 1 && digit === 1) {
        result += "";
      } else {
        result += numberText[digit];
      }

      result += unitText[pos];
    }

    return result;
  };

  const baht = Math.floor(value);
  const satang = Math.round((value - baht) * 100);

  let text = "";

  if (baht >= 1_000_000) {
    const millionPart = Math.floor(baht / 1_000_000);
    const restPart = baht % 1_000_000;

    text += readNumber(millionPart) + "ล้าน";
    if (restPart > 0) {
      text += readNumber(restPart);
    }
    text += "บาท";
  } else if (baht > 0) {
    text += readNumber(baht) + "บาท";
  }

  if (satang > 0) {
    text += readNumber(satang) + "สตางค์";
  } else {
    text += "ถ้วน";
  }

  return text;
};
