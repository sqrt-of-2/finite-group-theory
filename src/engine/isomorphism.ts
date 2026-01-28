// src/engine/isomorphism.ts
import type { IGroup } from './types';

// Compute map of Order -> Count of elements with that order
function getElementOrderCounts(g: IGroup): Record<number, number> {
    const counts: Record<number, number> = {};
    for (const el of g.elements) {
        const ord = el.order || 0; // Fallback for safety
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

    // 6. Watertight check: Find explicit isomorphism
    return checkExplicitIsomorphism(g1, g2);
}

// Minimal generator finder (Greedy)
function getGenerators(g: IGroup): string[] {
    const elements = g.elements.map(e => e.id);
    const generated = new Set<string>();
    const identity = g.getIdentity();
    generated.add(identity);
    const generators: string[] = [];

    if (elements.length <= 1) return []; // Trivial or empty

    // Helper to compute closure of current generators
    const computeClosure = (gens: string[]): Set<string> => {
        const closure = new Set<string>([identity]);
        const q = [identity];
        // Add generators themselves
        for (const gen of gens) {
            if (!closure.has(gen)) {
                closure.add(gen);
                q.push(gen);
            }
        }

        let head = 0;
        while (head < q.length) {
            const u = q[head++];
            for (const v of gens) {
                const prod = g.multiply(u, v);
                if (!closure.has(prod)) { closure.add(prod); q.push(prod); }
            }
        }
        return closure;
    };

    // Initialize closure with existing (identity)
    let currentClosure = new Set<string>([identity]);

    // Greedy: pick first element not in closure
    for (const el of elements) {
        if (currentClosure.has(el)) continue;
        generators.push(el);
        // Recompute closure
        currentClosure = computeClosure(generators);
        if (currentClosure.size === elements.length) break;
    }
    return generators;
}

function checkExplicitIsomorphism(g1: IGroup, g2: IGroup): boolean {
    // If trivial
    if (g1.elements.length <= 1) return true;

    const gens1 = getGenerators(g1);
    const elements2 = g2.elements.map(e => e.id);
    const orders1 = gens1.map(gen => g1.elements.find(x => x.id === gen)!.order);

    // Candidates for each generator of G1 in G2 (must match order)
    const candidates = gens1.map((_, i) => {
        return elements2.filter(e2 => g2.elements.find(x => x.id === e2)!.order === orders1[i]);
    });

    // If any generator has no candidate, impossible (though invariants should have caught element order mismatch)
    if (candidates.some(c => c.length === 0)) return false;

    // Backtracking search for mapping
    return solve(0, [], g1, g2, gens1, candidates);
}

function solve(
    idx: number,
    currentMapping: string[],
    g1: IGroup,
    g2: IGroup,
    gens1: string[],
    candidates: string[][]
): boolean {
    if (idx === gens1.length) {
        return isValidIsomorphism(g1, g2, gens1, currentMapping);
    }

    const possible = candidates[idx];
    for (const img of possible) {
        // Optimization: Check injectivity of generators? 
        // If gens1[i] != gens1[j], then img != previous images? 
        // Not necessarily true if gens are independent? 
        // Actually generators are distinct Set elements. If img is reused, it implies relation collision?
        // Wait, different generators CAN map to same element if G1 is not free? 
        // No, if G1 generators map to same element, then G1/Kernel -> Subgroup of G2.
        // We want Isomorphism, so kernel must be trivial.
        // If |G1| == |G2|, surjectivity implies injectivity.
        // Just proceed.

        if (solve(idx + 1, [...currentMapping, img], g1, g2, gens1, candidates)) {
            return true;
        }
    }
    return false;
}

function isValidIsomorphism(g1: IGroup, g2: IGroup, gens1: string[], imgs: string[]): boolean {
    // BFS to generate full map
    const map = new Map<string, string>();
    const id1 = g1.getIdentity();
    const id2 = g2.getIdentity();

    map.set(id1, id2);
    const queue = [id1];

    const usedImages = new Set<string>();
    usedImages.add(id2);

    let head = 0;
    while (head < queue.length) {
        const u = queue[head++];
        const imgU = map.get(u)!;

        for (let i = 0; i < gens1.length; i++) {
            const gen = gens1[i];
            const imgGen = imgs[i];

            const v = g1.multiply(u, gen);
            const expectedImgV = g2.multiply(imgU, imgGen);

            if (map.has(v)) {
                if (map.get(v) !== expectedImgV) return false; // Homomorphism conflict
            } else {
                if (usedImages.has(expectedImgV)) return false; // Collision -> Not injective
                map.set(v, expectedImgV);
                usedImages.add(expectedImgV);
                queue.push(v);
            }
        }
    }

    if (map.size !== g1.elements.length) return false; // Should not happen if generators correct
    if (usedImages.size !== g2.elements.length) return false;

    return true;
}
