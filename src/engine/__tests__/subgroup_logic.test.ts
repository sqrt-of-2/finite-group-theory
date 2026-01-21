
import { describe, it, expect } from 'vitest';
import { registry } from '../registry';

describe('Subgroup Logic Verification', () => {
    // We will test deep subgroup properties for a few representative groups
    // Testing ALL groups might be slow if finding all subgroups is expensive (exponential)
    // S_3, Z_6, Z_2_x_Z_2 are good candidates.

    const testIds = ['S_3', 'Z_6', 'Z_2_x_Z_2', 'D_8', 'Q_8', 'A_4'];

    testIds.forEach(id => {
        const group = registry.get(id);
        if (!group) return;

        describe(`Subgroups of ${group.displayName}`, () => {
            const subgroups = group.getSubgroups();
            const groupOrder = group.elements.length;

            it('has at least {e} and G as subgroups', () => {
                // Trivial subgroup
                const trivial = subgroups.find(s => s.order === 1);
                expect(trivial).toBeDefined();
                expect(trivial!.elements.size).toBe(1);

                // Full group
                const full = subgroups.find(s => s.order === groupOrder);
                expect(full).toBeDefined();
                expect(full!.elements.size).toBe(groupOrder);
            });

            it('satisfies Lagrange Theorem for all subgroups', () => {
                subgroups.forEach(sub => {
                    expect(groupOrder % sub.order).toBe(0);
                });
            });

            it('intersection of any two subgroups is a subgroup', () => {
                // Verify that for any A, B in Subgroups, A cap B is also in Subgroups list
                // This is O(N^2) where N is number of subgroups. For small groups N is small.
                // S3: 6 subgroups. D8: 10 subgroups. A4: ~10?

                for (let i = 0; i < subgroups.length; i++) {
                    for (let j = i + 1; j < subgroups.length; j++) {
                        const A = subgroups[i];
                        const B = subgroups[j];

                        // Compute intersection
                        const intersection = new Set(
                            [...A.elements].filter(x => B.elements.has(x))
                        );
                        const size = intersection.size;

                        // Check if a subgroup with these exact elements exists
                        // Note: Sets are unordered, we need to check membership
                        const match = subgroups.find(s =>
                            s.order === size && [...s.elements].every(x => intersection.has(x))
                        );

                        expect(match).toBeDefined();
                    }
                }
            });

            it('subgroup elements are closed under main group multiplication', () => {
                subgroups.forEach(sub => {
                    const elems = Array.from(sub.elements);
                    elems.forEach(a => {
                        elems.forEach(b => {
                            const prod = group.multiply(a, b);
                            expect(sub.elements.has(prod)).toBe(true);
                        });
                        // Inspect inverse too
                        const inv = group.invert(a);
                        expect(sub.elements.has(inv)).toBe(true);
                    });
                });
            });
        });
    });
});
