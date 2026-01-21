
// src/engine/ConcreteGroup.ts
import type { IGroup, GroupElement, ElementId, CayleyTable, GroupProperties, Subgroup } from './types';
import { generateClosure, generateCayleyTable, findConjugacyClasses, findAllSubgroups, isAbelian, findCenter } from './algorithms';

export class ConcreteGroup<T> implements IGroup {
    public id: string;
    public displayName: string;
    public elements: GroupElement[] = [];

    private _elementsT: T[] = []; // The underlying objects
    private _elementMap: Record<ElementId, T> = {};
    private _idMap: Record<string, ElementId> = {}; // T.toString() -> ElementId

    private _cayleyTable: CayleyTable | null = null;
    private _properties: GroupProperties | null = null;
    private _subgroups: Subgroup[] | null = null;
    private _conjugacyClasses: ElementId[][] | null = null;

    private multiplyFn: (a: T, b: T) => T;
    private invertFn: (a: T) => T;
    private identifyFn: (a: T) => string;
    private labelFn: (a: T) => string;


    constructor(
        id: string,
        displayName: string,
        generators: T[],
        multiply: (a: T, b: T) => T,
        invert: (a: T) => T, // Needed for internal logic? actually closure doesn't need it if finite
        identity: T,
        identify: (a: T) => string = (a) => String(a),
        label: (a: T) => string = (a) => String(a)
    ) {
        this.id = id;
        this.displayName = displayName;
        this.multiplyFn = multiply;
        this.invertFn = invert;
        this.identifyFn = identify;
        this.labelFn = label;

        // 1. Generate core elements
        const closure = generateClosure(generators, multiply, identify, identity);
        this._elementsT = closure.elements;

        // 2. Map to public GroupElement
        this._elementsT.forEach((el) => {
            // We can use the hash as ID, or simple index based ID.
            // Using hash is better for consistency if re-ordered? 
            // But 'identify' returns string. Let's use that.
            const elId = this.identifyFn(el);
            this._idMap[elId] = elId; // Identity map if identify returns unique strings
            this._elementMap[elId] = el;

            this.elements.push({
                id: elId,
                label: this.labelFn(el),
                // order will be computed later
            });
        });
    }

    multiply(a: ElementId, b: ElementId): ElementId {
        const objA = this._elementMap[a];
        const objB = this._elementMap[b];
        const res = this.multiplyFn(objA, objB);
        return this.identifyFn(res);
    }

    invert(a: ElementId): ElementId {
        const objA = this._elementMap[a];
        const res = this.invertFn(objA);
        return this.identifyFn(res);
    }

    getIdentity(): ElementId {
        // Assumes first element is identity in closure if derived correctly, 
        // or we can just find e such that e*e=e? 
        // Actually generateClosure ensures distinct elements.
        // We passed identity to it.
        // Let's rely on _elementsT[0] being identity (as per generateClosure impl).
        return this.identifyFn(this._elementsT[0]);
    }

    getCayleyTable(): CayleyTable {
        if (this._cayleyTable) return this._cayleyTable;

        this._cayleyTable = generateCayleyTable(
            this._elementsT,
            this.multiplyFn,
            this.identifyFn
        );
        return this._cayleyTable;
    }

    getProperties(): GroupProperties {
        if (this._properties) return this._properties;

        const table = this.getCayleyTable();
        const elementIds = this.elements.map(e => e.id);

        const abelian = isAbelian(elementIds, table.table);
        const center = findCenter(elementIds, table.table);
        const order = elementIds.length;

        // Cyclic? check max element order == order
        let maxOrder = 0;
        this.elements.forEach(el => {
            const ord = this.getElementOrder(el.id);
            el.order = ord; // update cached element
            if (ord > maxOrder) maxOrder = ord;
        });
        const cyclic = maxOrder === order;

        // Simple? Need normal subgroups.
        const subgroups = this.getSubgroups();
        // Simple if valid normal subgroups are only {e} and G.
        // Valid normal subgroups:
        const normalSubgroups = subgroups.filter(s => s.isNormal);
        const simple = normalSubgroups.length === 2 && order > 1; // {e} and G are distinct if order > 1

        // Min generators?
        // log2(order) as lower bound?
        // For now, heuristic or "d(G)" from Lattice?
        // We can just set it to 0 for now or compute it hard.

        this._properties = {
            isAbelian: abelian,
            isCyclic: cyclic,
            isSimple: simple,
            order: order,
            center: center,
            minGenerators: 0 // TODO
        };
        return this._properties;
    }

    getSubgroups(): Subgroup[] {
        if (this._subgroups) return this._subgroups;

        const table = this.getCayleyTable();
        const elementIds = this.elements.map(e => e.id);
        const rawSubgroups = findAllSubgroups(elementIds, table.table, this.getIdentity());

        this._subgroups = rawSubgroups.map(subIds => {
            // Check normality
            // N is normal if gNg^-1 = N for all g in G
            let isNormal = true;
            const setN = new Set(subIds);

            // Should optimize: only check generators of G?
            // For now brute force
            for (const g of elementIds) {
                const gInv = this.invert(g);
                for (const n of subIds) {
                    // g * n * gInv
                    const cn = this.multiply(this.multiply(g, n), gInv);
                    if (!setN.has(cn)) {
                        isNormal = false;
                        break;
                    }
                }
                if (!isNormal) break;
            }

            return {
                elements: setN,
                generators: [], // TODO: minimize generators for display
                isNormal,
                index: elementIds.length / subIds.length,
                order: subIds.length
            };
        });

        return this._subgroups;
    }

    conjugacyClasses(): ElementId[][] {
        if (this._conjugacyClasses) return this._conjugacyClasses;

        const table = this.getCayleyTable();
        const elementIds = this.elements.map(e => e.id);

        // efficient inverse map
        const inverseMap: Record<string, string> = {};
        elementIds.forEach(id => inverseMap[id] = this.invert(id));

        this._conjugacyClasses = findConjugacyClasses(elementIds, table.table, inverseMap);
        return this._conjugacyClasses;
    }

    private getElementOrder(id: ElementId): number {
        let current = id;
        const identity = this.getIdentity();
        let k = 1;
        while (current !== identity) {
            current = this.multiply(current, id);
            k++;
            if (k > this.elements.length) break; // Should not happen in finite group
        }
        return k;
    }
}
