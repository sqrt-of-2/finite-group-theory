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

        expect(screen.getAllByText('Quick facts').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Cayley table').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Subgroup lattice').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Quotients').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Elements').length).toBeGreaterThan(0);
    });

    it('renders Quotients table with LaTeX subgroup names', async () => {
        renderGroupPage();
        await waitFor(() => expect(screen.queryByText(/Loading/)).not.toBeInTheDocument());

        const headings = screen.getAllByRole('heading', { level: 2 });
        const quotientsHeader = headings.find(h => h.textContent === 'Quotients');
        expect(quotientsHeader).toBeInTheDocument();

        const quotientsSection = quotientsHeader!.closest('section');
        expect(quotientsSection).toBeInTheDocument();

        const mathElems = within(quotientsSection!).getAllByTestId('math-tex');
        const contents = mathElems.map(e => e.textContent);

        expect(contents).toContain('\\{e\\}');
        expect(contents).toContain('Z_{2}');
    });

    it('renders Explore buttons with specific group/subgroup names', async () => {
        renderGroupPage();
        await waitFor(() => expect(screen.queryByText(/Loading/)).not.toBeInTheDocument());

        const headings = screen.getAllByRole('heading', { level: 2 });
        const quotientsHeader = headings.find(h => h.textContent === 'Quotients');
        const quotientsSection = quotientsHeader!.closest('section');

        // Find buttons in quotients section
        const buttons = within(quotientsSection!).getAllByRole('button');

        // Z_2 quotients: 
        // 1. Z_2 / {e}  -> Explore Z_{2} / \{e\}
        // 2. Z_2 / Z_2  -> Explore Z_{2} / Z_{2}

        // We look for MathTex inside buttons
        const buttonMath = buttons.map(b => within(b).getByTestId('math-tex').textContent);

        expect(buttonMath).toContain('Z_{2} / \\{e\\}');
        expect(buttonMath).toContain('Z_{2} / Z_{2}');
    });

    it('displays Quotients table headers correctly', async () => {
        renderGroupPage();
        await waitFor(() => expect(screen.queryByText(/Loading/)).not.toBeInTheDocument());

        expect(screen.getByText('Index (quotient order)')).toBeInTheDocument();
    });

    it('renders sidebar title with MathTex', async () => {
        renderGroupPage();
        await waitFor(() => expect(screen.queryByText(/Loading/)).not.toBeInTheDocument());
        const math = screen.getAllByTestId('math-tex');
        const z2 = math.filter(m => m.textContent === 'Z_{2}');
        expect(z2.length).toBeGreaterThan(1);
    });
});
