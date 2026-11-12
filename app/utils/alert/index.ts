import SweetAlert from "sweetalert2";
import { getUserFacingErrorMessage } from "~/utils/api/error";
import type {
  Alert,
  AlertDelete,
  AlertLogout,
  AlertWithReason,
  AlertPermitted,
  AlertButtonPDF,
  AlertCheck,
  AlertFinalProcessCheck,
  AlertConfirmWithdraw,
  AlertConfirmWithDetails,
} from "#shared/types";

const Swal = SweetAlert.mixin({
  showClass: {
    popup: "hrm-swal-show",
    backdrop: "swal2-backdrop-show",
    icon: "swal2-icon-show",
  },
  hideClass: {
    popup: "hrm-swal-hide",
    backdrop: "swal2-backdrop-hide",
    icon: "swal2-icon-hide",
  },
});

// Material Symbols inline SVGs (used in Swal HTML strings — see Iconify)
const ICON_INFO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17q.425 0 .713-.288T13 16v-4q0-.425-.288-.712T12 11t-.712.288T11 12v4q0 .425.288.713T12 17m0-8q.425 0 .713-.288T13 8t-.288-.712T12 7t-.712.288T11 8t.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20"/></svg>`;
const ICON_EYE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 16q1.875 0 3.188-1.312T16.5 11.5t-1.312-3.187T12 7t-3.187 1.313T7.5 11.5t1.313 3.188T12 16m0-1.8q-1.125 0-1.912-.787T9.3 11.5t.788-1.912T12 8.8t1.913.788t.787 1.912t-.787 1.913T12 14.2m0 4.8q-3.65 0-6.65-2.037T1 11.5q1.35-3.425 4.35-5.462T12 4t6.65 2.038T23 11.5q-1.35 3.425-4.35 5.463T12 19m0-2q2.825 0 5.188-1.487T20.8 11.5q-1.25-2.525-3.612-4.012T12 6T6.812 7.488T3.2 11.5q1.25 2.525 3.613 4.013T12 17"/></svg>`;
const ICON_EYE_OFF_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="m16.1 13.3l-1.45-1.45q.225-1.175-.675-2.2T11.7 8.65L10.25 7.2q.425-.15.863-.225T12 6.9q1.875 0 3.188 1.313T16.5 11.4q0 .45-.075.913t-.325.987M19.8 17l-1.45-1.4q1.275-.975 2.275-2.137T22.2 11.4q-1.35-2.725-3.875-4.337T12.9 5.45q-.825 0-1.625.125t-1.575.375L8.05 4.2q.95-.4 2.05-.6T12.7 3.4q3.625 0 6.638 2t4.7 5.5q-.7 1.85-1.838 3.413T19.8 17m.1 5.55l-3.75-3.7q-.875.275-1.762.413T12.4 19.4q-3.5 0-6.512-1.987T1.2 12.3q.275-.95.95-1.95t1.575-1.95Q3.225 7.85 3.05 7.4T2.9 6.5L0.575 4.175Q0.275 3.9.275 3.5T0.575 2.825T1.275 2.55t.7.275L21.275 22.15q.275.275.275.7t-.275.7t-.7.275t-.7-.275"/></svg>`;

const setAppModalsHidden = (hidden: boolean) => {
  if (import.meta.server) return;
  document.body.classList.toggle("hrm-hide-modals", hidden);
};

const mapIcon = (
  type: Alert["type"] | "logout" | "reject" | "check" | "buttonPDF",
  isConfirm?: boolean,
) => {
  if (type === "warning") {
    return {
      iconHtml: isConfirm
        ? '<span class="cuida--alert-outline warning"></span>'
        : '<span class="cuida--alert-outline invalid"></span>',
    };
  }
  if (type === "error") {
    return {
      iconHtml: '<span class="cuida--alert-outline error"></span>',
    };
  }
  if (type === "success") {
    return {
      iconHtml: '<span class="gg--check-o"></span>',
    };
  }
  if (type === "delete") {
    return {
      iconHtml: '<span class="streamline-ultimate--bin-1"></span>',
    };
  }
  if (type === "info") {
    return {
      iconHtml: ICON_INFO_SVG,
      iconColor: "#2196F3",
    };
  }
  if (type === "logout") {
    return {
      iconHtml: '<span class="mynaui--logout-solid"></span>',
    };
  }
  if (type === "reject") {
    return {
      iconHtml: '<span class="cuida--alert-outline warning"></span>',
    };
  }
  if (type === "check") {
    return {
      iconHtml: '<span class="cuida--alert-outline warning"></span>',
    };
  }
  if (type === "buttonPDF") {
    return {
      iconHtml: '<span class="material-symbols--print-outline"></span>',
    };
  }
  return {
    iconHtml: ICON_INFO_SVG,
    iconColor: "#2196F3",
  };
};

//แสดง alert
export const showAlert = async (payload?: Alert) => {
  const { iconHtml, iconColor } = mapIcon(payload?.type, false);

  // ไม่แสดง alert ถ้าเป็น unauthorizedError (เซสชันหมดอายุ จัดการใน httpClient แล้ว)
  if (
    payload?.text === "unauthorizedError" ||
    payload?.title === "unauthorizedError"
  ) {
    return Promise.resolve();
  }

  if (payload?.isToast) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: payload?.timer || 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });
    return await Toast.fire({
      icon: "warning",
      iconHtml: iconHtml,
      iconColor: iconColor,
      title: payload?.title || "เกิดข้อผิดพลาด",
      text: payload?.textHtml ? undefined : payload?.text || undefined,
      html: payload?.textHtml || undefined,
      customClass: {
        title: "text-black text-2xl p-0 m-0 ",
        htmlContainer: "text-sm text-black p-0 m-0 ",
        container: payload?.text ? "toast-title" : "",
        popup: "pb-0",
        icon: "swal2-errornone",
      },
    });
  }

  return Swal.fire({
    icon: "warning",
    title: payload?.title || "เกิดข้อผิดพลาด",
    text: payload?.textHtml ? undefined : payload?.text || undefined,
    html: payload?.textHtml || undefined,
    iconHtml: iconHtml,
    iconColor: iconColor,
    customClass: {
      title: "text-black text-2xl swt-title",
      htmlContainer: "text-sm text-black swt-subtitle",
      popup: "pb-0",
      confirmButton: "text-[14px] m-0",
      cancelButton: "text-[14px] text-grayText m-0 mr-3",
      icon: "swal2-errornone",
    },
    showConfirmButton: false,
    timer: payload?.timer || 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mousedown", Swal.stopTimer);
      toast.addEventListener("mouseup", Swal.resumeTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
};

//แสดง alert confirm
export const showAlertConfirm = (payload: Alert) => {
  return new Promise((resolve) => {
    let iconHtmlCustom = "";
    let iconColorCustom = "";
    if (payload.type === "warning") {
      iconHtmlCustom = '<span class="cuida--alert-outline warning"></span>';
    } else if (payload.type === "error") {
      iconHtmlCustom = '<span class="cuida--alert-outline error"></span>';
    } else if (payload.type === "success") {
      iconHtmlCustom = '<span class="gg--check-o"></span>';
    } else if (payload.type === "delete") {
      iconHtmlCustom = '<span class="streamline-ultimate--bin-1"></span>';
    } else if (payload.type === "showcancel") {
      iconHtmlCustom = '<span class="cuida--alert-outline warning"></span>';
    } else if (payload.type === "info") {
      iconHtmlCustom = ICON_INFO_SVG;
      iconColorCustom = "#2196F3";
    }

    setAppModalsHidden(true);
    Swal.fire({
      icon: "info",
      title: payload.title,
      text: payload?.text || undefined,
      iconHtml: iconHtmlCustom,
      iconColor: iconColorCustom,
      showDenyButton: false,
      showCancelButton: payload.showCancelButton !== false,
      showConfirmButton: payload.showConfirmButton !== false,
      reverseButtons: true,
      allowOutsideClick:
        payload.allowOutsideClick !== undefined
          ? payload.allowOutsideClick
          : payload.showCancelButton !== false, //ไม่ให้คลิกด้านนอก
      allowEscapeKey: payload.allowEscapeKey !== false,
      confirmButtonColor: "#0066DA",
      cancelButtonColor: "#4C4C4C",
      confirmButtonText: payload.confirmButtonText || "ยืนยัน",
      cancelButtonText: payload.cancelButtonText || "ยกเลิก",

      customClass: {
        title: "text-black text-2xl swt-title",
        htmlContainer: "text-sm text-black swt-subtitle",
        popup: "pb-0",
        confirmButton: payload.confirmButtonAuto
          ? "swal2-custom"
          : "text-[14px] m-0 w-fit",
        cancelButton: "text-[14px] text-grayText m-0 mr-3",
        icon: "swal2-errornone",
      },

      didOpen: (popup) => {
        document.querySelector(".swal2-footer")?.remove();
        document.querySelector(".swal2-timer-progress-bar-container")?.remove();
        const actions = popup.querySelector(".swal2-actions");
        document.querySelector(".swal2-timer-progress-bar-container")?.remove();

        if (actions && !popup.querySelector(".my-separator")) {
          const hr = document.createElement("hr");
          hr.className = "my-separator";
          hr.style.border = "none";
          hr.style.borderTop = "0.7px solid #AFAFAF";
          actions.insertAdjacentElement("beforebegin", hr);
        }
      },
    }).then((resp: any) => {
      setAppModalsHidden(false);
      if (resp.isConfirmed) {
        return resolve(true);
      }
      return resolve(false);
    });
  });
};

const SWAL_CHECKBOX_ID = "swal-confirm-with-details-checkbox";

export const showAlertConfirmWithDetails = (
  payload: AlertConfirmWithDetails,
): Promise<boolean | { confirmed: true; checkboxChecked: boolean }> => {
  return new Promise((resolve) => {
    const iconHtml = '<span class="cuida--alert-outline warning"></span>';
    const checkboxChecked = ref<boolean>(false);
    const detailsHtml =
      payload.details?.length > 0
        ? `<div class="grid grid-cols-1 gap-3 text-[#222222] pt-3">
        ${payload.details
          .map(
            (d) => `
          <div class="flex justify-between">
            <span class="text-grayText text-sm w-1/2 text-left">${d.label}</span>
            <p class=" text-black font-bold w-1/2 text-right">${d.value}</p>
          </div>`,
          )
          .join("")}
      </div>`
        : "";
    const textSection = payload.text
      ? `<p class="text-sm text-black pt-2">${payload.text}</p>`
      : "";
    const checkedAttr =
      payload.checkbox?.defaultChecked !== false ? " checked" : "";
    const checkboxHtml = payload.checkbox
      ? `<div class="flex items-center gap-2 pt-3">
  
          <input type="checkbox" id="${SWAL_CHECKBOX_ID}" class="rounded border-gray-300 h-4 w-4   text-[#0066DA] focus:ring-[#0066DA]"${checkedAttr} />
          <label for="${SWAL_CHECKBOX_ID}" class="text-sm cursor-pointer">${payload.checkbox.label}</label>
        </div>`
      : "";

    Swal.fire({
      icon: "info",
      iconHtml,
      iconColor: "#7C7C7C",
      title: payload.title,
      html: `${textSection}${checkboxHtml}${detailsHtml}`,
      showCancelButton: payload.showCancelButton !== false,
      showConfirmButton: payload.showConfirmButton !== false,
      reverseButtons: true,
      allowOutsideClick:
        payload.allowOutsideClick !== undefined
          ? payload.allowOutsideClick
          : payload.showCancelButton !== false,
      allowEscapeKey: payload.allowEscapeKey !== false,
      confirmButtonColor: "#0066DA",
      cancelButtonColor: "#4C4C4C",
      confirmButtonText: payload.confirmButtonText || "ยืนยัน",
      cancelButtonText: payload.cancelButtonText || "ยกเลิก",
      customClass: {
        title: "text-black text-2xl swt-title",
        htmlContainer: "text-sm text-black swt-subtitle",
        popup: "pb-0",
        confirmButton: "text-[14px] m-0",
        cancelButton: "text-[14px] text-grayText m-0 mr-3",
        icon: "swal2-errornone",
      },
      didOpen: (popup) => {
        document.querySelector(".swal2-footer")?.remove();
        document.querySelector(".swal2-timer-progress-bar-container")?.remove();
        const actions = popup.querySelector(".swal2-actions");
        if (actions && !popup.querySelector(".my-separator")) {
          const hr = document.createElement("hr");
          hr.className = "my-separator";
          hr.style.border = "none";
          hr.style.borderTop = "0.7px solid #AFAFAF";
          actions.insertAdjacentElement("beforebegin", hr);
        }
      },
    }).then((resp: any) => {
      if (resp.isConfirmed) {
        if (payload.checkbox) {
          const el = document.getElementById(
            SWAL_CHECKBOX_ID,
          ) as HTMLInputElement | null;
          resolve({
            confirmed: true,
            checkboxChecked:
              el?.checked ?? payload.checkbox?.defaultChecked ?? false,
          });
        } else {
          resolve(true);
        }
      } else {
        resolve(false);
      }
    });
  });
};

export const showAlertConfirmProcess = (payload: Alert) => {
  return new Promise((resolve) => {
    let iconHtmlCustom = "";
    let iconColorCustom = "";

    // ใช้ไอคอนสีน้ำเงินสำหรับ info type หรือเมื่อมี textHtml
    if (payload.type === "info" || payload.textHtml) {
      iconHtmlCustom = '<span class="cuida--alert-outline warning"></span>';
      iconColorCustom = "#2196F3";
    } else if (payload.type === "warning") {
      iconHtmlCustom = '<span class="cuida--alert-outline warning"></span>';
    } else if (payload.type === "error") {
      iconHtmlCustom = '<span class="cuida--alert-outline error"></span>';
    } else if (payload.type === "success") {
      iconHtmlCustom = '<span class="gg--check-o"></span>';
    } else if (payload.type === "delete") {
      iconHtmlCustom = '<span class="streamline-ultimate--bin-1"></span>';
    } else if (payload.type === "showcancel") {
      iconHtmlCustom = '<span class="cuida--alert-outline warning"></span>';
    }

    // สร้าง HTML content
    let htmlContent = "";
    if (payload.textHtml) {
      htmlContent = `
        <div class="text-sm text-black space-y-3 pt-3">
          <div class="text-center">
            ${payload.textHtml}
          </div>
          <div class="flex items-center gap-2 bg-orange-50 border border-orange-300 text-orange-600 rounded-md p-3 mt-4">
            <div style="display: flex; justify-content: center; align-items: center; width: 20px; height: 20px; border-radius: 50%; background-color: #FF9800; border: none; flex-shrink: 0;">
              <span style="color: white; font-size: 12px; font-weight: bold;">!</span>
            </div>
            <span class="text-sm">โปรดตรวจสอบข้อมูลประมวลผลอีกครั้ง</span>
          </div>
        </div>
      `;
    } else if (payload.text && payload.text.includes("<span")) {
      // ถ้า text มี HTML tags ให้ใช้เป็น HTML
      htmlContent = `
        <div class="text-sm text-black space-y-3 pt-3">
          <div class="text-left">
            ${payload.text}
          </div>
          <div class="flex items-center gap-2 bg-orange-50 border border-orange-300 text-orange-600 rounded-md p-3 mt-4">
            <div style="display: flex; justify-content: center; align-items: center; width: 20px; height: 20px; border-radius: 50%; background-color: #FF9800; border: none; flex-shrink: 0;">
              <span style="color: white; font-size: 12px; font-weight: bold;">!</span>
            </div>
            <span class="text-sm">โปรดตรวจสอบข้อมูลประมวลผลอีกครั้ง</span>
          </div>
        </div>
      `;
    }

    Swal.fire({
      icon:
        payload.textHtml || (payload.text && payload.text.includes("<span"))
          ? "info"
          : "info",
      title: payload.title,
      html: htmlContent || undefined,
      text: htmlContent ? undefined : payload?.text || undefined,
      iconHtml: iconHtmlCustom,
      iconColor: iconColorCustom,
      showCancelButton: payload.showCancelButton !== false,
      showConfirmButton: payload.showConfirmButton !== false,
      reverseButtons: true,
      allowOutsideClick: payload.showCancelButton !== false, //ไม่ให้คลิกด้านนอก
      confirmButtonColor: "#0066DA",
      cancelButtonColor: "#4C4C4C",
      confirmButtonText: payload.confirmButtonText || "ยืนยัน",
      cancelButtonText: payload.cancelButtonText || "ยกเลิก",

      customClass: {
        title: "text-black text-2xl swt-title",
        htmlContainer: "text-sm text-black swt-subtitle",
        popup: "pb-0",
        confirmButton: "text-[14px] m-0",
        cancelButton: "text-[14px] text-grayText m-0 mr-3",
        icon: "swal2-errornone",
      },

      didOpen: (popup) => {
        document.querySelector(".swal2-footer")?.remove();
        document.querySelector(".swal2-timer-progress-bar-container")?.remove();
        const actions = popup.querySelector(".swal2-actions");
        document.querySelector(".swal2-timer-progress-bar-container")?.remove();

        if (actions && !popup.querySelector(".my-separator")) {
          const hr = document.createElement("hr");
          hr.className = "my-separator";
          hr.style.border = "none";
          hr.style.borderTop = "0.7px solid #AFAFAF";
          actions.insertAdjacentElement("beforebegin", hr);
        }
      },
    }).then((resp: any) => {
      if (resp.isConfirmed) {
        return resolve(true);
      }
      return resolve(false);
    });
  });
};

//แสดง alert delete
export const showAlertDelete = (payload: AlertDelete) => {
  return new Promise((resolve) => {
    const { iconHtml, iconColor } = mapIcon("delete");
    Swal.fire({
      icon: "info",
      title: payload.title,
      text: payload?.text || undefined,
      iconHtml: iconHtml,
      iconColor: iconColor,
      showCancelButton: true,
      showConfirmButton: true,
      reverseButtons: true,
      confirmButtonColor: "#FF5353",
      cancelButtonColor: "#494C52",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",

      customClass: {
        title: "text-[#FF3838] text-2xl swt-title",
        htmlContainer: "text-sm text-black swt-subtitle",
        popup: "pb-0",
        confirmButton: "text-[14px] m-0",
        cancelButton: "text-[14px] text-grayText m-0 mr-3",
        icon: "swal2-errornone",
      },

      didOpen: (popup) => {
        document.querySelector(".swal2-footer")?.remove();
        document.querySelector(".swal2-timer-progress-bar-container")?.remove();
        const actions = popup.querySelector(".swal2-actions");
        if (actions && !popup.querySelector(".my-separator")) {
          const hr = document.createElement("hr");
          hr.className = "my-separator";
          hr.style.border = "none";
          hr.style.borderTop = "0.7px solid #AFAFAF";
          actions.insertAdjacentElement("beforebegin", hr);
        }
      },
    }).then((resp: any) => {
      if (resp.isConfirmed) {
        return resolve(true);
      }
      return resolve(false);
    });
  });
};

//แสดง with reason
export const showAlertWithReason = (payload: AlertWithReason) => {
  return new Promise(async (resolve) => {
    const { iconHtml } = mapIcon("reject");
    setAppModalsHidden(true);
    Swal.fire({
      icon: "info",
      title: payload.title,
      html: `
      <div class="text-sm text-black">
        ${
          payload?.text
            ? `<p class="pt-[6px] pb-[6px] ">${payload.text}</p>`
            : ""
        }
        ${
          payload?.detail
            ? `<p class="mt-2 text-gray-500 text-left ">${payload.detail} ` +
              `${payload.isRequired === true ? `<span class="text-red-500">*</span>` : ""}` +
              `</p>`
            : ""
        }
      </div>`,
      input: "textarea",
      inputAttributes: {
        maxlength: "500",
        "aria-label": payload.detail || "รายละเอียด",
        "aria-required": payload.isRequired !== false ? "true" : "false",
      },
      iconHtml: iconHtml,
      showCancelButton: true,
      showConfirmButton: true,
      reverseButtons: true,
      confirmButtonColor: "#0066DA",
      cancelButtonColor: "#4C4C4C",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      inputValidator: (value) => {
        if (payload.isRequired === false) {
          return;
        } else if (!value.trim()) {
          return "กรุณากรอกรายละเอียด";
        }
      },
      customClass: {
        title: "text-black text-2xl swt-title",
        htmlContainer: "text-sm text-black swt-subtitle detail",
        input: "text-sm px-2 text-black border rounded-md ",
        validationMessage: "text-sm mt-1 text-left",
        popup: "pb-0",
        confirmButton: "text-[14px]",
        cancelButton: "text-[14px] text-grayText m-0 mr-3",
        icon: "swal2-errornone",
      },

      didOpen: (popup) => {
        document.querySelector(".swal2-footer")?.remove();
        document.querySelector(".swal2-timer-progress-bar-container")?.remove();
        const actions = popup.querySelector(".swal2-actions");
        if (actions && !popup.querySelector(".my-separator")) {
          const hr = document.createElement("hr");
          hr.className = "my-separator";
          hr.style.border = "none";
          hr.style.borderTop = "0.7px solid #AFAFAF";
          actions.insertAdjacentElement("beforebegin", hr);
        }
      },
    }).then((resp: any) => {
      setAppModalsHidden(false);
      if (payload.isRequired === false) {
        if (resp.isConfirmed) {
          return resolve({ confirmed: true, value: resp.value });
        } else if (!resp.isConfirmed) {
          return resolve({ confirmed: false, value: null });
        }
      } else {
        if (resp.isConfirmed) {
          return resolve(resp.value);
        }
        if (resp.value) {
          Swal.fire(`กรุณากรอกรายละเอียด: ${resp.value}`);
        }
        return resolve(false);
      }
    });
  });
};

//แสดง alert permitted
export const showAlerPermitted = (payload: AlertPermitted) => {
  return new Promise(async (resolve) => {
    const { iconHtml } = mapIcon("check");
    Swal.fire({
      icon: "info",
      title: payload.title,
      html: `
        <div class="text-sm text-black mb-4 pt-[10px] pb-[14px]">${
          payload?.text || ""
        }</div>
        <div class="space-y-3">
          <div>
            <label class="swal2-input-label pb-2">${payload?.inputLabel1 || ""}
            <span class="ml-1 text-red-500">${payload.isRequired ? "*" : ""}</span>
            </label>
            <input id="swal-input1" class="swal2-input swal-input1 border rounded-md border-gray-300">
            <div id="swal-error1" class="text-xs text-red-500 mt-1 hidden text-left">กรุณากรอก ${
              payload?.inputLabel1 || ""
            }</div>
          </div>
          <div class="pb-4">
            <label class="swal2-input-label pb-2">${payload?.inputLabel2 || ""}
            <span class="ml-1 text-red-500">${payload.isRequired ? "*" : ""}</span>
            </label>
            <div class="relative">
              <input id="swal-input2" type="password" class="swal2-input swal-input2 border rounded-md border-gray-300 pr-10" >
              <div id="swal-password-toggle" class="absolute flex justify-center items-center right-0 top-0 h-full w-10 cursor-pointer hidden">
                <span id="swal-eye-icon" class="flex items-center justify-center">${ICON_EYE_OFF_SVG}</span>
              </div>
            </div>
            <div id="swal-error2" class="text-xs text-red-500 mt-1 hidden text-left">กรุณากรอก ${
              payload?.inputLabel2 || ""
            }</div>
          </div>
        </div>
      `,
      iconHtml: iconHtml,
      showCancelButton: true,
      showConfirmButton: true,
      reverseButtons: true,
      confirmButtonColor: "#0066DA",
      cancelButtonColor: "#4C4C4C",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",

      //validate
      preConfirm: () => {
        const input1 = document.getElementById(
          "swal-input1",
        ) as HTMLInputElement;
        const input2 = document.getElementById(
          "swal-input2",
        ) as HTMLInputElement;
        const error1 = document.getElementById("swal-error1");
        const error2 = document.getElementById("swal-error2");

        // Remove previous error styling
        input1?.classList.remove("border-red-500");
        input2?.classList.remove("border-red-500");
        input1?.classList.add("border-gray-300");
        input2?.classList.add("border-gray-300");
        error1?.classList.add("hidden");
        error2?.classList.add("hidden");

        if (payload.isRequired === true && (!input1?.value || !input2?.value)) {
          // Add red border and error message to empty inputs
          if (!input1?.value) {
            input1?.classList.remove("border-gray-300");
            input1?.classList.add("border-red-500");
            error1?.classList.remove("hidden");
          }
          if (!input2?.value) {
            input2?.classList.remove("border-gray-300");
            input2?.classList.add("border-red-500");
            error2?.classList.remove("hidden");
          }
          return false;
        }
        return {
          input1: input1.value,
          input2: input2.value,
        };
      },

      customClass: {
        title: "text-black text-2xl swt-title",
        htmlContainer: "text-sm text-black p-0",
        input: "text-sm px-2 text-black border rounded-md",
        validationMessage: "text-sm mt-1 text-left text-red-500",
        popup: "pb-0",
        confirmButton: "text-[14px] btn-check",
        cancelButton: "text-[14px] text-grayText m-0 mr-3",
        icon: "swal2-errornone",
      },

      didOpen: (popup) => {
        document.querySelector(".swal2-footer")?.remove();
        document.querySelector(".swal2-timer-progress-bar-container")?.remove();
        const actions = popup.querySelector(".swal2-actions");
        if (actions && !popup.querySelector(".my-separator")) {
          const hr = document.createElement("hr");
          hr.className = "my-separator";
          hr.style.border = "none";
          hr.style.borderTop = "0.7px solid #AFAFAF";
          actions.insertAdjacentElement("beforebegin", hr);
        }

        // Remove red border and error message when user starts typing
        const input1 = document.getElementById(
          "swal-input1",
        ) as HTMLInputElement;
        const input2 = document.getElementById(
          "swal-input2",
        ) as HTMLInputElement;
        const error1 = document.getElementById("swal-error1");
        const error2 = document.getElementById("swal-error2");

        if (input1) {
          input1.addEventListener("input", () => {
            input1.classList.remove("border-red-500");
            input1.classList.add("border-gray-300");
            error1?.classList.add("hidden");
          });
        }
        if (input2) {
          const passwordToggle = document.getElementById(
            "swal-password-toggle",
          );
          const eyeIcon = document.getElementById("swal-eye-icon");
          let showPassword = false;

          input2.addEventListener("input", () => {
            input2.classList.remove("border-red-500");
            input2.classList.add("border-gray-300");
            error2?.classList.add("hidden");

            // Show/hide password toggle icon based on input value
            if (input2.value.length > 0) {
              passwordToggle?.classList.remove("hidden");
            } else {
              passwordToggle?.classList.add("hidden");
            }
          });

          // Password toggle functionality
          if (passwordToggle && eyeIcon) {
            passwordToggle.addEventListener("click", () => {
              showPassword = !showPassword;
              if (showPassword) {
                input2.type = "text";
                eyeIcon.innerHTML = ICON_EYE_SVG;
              } else {
                input2.type = "password";
                eyeIcon.innerHTML = ICON_EYE_OFF_SVG;
              }
            });
          }
        }
      },
    }).then((resp: any) => {
      if (payload.isRequired === false) {
        if (resp.isConfirmed) {
          return resolve({ confirmed: true, value: resp.value });
        } else if (!resp.isConfirmed) {
          return resolve({ confirmed: false, value: null });
        }
      } else {
        if (resp.isConfirmed) {
          return resolve(resp.value);
        }
        if (resp.value) {
          Swal.fire(`กรุณากรอกข้อมูลให้ครบ: ${resp.value}`);
        }
        return resolve(false);
      }
    });
  });
};

//แสดง alert logout
export const showAlertLogout = (payload: AlertLogout) => {
  return new Promise((resolve) => {
    const { iconHtml, iconColor } = mapIcon("logout");
    Swal.fire({
      icon: "info",
      title: payload.title,
      text: payload?.text || undefined,
      iconHtml: iconHtml,
      iconColor: iconColor,
      showCancelButton: true,
      showConfirmButton: true,
      reverseButtons: true,
      confirmButtonColor: "#0066DA",
      cancelButtonColor: "#4C4C4C",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",

      customClass: {
        title: "text-black text-2xl swt-title",
        htmlContainer: "text-sm text-black swt-subtitle",
        popup: "pb-0",
        confirmButton: "text-[14px] m-0",
        cancelButton: "text-[14px] text-grayText m-0",
        icon: "swal2-errornone",
      },

      didOpen: (popup) => {
        document.querySelector(".swal2-footer")?.remove();
        document.querySelector(".swal2-timer-progress-bar-container")?.remove();
        const actions = popup.querySelector(".swal2-actions");
        if (actions && !popup.querySelector(".my-separator")) {
          const hr = document.createElement("hr");
          hr.className = "my-separator";
          hr.style.border = "none";
          hr.style.borderTop = "0.7px solid #AFAFAF";
          actions.insertAdjacentElement("beforebegin", hr);
        }
      },
    }).then((resp: any) => {
      if (resp.isConfirmed) {
        return resolve(true);
      }
      return resolve(false);
    });
  });
};

export const showAlertBackToLogin = (payload: Alert) => {
  return new Promise((resolve) => {
    Swal.fire({
      icon: "warning",
      title: payload.title,
      text: payload?.text || undefined,
      customClass: {
        title: "text-black text-2xl px-[16px] pt-[10px]",
        htmlContainer: "px-[16px] pt-[10px]",
        cancelButton: "text-[14px] text-grayText",
      },
      showCancelButton: true,
      showConfirmButton: true,
      reverseButtons: true,
      confirmButtonColor: "#0066DA",
      cancelButtonColor: "#4C4C4C",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    }).then((resp: any) => {
      if (resp.isConfirmed) {
        return resolve(true);
      }
      return resolve(false);
    });
  });
};

//แสดง alert buttonPDF
export const showAlertButtonPDF = (payload: AlertButtonPDF) => {
  return new Promise((resolve) => {
    const { iconHtml } = mapIcon("buttonPDF");
    Swal.fire({
      icon: "info",
      title: payload.title,
      text: payload?.text || undefined,
      iconHtml: iconHtml,
      showCancelButton: true,
      showConfirmButton: true,
      reverseButtons: true,
      confirmButtonColor: "#0066DA",
      cancelButtonColor: "#4C4C4C",
      confirmButtonText: payload.confirmButtonText || "พิมพ์",
      cancelButtonText: payload.cancelButtonText || "ยืนยัน",

      customClass: {
        title: "text-black text-2xl swt-title",
        htmlContainer: "text-sm text-black swt-subtitle",
        popup: "pb-0",
        confirmButton: "text-[14px] m-0",
        cancelButton: "swal2-cancelbuttonPDF text-[14px] m-0 mr-3 ",
        icon: "swal2-errornone",
      },

      didOpen: (popup) => {
        document.querySelector(".swal2-footer")?.remove();
        document.querySelector(".swal2-timer-progress-bar-container")?.remove();
        const actions = popup.querySelector(".swal2-actions");
        document.querySelector(".swal2-timer-progress-bar-container")?.remove();
        const cancelBtn = popup.querySelector(".swal2-cancel") as HTMLElement;
        if (cancelBtn) {
          cancelBtn.className = "swal2-cancelbuttonPDF"; // set ใหม่ทั้งก้อน
        }

        if (actions && !popup.querySelector(".my-separator")) {
          const hr = document.createElement("hr");
          hr.className = "my-separator";
          hr.style.border = "none";
          hr.style.borderTop = "0.7px solid #AFAFAF";
          actions.insertAdjacentElement("beforebegin", hr);
        }
      },
    }).then((resp: any) => {
      if (resp.isConfirmed) {
        return resolve(true);
      }
      return resolve(false);
    });
  });
};

// export const showAlertConfirmDelete = (payload: Alert) => {
//   return new Promise((resolve) => {
//     Swal.fire({
//       icon: payload.icon,
//       title: payload.title,
//       text: payload?.text || undefined,
//       customClass: {
//         title: "text-black text-xl px-[16px] pt-[10px]",
//         htmlContainer: "px-[16px] pt-[10px]",
//         cancelButton: "text-[14px] ",
//       },
//       showCancelButton: true,
//       showConfirmButton: true,
//       reverseButtons: true,
//       confirmButtonColor: "#F59C1A",
//       cancelButtonColor: "#4C4C4C",
//       confirmButtonText: "ยืนยัน",
//       cancelButtonText: "ยกเลิก",
//     }).then((resp: any) => {
//       if (resp.isConfirmed) {
//         return resolve(true);
//       }
//       return resolve(false);
//     });
//   });
// };

///show toast error
// export const showToast = async (payload?: Alert) => {
//   const { iconHtml, iconColor } = mapIcon(payload?.type, false);
//   const Toast = Swal.mixin({
//     toast: true,
//     position: "top-end",
//     showConfirmButton: false,
//     timer: payload?.timer || 1500,
//     timerProgressBar: true,
//     didOpen: (toast) => {
//       toast.onmouseenter = Swal.stopTimer;
//       toast.onmouseleave = Swal.resumeTimer;
//     }
//   });
//   Toast.fire({
//     icon: "warning",
//     iconHtml: iconHtml,
//     iconColor: iconColor,
//     title: payload?.title || "เกิดข้อผิดพลาด",
//     text: payload?.text || undefined,

//     customClass: {
//       title: "text-black text-2xl p-0 m-0",
//       htmlContainer: "text-sm text-black p-0 m-0",
//       popup: "pb-0",
//       icon: "swal2-errornone",
//     },
//   });
// };

//แสดง alert close
export const showAlertClose = (payload: Alert) => {
  return new Promise((resolve) => {
    let iconHtmlCustom = "";
    let iconColorCustom = "";
    if (payload.type === "warning") {
      iconHtmlCustom = '<span class="cuida--alert-outline warning"></span>';
    } else if (payload.type === "error") {
      iconHtmlCustom = '<span class="cuida--alert-outline error"></span>';
    } else if (payload.type === "success") {
      iconHtmlCustom = '<span class="gg--check-o"></span>';
    } else if (payload.type === "delete") {
      iconHtmlCustom = '<span class="streamline-ultimate--bin-1"></span>';
    } else if (payload.type === "showcancel") {
      iconHtmlCustom = '<span class="cuida--alert-outline warning"></span>';
    } else if (payload.type === "info") {
      iconHtmlCustom = ICON_INFO_SVG;
      iconColorCustom = "#2196F3";
    }

    Swal.fire({
      icon: "info",
      title: payload.title,
      text: payload?.text || undefined,
      iconHtml: iconHtmlCustom,
      iconColor: iconColorCustom,
      showCancelButton: payload.showCancelButton !== false,
      showConfirmButton: false,
      // reverseButtons: true,
      allowOutsideClick: payload.showCancelButton !== false, //ไม่ให้คลิกด้านนอก
      // confirmButtonColor: "#0066DA",
      cancelButtonColor: "#4C4C4C",
      // confirmButtonText: payload.confirmButtonText || "ยืนยัน",
      cancelButtonText: "ปิด",

      customClass: {
        title: "text-black text-2xl swt-title",
        htmlContainer: "text-sm text-black swt-subtitle",
        popup: "pb-0",
        confirmButton: "text-[14px] m-0",
        cancelButton: "text-[14px] text-grayText m-0 mr-3",
        icon: "swal2-errornone",
      },

      didOpen: (popup) => {
        document.querySelector(".swal2-footer")?.remove();
        document.querySelector(".swal2-timer-progress-bar-container")?.remove();
        const actions = popup.querySelector(".swal2-actions");
        document.querySelector(".swal2-timer-progress-bar-container")?.remove();

        if (actions && !popup.querySelector(".my-separator")) {
          const hr = document.createElement("hr");
          hr.className = "my-separator";
          hr.style.border = "none";
          hr.style.borderTop = "0.7px solid #AFAFAF";
          actions.insertAdjacentElement("beforebegin", hr);
        }
      },
    }).then((resp: any) => {
      if (resp.isConfirmed) {
        return resolve(true);
      }
      return resolve(false);
    });
  });
};

// แสดง alert ตรวจสอบข้อมูลก่อนยืนยัน
export const showAlertCheck = (payload: AlertCheck) => {
  return new Promise<boolean>((resolve) => {
    Swal.fire({
      icon: "info",
      iconHtml: '<span class="cuida--alert-outline warning"></span>',
      title: "โปรดตรวจสอบข้อมูล",

      html: `
        <div class="text-sm text-black space-y-3 pt-3">
          <div class="text-left">
            <span class="font-bold text-xl">วันที่มีผล :</span>
            <span class="text-blue-600 font-bold text-xl">
              ${payload.date}
            </span>
          </div>

          <div class="text-left">
            <span class="font-bold text-xl">การซื้อหุ้นรายเดือน :</span>
            <span class="text-blue-600 font-bold text-xl">
              ${payload.text}
            </span>
          </div>

          <hr class="my-3"/>

          <div class="flex justify-center items-center gap-2 bg-orange-50 border border-orange-300 text-orange-600 rounded-md p-3">
            <span
              class="cuida--alert-outline warning orange inline-block scale-40"
              style="width:14px;height:14px"
            ></span>
            <span>โปรดตรวจสอบข้อมูลตั้งค่าหุ้นรายเดือนอีกครั้ง</span>
          </div>
        </div>
      `,

      showCancelButton: payload.showCancelButton !== false,
      showConfirmButton: payload.showConfirmButton !== false,
      reverseButtons: true,
      allowOutsideClick: payload.showCancelButton !== false, //ไม่ให้คลิกด้านนอก
      confirmButtonColor: "#0066DA",
      cancelButtonColor: "#4C4C4C",
      confirmButtonText: payload.confirmButtonText || "ยืนยัน",
      cancelButtonText: payload.cancelButtonText || "ยกเลิก",

      customClass: {
        title: "text-black text-2xl swt-title",
        htmlContainer: "text-sm text-black swt-subtitle",
        popup: "alert-check-popup",
        confirmButton: "text-[14px] m-0",
        cancelButton: "text-[14px] text-grayText m-0 mr-3",
        icon: "swal2-errornone",
      },
    }).then((resp: any) => {
      if (resp.isConfirmed) {
        return resolve(true);
      }
      return resolve(false);
    });
  });
};

// แสดง alert ตรวจบสอบยอดถอนรวม
export const showAlertConfirmWithdraw = (payload: AlertConfirmWithdraw) => {
  return new Promise<boolean>((resolve) => {
    Swal.fire({
      icon: "info",
      iconHtml: '<span class="cuida--alert-outline warning"></span>',
      title: "ยอดถอนรวมทั้งหมดไม่ลงตัว",

      html: `<div class=" space-y-3 pt-3">
      <div> 
      <span class="text-black">ยอดที่ใช้ไป</span> 
      <span class="font-bold">${payload.usedAmount}</span> 
      <span class="text-black">บาท</span> 
      </div>

      <div> 
      <span class="text-black">ยอดที่เหลือ</span> 
      <span class="font-bold">${payload.remainingAmount}</span> 
      <span class="text-black">บาท</span> 
      </div>
      
      <div>
      <p class="text-black">ต้องการปรับยอดถอนรวมทั้งหมดหรือไม่</p>
      </div>
      
      <hr class="my-3"/>
      </div>`,

      showCancelButton: true,
      showConfirmButton: true,
      reverseButtons: true,
      allowOutsideClick: payload.showCancelButton !== false,
      confirmButtonColor: "#0066DA",
      cancelButtonColor: "#4C4C4C",
      confirmButtonText: "ปรับยอด",
      cancelButtonText: "ไม่ปรับยอด",

      customClass: {
        title: "text-black text-2xl swt-title",
        htmlContainer: "text-sm text-black swt-subtitle",
        popup: "pb-0",
        confirmButton: "swal2-confirmWithdraw",
        cancelButton: "swal2-confirmWithdraw",
        icon: "swal2-errornone",
      },
    }).then((resp: any) => {
      if (resp.isConfirmed) {
        return resolve(true);
      }
      return resolve(false);
    });
  });
};
export const confirmDelete = (text?: string): Promise<boolean> =>
  showAlertConfirm({
    type: "warning",
    title: "ลบข้อมูล",
    text: text || "ยืนยันการลบข้อมูลหรือไม่?",
  }) as Promise<boolean>;

export const confirmAction = (text?: string): Promise<boolean> =>
  showAlertConfirm({
    type: "warning",
    title: "บันทึกข้อมูล",
    text: text || "ยืนยันการทำรายการดังกล่าวหรือไม่?",
  }) as Promise<boolean>;

export const confirmUpdate = (text?: string): Promise<boolean> =>
  showAlertConfirm({
    type: "warning",
    title: "บันทึกการแก้ไขข้อมูล",
    text: text || "คุณต้องการบันทึกการแก้ไขข้อมูลหรือไม่",
  }) as Promise<boolean>;

const showRequestError = (
  title: string,
  err?: unknown,
) => {
  const text = getUserFacingErrorMessage(err, "");
  showAlert({
    type: "error",
    title,
    ...(text ? { text } : {}),
    isToast: true,
  });
};

export const showFetchError = (err?: unknown) =>
  showRequestError("ดึงข้อมูลไม่สำเร็จ", err);

export const showExportError = (err?: unknown) =>
  showRequestError("ส่งออกข้อมูลไม่สำเร็จ", err);

export const showSaveError = (err?: unknown) =>
  showRequestError("บันทึกข้อมูลไม่สำเร็จ", err);

export const showDeleteError = (err?: unknown) =>
  showRequestError("ลบข้อมูลไม่สำเร็จ", err);

export const showDeleteSuccess = (text?: string) =>
  showAlert({
    type: "success",
    title: "ลบข้อมูลสำเร็จ",
    text: text,
    isToast: true,
  });

export const showSaveSuccess = (text?: string, timer?: number) =>
  showAlert({
    type: "success",
    title: "บันทึกข้อมูลสำเร็จ",
    text: text,
    isToast: true,
    timer: timer,
  });

// แสดง alert ตรวจบสอบวันที่
export const showAlertDate = async (payload?: Alert) => {
  const { iconHtml, iconColor } = mapIcon(payload?.type, false);

  if (
    payload?.text === "unauthorizedError" ||
    payload?.title === "unauthorizedError"
  ) {
    return;
  }

  if (payload?.isToast) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: payload?.timer || 2500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });
    return await Toast.fire({
      icon: "warning",
      iconHtml: iconHtml,
      iconColor: iconColor,
      title: payload?.title || "เกิดข้อผิดพลาด",
      text: payload?.text || undefined,
      customClass: {
        title: "text-black text-2xl p-0 m-0 ",
        htmlContainer: "text-sm text-black p-0 m-0 ",
        container: payload?.text ? "toast-title" : "",
        popup: "pb-0",
        icon: "swal2-errornone",
      },
    });
  }

  return Swal.fire({
    icon: "warning",
    title: payload?.title || "เกิดข้อผิดพลาด",
    text: payload?.text || undefined,
    iconHtml: iconHtml,
    iconColor: iconColor,
    customClass: {
      title: "text-black text-2xl swt-title",
      htmlContainer: "text-sm text-black swt-subtitle",
      popup: "pb-0",
      confirmButton: "text-[14px] m-0",
      cancelButton: "text-[14px] text-grayText m-0 mr-3",
      icon: "swal2-errornone",
    },
    showConfirmButton: false,
    timer: payload?.timer || 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mousedown", Swal.stopTimer);
      toast.addEventListener("mouseup", Swal.resumeTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
};
