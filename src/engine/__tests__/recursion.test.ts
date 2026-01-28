import { describe, it, expect } from 'vitest';
import { registry } from '../registry';
import { createSn } from '../factory';

describe('Deep Quotient Recursion', () => {

    // Test that registry can resolve "S_3_quo_1_quo_0" dynamically

    it('should resolve recursive quotients dynamically', () => {
        // Ensure S_3 is registered
        if (!registry.get('S_3')) {
            registry.register('S_3', () => createSn(3));
        }

        // 1. Get S_3
        const s3 = registry.get('S_3');
        expect(s3).toBeDefined();

        // 2. We want to simulate navigating to S_3_quo_1
        // (Assuming standard order: S_3, A_3, {e}. A_3 is index 1 or 0 depending on sorted order)
        // Groups sorted by order descend.
        // S_3 (6), A_3 (3), {e} (1).
        // Index 0: S_3 (Ord 6) -> Quotient Order 1 (Z_1)
        // Index 1: A_3 (Ord 3) -> Quotient Order 2 (Z_2)
        // Index 2: {e} (Ord 1) -> Quotient Order 6 (S_3)

        // Let's try getting index 1 (A_3 quotient, should be Z_2)
        const q1Id = 'S_3_quo_1';
        const q1 = registry.get(q1Id); // Dynamic load
        expect(q1).toBeDefined();
        expect(q1!.getProperties().order).toBe(2);

        // 3. Now quotient of quotient.
        // q1 is Z_2. Subgroups: Z_2 (ord 2), {e} (ord 1).
        // Index 0: Z_2 -> Quotient Order 1 (Z_1)
        // Index 1: {e} -> Quotient Order 2 (Z_2)

        // Request S_3_quo_1_quo_1 (which should be isomorphic to Z_2 again)
        const q2Id = 'S_3_quo_1_quo_1';
        const q2 = registry.get(q2Id);
        expect(q2).toBeDefined();
        expect(q2!.getProperties().order).toBe(2);

        // Verify internal name might be fancy
        expect(q2!.displayName).toContain('/');
    });
});
