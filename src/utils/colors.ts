
// Helper for updated GroupPage
export const getElementColor = (
    elementId: string,
    conjugacyClasses: string[][]
): string => {
    // Identity is always first class usually, or specifically identified
    // If element is identity or in identity class, keep white?
    // Usually identity is its own class {e}. 
    // We want identity to be white/distinct.

    // Find index
    const index = conjugacyClasses.findIndex(cls => cls.includes(elementId));
    if (index === -1) return '#ffffff';

    // Identity check: usually index 0 if sorted? or we can check elementId if passed context.
    // Assuming index 0 is identity (common convention in our engine)
    if (index === 0) return '#ffffff';

    const count = conjugacyClasses.length;
    // Generate HSL
    // Hue: Distributed evenly. Skip 0 (white).
    // range 0-360.
    // If we have N classes. 0 is white. 1..N-1 are colors.
    // Hue step = 360 / (N-1)

    // To ensure good separation for small N:
    // index 1..N-1
    const hue = ((index - 1) * (360 / (Math.max(1, count - 1)))) % 360;

    // Use pastel L=90%, S=70%
    return `hsl(${hue}, 70%, 90%)`;
};
