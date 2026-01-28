
import { describe, it, expect } from 'vitest';
import { getElementColor } from '../colors'; // adjusting import later
import { createCn } from '../../engine/factory';

describe('Color Generation', () => {
    it('generates distinct colors for Z_12 classes', () => {
        // Z_12 has 12 conjugacy classes (abelian -> 1 el per class)
        const g = createCn(12);
        const classes = g.conjugacyClasses();
        expect(classes.length).toBe(12);

        const colors = new Set<string>();
        // Check colors for each representative
        classes.forEach(cls => {
            const rep = cls[0];
            const color = getElementColor(rep, classes);
            colors.add(color);
        });

        // We expect 12 distinct colors
        expect(colors.size).toBe(12);
    });
});
