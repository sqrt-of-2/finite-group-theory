import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SubgroupLattice } from '../SubgroupLattice';
import { createCn } from '../../engine/factory';

// Mock MathTex to inspect props
vi.mock('../MathTex', () => ({
    MathTex: ({ tex }: { tex: string }) => <span data-testid="math-tex">{tex}</span>
}));

describe('SubgroupLattice', () => {
    it('renders trivial group Z_1 with correct labels', () => {
        const group = createCn(1); // Z_1
        const subgroups = group.getSubgroups();

        render(<SubgroupLattice group={group} subgroups={subgroups} />);

        // Z_1 has 1 subgroup.
        // It should render \{e\} because order is 1.
        // Top node logic says "if order == groupOrder, render G".
        // BUT logic is: node.order === 1 ? '\{e\}' : (node.order === groupOrder ? 'G' : ...)
        // Since order 1 == 1, it hits the first branch.
        const labels = screen.getAllByTestId('math-tex');
        const texts = labels.map(l => l.textContent);
        expect(texts).toContain('\\{e\\}');
        expect(texts).not.toContain('G = Z_{1}'); // Should show trivial label primarily if order 1
    });

    it('renders Z_2 with distinct trivial and group nodes', () => {
        const group = createCn(2);
        const subgroups = group.getSubgroups();

        render(<SubgroupLattice group={group} subgroups={subgroups} />);

        const labels = screen.getAllByTestId('math-tex');
        const texts = labels.map(l => l.textContent);

        expect(texts).toContain('\\{e\\}');
        expect(texts).toContain('G = Z_{2}');
    });

    it('formats multi-digit indices correctly in LaTeX', () => {
        const group = createCn(2);
        const subgroups = group.getSubgroups(); // 2 subgroups

        // Create fake subgroups with specific IDs and orders
        // We want to test H_{13}. 
        // We need at least 14 subgroups to hit index 13.
        const fakeSubgroups = Array(15).fill(null).map((_, i) => ({
            ...subgroups[0], // base props
            order: i === 0 ? 1 : i + 2, // avoid order 1 for non-index 0 if preserving logic (but logic relies on set size)
            // simplified: we just want list rendering
            elements: new Set(['e']),
            isNormal: true,
            name: ''
        }));

        // The component uses the index 'i' from the map for ID.
        // So the 14th element (index 13) will be H_{13}.
        // Its order should NOT be 1 (trivial) and NOT be groupOrder (2).
        // Let's ensure group order is definitely not matching fake orders.
        // Actually we pass group props.
        // If we set group order to say 100, and our fake subgroup has order 50.
        // ensure fakeSubgroups[13].order != 1 and != 100.

        const bigGroup = { ...group, getProperties: () => ({ order: 100 }) } as any;

        render(<SubgroupLattice group={bigGroup} subgroups={fakeSubgroups} />);

        const labels = screen.getAllByTestId('math-tex');
        // Index 13 -> H_{13}
        const h13 = labels.find(l => l.textContent === 'H_{13}');
        expect(h13).toBeInTheDocument();

        // Ensure not H_13
        const bad = labels.find(l => l.textContent === 'H_13');
        expect(bad).toBeUndefined();
    });

    it('renders edges between connected subgroups', () => {
        // Z_4: {0}, {0,2}, {0,1,2,3}
        // Chain: {0} -> {0,2} -> G
        const group = createCn(4);
        const subgroups = group.getSubgroups(); // 3 subgroups

        const { container } = render(<SubgroupLattice group={group} subgroups={subgroups} />);

        // Should have SVG lines
        const lines = container.querySelectorAll('line');
        // Edges: {0}->{0,2}, {0,2}->G. 
        // Transitive reduction removes {0}->G.
        // So expect 2 lines.
        expect(lines.length).toBe(2);
    });
});
