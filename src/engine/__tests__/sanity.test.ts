
import { describe, it, expect } from 'vitest';
import { createCn, createSn } from '../factory';

describe('Sanity Checks', () => {
    it('Z_2 should have order 2', () => {
        const z2 = createCn(2);
        const props = z2.getProperties();
        expect(props.order).toBe(2);
        expect(props.isAbelian).toBe(true);
        expect(props.isCyclic).toBe(true);
    });

    it('Z_3 should have order 3', () => {
        const z3 = createCn(3);
        const props = z3.getProperties();
        expect(props.order).toBe(3);
    });

    it('S_3 should have order 6', () => {
        const s3 = createSn(3);
        expect(s3.getProperties().order).toBe(6);
    });
});
