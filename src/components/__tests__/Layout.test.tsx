import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Layout } from '../Layout';
import { MemoryRouter } from 'react-router-dom';
import { registry } from '../../engine/registry';
import { createCn } from '../../engine/factory';

// Mock MathTex
vi.mock('../MathTex', () => ({
    MathTex: ({ tex }: { tex: string }) => <span data-testid="math-tex">{tex}</span>
}));

const renderLayout = (path: string) => {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Layout />
        </MemoryRouter>
    );
};

describe('Layout Breadcrumbs', () => {
    beforeEach(() => {
        // Register some dummy groups
        registry.register('Z_2', () => createCn(2));
        registry.register('G_Custom', () => {
            const g = createCn(3);
            g.displayName = 'MyGroup_{3}';
            return g;
        });
    });

    it('renders simple text for non-math paths', () => {
        renderLayout('/glossary');
        // Home > Glossary
        expect(screen.getByText('Glossary')).toBeInTheDocument();
        expect(screen.queryByTestId('math-tex')).not.toBeInTheDocument();
    });

    it('renders Home link', () => {
        renderLayout('/anywhere');
        expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('renders LaTeX for known group IDs', () => {
        // Path /group/Z_2
        renderLayout('/group/Z_2');

        // Should find "Z_{2}" in MathTex because we registered it
        const math = screen.getAllByTestId('math-tex');
        // Might match "group" if it thinks it's math? No.
        // "group" does not contain _, ^, numbers.
        // Z_2 contains numbers and _. 
        // Registry lookup returns Z_{2} display name.

        expect(math.some(m => m.textContent === 'Z_{2}')).toBe(true);
    });

    it('renders LaTeX for raw strings that look like math even if not in registry', () => {
        // Path /something/H_1
        renderLayout('/something/H_1');

        // H_1 is not in registry.
        // But logic checks for _, ^, numbers.
        // content should be H_1 rendered via math-tex
        const math = screen.getAllByTestId('math-tex');
        expect(math.some(m => m.textContent === 'H_1')).toBe(true);
    });
});
