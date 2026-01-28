
// src/engine/registry.ts
import type { IGroup } from './types';
// ... imports
import { areGroupsIsomorphic } from './isomorphism';
import { createCn, createSn, createDn, createKlein4, createAn, createQ8, createDirectProduct, createDic3 } from './factory';

class GroupRegistry {
    private groups: Record<string, IGroup> = {};
    private loaders: Record<string, () => IGroup> = {};

    register(id: string, loader: () => IGroup) {
        this.loaders[id] = loader;
    }

    get(id: string): IGroup | undefined {
        if (this.groups[id]) return this.groups[id];
        if (this.loaders[id]) {
            try {
                this.groups[id] = this.loaders[id]();
            } catch (e) {
                console.error(`Failed to load group ${id}`, e);
                throw e;
            }
            return this.groups[id];
        }
        return undefined;
    }

    getCatalog(): { id: string, name: string }[] {
        return Object.keys(this.loaders).map(id => ({ id, name: id }));
    }

    findIsomorphism(target: IGroup): IGroup | null {
        // Only check identifying properties first to avoid loading everything
        const targetProps = target.getProperties();

        for (const id of Object.keys(this.loaders)) {
            // Optimization: Maybe we can check metadata before loading? 
            // For now, load everything (small catalog).
            const candidate = this.get(id);
            if (!candidate) continue;

            if (areGroupsIsomorphic(target, candidate)) {
                return candidate;
            }
        }
        return null;
    }
}

export const registry = new GroupRegistry();

// Register known groups
// Order 1
registry.register('Z_1', () => createCn(1));
// Order 2
registry.register('Z_2', () => createCn(2));
// Order 3
registry.register('Z_3', () => createCn(3));
// Order 4
registry.register('Z_4', () => createCn(4));
registry.register('Z_2_x_Z_2', () => createKlein4()); // Z2 x Z2
// Order 5
registry.register('Z_5', () => createCn(5));
// Order 6
registry.register('Z_6', () => createCn(6)); // Z2 x Z3
registry.register('S_3', () => createSn(3)); // D3
// Order 7
registry.register('Z_7', () => createCn(7));
// Order 8
registry.register('Z_8', () => createCn(8));
registry.register('Z_4_x_Z_2', () => createDirectProduct(createCn(4), createCn(2)));
registry.register('Z_2_x_Z_2_x_Z_2', () => createDirectProduct(createKlein4(), createCn(2))); // V4 x Z2 (now Z2xZ2xZ2)
registry.register('D_8', () => createDn(4));
registry.register('Q_8', () => createQ8());
// Order 9
registry.register('Z_9', () => createCn(9));
registry.register('Z_3_x_Z_3', () => createDirectProduct(createCn(3), createCn(3)));
// Order 10
registry.register('Z_10', () => createCn(10));
registry.register('D_10', () => createDn(5));
// Order 11
registry.register('Z_11', () => createCn(11));
// Order 12
registry.register('Z_12', () => createCn(12));
registry.register('Z_6_x_Z_2', () => createDirectProduct(createCn(6), createCn(2)));
registry.register('A_4', () => createAn(4));
registry.register('D_12', () => createDn(6));
registry.register('Dic_3', () => createDic3()); // Q12

// Order 60
registry.register('A_5', () => createAn(5));

