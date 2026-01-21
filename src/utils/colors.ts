
// Helper for updated GroupPage
export const getElementColor = (
    elementId: string,
    conjugacyClasses: string[][]
): string => {
    // Simple palette (pastel)
    const palette = [
        '#ffffff', // Identity usually
        '#ffebee', '#f3e5f5', '#e8eaf6', '#e3f2fd',
        '#e0f2f1', '#e8f5e9', '#f9fbe7', '#fffde7', '#fff3e0', '#fbe9e7'
    ];

    const index = conjugacyClasses.findIndex(cls => cls.includes(elementId));
    if (index === -1) return '#ffffff';
    return palette[index % palette.length];
};
