export const generateUniqueId = (name: string) => {
  return `${name}-${getCurrentInstance()?.uid}`;
};

export const createDraftKey = () => crypto.randomUUID();
