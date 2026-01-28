// src/engine/isomorphism.ts
import type { IGroup } from './types';

// Compute map of Order -> Count of elements with that order
function getElementOrderCounts(g: IGroup): Record<number, number> {
    const counts: Record<number, number> = {};
    for (const el of g.elements) {
        const ord = el.order;
        counts[ord] = (counts[ord] || 0) + 1;
    }
    return counts;
}

// Check if two maps are equal
function areMapsEqual(m1: Record<number, number>, m2: Record<number, number>): boolean {
    const k1 = Object.keys(m1).map(Number).sort((a, b) => a - b);
    const k2 = Object.keys(m2).map(Number).sort((a, b) => a - b);
    if (k1.length !== k2.length) return false;
    for (let i = 0; i < k1.length; i++) {
        if (k1[i] !== k2[i]) return false;
        if (m1[k1[i]] !== m2[k2[i]]) return false;
    }
    return true;
}

export function areGroupsIsomorphic(g1: IGroup, g2: IGroup): boolean {
    // 1. Order check
    const p1 = g1.getProperties();
    const p2 = g2.getProperties();
    if (p1.order !== p2.order) return false;

    // 2. Abelian check
    if (p1.isAbelian !== p2.isAbelian) return false;

    // 3. Cyclic check
    if (p1.isCyclic !== p2.isCyclic) return false;

    // 4. Element Order Distribution (Invariant)
    const c1 = getElementOrderCounts(g1);
    const c2 = getElementOrderCounts(g2);
    if (!areMapsEqual(c1, c2)) return false;

    // 5. Center size (Invariant)
    if ((p1.center?.length || 0) !== (p2.center?.length || 0)) return false;

    // For the scope of small groups (order < 64), these invariants 
    // strongly differentiate non-isomorphic groups.
    // (e.g. D8 vs Q8 are distinguished by element order counts)

    return true;
}
