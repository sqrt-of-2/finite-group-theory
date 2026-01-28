
import { describe, it, expect } from 'vitest';
import { calculateLattice, LatticeGraph } from '../lattice';
import { createCn, createKlein4, createSn, createDn } from '../factory';
import { registry } from '../registry';

// Helper to find node by order and possibly element count for uniqueness
// For small groups, order is often unique enough for layers, 
// but for Z_6 we have two subgroups of different orders (2 and 3) that are Rank 1.
// For V_4 we have 3 subgroups of order 2.

function findNodeByOrder(graph: LatticeGraph, order: number) {
    return graph.nodes.filter(n => n.order === order);
}

describe('Lattice Algorithm', () => {

    describe('Cyclic Groups', () => {
        it('Z_6: Diamond structure', () => {
            const g = createCn(6);
            const subs = g.getSubgroups();
            const lattice = calculateLattice(subs);

            // Expected:
            // Rank 0: {e} (Ord 1)
            // Rank 1: {0,3} (Ord 2), {0,2,4} (Ord 3) -> Both are maximal proper subgroups? No, G covers them.
            // Rank 2: G (Ord 6)

            // Note: Ranks are computed by longest chain from bottom.
            // {e} -> Rank 0.
            // Ord 2: > {e}. Rank 1.
            // Ord 3: > {e}. Rank 1.
            // Ord 6: > Ord 2, > Ord 3. Max(1, 1) + 1 = 2.

            // Verify nodes
            const rank0 = lattice.nodes.filter(n => n.rank === 0);
            expect(rank0.length).toBe(1);
            expect(rank0[0].order).toBe(1);

            const rank1 = lattice.nodes.filter(n => n.rank === 1);
            expect(rank1.length).toBe(2);
            expect(rank1.map(n => n.order).sort()).toEqual([2, 3]);

            const rank2 = lattice.nodes.filter(n => n.rank === 2);
            expect(rank2.length).toBe(1);
            expect(rank2[0].order).toBe(6);

            // Verify Edges
            // Should have: {e}->Ord2, {e}->Ord3, Ord2->G, Ord3->G
            // Total 4 edges.
            expect(lattice.links.length).toBe(4);

            // Verify no edge between Ord 2 and Ord 3
            // Since links are indices, let's map to ranks.
            lattice.links.forEach(([src, tgt]) => {
                const s = lattice.nodes[src];
                const t = lattice.nodes[tgt];
                expect(t.rank).toBeGreaterThan(s.rank);
            });
        });

        it('Z_8: Linear structure', () => {
            const g = createCn(8);
            const lattice = calculateLattice(g.getSubgroups());
            // 1 -> 2 -> 4 -> 8
            // Ranks: 0, 1, 2, 3

            expect(lattice.maxRank).toBe(3);
            const layers = Array.from(lattice.layers.keys()).sort((a, b) => a - b);
            expect(layers).toEqual([0, 1, 2, 3]);

            // Each layer has 1 node
            expect(lattice.layers.get(0)?.length).toBe(1);
            expect(lattice.layers.get(1)?.length).toBe(1);
            expect(lattice.layers.get(2)?.length).toBe(1);
            expect(lattice.layers.get(3)?.length).toBe(1);

            expect(lattice.links.length).toBe(3); // 0->1, 1->2, 2->3
        });

        it('Z_12: Multi-path structure', () => {
            const g = createCn(12);
            const lattice = calculateLattice(g.getSubgroups());
            // Divisors: 1, 2, 3, 4, 6, 12
            // Rank 0: 1
            // Rank 1: 2, 3  (2 covers 1, 3 covers 1)
            // Rank 2: 4 (covers 2), 6 (covers 2,3)
            // Rank 3: 12 (covers 4,6)

            const rank1 = lattice.nodes.filter(n => n.rank === 1);
            expect(rank1.length).toBe(2); // 2 and 3
            expect(rank1.map(n => n.order).sort()).toEqual([2, 3]);

            const rank2 = lattice.nodes.filter(n => n.rank === 2);
            expect(rank2.length).toBe(2); // 4 and 6
            expect(rank2.map(n => n.order).sort()).toEqual([4, 6]);

            const rank3 = lattice.nodes.filter(n => n.rank === 3);
            expect(rank3.length).toBe(1); // 12
        });
    });

    describe('Non-Cyclic Groups', () => {
        it('V_4 (Klein 4): 1 -> (2,2,2) -> 4', () => {
            const g = createKlein4();
            const lattice = calculateLattice(g.getSubgroups());

            // Rank 0: {e}
            // Rank 1: 3 subgroups of order 2
            // Rank 2: V_4

            expect(lattice.layers.get(0)?.length).toBe(1);
            expect(lattice.layers.get(1)?.length).toBe(3);
            expect(lattice.layers.get(2)?.length).toBe(1);

            expect(lattice.links.length).toBe(6); // 3 going up from {e}, 3 going up to G
        });

        it('S_3: 1 -> (2,2,2,3) -> 6 ?? No.', () => {
            const g = createSn(3);
            const lattice = calculateLattice(g.getSubgroups());

            // S3 has:
            // 1 x Order 1 ({e})
            // 3 x Order 2 (<(12)>, <(13)>, <(23)>)
            // 1 x Order 3 (<(123)>)
            // 1 x Order 6 (G)

            // Elements of order 2 and 3 are prime, so they cover {e} directly.
            // So Rank 1 contains ALL 4 proper subgroups.
            // Rank 2 contains G.

            const rank1 = lattice.nodes.filter(n => n.rank === 1);
            expect(rank1.length).toBe(4);

            // 3 of order 2, 1 of order 3
            expect(rank1.filter(n => n.order === 2).length).toBe(3);
            expect(rank1.filter(n => n.order === 3).length).toBe(1);

            expect(lattice.maxRank).toBe(2);
        });

        it('D_8: More complex lattice', () => {
            // D_8 (Order 8).
            // Subgroups:
            // Order 1: 1 ({e})
            // Order 2: 5 (<r2>, <s>, <r2s>, <rs>, <r3s>)
            // Order 4: 3 (<r>, <r2, s> (Klein), <r2, rs> (Klein))
            // Order 8: 1 (G)

            // Ranks:
            // Rank 0: {e}
            // Rank 1: Order 2 subgroups (5 of them)
            // Rank 2: Order 4 subgroups (3 of them)
            // Rank 3: G

            // Let's verify.
            // Does every Order 4 subgroup contain an Order 2 subgroup? Yes.
            // Elements of order 4 (<r>) cover <r2> (Order 2).
            // Klein groups {e, a, b, ab} cover 3 order-2 subgroups.

            // So structure should be:
            // 0: {e}
            // 1: 5 nodes
            // 2: 3 nodes
            // 3: 1 node

            const g = registry.get('D_8')!;
            const lattice = calculateLattice(g.getSubgroups());

            expect(lattice.layers.get(0)?.length).toBe(1);
            expect(lattice.layers.get(1)?.length).toBe(5);
            expect(lattice.layers.get(2)?.length).toBe(3);
            expect(lattice.layers.get(3)?.length).toBe(1);

            expect(lattice.maxRank).toBe(3);
        });
    });
});
