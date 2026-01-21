
// src/components/Layout.tsx
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

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
                        Notable Small Groups
                    </Link>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/groups">Catalog</Link>
                        <Link to="/glossary">Glossary</Link>
                        {/* Simple link to compare for now, ideally user selects groups first. 
                            We can link to a default compare like Z2 vs Z3? or empty. */}
                        <Link to="/compare?g=Z_2&h=Z_3">Compare</Link>
                    </div>
                </div>
            </nav>

            <div className="container" style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                {parts.length > 0 && <Link to="/">Home</Link>}
                {parts.map((p, i) => (
                    <span key={i}> &gt; <span style={{ textTransform: 'capitalize' }}>{p}</span></span>
                ))}
            </div>

            <main>
                <Outlet />
            </main>
        </div>
    );
};
