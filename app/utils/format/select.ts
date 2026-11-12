import type { StatusAndIconClass } from "~~/shared/types";


export type SelectClassType = 'member_account' | 'account' | 'member' | 'member_stock'
export type SelectClassMode = 'normal' | 'disabled'


export interface SelectClass {
  customClassHeader: string;
  customClassMiddleName: string;
  customClassTagName: string;
}

export const defaultSelect = (): Select => {
  return {
    id: "",
    name: "",
  }
}

export const formatSelectClass = (type: SelectClassType, subType?: string, mode: SelectClassMode = 'normal'): SelectClass => {
  const classTagName: string = 'bg-[#811919] text-white text-nowrap font-bold rounded-md  px-3 min-w-20 text-xs text-center py-1'
  switch (type) {
    case 'member_account':
      return {
        customClassHeader: formatCustomClassHeaderAccount(mode, subType),
        customClassMiddleName: formatCustomClassMiddleNameMemberAccount(mode, subType),
        customClassTagName: `rounded-[4px] px-2 py-1 h-fit w-full max-w-[9.5rem] md:flex items-center !justify-start text-xs text-nowrap md:text-wrap truncate block`,
      }
    case 'account':
      return {
        customClassHeader: formatCustomClassHeaderAccount(mode, subType),
        customClassMiddleName: 'bg-grayTableHeader text-darkTextHover rounded-[4px] text-nowrap px-2 text-xs w-fit px-1 py-1',
        customClassTagName: 'rounded-[4px]  text-nowrap pr-2 py-1 h-full w-fit flex items-center justify-center text-xs',
      }
    case 'member':
      return {
        customClassHeader: formatCustomClassHeaderMember(mode, subType),
        customClassMiddleName: formatCustomClassMiddleNameMember(mode, subType),
        customClassTagName: classTagName,
      }
    case 'member_stock':
      return {
        customClassHeader: 'bg-[#F6F6F6] text-black  text-nowrap font-bold  rounded-md  px-3 min-w-[120px] text-center text-xs w-fit px-1 py-1',
        customClassMiddleName: '',
        customClassTagName: classTagName,
      }
    default:
      return {
        customClassHeader: 'bg-[#F6F6F6] text-black  text-nowrap font-bold  rounded-md  px-3 text-xs w-fit px-1 py-1 min-w-[120px] text-center',
        customClassMiddleName: 'bg-[#F6F6F6] text-black  text-nowrap font-bold  rounded-md  px-3 text-xs w-fit px-1 py-1 min-w-[120px] text-center',
        customClassTagName: classTagName,
      }
  }
}

const formatCustomClassHeaderAccount = (mode: SelectClassMode = 'normal', subType?: string): string => {
  const className: string = 'text-white rounded-[30px] font-bold text-nowrap text-center px-2 text-xs min-w-[4.5rem] px-1 py-1';
  if (mode === 'disabled') return `${className} bg-[#919191]`;
  switch (subType) {
    case 'savings':
      return `${className} bg-[#5EB3F0]`;
    default:
      return `${className} bg-[#F582F1]`;
  }
}

const formatCustomClassMiddleNameMemberAccount = (mode: SelectClassMode = 'normal', subType?: string): string => {
  const className: string = 'bg-[#F6F6F6] rounded-[4px] font-bold  px-2 py-1 h-fit w-full max-w-[10rem] md:flex items-center justify-center text-xs text-nowrap md:text-wrap truncate block ';
  if (mode === 'disabled') return `${className} text-[#919191]`;
  switch (subType) {
    case 'savings':
      return `${className} text-[#5EB3F0]`;
    default:
      return `${className} text-[#F582F1]`;
  }
}

const formatCustomClassHeaderMember = (mode: SelectClassMode = 'normal', subType?: string): string => {
  const className: string = ' text-nowrap font-bold  rounded-md  px-3 text-xs w-fit px-1 py-1';
  if (mode === 'disabled') return `${className} bg-[#919191] text-white`;
  switch (subType) {
    case 'financial':
      return `${className} bg-[#F6F6F6] text-black`;
    case 'savings':
      return `${className} bg-[#811919] text-white   min-w-[120px] text-center`;
    case 'request_deposit':
      return `${className} bg-[#811919] text-white`;
    default:
      return `${className} bg-[#F6F6F6] text-black`;
  }
}


const formatCustomClassMiddleNameMember = (mode: SelectClassMode = 'normal', subType?: string): string => {
  const className: string = '  text-nowrap font-bold  rounded-md  px-3 text-xs  px-1 py-1 text-center';
  if (mode === 'disabled') return `${className} text-[#919191]`;
  switch (subType) {
    case 'savings':
      return `${className} bg-[#F6F6F6] text-black  min-w-[120px]`;
    default:
      return `${className} bg-[#811919] text-white  min-w-20`;
  }
}


export const generateStatusAndIconClass = (status: string): StatusAndIconClass => {
  const defaultClass: string = "text-[10px] font-bold text-nowrap min-w-11";
  switch (status) {
    case "active":
      return {
        class: `${defaultClass} text-[#008E6D]`,
        icon: "#008E6D",
      };
    case "suspended":
      return {
        class: `${defaultClass} text-[#FE3636]`,
        icon: "#FE3636",
      };
    case "closed":
      return {
        class: `${defaultClass} text-[#919191]`,
        icon: "#919191",
      };
    case "pending_close":
      return {
        class: `${defaultClass} text-[#FF6E00]`,
        icon: "#FF6E00",
      };
    default:
      return {
        class: `${defaultClass} text-[#919191]`,
        icon: "#919191",
      };
  }
};

export const formatCustomClassName = (mode: SelectClassMode = 'normal'): string => {
  if (mode === 'disabled') return 'text-[#919191] text-sm font-bold text-wrap truncate block';
  return 'text-darkTextHover text-sm font-bold text-wrap truncate block';
}