
// src/engine/__tests__/relations.test.ts
import { describe, it, expect } from 'vitest';
import { registry } from '../registry';

// Helper to get element by name/label
function getElement(group: any, label: string) {
    const el = group.elements.find((e: any) => e.label === label);
    if (!el) throw new Error(`Element ${label} not found in ${group.id}. Available: ${group.elements.map((e: any) => e.label).join(', ')}`);
    return el.id;
}

// Check if A = B in group
function expectEqual(group: any, a: string, b: string) {
    // a and b are IDs
    expect(a).toBe(b);
}

// Check A * B = C
function expectProd(group: any, a: string, b: string, result: string) {
    const prod = group.multiply(a, b);
    expect(prod).toBe(result);
}

describe('Group Relations Verification', () => {

    it('D8 (Dihedral order 8) should satisfy r^4=e, s^2=e, srs=r^-1', () => {
        // D8: <r, s | r^4=e, s^2=e, srs=r^-1>
        // Note: Our implementation might label them differently.
        // Factory D4 (order 8)
        const d8 = registry.get('D_8');
        expect(d8).toBeDefined();
        if (!d8) return;

        expect(d8!.getProperties().order).toBe(8);

        // Find generators r (order 4) and s (order 2, not r^2)
        // In our factory, we probably use standard cycle notation.
        // r = (1 2 3 4), s = (1 4)(2 3) or similar?
        // Let's identify r and s by order and non-commutativity.

        // Find element of order 4
        const order4 = d8!.elements.filter(e => e.order === 4);
        expect(order4.length).toBeGreaterThan(0);
        const r_id = order4[0].id;

        // Find element of order 2 that is not r^2
        const r2_id = d8!.multiply(r_id, r_id);
        const order2 = d8!.elements.filter(e => e.order === 2 && e.id !== r2_id);
        expect(order2.length).toBeGreaterThan(0);
        const s_id = order2[0].id;

        // Check s * s = e
        const s2 = d8!.multiply(s_id, s_id);
        const e = d8!.getIdentity();
        expect(s2).toBe(e);

        // Check r * r * r * r = e
        const r4 = d8!.multiply(r2_id, r2_id);
        expect(r4).toBe(e);

        // Check s * r * s = r^-1
        const sr = d8!.multiply(s_id, r_id);
        const srs = d8!.multiply(sr, s_id);
        const rInv = d8!.invert(r_id);

        expect(srs).toBe(rInv);
    });

    it('Q8 (Quaternion) should satisfy i^2=j^2=k^2=ijk=-1', () => {
        const q8 = registry.get('Q_8');
        expect(q8).toBeDefined();
        if (!q8) return;

        // Map labels to IDs
        const e = getElement(q8, '1');
        const i = getElement(q8, 'i');
        const j = getElement(q8, 'j');
        const k = getElement(q8, 'k');
        const neg1 = getElement(q8, '-1');

        // i^2 = -1
        expectProd(q8, i, i, neg1);
        // j^2 = -1
        expectProd(q8, j, j, neg1);
        // k^2 = -1
        expectProd(q8, k, k, neg1);

        // ijk = -1
        const ij = q8!.multiply(i, j);
        expect(ij).toBe(k); // i*j = k
        const ijk = q8!.multiply(ij, k);
        expect(ijk).toBe(neg1); // k*k = -1

        // -1 should be order 2 and commute with everything (center)
        expect(q8!.getProperties().center).toContain(neg1);
    });

    it('Z_2 x Z_2 should be abelian and all elements order 2 (except e)', () => {
        const v4 = registry.get('Z_2_x_Z_2');
        expect(v4).toBeDefined();
        if (!v4) return;

        const props = v4!.getProperties();
        expect(props.isAbelian).toBe(true);
        expect(props.order).toBe(4);

        const e = v4!.getIdentity();
        v4!.elements.forEach(el => {
            if (el.id !== e) {
                expect(el.order).toBe(2);
            }
        });
    });
});
