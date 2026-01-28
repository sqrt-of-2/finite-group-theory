
// src/engine/__tests__/catalogue.test.ts
import { describe, it, expect } from 'vitest';
import { registry } from '../registry';

// Expected properties for our catalogue
const EXPECTED_PROPS: Record<string, {
    order: number;
    isAbelian: boolean;
    isCyclic: boolean;
    isSimple?: boolean;
    centerSize?: number;
}> = {
    // Order 1
    'Z_1': { order: 1, isAbelian: true, isCyclic: true, centerSize: 1 },
    // Order 2
    'Z_2': { order: 2, isAbelian: true, isCyclic: true, centerSize: 2 },
    // Order 3
    'Z_3': { order: 3, isAbelian: true, isCyclic: true, centerSize: 3 },
    // Order 4
    'Z_4': { order: 4, isAbelian: true, isCyclic: true, centerSize: 4 },
    'Z_2_x_Z_2': { order: 4, isAbelian: true, isCyclic: false, centerSize: 4 },
    // Order 5
    'Z_5': { order: 5, isAbelian: true, isCyclic: true, centerSize: 5 },
    // Order 6
    'Z_6': { order: 6, isAbelian: true, isCyclic: true, centerSize: 6 },
    'S_3': { order: 6, isAbelian: false, isCyclic: false, centerSize: 1, isSimple: false },
    // Order 7
    'Z_7': { order: 7, isAbelian: true, isCyclic: true, centerSize: 7 },
    // Order 8
    'Z_8': { order: 8, isAbelian: true, isCyclic: true, centerSize: 8 },
    'Z_4_x_Z_2': { order: 8, isAbelian: true, isCyclic: false, centerSize: 8 },
    'Z_2_x_Z_2_x_Z_2': { order: 8, isAbelian: true, isCyclic: false, centerSize: 8 },
    'D_8': { order: 8, isAbelian: false, isCyclic: false, centerSize: 2 },
    'Q_8': { order: 8, isAbelian: false, isCyclic: false, centerSize: 2 },
    // Order 9
    'Z_9': { order: 9, isAbelian: true, isCyclic: true, centerSize: 9 },
    'Z_3_x_Z_3': { order: 9, isAbelian: true, isCyclic: false, centerSize: 9 },
    // Order 10
    'Z_10': { order: 10, isAbelian: true, isCyclic: true, centerSize: 10 },
    'D_10': { order: 10, isAbelian: false, isCyclic: false, centerSize: 1 }, // Center of D_2n: if n odd -> {e}, if n even -> {e, a^n}
    // Order 11
    'Z_11': { order: 11, isAbelian: true, isCyclic: true, centerSize: 11 },
    // Order 12
    'Z_12': { order: 12, isAbelian: true, isCyclic: true, centerSize: 12 },
    'Z_6_x_Z_2': { order: 12, isAbelian: true, isCyclic: false, centerSize: 12 },
    'A_4': { order: 12, isAbelian: false, isCyclic: false, centerSize: 1, isSimple: false },
    'D_12': { order: 12, isAbelian: false, isCyclic: false, centerSize: 2 },
    'Dic_3': { order: 12, isAbelian: false, isCyclic: false, centerSize: 2 }, // Center {±1}
    // Order 60
    'A_5': { order: 60, isAbelian: false, isCyclic: false, centerSize: 1, isSimple: true }
};

describe('Group Catalogue Verification', () => {
    Object.entries(EXPECTED_PROPS).forEach(([id, expected]) => {
        it(`check properties of ${id}`, () => {
            const group = registry.get(id);
            expect(group).toBeDefined();
            if (!group) return;

            const props = group.getProperties();

            expect(props.order).toBe(expected.order);
            expect(props.isAbelian).toBe(expected.isAbelian);
            expect(props.isCyclic).toBe(expected.isCyclic);

            if (expected.isSimple !== undefined) {
                expect(props.isSimple).toBe(expected.isSimple);
            }

            if (expected.centerSize !== undefined) {
                expect(props.center?.length).toBe(expected.centerSize);
            }
        });
    });
});
