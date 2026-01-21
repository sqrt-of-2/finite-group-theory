
// src/engine/types.ts

export type ElementId = string;

export interface GroupElement {
  id: ElementId;
  label: string; // KaTeX compatible label
  order?: number;
}

export interface CayleyTable {
    elements: ElementId[];
    table: Record<ElementId, Record<ElementId, ElementId>>;
}

export interface GroupProperties {
    isAbelian: boolean;
    isCyclic: boolean;
    isSimple: boolean;
    order: number;
    center?: ElementId[];
    commutatorSubgroup?: ElementId[];
    minGenerators: number;
}

export interface Subgroup {
    elements: Set<ElementId>;
    generators: ElementId[];
    isNormal: boolean;
    index: number;
    order: number;
    name?: string;
}

export interface IGroup {
    id: string;
    displayName: string; // KaTeX
    description?: string;
    
    // Core operations
    elements: GroupElement[];
    multiply(a: ElementId, b: ElementId): ElementId;
    invert(a: ElementId): ElementId;
    getIdentity(): ElementId;
    
    // Computed (memoized ideally)
    getCayleyTable(): CayleyTable;
    getProperties(): GroupProperties;
    getSubgroups(): Subgroup[];
    conjugacyClasses(): ElementId[][];
}
