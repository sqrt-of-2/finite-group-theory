// src/engine/lattice.ts
import type { Subgroup } from './types';

export interface LatticeNode extends Subgroup {
    id: number; // Index in original array? Or sorted index? Let's use index in input array for ID.
    rank: number;
    layerIndex?: number;
}

export interface LatticeGraph {
    nodes: LatticeNode[]; // Ordered by rank/order
    links: [number, number][]; // Indices in the nodes array
    layers: Map<number, number[]>; // rank -> list of node indices
    maxRank: number;
}

// Logic Helpers
const isSubset = (a: Set<string>, b: Set<string>) => {
    if (a.size > b.size) return false;
    for (const x of a) {
        if (!b.has(x)) return false;
    }
    return true;
};

export function calculateLattice(subgroups: Subgroup[]): LatticeGraph {
    // 1. Sort subgroups by order (stable sort for consistency)
    // We map original index to new sorted index to preserve IDs if needed, 
    // but typically we just reassign IDs based on sorted position or keep reference.
    // The UI uses "index in subgroups array" as distinct ID. 
    // Let's attach the original index to the object.

    const sorted = subgroups.map((s, i) => ({ ...s, originalIndex: i }))
        .sort((a, b) => a.order - b.order);

    // 2. Compute Rank (Height)
    // Rank(S) = max(Rank(sub)) + 1 for all proper subgroups sub < S
    const ranks = new Map<number, number>(); // sortedIndex -> rank
    ranks.set(0, 0); // {e} is always first
    let maxRank = 0;

    for (let i = 1; i < sorted.length; i++) {
        const S = sorted[i];
        let r = 0;
        for (let j = 0; j < i; j++) {
            const sub = sorted[j];
            // Check specific subset relation
            if (S.order % sub.order === 0 && S.order !== sub.order) {
                if (isSubset(sub.elements, S.elements)) {
                    const subRank = ranks.get(j)!;
                    if (subRank + 1 > r) r = subRank + 1;
                }
            }
        }
        ranks.set(i, r);
        if (r > maxRank) maxRank = r;
    }

    // 3. Compute Edges (Transitive Reduction)
    const edges: [number, number][] = [];
    for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
            const subA = sorted[i];
            const subB = sorted[j];

            if (subB.order % subA.order !== 0) continue;

            if (isSubset(subA.elements, subB.elements)) {
                let direct = true;
                for (let k = i + 1; k < j; k++) {
                    const subK = sorted[k];
                    // If K is between A and B
                    if (subK.order === subA.order || subK.order === subB.order) continue;
                    if (subK.order % subA.order === 0 && subB.order % subK.order === 0) {
                        if (isSubset(subA.elements, subK.elements) && isSubset(subK.elements, subB.elements)) {
                            direct = false;
                            break;
                        }
                    }
                }
                if (direct) {
                    edges.push([i, j]);
                }
            }
        }
    }

    // 4. Layers
    // User Request: Group by Order strictly.
    // "subgroups of larger order are positioned higher"
    const layers = new Map<number, number[]>();
    // Since 'sorted' is already sorted by order, we can trust the order of keys if we insert in order.
    for (let i = 0; i < sorted.length; i++) {
        const ord = sorted[i].order;
        if (!layers.has(ord)) layers.set(ord, []);
        layers.get(ord)!.push(i);
    }

    // Return structure with nodes having the computed logical rank and ID
    const nodes: LatticeNode[] = sorted.map((s, i) => ({
        ...s,
        id: s.originalIndex, // Preserve original ID for UI keys
        rank: ranks.get(i)!
    }));

    return { nodes, links: edges, layers, maxRank };
}
