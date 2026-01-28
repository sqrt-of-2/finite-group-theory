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

    it('renders all sections with correct capitalization', async () => {
        renderGroupPage();
        await waitFor(() => expect(screen.queryByText(/Loading/)).not.toBeInTheDocument());

        // Use regex for case sensitive check or exact strings
        // "Quotients" appears multiple times, so getAllByText
        expect(screen.getAllByText('Quick facts').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Cayley table').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Subgroup lattice').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Quotients').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Elements').length).toBeGreaterThan(0);
    });

    it('renders Quotients table with LaTeX subgroup names', async () => {
        renderGroupPage();
        await waitFor(() => expect(screen.queryByText(/Loading/)).not.toBeInTheDocument());

        // "Quotients" appears in TOC and Header. Find the one that matches H2
        const headings = screen.getAllByRole('heading', { level: 2 });
        const quotientsHeader = headings.find(h => h.textContent === 'Quotients');
        expect(quotientsHeader).toBeInTheDocument();

        const quotientsSection = quotientsHeader!.closest('section');
        expect(quotientsSection).toBeInTheDocument();

        // Within quotients table, check for MathTex elements
        // Z_2 row: {e} -> index 2, Z_2 -> index 1
        const mathElems = within(quotientsSection!).getAllByTestId('math-tex');
        const contents = mathElems.map(e => e.textContent);

        expect(contents).toContain('\\{e\\}');
        expect(contents).toContain('Z_{2}');
    });

    it('displays Quotients table headers correctly', async () => {
        renderGroupPage();
        await waitFor(() => expect(screen.queryByText(/Loading/)).not.toBeInTheDocument());

        expect(screen.getByText('Index (quotient order)')).toBeInTheDocument();
    });

    it('renders sidebar title with MathTex', async () => {
        renderGroupPage();
        await waitFor(() => expect(screen.queryByText(/Loading/)).not.toBeInTheDocument());

        // Check for Z_{2} in sidebar
        // There are multiple Z_{2}: H1, Sidebar, Quotients, etc.
        const math = screen.getAllByTestId('math-tex');
        const z2 = math.filter(m => m.textContent === 'Z_{2}');
        expect(z2.length).toBeGreaterThan(1);
    });
});
