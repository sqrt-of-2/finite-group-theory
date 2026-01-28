
// src/components/Layout.tsx
import React from 'react';
import { Link, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { registry } from '../engine/registry';

import { MathTex } from './MathTex';

export const Layout: React.FC = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const groupId = searchParams.get('group');
    const page = searchParams.get('page');

    // Breadcrumb logic
    let breadcrumbs: Array<{ label: string | React.ReactNode; to: string }> = [];

    // Always start with Home

    if (groupId) {
        // Recursive chain logic
        if (groupId.includes('_quo_')) {
            const parts = groupId.split('_quo_');
            let currentId = parts[0];
            const baseGroup = registry.get(currentId);
            breadcrumbs.push({ label: baseGroup ? <MathTex tex={baseGroup.displayName} inline /> : currentId, to: `/?group=${currentId}` });

            let accumulatedId = currentId;
            for (let i = 1; i < parts.length; i++) {
                accumulatedId += `_quo_${parts[i]}`;
                const g = registry.get(accumulatedId);
                const l = g ? <MathTex tex={g.displayName} inline /> : parts[i];
                breadcrumbs.push({ label: l, to: `/?group=${accumulatedId}` });
            }
        } else {
            const group = registry.get(groupId);
            const label = group ? <MathTex tex={group.displayName} inline /> : groupId;
            breadcrumbs.push({ label, to: `/?group=${groupId}` });
        }

    } else if (page === 'glossary') {
        breadcrumbs.push({ label: 'Glossary', to: '/?page=glossary' });
    } else if (page === 'catalog' || location.pathname === '/groups') { // legacy fix
        breadcrumbs.push({ label: 'Catalog', to: '/?page=catalog' });
    }

    return (
        <div>
            <nav className="container navbar">
                <div className="navbar-content">
                    <Link to="/" className="brand">
                        Notable small groups
                    </Link>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/?page=catalog">Catalog</Link>
                        <Link to="/?page=glossary">Glossary</Link>
                    </div>
                </div>
            </nav>

            <div className="container" style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                <Link to="/">Home</Link>
                {breadcrumbs.map((b, i) => (
                    <span key={i}>
                        {' > '}
                        {i === breadcrumbs.length - 1 ? (
                            <span style={{ color: '#333' }}>{b.label}</span>
                        ) : (
                            <Link to={b.to}>{b.label}</Link>
                        )}
                    </span>
                ))}
            </div>

            <main>
                <Outlet />
            </main>
        </div>
    );
};
