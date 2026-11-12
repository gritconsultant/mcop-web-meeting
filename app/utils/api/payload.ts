export type EmptyStringsAsNull<T> = T extends string
  ? string | null
  : T extends readonly unknown[]
    ? { [K in keyof T]: EmptyStringsAsNull<T[K]> }
    : T extends object
      ? { [K in keyof T]: EmptyStringsAsNull<T[K]> }
      : T;

export const emptyStringsToNull = <T>(value: T): EmptyStringsAsNull<T> => {
  if (typeof value === "string") {
    return (value.trim() === "" ? null : value) as EmptyStringsAsNull<T>;
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      emptyStringsToNull(item),
    ) as EmptyStringsAsNull<T>;
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        emptyStringsToNull(item),
      ]),
    ) as EmptyStringsAsNull<T>;
  }

  return value as EmptyStringsAsNull<T>;
};
