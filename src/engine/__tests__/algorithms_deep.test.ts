
// src/engine/__tests__/algorithms_deep.test.ts
import { describe, it, expect } from 'vitest';
import { generateClosure, findConjugacyClasses, findAllSubgroups, findCenter, isAbelian } from '../algorithms';

// Mock simple integer multiplication modulo 12 for testing (Z_12)
const addMod12 = (a: number, b: number) => (a + b) % 12;
const ident = (a: number) => String(a);

describe('Algorithms Deep Dive', () => {

    describe('generateClosure', () => {
        it('should generate Z_12 from {1}', () => {
            const result = generateClosure([1], addMod12, ident, 0);
            expect(result.elements.length).toBe(12);
            expect(result.elements).toContain(0);
            expect(result.elements).toContain(11);
        });

        it('should generate Z_12 from {2, 3} (gcd=1)', () => {
            const result = generateClosure([2, 3], addMod12, ident, 0);
            expect(result.elements.length).toBe(12);
        });

        it('should generate subgroup {0, 2, 4, 6, 8, 10} from {2}', () => {
            const result = generateClosure([2], addMod12, ident, 0);
            expect(result.elements.length).toBe(6);
            expect(result.elements.sort((a, b) => a - b)).toEqual([0, 2, 4, 6, 8, 10]);
        });

        it('should handle disjoint generators resulting in direct product structure', () => {
            // Test with string concatenation limited length? Or simple vector addition.
            // Let's stick to known groups logic.
            // Z6 from 2 and 3.
            // <2> = {0, 2, 4}, <3> = {0, 3}. <2, 3> = Z6.
            const result = generateClosure<number>([2, 3], (a, b) => (a + b) % 6, (a) => String(a), 0);
            expect(result.elements.length).toBe(6);
        });
    });

    // We need a small table for class equation tests.
    // Let's Use S3 table logic manually or reuse factory logic if pure function testing is hard without table.
    // We can simulate a non-abelian group table.
    // Group: {e, a, b, ab, ba, aba...} too complex.
    // Use the S3 table structure (isomorphic).
    // e=0, (12)=1, (13)=2, (23)=3, (123)=4, (132)=5
    // 0 is id.
    // 1*1=0, 2*2=0, 3*3=0.
    // 4*4=5, 5*5=4.
    // 1*2=5 (132), 2*1=4 (123).
    // ... This is hard to manually type.

    // Instead, verify properties of the algorithms using numeric groups (Abelian).
    // For Abelian groups, Classes = Elements (each is size 1).
    describe('findConjugacyClasses (Abelian)', () => {
        it('should return singleton classes for Z_6', () => {
            const { table, elements } = makeZTable(6);
            const invMap = { '0': '0', '1': '5', '2': '4', '3': '3', '4': '2', '5': '1' };
            const classes = findConjugacyClasses(elements, table, invMap);

            expect(classes.length).toBe(6); // All singletons
            classes.forEach(c => expect(c.length).toBe(1));
        });
    });

    describe('isAbelian', () => {
        it('should return true for Z_6', () => {
            const { table, elements } = makeZTable(6);
            expect(isAbelian(elements, table)).toBe(true);
        });
        // Non-abelian case tested in group.test.ts
    });

    describe('findCenter', () => {
        it('should be whole group for Z_6', () => {
            const { table, elements } = makeZTable(6);
            const center = findCenter(elements, table);
            expect(center.length).toBe(6);
        });
    });
});

// Helper to make Z_n table
function makeZTable(n: number) {
    const elements = Array.from({ length: n }, (_, i) => String(i));
    const table: Record<string, Record<string, string>> = {};
    for (let i = 0; i < n; i++) {
        const row = String(i);
        table[row] = {};
        for (let j = 0; j < n; j++) {
            table[row][String(j)] = String((i + j) % n);
        }
    }
    return { elements, table };
}
