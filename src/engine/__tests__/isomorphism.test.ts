
import { describe, it, expect } from 'vitest';
import { registry } from '../registry';
import { areGroupsIsomorphic } from '../isomorphism';
import { createCn, createSn, createDn, createKlein4, createQ8, createDirectProduct } from '../factory';

describe('Isomorphism Logic - Extensive Checks', () => {

    const catalog = registry.getCatalog(); // [{id, name}, ...]

    // 1. Reflexivity: G ~= G
    describe('Reflexivity', () => {
        catalog.forEach(({ id }) => {
            it(`${id} should be isomorphic to itself`, () => {
                const g = registry.get(id)!;
                expect(areGroupsIsomorphic(g, g)).toBe(true);
            });
        });
    });

    // 2. Known Isomorphisms
    describe('Known Isomorphisms', () => {
        it('Z_2 x Z_2 ~= Klein 4', () => {
            const z2xz2 = createDirectProduct(createCn(2), createCn(2));
            const k4 = createKlein4();
            expect(areGroupsIsomorphic(z2xz2, k4)).toBe(true);
        });

        it('S_3 ~= D_6 (D_3)', () => {
            const s3 = registry.get('S_3')!;
            const d3 = createDn(3);
            expect(areGroupsIsomorphic(s3, d3)).toBe(true);
        });

        it('Z_6 ~= Z_2 x Z_3', () => {
            const z6 = createCn(6);
            const z2z3 = createDirectProduct(createCn(2), createCn(3));
            expect(areGroupsIsomorphic(z6, z2z3)).toBe(true);
        });

        it('Z_4 != Z_2 x Z_2', () => {
            const z4 = createCn(4);
            const k4 = createKlein4();
            expect(areGroupsIsomorphic(z4, k4)).toBe(false);
        });

        it('D_8 != Q_8 (Order 8)', () => {
            const d8 = registry.get('D_8')!;
            const q8 = registry.get('Q_8')!;
            expect(areGroupsIsomorphic(d8, q8)).toBe(false);
        });

        it('Z_8 != D_8', () => {
            const z8 = createCn(8);
            const d8 = registry.get('D_8')!;
            expect(areGroupsIsomorphic(z8, d8)).toBe(false);
        });

        it('D_8 != Z_2 x Z_4', () => {
            const d8 = registry.get('D_8')!;
            const z2z4 = createDirectProduct(createCn(2), createCn(4));
            // Both order 8. D8 non-abelian, Z2xZ4 abelian.
            expect(areGroupsIsomorphic(d8, z2z4)).toBe(false);
        });
    });

    // 3. Pairwise checks for catalog
    // Most distinct IDs in our catalog are NOT isomorphic, except synonyms if any.
    // We can assume distinct *names* in our current registry (Z_3, Z_4, etc) are distinct groups.
    // Wait, Z_6 is registered. Z_2 and Z_3 are registered. Is Z_2xZ_3 registered? No, but Z_6 is.
    // If we have registered 'Z_6' and also 'Z_2xZ_3' they should be isomorphic.
    // Let's iterate all pairs of unique IDs.

    describe('Pairwise Consistency', () => {
        // We know which pairs SHOULD be isomorphic.
        // Let's create a map of "Isomorphism Classes"
        // Class 1: Z_1
        // Class 2: Z_2
        // ...
        // Class Order 4: Z_4, V_4 (Z_2xZ_2)
        // Groups in different classes must return false.

        // Let's define sets of IDs that are isomorphic.
        const isoSets: string[][] = [
            ['Z_1'],
            ['Z_2'],
            ['Z_3'],
            ['Z_4'],
            ['Z_5'],
            ['Z_6'],
            ['S_3', 'D_6', 'D_3'], // Note D_6/D_3 might not be in registry by that name? registry has S_3.
            ['Z_2_x_Z_2', 'V_4'],
            // We can check if `registry` has duplicates.
        ];

        // Just brute force check everything against everything and ensure symmetry.
        const ids = catalog.map(c => c.id);

        // This is O(N^2), N=~25. 625 checks. Fast enough.

        it('Isomorphism relation is Symmetric', () => {
            for (let i = 0; i < ids.length; i++) {
                for (let j = i + 1; j < ids.length; j++) {
                    const g1 = registry.get(ids[i])!;
                    const g2 = registry.get(ids[j])!;
                    const iso1 = areGroupsIsomorphic(g1, g2);
                    const iso2 = areGroupsIsomorphic(g2, g1);
                    expect(iso1).toBe(iso2); // Symmetry
                }
            }
        });
    });
});
