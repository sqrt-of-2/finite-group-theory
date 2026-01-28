import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SubgroupLattice } from '../SubgroupLattice';
import { createCn } from '../../engine/factory';

// Mock MathTex to inspect props
vi.mock('../MathTex', () => ({
    MathTex: ({ tex }: { tex: string }) => <span data-testid="math-tex">{tex}</span>
}));

describe('SubgroupLattice', () => {
    it('renders trivial group Z_1 without crashing (div by zero fix)', () => {
        const group = createCn(1); // Z_1
        const subgroups = group.getSubgroups();

        render(<SubgroupLattice group={group} subgroups={subgroups} />);

        // Should find "e" or subgroup representation
        const labels = screen.getAllByTestId('math-tex');
        expect(labels.length).toBeGreaterThan(0);
        // Expect 'e' or 'G' or 'Z_1' depending on exact logic.
        // Z_1 displayName is 'Z_1'. node.name might be empty?
        // Logic: node.name || (node.order === 1 ? 'e' : (node.order === groupOrder ? 'G' : `H_{${node.id}}`))
        // For Z_1, order 1 is groupOrder. Order 1 text is 'e'. Priority to 'e'.
        const texts = labels.map(l => l.textContent);
        expect(texts).toContain('e');
    });

    it('renders correct labels for subgroups', () => {
        const group = createCn(2); // Z_2 -> {e}, {e, a}
        const subgroups = group.getSubgroups();

        render(<SubgroupLattice group={group} subgroups={subgroups} />);

        const labels = screen.getAllByTestId('math-tex');
        // We expect matching content. 
        // e (order 1)
        // G (order 2)
        const texts = labels.map(l => l.textContent);
        expect(texts).toContain('e');
        expect(texts).toContain('G');
    });

    it('formats multi-digit indices correctly in LaTeX', () => {
        const group = createCn(2);
        const subgroups = group.getSubgroups();

        // Artificially modify a subgroup id to be 13 to test rendering
        const fakeSubgroups = Array(15).fill(subgroups[0]).map((s, i) => ({
            ...s,
            order: i + 1, // distinct orders to force layers
            elements: new Set(['e']),
            isNormal: true,
            name: '' // force H_id generation
        }));

        render(<SubgroupLattice group={group} subgroups={fakeSubgroups} />);

        const labels = screen.getAllByTestId('math-tex');
        // We expect H_{13}
        // index 13 should be H_{13}
        const h13 = labels.find(l => l.textContent === 'H_{13}');
        expect(h13).toBeInTheDocument();

        // Should NOT be H_13
        const badH13 = labels.find(l => l.textContent === 'H_13');
        expect(badH13).toBeUndefined();
    });
});
