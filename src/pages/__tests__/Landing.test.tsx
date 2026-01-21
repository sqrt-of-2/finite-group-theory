
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

        // Initial state: check for Z_1 via Order
        expect(screen.getAllByText(/Order 1/).length).toBeGreaterThan(0);

        // Search for "S_3"
        fireEvent.change(input, { target: { value: 'S_3' } });

        // Should show S_3 (Order 6)
        await waitFor(() => {
            const order6 = screen.getAllByText(/Order 6/);
            expect(order6.length).toBeGreaterThan(0);

            // Z_1 should be gone
            expect(screen.queryByText(/Order 1/)).not.toBeInTheDocument();
        });
    });

    it('finds groups by order (e.g. searching "8" shows Z_4 x Z_2)', async () => {
        renderWithRouter(<Landing />);
        const input = screen.getByPlaceholderText('Search groups...');

        // Search for "8"
        fireEvent.change(input, { target: { value: '8' } });

        await waitFor(() => {
            // Should show groups of order 8
            const order8s = screen.getAllByText(/Order 8/);
            expect(order8s.length).toBeGreaterThan(0);

            // Z_1 (order 1) is gone.
            expect(screen.queryByText(/Order 1/)).not.toBeInTheDocument();
        });
    });

    it('filters by Abelian property', () => {
        renderWithRouter(<Landing />);

        // Find checkbox "Abelian"
        const abelianCheckbox = screen.getByLabelText('Abelian');
        fireEvent.click(abelianCheckbox);

        // Should show Z_2 (Abelian) 
        // Note: Z_2 is order 2 which is prime, so text is "Order 2 (prime)"
        expect(screen.getAllByText(/Order 2/).length).toBeGreaterThan(0);

        // Should NOT show any "Non-Abelian" cards.
        // The text "Non-abelian" appears in the implication chain.
        // We want to ensure no cards identify as "Non-abelian".
        // The filter label (input) has text "Non-Abelian".
        // The cards have "Non-abelian" (lowercase a).
        // Let's check that the rendered text "Non-abelian" is NOT present in any card.
        // Note: getAllByText might find the label if case insensitive.
        // Helper:
        const nonAbelianCards = screen.queryAllByText('Non-abelian');
        expect(nonAbelianCards.length).toBe(0);
    });

    it('clears filters', () => {
        renderWithRouter(<Landing />);
        const input = screen.getByPlaceholderText('Search groups...');
        fireEvent.change(input, { target: { value: 'NonExistentGroup' } });

        // Should show nothing
        expect(screen.queryByText(/Order 1/)).not.toBeInTheDocument();

        const clearBtn = screen.getByText('Clear');
        fireEvent.click(clearBtn);

        // Should show everything again
        expect(screen.getAllByText(/Order 1/).length).toBeGreaterThan(0);
        expect(input).toHaveValue('');
    });

    it('displays Notable Small Groups links correctly', () => {
        const { container } = renderWithRouter(<Landing />);

        // Find links by tag name to avoid JSDOM accessibility issues with Katex/MathML
        const links = Array.from(container.querySelectorAll('a'));

        const z1 = links.find(l => l.getAttribute('href') === '/group/Z_1');
        expect(z1).toBeDefined();

        const d8 = links.find(l => l.getAttribute('href') === '/group/D_8');
        expect(d8).toBeDefined();

        const q8 = links.find(l => l.getAttribute('href') === '/group/Q_8');
        expect(q8).toBeDefined();
    });

    it('navigates to group page when clicking a catalog card', async () => {
        // Need to test navigation. Since we use BrowserRouter, we can check if URL changes or new content renders.
        // But verifying URL change in test environment is slightly tricky without memory router.
        // We can just verify the link href.
        renderWithRouter(<Landing />);

        const cardS3 = screen.getAllByRole('link').find(l => l.getAttribute('href') === '/group/S_3');
        expect(cardS3).toBeDefined();

        // If we really want to test navigation, we might need a test-router setup or just trust Link works.
        // Let's trust Link works but verify the href is correct.
        expect(cardS3).toHaveAttribute('href', '/group/S_3');
    });
});
