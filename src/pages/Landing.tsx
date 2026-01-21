
// src/pages/Landing.tsx
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MathTex } from '../components/MathTex';
import { registry } from '../engine/registry';

// Need to access group properties for filtering.
// We might need to "peek" at properties without fully computing everything if possible,
// but for small groups we can just load them.

export const Landing: React.FC = () => {
    const fullCatalogIds = registry.getCatalog();

    // Load all groups to filter (small scale ok)
    // In real app, we might have metadata separate from full load
    // For now we assume registry.get() is fast enough or cached.
    const allGroups = useMemo(() => {
        return fullCatalogIds.map(g => {
            const group = registry.get(g.id);
            if (!group) return null;
            return {
                id: group.id,
                name: group.displayName,
                props: group.getProperties(),
                // could add more search terms
            };
        }).filter(Boolean) as any[]; // TODO: proper type
    }, []);

    const [search, setSearch] = useState('');
    const [filterAbelian, setFilterAbelian] = useState<boolean | null>(null);
    const [filterCyclic, setFilterCyclic] = useState<boolean | null>(null);
    const [filterSimple, setFilterSimple] = useState<boolean | null>(null);

    const filtered = allGroups.filter(g => {
        const searchLower = search.toLowerCase();
        if (search) {
            const matchesName = g.name.toLowerCase().includes(searchLower);
            const matchesId = g.id.toLowerCase().includes(searchLower);
            const matchesOrder = g.props.order.toString().includes(searchLower);

            if (!matchesName && !matchesId && !matchesOrder) return false;
        }
        if (filterAbelian !== null && g.props.isAbelian !== filterAbelian) return false;
        if (filterCyclic !== null && g.props.isCyclic !== filterCyclic) return false;
        if (filterSimple !== null && g.props.isSimple !== filterSimple) return false;
        return true;
    });

    // Hardcoded list from requirements
    const notableGroups = [
        { id: 'Z_1', desc: 'The smallest group (order 1)', tex: 'Z_1' },
        { id: 'Z_2', desc: 'The smallest non-trivial group (order 2)', tex: 'Z_2' },
        { id: 'Z_2_x_Z_2', desc: 'The smallest non-cyclic group (order 4)', tex: 'Z_2 \\times Z_2' },
        { id: 'S_3', desc: 'The smallest non-abelian group (order 6)', tex: 'S_3' },
        { id: 'D_8', desc: 'The smallest non-abelian p-groups (order 8)', tex: 'D_8, Q_8' },
        { id: 'A_4', desc: 'The smallest group where the converse of Lagrange fails (order 12)', tex: 'A_4' },
        { id: 'A_5', desc: 'The smallest non-abelian simple group (order 60)', tex: 'A_5' }
    ];

    return (
        <div className="container">
            <section style={{ margin: '2rem 0' }}>
                <h2>Notable small groups</h2>
                <ul className="dense-list">
                    {notableGroups.map(item => (
                        <li key={item.id}>
                            <Link to={`/group/${item.id}`}>
                                <span>The smallest ... is </span>
                                <MathTex tex={item.tex} />
                            </Link>
                            <span style={{ marginLeft: '1rem', color: '#666' }}>
                                ({item.desc})
                            </span>
                        </li>
                    ))}
                </ul>
            </section>

            <section style={{ margin: '2rem 0' }}>
                <h3>Explore & Filter</h3>
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search groups..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />

                    <label><input type="checkbox" checked={filterAbelian === true} onChange={() => setFilterAbelian(prev => prev === true ? null : true)} /> Abelian</label>
                    <label><input type="checkbox" checked={filterAbelian === false} onChange={() => setFilterAbelian(prev => prev === false ? null : false)} /> Non-Abelian</label>

                    <label><input type="checkbox" checked={filterCyclic === true} onChange={() => setFilterCyclic(prev => prev === true ? null : true)} /> Cyclic</label>
                    <label><input type="checkbox" checked={filterSimple === true} onChange={() => setFilterSimple(prev => prev === true ? null : true)} /> Simple</label>

                    <button onClick={() => { setSearch(''); setFilterAbelian(null); setFilterCyclic(null); setFilterSimple(null); }} style={{ cursor: 'pointer' }}>
                        Clear
                    </button>
                </div>

                <div className="group-catalog">
                    {filtered.map(g => (
                        <Link key={g.id} to={`/group/${g.id}`} className="card" style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                <MathTex tex={g.name} />
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                                <div>Order: {g.props.order}</div>
                                <div>{g.props.isAbelian ? 'Abelian' : 'Non-Abelian'}</div>
                                {g.props.isSimple && <div style={{ color: 'green' }}>Simple</div>}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};
