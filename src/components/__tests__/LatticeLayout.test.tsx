import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SubgroupLattice } from '../SubgroupLattice';
import { createCn } from '../../engine/factory';

// Mock MathTex to render plain text for size estimations
vi.mock('../MathTex', () => ({
    MathTex: ({ tex }: { tex: string }) => <span data-testid="math-tex">{tex}</span>
}));

describe('SubgroupLattice Layout Safety', () => {
    it('calculates node positions within safe bounds', () => {
        // Z_12 has many subgroups. Lattice is tall.
        const g = createCn(12);
        const subgroups = g.getSubgroups();

        // We can't easily access internal state from render, 
        // but we can check the SVG elements produced.
        const { container } = render(<SubgroupLattice group={g} subgroups={subgroups} />);

        const nodes = container.querySelectorAll('g[transform]');
        expect(nodes.length).toBeGreaterThan(0);

        // Parse transform="translate(x, y)"
        nodes.forEach(node => {
            const transform = node.getAttribute('transform');
            const match = transform?.match(/translate\(([\d.]+),\s*([\d.]+)\)/);
            if (match) {
                const [, x, y] = match.map(Number);

                // SVG is 600x400.
                // Padding is 50.
                // We want to ensure nodes are not too close to edges.
                // But labels extend "up" by ~30px. 
                // So y should be >= 30 (preferably >= padding=50).

                // Verify y bounds
                expect(y).toBeGreaterThanOrEqual(50);
                expect(y).toBeLessThanOrEqual(400 - 50);

                // Verify x bounds
                expect(x).toBeGreaterThan(0);
                expect(x).toBeLessThan(600);
            }
        });
    });

    it('renders label containers with sufficient width', () => {
        const g = createCn(12);
        const { container } = render(<SubgroupLattice group={g} subgroups={g.getSubgroups()} />);

        const foreignObjects = container.querySelectorAll('foreignObject');
        foreignObjects.forEach(fo => {
            const width = Number(fo.getAttribute('width'));
            const x = Number(fo.getAttribute('x'));

            // Previous bug: width=40, height=20, x=-20, y=-30.
            // We want wider. e.g. 100px.

            // Check if we improved it
            expect(width).toBeGreaterThan(40); // Expecting improvement
            expect(x).toBeLessThan(-20); // Should shift left to center wider block
        });
    });
});
