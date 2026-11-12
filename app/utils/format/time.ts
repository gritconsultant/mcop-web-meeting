export interface TimeFormat {
  hours: number;
  minutes: number;
}

/** "09:00" → "09:00:00" */
export const addSeconds = (time: string): string => {
  return time.split(":").length === 2 ? `${time}:00` : time;
};

/** "09:00:00" → "09:00" */
export const cutSeconds = (time: string): string => {
  return time.split(":").slice(0, 2).join(":");
};

/** "09:30" → 570 */
export const toMinutes = (time: string): number => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/** ชั่วโมง → นาที */
export const toHoursToMinutes = (hours: number): number => {
  return hours * 60;
};

export const formatMinutesToHoursText = (totalMinutes: number): TimeFormat => {
  if (!totalMinutes || totalMinutes <= 0) return { hours: 0, minutes: 0 };
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
};


