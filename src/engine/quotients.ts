
// src/engine/quotients.ts
import { ConcreteGroup } from './ConcreteGroup';
import type { IGroup, Subgroup, ElementId } from './types';

export function createQuotientGroup(G: IGroup, N: Subgroup): IGroup {
    // 1. Identify Cosets
    // All elements of G partitioned by N.
    // Coset gN = { gn | n in N }.
    // Canonical rep: smallest ID in coset? Or simple g.

    // We need to map every element of G to its coset.
    const elementToCoset: Record<ElementId, string> = {};
    const cosets: string[] = []; // List of canonical IDs (representatives)
    const cosetElements: Record<string, ElementId[]> = {};

    // Iterate G's elements. If not in map, start new coset.
    G.elements.forEach(g => {
        if (elementToCoset[g.id]) return;

        // Generate coset gN
        // We know elements of N. multiply g * n for all n in N.
        const currentCosetMembers: ElementId[] = [];
        const nIds = Array.from(N.elements); // Set of IDs

        for (const nId of nIds) {
            const val = G.multiply(g.id, nId);
            currentCosetMembers.push(val);
        }

        // Pick canonical (sort and pick first)
        currentCosetMembers.sort();
        const canonical = currentCosetMembers[0];

        cosets.push(canonical);
        cosetElements[canonical] = currentCosetMembers;

        currentCosetMembers.forEach(m => {
            elementToCoset[m] = canonical;
        });
    });

    // 2. Build Quotient Group Table
    // Elements are 'cosets'.
    // Multiply(A, B) = A*B (in G) mapped to coset.
    // (aN)(bN) = abN.
    // Take rep A and rep B. Multiply in G -> P.
    // Find coset of P.

    return new ConcreteGroup<string>(
        `${G.id}/${N.generators.join('') || 'N'}`, // TODO: Better naming if N has name
        `${G.displayName} / ${N.name || 'N'}`,
        cosets, // These are the elements (reps)
        (a, b) => {
            const prod = G.multiply(a, b);
            return elementToCoset[prod];
        },
        (a) => {
            const inv = G.invert(a);
            return elementToCoset[inv];
        },
        elementToCoset[G.getIdentity()],
        (a) => {
            // Label: "gH" or just g
            // If trivial quotient, "e".
            // If G/G, "e".
            // Use label of representative + "N"?
            const repLabel = G.elements.find(x => x.id === a)?.label || a;
            if (N.order === 1) return repLabel;
            if (N.order === G.elements.length) return "1"; // Trivial group
            // For Z_n / Z_k etc.
            return `[${repLabel}]`;
        }
    );
}
