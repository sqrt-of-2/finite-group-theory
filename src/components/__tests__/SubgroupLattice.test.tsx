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

        // Should find "{e}" or subgroup representation
        const labels = screen.getAllByTestId('math-tex');
        expect(labels.length).toBeGreaterThan(0);
        // Expect '\{e\}'. Note Z_1 displayName is Z_{1}.
        // For Z_1, order 1 is groupOrder. 
        // Logic: node.order === 1 condition is first.
        // So it should render \{e\} primarily?
        // Wait, node.order === 1 ? '\{e\}' : (node.order === groupOrder ? ...
        // If order === 1, it renders \{e\}.
        // Does Z_1 have a "G" node?
        // Z_1 has only 1 subgroup: order 1.
        // So it hits order===1 branch first.
        // Thus it renders \{e\}.
        const texts = labels.map(l => l.textContent);
        expect(texts).toContain('\\{e\\}');
    });

    it('renders correct labels for subgroups', () => {
        const group = createCn(2); // Z_2 -> {e}, {e, a}
        const subgroups = group.getSubgroups();

        render(<SubgroupLattice group={group} subgroups={subgroups} />);

        const labels = screen.getAllByTestId('math-tex');
        // We expect matching content. 
        // \{e\} (order 1)
        // G = Z_{2} (order 2)
        const texts = labels.map(l => l.textContent);
        expect(texts).toContain('\\{e\\}');
        expect(texts).toContain('G = Z_{2}');
    });

    it('formats multi-digit indices correctly in LaTeX', () => {
        const group = createCn(2);
        const subgroups = group.getSubgroups();

        const fakeSubgroups = Array(15).fill(subgroups[0]).map((s, i) => ({
            ...s,
            order: i + 1, // distinct orders to force layers except 1
            elements: new Set(['e']),
            isNormal: true,
            name: ''
        }));

        // Fix fake logic to not trigger order=1 for index 13 (order 14)
        // order 1 is index 0.

        render(<SubgroupLattice group={group} subgroups={fakeSubgroups} />);

        const labels = screen.getAllByTestId('math-tex');
        // index 13 is order 14. 
        // It is not 1, not groupOrder (2).
        // So H_{13}.
        const h13 = labels.find(l => l.textContent === 'H_{13}');
        expect(h13).toBeInTheDocument();
    });
});
