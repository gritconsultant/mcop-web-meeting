import { FOOTER_NAV_ITEMS, NAV_ITEMS } from "~/composables/useNavigation";
import type { NavItem } from "~~/shared/types";

const buildMapFromNav = (items: NavItem[]): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const item of items) {
    if (item.to) map[item.to] = item.label;
    item.children?.forEach((child) => {
      map[child.to] = child.label;
    });
  }
  return map;
};

export const APP_TITLE = "ระบบประชุม";

export const routeTitleMap: Record<string, string> = {
  ...buildMapFromNav(NAV_ITEMS),
  ...buildMapFromNav(FOOTER_NAV_ITEMS),
  "/login": "เข้าสู่ระบบ",
};

const sortedKeys = Object.keys(routeTitleMap)
  .filter((key) => key !== "/")
  .sort((a, b) => b.length - a.length);

export const findRouteTitle = (path: string): string | null => {
  if (!path) return null;

  const normalized = path === "/" ? "/" : path.replace(/\/+$/, "") || "/";

  const exact = routeTitleMap[normalized];
  if (exact) return exact;

  for (const key of sortedKeys) {
    if (normalized.startsWith(`${key}/`)) return routeTitleMap[key] ?? null;
  }

  return null;
};
