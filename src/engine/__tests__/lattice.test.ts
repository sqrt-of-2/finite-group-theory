
import { describe, it, expect } from 'vitest';
import { calculateLattice } from '../lattice';
import { createCn, createKlein4, createSn } from '../factory';


describe('Lattice Algorithm (Rank-Based Topology)', () => {

    describe('Cyclic Groups', () => {
        it('Z_6: Diamond structure', () => {
            const g = createCn(6);
            const subs = g.getSubgroups();
            const lattice = calculateLattice(subs);

            // Expected:
            // Rank 0: {e}
            // Rank 1: {0,3} (Ord 2), {0,2,4} (Ord 3)
            // Rank 2: G

            expect(lattice.layers.size).toBe(3);
            expect(lattice.layers.get(0)?.length).toBe(1);
            expect(lattice.layers.get(1)?.length).toBe(2);
            expect(lattice.layers.get(2)?.length).toBe(1);

            // Verify Ranks 1 contains orders 2 and 3
            // Since we only store indices, lets check nodes
            const rank1Indices = lattice.layers.get(1)!;
            const rank1Orders = rank1Indices.map(i => lattice.nodes[i].order).sort();
            expect(rank1Orders).toEqual([2, 3]);
        });

        it('Z_8: Linear structure', () => {
            const g = createCn(8);
            const lattice = calculateLattice(g.getSubgroups());
            // 1, 2, 4, 8
            // Ranks 0, 1, 2, 3
            expect(lattice.layers.size).toBe(4);
        });

        it('Z_12: Multi-path structure', () => {
            const g = createCn(12);
            const lattice = calculateLattice(g.getSubgroups());

            // Rank 1: 2, 3
            // Rank 2: 4, 6
            const rank1Indices = lattice.layers.get(1)!;
            expect(rank1Indices.length).toBe(2);

            const rank2Indices = lattice.layers.get(2)!;
            expect(rank2Indices.length).toBe(2);
        });
    });

    describe('Non-Cyclic Groups', () => {
        it('V_4 (Klein 4): 1 -> (2,2,2) -> 4', () => {
            const g = createKlein4();
            const lattice = calculateLattice(g.getSubgroups());

            // Rank 0: {e}
            // Rank 1: 3 x Ord 2
            // Rank 2: G
            expect(lattice.layers.get(1)?.length).toBe(3);
        });

        it('S_3: 1 -> (2,2,2,3) -> 6', () => {
            const g = createSn(3);
            const lattice = calculateLattice(g.getSubgroups());

            // All atoms (2,2,2,3) are Rank 1
            expect(lattice.layers.get(1)?.length).toBe(4);
            expect(lattice.maxRank).toBe(2);
        });
    });
});
