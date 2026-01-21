
// src/pages/__tests__/Landing.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Landing } from '../Landing';
import { BrowserRouter } from 'react-router-dom';

// We need to wrap components in Router because of <Link> usage
const renderWithRouter = (ui: React.ReactElement) => {
    return render(
        <BrowserRouter>
            {ui}
        </BrowserRouter>
    );
};

describe('Landing Page UI', () => {
    it('renders the "Search groups..." input', () => {
        renderWithRouter(<Landing />);
        const input = screen.getByPlaceholderText('Search groups...');
        expect(input).toBeInTheDocument();
    });

    it('filters groups when searching by ID', async () => {
        renderWithRouter(<Landing />);
        const input = screen.getByPlaceholderText('Search groups...');

        // Initial state: check for Z_1 via Order (since KaTeX text is tricky)
        const order1 = screen.getAllByText('Order: 1');
        expect(order1.length).toBeGreaterThan(0);

        // Search for "S_3"
        fireEvent.change(input, { target: { value: 'S_3' } });

        // Should show S_3 (Order: 6)
        await waitFor(() => {
            const order6 = screen.getAllByText('Order: 6');
            expect(order6.length).toBeGreaterThan(0);

            // Z_1 should be gone
            const order1After = screen.queryByText('Order: 1');
            expect(order1After).not.toBeInTheDocument();
        });
    });

    it('filters by Abelian property', () => {
        renderWithRouter(<Landing />);

        // Find checkbox "Abelian"
        const abelianCheckbox = screen.getByLabelText('Abelian');
        fireEvent.click(abelianCheckbox);

        // Should show Z_2 (Abelian) 
        expect(screen.getAllByText('Order: 2').length).toBeGreaterThan(0);

        // Should NOT show any "Non-Abelian" cards.
        // The text "Non-Abelian" appears in the filter label, so we expect exactly 1 occurrence.
        const nonAbelianTexts = screen.getAllByText('Non-Abelian');
        expect(nonAbelianTexts).toHaveLength(1); // Only the label
    });

    it('clears filters', () => {
        renderWithRouter(<Landing />);
        const input = screen.getByPlaceholderText('Search groups...');
        fireEvent.change(input, { target: { value: 'NonExistentGroup' } });

        // Should show nothing
        expect(screen.queryByText('Order: 1')).not.toBeInTheDocument();

        const clearBtn = screen.getByText('Clear');
        fireEvent.click(clearBtn);

        // Should show everything again
        expect(screen.getByText('Order: 1')).toBeInTheDocument();
        expect(input).toHaveValue('');
    });
});
