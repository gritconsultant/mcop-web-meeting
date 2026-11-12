export const convertPathName = (path: string): string => {
  const map: Record<string, string> = {
    home: "หน้าหลัก",
    meetings: "การประชุม",
    committees: "คณะกรรมการ",
  };

  return map[path.toLowerCase()] || path;
};

export const dynamicSegmentMap: Record<string, string> = {
  home: "หน้าหลัก",
  "/": "หน้าหลัก",
  "/meetings": "การประชุม",
  "/committees": "คณะกรรมการ",
};

export const convert = (path: string): string => {
  return dynamicSegmentMap[path.toLowerCase()] || path;
};
