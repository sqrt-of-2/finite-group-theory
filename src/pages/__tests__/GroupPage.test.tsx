import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroupPage } from '../GroupPage';
import { createCn } from '../../engine/factory';
import { registry } from '../../engine/registry';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock specific components to simplify test
vi.mock('../../components/MathTex', () => ({
    MathTex: ({ tex }: { tex: string }) => <span data-testid="math-tex">{tex}</span>
}));

// Mock SubgroupLattice to avoid complex rendering in page test
vi.mock('../../components/SubgroupLattice', () => ({
    SubgroupLattice: () => <div data-testid="subgroup-lattice">Lattice</div>
}));

describe('GroupPage', () => {
    beforeEach(() => {
        // Register a test group
        registry.register('Z_2', () => createCn(2));
    });

    const renderGroupPage = (id: string) => {
        return render(
            <MemoryRouter initialEntries={[`/group/${id}`]}>
                <Routes>
                    <Route path="/group/:id" element={<GroupPage />} />
                </Routes>
            </MemoryRouter>
        );
    };

    it('renders Standardized Capitalization headers', async () => {
        renderGroupPage('Z_2');

        // Wait for loading to finish
        await waitFor(() => expect(screen.queryByText(/Loading/)).not.toBeInTheDocument());

        // Check headers
        expect(screen.getByText('Quick facts')).toBeInTheDocument();

        // Cayley table is present as link text AND header text, so getAllByText
        expect(screen.getAllByText('Cayley table').length).toBeGreaterThan(0);

        // Subgroup lattice, Quotients, Elements are also in TOC and Header
        expect(screen.getAllByText('Subgroup lattice').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Quotients').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Elements').length).toBeGreaterThan(0);
    });

    it('renders Cayley table with standard capitalization and symbol', async () => {
        renderGroupPage('Z_2');
        await waitFor(() => expect(screen.queryByText(/Loading/)).not.toBeInTheDocument());

        // Check for \circ symbol in MathTex
        const mathTexs = screen.getAllByTestId('math-tex');
        const circ = mathTexs.find(el => el.textContent === '\\circ');
        expect(circ).toBeInTheDocument();

        expect(screen.getAllByText('Cayley table').length).toBeGreaterThan(0);
    });

    it('renders Quotients table headers correctly', async () => {
        renderGroupPage('Z_2');
        await waitFor(() => expect(screen.queryByText(/Loading/)).not.toBeInTheDocument());

        // "Index (quotient order)"
        expect(screen.getByText('Index (quotient order)')).toBeInTheDocument();
    });

    it('renders sidebar title with MathTex', async () => {
        renderGroupPage('Z_2');
        await waitFor(() => expect(screen.queryByText(/Loading/)).not.toBeInTheDocument());

        // Sidebar title: Z_{2} (rendered via MathTex due to displayName having brackets)
        const mathTexs = screen.getAllByTestId('math-tex');
        // Both headers use MathTex
        const z2Labels = mathTexs.filter(el => el.textContent === 'Z_{2}');
        expect(z2Labels.length).toBeGreaterThanOrEqual(1);
    });
});
