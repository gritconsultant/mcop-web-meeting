export interface Alert {
  type?: "error" | "success" | "warning" | "delete" | "info" | "showcancel";
  title: string;
  text?: string;
  isToast?: boolean;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonAuto?: boolean;
  allowOutsideClick?: boolean;
  allowEscapeKey?: boolean;
  timer?: number;
  textHtml?: string;
}

export interface AlertDelete {
  type?: "delete";
  title: string;
  text?: string;
  isToast?: boolean;
}

export interface AlertLogout {
  type?: "logout";
  title: string;
  text?: string;
  isToast?: boolean;
}

export interface AlertWithReason {
  type?: "reject";
  title: string;
  text?: string;
  detail?: string;
  isRequired?: boolean;
}

export interface AlertPermitted {
  type?: "permitted";
  title: string;
  text?: string;
  inputLabel1?: string;
  inputLabel2?: string;
  isRequired?: boolean;
}

export interface AlertButtonPDF {
  type?: "buttonPDF";
  title: string;
  text?: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
}

export interface AlertCheck {
  type?: "warning";
  date?: string;
  text?: any;
  isToast?: boolean;
  cancelButtonText?: string;
  confirmButtonText?: string;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
}

export interface AlertFinalProcessCheck {
  type?: "warning";
  title?: string;
  dividendPercent?: number;
  averageReturnPercent?: number;
}

export interface AlertConfirmWithdraw {
  type?: "warning";
  usedAmount?: string;
  remainingAmount?: string;
  isToast?: boolean;
  cancelButtonText?: string;
  confirmButtonText?: string;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
}

export interface AlertConfirmWithDetails {
  title: string;
  /** ข้อความคำอธิบาย/คำแนะนำ ใต้หัวข้อ */
  text?: string;
  /** checkbox เดี่ยว ระหว่างคำอธิบายกับรายการ details (เช่น พิมพ์ยอดยกออกมา) */
  checkbox?: {
    label: string;
    defaultChecked?: boolean;
  };
  /** รายการแสดงเป็น label: value */
  details: { label: string; value: string | number }[];
  confirmButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
  allowOutsideClick?: boolean;
  allowEscapeKey?: boolean;
}
