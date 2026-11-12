export const onFieldErrorChange = (errors: Ref<Record<string, string | undefined>>, name: string, error: string | undefined) => {
    if (error) {
        errors.value[name] = error;
    } else {
        errors.value = Object.fromEntries(Object.entries(errors.value).filter(([key]) => key !== name));
    }
};

export const removeFieldErrorsByIndex = (
    errors: Ref<Record<string, string | undefined>>,
    prefix: string,
    removedIndex: number,
) => {
    const pattern = new RegExp(`^${prefix}\\.(\\d+)\\.(.+)$`);
    const next: Record<string, string | undefined> = {};

    for (const [key, value] of Object.entries(errors.value)) {
        const match = key.match(pattern);
        if (!match) {
            next[key] = value;
            continue;
        }

        const rowIndex = Number(match[1]);
        if (rowIndex === removedIndex) continue;

        const newIndex = rowIndex > removedIndex ? rowIndex - 1 : rowIndex;
        next[`${prefix}.${newIndex}.${match[2]}`] = value;
    }

    errors.value = next;
};