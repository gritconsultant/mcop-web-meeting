export const generateUniqueId = (name: string) => {
  return `${name}-${getCurrentInstance()?.uid}`;
};
