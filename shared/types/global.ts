export interface MainMenu {
  label: string;
  tab?: string;
  icon?: string | "material-symbols:add-circle-outline";
  link?: string | null;
  active: boolean;
  disabled?: boolean;
  page?: string;
}

export interface Select {
  id: string;
  name: string;
  headerName?: string;
  middleName?: string;
  tagName?: string;
  value?: unknown;
  urlImage?: string;
  status?: string;
  iconStatusColor?: string;
  customClassHeader?: string;
  customClassMiddleName?: string;
  customClassTagName?: string;
  customClassName?: string;
  customClassStatus?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  isNew?: boolean;
}

export interface MultiSelect extends Select {
  isSelected: boolean;
}

export interface StatusAndIconClass {
  class: string;
  icon: string;
}

export interface FormStep {
  value: number;
  label: string;
}

export interface FormStepColor {
  text?: string;
  border?: string;
  background?: string;
  textActive?: string;
  borderActive?: string;
  backgroundActive?: string;
}

export interface RadioGroupItem {
  label: string;
  value: string | boolean | number | null;
}


export interface TabMenu {
  key: string;
  label: string;
  link?: string;
  active?: boolean;
  disabled?: boolean;
  icon?: string;
}