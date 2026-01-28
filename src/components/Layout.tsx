
// src/components/Layout.tsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { MathTex } from './MathTex';

export const Layout: React.FC = () => {
    const location = useLocation();

    // Breadcrumb logic (simple for now)
    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);

    return (
        <div>
            <nav className="container navbar">
                <div className="navbar-content">
                    <Link to="/" className="brand">
                        Notable small groups
                    </Link>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/groups">Catalog</Link>
                        <Link to="/glossary">Glossary</Link>

                    </div>
                </div>
            </nav>

            <div className="container" style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                {parts.length > 0 && <Link to="/">Home</Link>}
                {parts.map((p, i) => {
                    const isMath = p.includes('_') || p.includes('^') || p.match(/[0-9]/);
                    return (
                        <span key={i}> &gt; <span style={{ textTransform: 'capitalize' }}>
                            {isMath ? <MathTex tex={p} inline /> : p}
                        </span></span>
                    );
                })}
            </div>

            <main>
                <Outlet />
            </main>
        </div>
    );
};
