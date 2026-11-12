export interface NavChild {
  label: string
  to: string
  icon?: string
}

export interface NavItem {
  label: string
  /** URL จาก import SVG asset */
  icon: string
  /** ถ้ามี children จะเป็นเมนูกลุ่ม (collapsible) — ถ้าไม่มีจะ navigate ตรงไปที่ to */
  to?: string
  children?: NavChild[]
  /** ถ้าระบุ จะแสดงเมนูนี้เฉพาะ user ที่มี role ตรงกัน — ไม่ระบุ = แสดงทุก role */
  roles?: import('./role').UserRole[]
  /** ถ้าระบุ จะแสดงเมนูนี้เฉพาะ user ที่มี permission key อย่างน้อยหนึ่งค่า */
  permissions?: string[]
  /** แสดงเส้นคั่นเหนือเมนูนี้ */
  dividerBefore?: boolean
}


export interface SubMenu {
  title: string;
  prefix: string;
  ref?: string;
  url: string;
  disabled?: boolean;
}
