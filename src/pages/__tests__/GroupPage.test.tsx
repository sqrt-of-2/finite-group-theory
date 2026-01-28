import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroupPage } from '../GroupPage';
import { createCn } from '../../engine/factory';
import { registry } from '../../engine/registry';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock components
vi.mock('../../components/MathTex', () => ({
    MathTex: ({ tex }: { tex: string }) => <span data-testid="math-tex">{tex}</span>
}));

vi.mock('../../components/SubgroupLattice', () => ({
    SubgroupLattice: () => <div data-testid="subgroup-lattice">Lattice</div>
}));

describe('GroupPage', () => {
    beforeEach(() => {
        // Essential for isomorphism lookup
        registry.register('Z_1', () => createCn(1));
        registry.register('Z_2', () => createCn(2));
    });

    const renderGroupPage = (id: string = 'Z_2') => {
        return render(
            <MemoryRouter initialEntries={[`/group/${id}`]}>
                <Routes>
                    <Route path="/group/:id" element={<GroupPage />} />
                </Routes>
            </MemoryRouter>
        );
    };

    // ... Check previous tests still pass or adapt them ...

    it('renders Explore buttons with order and isomorphism info', async () => {
        renderGroupPage('Z_2');
        await waitFor(() => expect(screen.queryByText(/Loading/)).not.toBeInTheDocument());

        const headings = screen.getAllByRole('heading', { level: 2 });
        const quotientsHeader = headings.find(h => h.textContent === 'Quotients');
        const quotientsSection = quotientsHeader!.closest('section');

        const buttons = within(quotientsSection!).getAllByRole('button');

        // Z_2 / {e}  -> Order 2 (iso Z_2)
        // Z_2 / Z_2  -> Order 1 (iso Z_1)

        // Button text is complex: "Explore ", MathTex, " of order ", number, " (isomorphic to ", MathTex, ")"
        // We can check text content roughly.
        // MathTex mock renders tex in span.

        const buttonTexts = buttons.map(b => b.textContent);

        // 1. Explore Z_{2} / \{e\} of order 2 (isomorphic to Z_{2})
        // 2. Explore Z_{2} / Z_{2} of order 1 (isomorphic to Z_{1})

        expect(buttonTexts.some(t => t?.includes('of order 2') && t?.includes('isomorphic to'))).toBe(true);
        expect(buttonTexts.some(t => t?.includes('of order 1') && t?.includes('isomorphic to'))).toBe(true);

        // Check for math tex names inside
        const buttonMath = buttons.map(b => within(b).getAllByTestId('math-tex').map(m => m.textContent));

        // One button should contain Z_2 (iso target)
        // Note: Z_2/ {e} is isomorphic to Z_2. So valid match.
        // Z_2/Z_2 is isomorphic to Z_1.

        expect(buttonMath.flat()).toContain('Z_{1}');
        expect(buttonMath.flat()).toContain('Z_{2}');
    });

});
