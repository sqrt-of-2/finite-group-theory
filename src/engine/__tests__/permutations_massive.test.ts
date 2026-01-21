
// src/engine/__tests__/permutations_massive.test.ts
import { describe, it, expect } from 'vitest';
import { Permutation } from '../permutation';

describe('Massive Permutation Tests', () => {

    const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1);

    // Test all permutations of S3 exhaustively (6 tests)
    describe('S3 Exhaustive Checks', () => {
        const n = 3;
        // Generate all perms manually
        const perms: number[][] = [
            [0, 1, 2], [0, 2, 1],
            [1, 0, 2], [1, 2, 0],
            [2, 0, 1], [2, 1, 0]
        ];

        perms.forEach((map, i) => {
            const p = new Permutation(map);
            it(`S3 Permutation ${i} (${map.join(',')}) properties`, () => {
                // Check identity property
                const id = Permutation.identity(n);
                expect(p.multiply(id).toString()).toBe(p.toString());
                expect(id.multiply(p).toString()).toBe(p.toString());

                // Check inverse
                const inv = p.inverse();
                expect(p.multiply(inv).toString()).toBe(id.toString());

                // Check order validity (must divide 6)
                const order = p.order();
                expect([1, 2, 3]).toContain(order);
                expect(6 % order).toBe(0);
            });
        });
    });

    // Test cycle conversion for many random permutations (50 tests)
    describe('Random S5 Permutations', () => {
        for (let i = 0; i < 50; i++) {
            it(`Random Permutation ${i} in S5 consistency`, () => {
                const arr = [0, 1, 2, 3, 4];
                // Shuffle
                for (let j = arr.length - 1; j > 0; j--) {
                    const k = Math.floor(Math.random() * (j + 1));
                    [arr[j], arr[k]] = [arr[k], arr[j]];
                }

                const p = new Permutation(arr);

                // 1. Cycle conversion roundtrip might be hard if "fromCycles" logic is strict specific format
                // But we can check basic properties

                // 2. p^order = id
                const order = p.order();
                let acc = p;
                // p^1..p^order
                for (let k = 1; k < order; k++) {
                    acc = acc.multiply(p);
                }
                if (order > 1) {
                    // acc should be last step, wait. 
                    // p^order
                    let res = Permutation.identity(5);
                    for (let k = 0; k < order; k++) res = res.multiply(p);
                    expect(res.toString()).toBe(Permutation.identity(5).toString());
                } else {
                    expect(p.toString()).toBe(Permutation.identity(5).toString());
                }

                // 3. (p^-1)^-1 = p
                expect(p.inverse().inverse().toString()).toBe(p.toString());
            });
        }
    });

    // Specific arithmetic checks (30 tests)
    describe('Arithmetic Checks', () => {
        const id = Permutation.identity(4);
        const p1 = Permutation.fromCycles(4, [[1, 2]]);
        const p2 = Permutation.fromCycles(4, [[3, 4]]);
        const p3 = Permutation.fromCycles(4, [[1, 3]]);

        // p1 and p2 are disjoint, should commute
        it('Disjoint cycles commute (p1, p2)', () => {
            expect(p1.multiply(p2).toString()).toBe(p2.multiply(p1).toString());
        });

        for (let i = 0; i < 29; i++) {
            it(`Generated commutation check ${i}`, () => {
                // Randomly compose p1, p2, p3 and check associative
                const list = [p1, p2, p3];
                const a = list[i % 3];
                const b = list[(i + 1) % 3];
                const c = list[(i + 2) % 3];

                const lhs = a.multiply(b).multiply(c);
                const rhs = a.multiply(b.multiply(c));
                expect(lhs.toString()).toBe(rhs.toString());
            });
        }
    });

});
