
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
    const [filterPrime, setFilterPrime] = useState<boolean | null>(null);

    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59];

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
        if (filterPrime !== null) {
            const isPrime = primes.includes(g.props.order);
            if (isPrime !== filterPrime) return false;
        }
        return true;
    });

    // Hardcoded list from requirements
    const notableGroups = [
        { id: 'Z_1', prefix: 'The smallest group', suffix: '(order 1)', tex: 'Z_1' },
        { id: 'Z_2', prefix: 'The smallest non-trivial group', suffix: '(order 2)', tex: 'Z_2' },
        { id: 'Z_2_x_Z_2', prefix: 'The smallest non-cyclic group', suffix: '(order 4)', tex: 'Z_2 \\times Z_2' },
        { id: 'S_3', prefix: 'The smallest non-abelian group', suffix: '(order 6)', tex: 'S_3' },
        { id: 'D_8', prefix: 'The smallest non-abelian p-groups', suffix: '(order 8)', tex: 'D_8', secondTex: 'Q_8' }, // Special handling for D8/Q8
        { id: 'A_4', prefix: 'The smallest group where the converse of Lagrange fails', suffix: '(order 12)', tex: 'A_4' },
        { id: 'A_5', prefix: 'The smallest non-abelian simple group', suffix: '(order 60)', tex: 'A_5' }
    ];

    return (
        <div className="container">
            {/* ... notableGroups section ... */}
            <section style={{ margin: '2rem 0' }}>
                <ul className="dense-list">
                    {notableGroups.map((item: any) => (
                        <li key={item.id} style={{ marginBottom: '0.5rem' }}>
                            <span>{item.prefix} {item.plural || item.secondTex ? 'are' : 'is'} </span>
                            <Link to={`/group/${item.id}`}>
                                <MathTex tex={item.tex} />
                            </Link>
                            {item.secondTex && (
                                <>
                                    <span> and </span>
                                    {/* Q8 link logic: hardcoded or inferred? Hardcoded for now. */}
                                    <Link to={`/group/Q_8`}>
                                        <MathTex tex={item.secondTex} />
                                    </Link>
                                </>
                            )}
                            <span> {item.suffix}.</span>
                        </li>
                    ))}
                </ul>
            </section>

            <section style={{ margin: '2rem 0' }}>

                <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search groups..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />

                    {/* Filter Ordering: Prime, Cyclic, Non-cyclic, Abelian, Non-abelian, Simple */}
                    <label><input type="checkbox" checked={filterPrime === true} onChange={() => setFilterPrime(prev => prev === true ? null : true)} /> Prime order</label>

                    <label><input type="checkbox" checked={filterCyclic === true} onChange={() => setFilterCyclic(prev => prev === true ? null : true)} /> Cyclic</label>
                    <label><input type="checkbox" checked={filterCyclic === false} onChange={() => setFilterCyclic(prev => prev === false ? null : false)} /> Non-cyclic</label>

                    <label><input type="checkbox" checked={filterAbelian === true} onChange={() => setFilterAbelian(prev => prev === true ? null : true)} /> Abelian</label>
                    <label><input type="checkbox" checked={filterAbelian === false} onChange={() => setFilterAbelian(prev => prev === false ? null : false)} /> Non-abelian</label>

                    <label><input type="checkbox" checked={filterSimple === true} onChange={() => setFilterSimple(prev => prev === true ? null : true)} /> Simple</label>

                    <button onClick={() => { setSearch(''); setFilterAbelian(null); setFilterCyclic(null); setFilterSimple(null); setFilterPrime(null); }} style={{ cursor: 'pointer' }}>
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
                                <div>
                                    Order {g.props.order}
                                </div>
                                <div style={{ fontSize: '0.8rem', fontStyle: 'italic', marginTop: '0.2rem' }}>
                                    {(() => {
                                        const isPrime = primes.includes(g.props.order);
                                        if (isPrime) return "Prime order ⇒ cyclic ⇒ abelian";
                                        if (g.props.isCyclic) return "Cyclic ⇒ abelian";
                                        if (g.props.isAbelian) return "Abelian";
                                        return "Non-abelian";
                                    })()}
                                </div>
                                {g.props.isSimple && !(primes.includes(g.props.order)) && (
                                    <div style={{ color: 'green', marginTop: '0.2rem' }}>Simple</div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};
