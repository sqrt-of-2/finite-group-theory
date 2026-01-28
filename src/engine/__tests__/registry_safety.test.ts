
import { describe, it, expect } from 'vitest';
import { registry } from '../registry';
import { createCn } from '../factory';

describe('GroupRegistry Catalog Safety', () => {
    it('does not leak dynamic groups into the catalog', () => {
        const initialCatalogSize = registry.getCatalog().length;

        // Register a hidden dynamic group
        registry.register('Dynamic_Group_XY', () => createCn(5), false);

        // Should be retrievable
        expect(registry.get('Dynamic_Group_XY')).toBeDefined();

        // But should NOT be in catalog
        const newCatalog = registry.getCatalog();
        expect(newCatalog.length).toBe(initialCatalogSize);
        expect(newCatalog.find(c => c.id === 'Dynamic_Group_XY')).toBeUndefined();
    });

    it('includes default registered groups in catalog', () => {
        // Register a static group (default true)
        registry.register('Static_Test_Group', () => createCn(5));

        const catalog = registry.getCatalog();
        expect(catalog.find(c => c.id === 'Static_Test_Group')).toBeDefined();
    });
});
