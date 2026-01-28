
import { describe, it, expect } from 'vitest';
import { calculateLattice, LatticeGraph } from '../lattice';
import { createCn, createKlein4, createSn, createDn } from '../factory';
import { registry } from '../registry';

describe('Lattice Algorithm (Order-based Layout)', () => {

    describe('Cyclic Groups', () => {
        it('Z_6: Diamond structure, Order Based Layers', () => {
            // Z_6 layers by Order: 1, 2, 3, 6.
            const g = createCn(6);
            const subs = g.getSubgroups();
            const lattice = calculateLattice(subs);

            // Layer Keys should be orders
            expect(lattice.layers.has(1)).toBe(true);
            expect(lattice.layers.has(2)).toBe(true);
            expect(lattice.layers.has(3)).toBe(true);
            expect(lattice.layers.has(6)).toBe(true);

            expect(lattice.layers.get(1)?.length).toBe(1); // {e}
            expect(lattice.layers.get(2)?.length).toBe(1); // {0,3}
            expect(lattice.layers.get(3)?.length).toBe(1); // {0,2,4}
            expect(lattice.layers.get(6)?.length).toBe(1); // G
        });

        it('Z_8: Linear structure, Order Based', () => {
            const g = createCn(8);
            const lattice = calculateLattice(g.getSubgroups());
            // Layers: 1, 2, 4, 8
            const layers = Array.from(lattice.layers.keys()).sort((a, b) => a - b);
            expect(layers).toEqual([1, 2, 4, 8]);

            expect(lattice.layers.get(1)?.length).toBe(1);
            expect(lattice.layers.get(2)?.length).toBe(1);
            expect(lattice.layers.get(4)?.length).toBe(1);
            expect(lattice.layers.get(8)?.length).toBe(1);
        });

        it('Z_12: Multi-path structure, Stratified by Order', () => {
            const g = createCn(12);
            const lattice = calculateLattice(g.getSubgroups());
            // Orders: 1, 2, 3, 4, 6, 12.
            const layers = Array.from(lattice.layers.keys()).sort((a, b) => a - b);
            expect(layers).toEqual([1, 2, 3, 4, 6, 12]);

            expect(lattice.layers.get(2)?.length).toBe(1); // {0,6}
            expect(lattice.layers.get(3)?.length).toBe(1); // {0,4,8}
            expect(lattice.layers.get(4)?.length).toBe(1); // {0,3,6,9}
            expect(lattice.layers.get(6)?.length).toBe(1); // {0,2,4,6,8,10}
        });
    });

    describe('Non-Cyclic Groups', () => {
        it('V_4 (Klein 4): 1 -> (2,2,2) -> 4', () => {
            const g = createKlein4();
            const lattice = calculateLattice(g.getSubgroups());
            // Orders: 1, 2, 4

            expect(lattice.layers.get(1)?.length).toBe(1);
            expect(lattice.layers.get(2)?.length).toBe(3);
            expect(lattice.layers.get(4)?.length).toBe(1);
        });

        it('S_3: 1 -> (2,2,2) -> 3 -> 6', () => {
            const g = createSn(3);
            const lattice = calculateLattice(g.getSubgroups());
            // Orders: 1, 2, 3, 6 (Unlike Rank layout where 2 and 3 were mixed/same rank)
            // Here distinct order layers.

            expect(lattice.layers.get(1)?.length).toBe(1);
            expect(lattice.layers.get(2)?.length).toBe(3);
            expect(lattice.layers.get(3)?.length).toBe(1);
            expect(lattice.layers.get(6)?.length).toBe(1);
        });

        it('D_8: 1 -> 2 -> 4 -> 8', () => {
            const g = registry.get('D_8')!;
            const lattice = calculateLattice(g.getSubgroups());

            // Orders: 1, 2, 4, 8
            expect(lattice.layers.get(1)?.length).toBe(1);
            expect(lattice.layers.get(2)?.length).toBe(5);
            expect(lattice.layers.get(4)?.length).toBe(3);
            expect(lattice.layers.get(8)?.length).toBe(1);
        });
    });
});
