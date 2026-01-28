
import { describe, it, expect } from 'vitest';
import { createCn } from '../../engine/factory';
import { IGroup, Subgroup } from '../../engine/types';

// Logic copied from SubgroupLattice.tsx for verification
const calculateEdges = (subgroups: Subgroup[]) => {
    const isSubset = (a: Set<string>, b: Set<string>) => {
        if (a.size > b.size) return false;
        for (const x of a) {
            if (!b.has(x)) return false;
        }
        return true;
    };

    const sorted = [...subgroups].sort((a, b) => a.order - b.order);
    const edges: [string, string][] = []; // Names for debugging

    for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
            const subA = sorted[i];
            const subB = sorted[j];

            if (subB.order % subA.order !== 0) continue;

            if (isSubset(subA.elements, subB.elements)) {
                let direct = true;
                for (let k = i + 1; k < j; k++) {
                    const subK = sorted[k];
                    if (subK.order === subA.order || subK.order === subB.order) continue;
                    if (subK.order % subA.order === 0 && subB.order % subK.order === 0) {
                        if (isSubset(subA.elements, subK.elements) && isSubset(subK.elements, subB.elements)) {
                            direct = false;
                            break;
                        }
                    }
                }
                if (direct) {
                    const nameA = subA.order === 1 ? '{e}' : (subA.order === sorted[sorted.length - 1].order ? 'G' : `H_${subA.order}`);
                    const nameB = subB.order === 1 ? '{e}' : (subB.order === sorted[sorted.length - 1].order ? 'G' : `H_${subB.order}`);
                    edges.push([nameA, nameB]);
                }
            }
        }
    }
    return edges;
};

describe('Lattice Edge Logic', () => {
    it('generates correct edges for Z_6', () => {
        const g = createCn(6);
        const subgroups = g.getSubgroups();
        // Z6 Subgroups:
        // {0} (order 1)
        // {0, 3} (order 2)
        // {0, 2, 4} (order 3)
        // {0, 1, 2, 3, 4, 5} (order 6)

        // Expected Hasse Diagram:
        // {e} -> {0,3}
        // {e} -> {0,2,4}
        // {0,3} -> G
        // {0,2,4} -> G

        // No edge {0,3} -> {0,2,4}

        const edges = calculateEdges(subgroups);
        console.log('Edges generated:', edges);

        // Verify edge count
        expect(edges.length).toBe(4);

        // Verify specifically
        // Note: my helper names them by order for uniqueness in this simplistic test
        // H_2 is order 2. H_3 is order 3.

        const hasEdge = (a: string, b: string) => edges.some(e => e[0] === a && e[1] === b);

        expect(hasEdge('{e}', 'H_2')).toBe(true);
        expect(hasEdge('{e}', 'H_3')).toBe(true);
        expect(hasEdge('H_2', 'G')).toBe(true);
        expect(hasEdge('H_3', 'G')).toBe(true);

        expect(hasEdge('H_2', 'H_3')).toBe(false);
    });
});
