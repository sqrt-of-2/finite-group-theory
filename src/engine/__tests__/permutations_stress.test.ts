
// src/engine/__tests__/permutations_stress.test.ts
import { describe, it, expect } from 'vitest';
import { Permutation } from '../permutation';

describe('Permutation Stress Tests', () => {
    // Generate some specific permutations in S5
    const p1 = Permutation.fromCycles(5, [[1, 2, 3, 4, 5]]); // (1 2 3 4 5)
    const p2 = Permutation.fromCycles(5, [[1, 2]]); // (1 2)
    const p3 = Permutation.fromCycles(5, [[3, 4, 5]]); // (3 4 5)
    const id = Permutation.identity(5);

    // Manual cases
    const cases = [
        { p: p1, expectedOrder: 5 },
        { p: p2, expectedOrder: 2 },
        { p: p3, expectedOrder: 3 },
        { p: p1.multiply(p1), expectedOrder: 5 }, // (1 3 5 2 4)
    ];

    cases.forEach((c, i) => {
        it(`Case ${i}: Order calculation for ${c.p.format()}`, () => {
            expect(c.p.order()).toBe(c.expectedOrder);
        });
    });

    // Check inverse property (p * p^-1 = id) for generated permutations
    const permutations = [p1, p2, p3, p1.multiply(p2), p2.multiply(p3)];
    permutations.forEach((p, i) => {
        it(`Permutation ${i}: should satisfy p * p^-1 = id`, () => {
            const inv = p.inverse();
            const prod = p.multiply(inv);
            expect(prod.toString()).toBe(id.toString());
        });
    });

    // Check (xy)^-1 = y^-1 x^-1
    const pairs = [
        [p1, p2], [p1, p3], [p2, p3], [p2, p1]
    ];
    pairs.forEach(([a, b], i) => {
        it(`Pair ${i}: (ab)^-1 should equal b^-1 a^-1`, () => {
            const ab = a.multiply(b);
            const abInv = ab.inverse();

            const aInv = a.inverse();
            const bInv = b.inverse();
            const bInvAInv = bInv.multiply(aInv);

            expect(abInv.toString()).toBe(bInvAInv.toString());
        });
    });

    // Check associativity a(bc) = (ab)c
    const triples = [
        [p1, p2, p3],
        [p2, p3, p1],
        [p3, p1, p2]
    ];
    triples.forEach(([a, b, c], i) => {
        it(`Triple ${i}: Associativity`, () => {
            const ab_c = a.multiply(b).multiply(c);
            const a_bc = a.multiply(b.multiply(c));
            expect(ab_c.toString()).toBe(a_bc.toString());
        });
    });
});
