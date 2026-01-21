
import { describe, it, expect } from 'vitest';
import { registry } from '../registry';

// Load all groups to test
const catalog = registry.getCatalog();
const groups = catalog.map(entry => {
    const group = registry.get(entry.id);
    if (!group) throw new Error(`Failed to load group ${entry.id}`);
    return group;
});

describe('Massive Element Verification Suite', () => {
    groups.forEach(group => {
        describe(`Group ${group.displayName} (Order ${group.elements.length})`, () => {
            const elements = group.elements;
            const identity = group.getIdentity();

            // 1. Identity Laws for every element
            describe('Identity Axioms', () => {
                elements.forEach(element => {
                    it(`g=${element.label || element.id}: e * g = g`, () => {
                        const prod = group.multiply(identity, element.id);
                        expect(prod).toBe(element.id);
                    });

                    it(`g=${element.label || element.id}: g * e = g`, () => {
                        const prod = group.multiply(element.id, identity);
                        expect(prod).toBe(element.id);
                    });
                });
            });

            // 2. Inverse Laws for every element
            describe('Inverse Axioms', () => {
                elements.forEach(element => {
                    it(`g=${element.label || element.id}: g * g^-1 = e`, () => {
                        const inv = group.invert(element.id);
                        const prod = group.multiply(element.id, inv);
                        expect(prod).toBe(identity);
                    });

                    it(`g=${element.label || element.id}: g^-1 * g = e`, () => {
                        const inv = group.invert(element.id);
                        const prod = group.multiply(inv, element.id);
                        expect(prod).toBe(identity);
                    });
                });
            });

            // 3. Order Properties
            describe('Order Properties', () => {
                elements.forEach(element => {
                    it(`g=${element.label || element.id}: g^order = e`, () => {
                        // Quick power calculation
                        // Use the cached order if available
                        const order = element.order!;

                        // compute g^order
                        let acc = element.id;
                        for (let k = 1; k < order; k++) {
                            acc = group.multiply(acc, element.id);
                        }

                        // If order is 1 (identity), loop doesn't run, acc is identity.
                        // Wait, if order=1, element is identity. acc should start as element.
                        // If order=1, loop 1<1 false. acc=identity. Correct.
                        // If order=2, loop k=1. acc = g*g = e. Correct.

                        if (order === 1) {
                            expect(element.id).toBe(identity);
                        } else {
                            // If order > 1, the loop computes g^(order).
                            // Let's redo simple power loop
                            let val = identity;
                            for (let k = 0; k < order; k++) {
                                val = group.multiply(val, element.id);
                            }
                            expect(val).toBe(identity);
                        }
                    });

                    it(`g=${element.label || element.id}: order(g) divides |G|`, () => {
                        expect(group.elements.length % element.order!).toBe(0);
                    });
                });
            });

            // 4. Center check (element-wise)
            // Verify that if an element is in the center, it commutes with everything
            describe('Center Consistency', () => {
                const props = group.getProperties();
                const centerIds = new Set(props.center || []);

                it('Identity is always in the center', () => {
                    expect(centerIds.has(identity)).toBe(true);
                });

                elements.forEach(x => {
                    if (centerIds.has(x.id)) {
                        it(`Center element ${x.label || x.id} commutes with all elements`, () => {
                            elements.forEach(y => {
                                const xy = group.multiply(x.id, y.id);
                                const yx = group.multiply(y.id, x.id);
                                expect(xy).toBe(yx);
                            });
                        });
                    }
                });
            });

        });
    });
});
