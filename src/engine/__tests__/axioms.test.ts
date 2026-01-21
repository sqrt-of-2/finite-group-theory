
// src/engine/__tests__/axioms.test.ts
import { describe, it, expect } from 'vitest';
import { registry } from '../registry';

// Get all groups to test
const catalog = registry.getCatalog();
// We know these are registered: Z_1, Z_2, Z_3, Z_4, V_4, S_3, D_8, Q_8, A_4, A_5
// A_5 is order 60, might be slightly slow for O(N^3) checks but O(N) checks are fine.

describe('Group Axioms & Theorems', () => {
    catalog.forEach(item => {
        const group = registry.get(item.id);
        if (!group) return;

        describe(`${item.name} (Order ${group.elements.length})`, () => {
            const elements = group.elements;
            const order = elements.length;
            const identity = group.getIdentity();

            it('should have a unique identity element', () => {
                // Check e * e = e
                expect(group.multiply(identity, identity)).toBe(identity);
                // Check e * x = x * e = x for all x
                elements.forEach(x => {
                    expect(group.multiply(identity, x.id)).toBe(x.id);
                    expect(group.multiply(x.id, identity)).toBe(x.id);
                });
            });

            it('should have inverses for every element', () => {
                elements.forEach(x => {
                    const inv = group.invert(x.id);
                    // x * x^-1 = e
                    expect(group.multiply(x.id, inv)).toBe(identity);
                    // x^-1 * x = e
                    expect(group.multiply(inv, x.id)).toBe(identity);
                });
            });

            it('should satisfy Lagrange Theorem (element order divides group order)', () => {
                elements.forEach(x => {
                    // element order is already computed/cached in x.order?
                    // We can re-verify it.
                    let current = x.id;
                    let k = 1;
                    while (current !== identity && k <= order + 1) {
                        current = group.multiply(current, x.id);
                        k++;
                    }
                    expect(current).toBe(identity);
                    expect(order % k).toBe(0);
                });
            });

            it('should be associative (random sample)', () => {
                // Testing all triples for A5 (60^3 = 216000) is too slow.
                // Sample 50 random triples.
                for (let i = 0; i < 50; i++) {
                    const a = elements[Math.floor(Math.random() * order)].id;
                    const b = elements[Math.floor(Math.random() * order)].id;
                    const c = elements[Math.floor(Math.random() * order)].id;

                    // (ab)c
                    const ab = group.multiply(a, b);
                    const ab_c = group.multiply(ab, c);

                    // a(bc)
                    const bc = group.multiply(b, c);
                    const a_bc = group.multiply(a, bc);

                    expect(ab_c).toBe(a_bc);
                }
            });

            it('should have a computed center that is consistent', () => {
                const props = group.getProperties();
                const center = props.center;
                // Verify every element in center commutes with everything
                center.forEach(c => {
                    elements.forEach(x => {
                        const cx = group.multiply(c, x.id);
                        const xc = group.multiply(x.id, c);
                        expect(cx).toBe(xc);
                    });
                });
                // Verify identity is in center
                expect(center).toContain(identity);
            });

            it('subgroups should contain identity', () => {
                const subgroups = group.getSubgroups();
                subgroups.forEach(sub => {
                    const subElements = Array.from(sub.elements);
                    expect(subElements).toContain(identity);
                });
            });

            it('normal subgroups should be closed under conjugation', () => {
                const subgroups = group.getSubgroups();
                subgroups.filter(s => s.isNormal).forEach(sub => {
                    const subEls = Array.from(sub.elements);
                    // Check g n g^-1 in N for random g and random n
                    // Sample checks
                    for (let i = 0; i < 20; i++) {
                        const n = subEls[Math.floor(Math.random() * subEls.length)];
                        const g = elements[Math.floor(Math.random() * order)].id;
                        const gInv = group.invert(g);
                        const conj = group.multiply(group.multiply(g, n), gInv);
                        expect(subEls).toContain(conj);
                    }
                });
            });
        });
    });
});
