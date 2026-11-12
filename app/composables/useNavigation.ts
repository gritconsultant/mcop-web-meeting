import type { NavItem } from "~~/shared/types";
import searchIcon from "~/assets/icon/meeting/search.svg";
import agendaIcon from "~/assets/icon/meeting/agenda.svg";
import reportIcon from "~/assets/icon/meeting/report.svg";
import controlIcon from "~/assets/icon/meeting/control.svg";
import manageIcon from "~/assets/icon/meeting/manage.svg";

export const DEFAULT_ROUTE = "/meetings";

/** เมนูหลักตาม Figma (Admin) sidebar */
export const NAV_ITEMS: NavItem[] = [
  {
    label: "ค้นหาวาระการประชุม",
    icon: searchIcon,
    to: "/search",
  },
  {
    label: "ระเบียบการประชุม",
    icon: agendaIcon,
    to: "/meetings",
  },
  {
    label: "รายงานการประชุม",
    icon: reportIcon,
    to: "/reports",
  },
  {
    label: "ควบคุมการประชุม",
    icon: controlIcon,
    to: "/control",
  },
];

/** เมนูล่างสุดของ sidebar */
export const FOOTER_NAV_ITEMS: NavItem[] = [
  {
    label: "ระบบจัดการ",
    icon: manageIcon,
    to: "/manage",
  },
];

const findBestMatchingPath = (candidates: string[], currentPath: string) => {
  const normalized =
    currentPath === "/" ? "/" : currentPath.replace(/\/+$/, "") || "/";
  return (
    candidates
      .slice()
      .sort((a, b) => b.length - a.length)
      .find(
        (path) =>
          normalized === path ||
          (path !== "/" && normalized.startsWith(`${path}/`)),
      ) ?? null
  );
};

export const useNavigation = () => {
  const route = useRoute();
  const auth = useAuthStore();

  const currentPath = computed(() => route.path);
  const allItems = computed(() => [...NAV_ITEMS, ...FOOTER_NAV_ITEMS]);

  const activePath = computed(
    () =>
      findBestMatchingPath(
        allItems.value.flatMap((item) => [
          ...(item.to ? [item.to] : []),
          ...(item.children?.map((child) => child.to) ?? []),
        ]),
        currentPath.value,
      ) ?? currentPath.value,
  );

  const isActive = (path?: string, siblingPaths?: string[]) => {
    if (!path) return false;
    const candidates = siblingPaths?.length
      ? [...new Set([...siblingPaths, path])]
      : [path];
    return findBestMatchingPath(candidates, currentPath.value) === path;
  };

  const isGroupActive = (item: NavItem) => {
    return (
      activePath.value === item.to ||
      item.children?.some((child) => child.to === activePath.value) === true
    );
  };

  const canView = (item: NavItem) => {
    const hasRequiredRole = !item.roles?.length || auth.hasRole(item.roles);
    const hasRequiredPermission =
      !item.permissions?.length ||
      item.permissions.some((permission) => auth.hasPermission(permission));
    return hasRequiredRole && hasRequiredPermission;
  };

  const items = computed(() => {
    if (!auth.permissions) return NAV_ITEMS;
    return NAV_ITEMS.filter(canView);
  });

  const footerItems = computed(() => {
    if (!auth.permissions) return FOOTER_NAV_ITEMS;
    return FOOTER_NAV_ITEMS.filter(canView);
  });

  return {
    items,
    footerItems,
    isActive,
    isGroupActive,
  };
};
