
// src/pages/GroupPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { registry } from '../engine/registry';
import { MathTex } from '../components/MathTex';
import type { IGroup, Subgroup } from '../engine/types';
import { SubgroupLattice } from '../components/SubgroupLattice';
import { createQuotientGroup } from '../engine/quotients';
import { getElementColor } from '../utils/colors';
import { GlossaryLink } from '../components/GlossaryLink';

export const GroupPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [group, setGroup] = useState<IGroup | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setTimeout(() => {
            const g = registry.get(id);
            setGroup(g || null);
            setLoading(false);
        }, 10);
    }, [id]);

    if (loading) return <div className="container">Loading group properties...</div>;
    if (!group) return <div className="container">Group not found: {id}</div>;

    const props = group.getProperties();
    const table = group.getCayleyTable();
    const subgroups = group.getSubgroups();
    const classes = group.conjugacyClasses();
    const normalSubgroups = subgroups.filter(s => s.isNormal);

    const handleExploreQuotient = (sub: Subgroup, idx: number) => {
        const quoId = `${group.id}_quo_${idx}`;
        // Register if not exists (or overwrite)
        registry.register(quoId, () => createQuotientGroup(group, sub));
        navigate(`/group/${quoId}`);
    };

    return (
        <div className="container group-page-layout">
            <aside className="toc">
                <h3><MathTex tex={group.displayName} /></h3>
                <ul className="dense-list">
                    <li><a href="#facts">Quick facts</a></li>
                    <li><a href="#cayley">Cayley table</a></li>
                    <li><a href="#subgroups">Subgroups</a></li>
                    <li><a href="#quotients">Quotients</a></li>
                    <li><a href="#elements">Elements</a></li>
                </ul>
            </aside>

            <div className="content">
                <header style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '2rem' }}>
                    <h1 style={{ display: 'inline-block', marginRight: '1rem' }}>
                        <MathTex tex={group.displayName} />
                    </h1>
                    <span className="badge">Order {props.order}</span>
                    {props.isAbelian && <span className="badge">Abelian</span>}
                    {props.isCyclic && <span className="badge">Cyclic</span>}
                    {props.isSimple && <span className="badge">Simple</span>}
                </header>

                {/* ... */}

                <section id="facts" className="section">
                    <h2>Properties</h2>
                    <ul className="dense-list">
                        <li><strong><GlossaryLink termKey="order" capitalize>Order</GlossaryLink>:</strong> {props.order}</li>
                        <li><strong><GlossaryLink termKey="center" capitalize>Center</GlossaryLink>:</strong> Size {props.center?.length}</li>
                        <li><strong><GlossaryLink termKey="cyclic" capitalize>Cyclic</GlossaryLink>?</strong> {props.isCyclic ? 'Yes' : 'No'}</li>
                        <li><strong><GlossaryLink termKey="abelian" capitalize>Abelian</GlossaryLink>?</strong> {props.isAbelian ? 'Yes' : 'No'}</li>
                        <li><strong><GlossaryLink termKey="simple" capitalize>Simple</GlossaryLink>?</strong> {props.isSimple ? 'Yes' : 'No'}</li>
                        <li><strong><GlossaryLink termKey="conjugacy class" capitalize>Conjugacy classes</GlossaryLink>:</strong> {classes.length}</li>
                    </ul>
                </section>

                <section id="subgroups" className="section">
                    <h2>Subgroup lattice</h2>
                    <SubgroupLattice subgroups={subgroups} group={group} />
                </section>

                <section id="quotients" className="section">
                    <h2>Quotients</h2>
                    <p><GlossaryLink termKey="normal">Normal subgroups</GlossaryLink>: {normalSubgroups.length}</p>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                                <th>Subgroup</th>
                                <th>Order</th>
                                <th>Index (quotient order)</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {normalSubgroups.map((sub, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #eee', height: '2.5rem' }}>
                                    <td>
                                        {/* Identify generic name */}
                                        {sub.order === 1 ? '{e}' : (sub.order === props.order ? group.displayName : `H_${subgroups.indexOf(sub)}`)}
                                    </td>
                                    <td>{sub.order}</td>
                                    <td>{props.order / sub.order}</td>
                                    <td>
                                        <button
                                            onClick={() => handleExploreQuotient(sub, subgroups.indexOf(sub))}
                                            style={{ cursor: 'pointer', padding: '2px 8px' }}
                                        >
                                            Explore G/N
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <section id="cayley" className="section">
                    <h2>Cayley table</h2>
                    <p style={{ fontSize: '0.9rem', color: 'gray' }}>Colored by conjugacy class</p>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="cayley-table">
                            <thead>
                                <tr>
                                    <th><MathTex tex="\circ" /></th>
                                    {table.elements.map(e => (
                                        <th key={e} style={{ backgroundColor: '#f5f5f5' }}>
                                            <MathTex tex={group.elements.find(x => x.id === e)?.label || e} />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {table.elements.map(rowEnv => (
                                    <tr key={rowEnv}>
                                        <th style={{ backgroundColor: '#f5f5f5' }}>
                                            <MathTex tex={group.elements.find(x => x.id === rowEnv)?.label || rowEnv} />
                                        </th>
                                        {table.elements.map(colEnv => {
                                            const prod = table.table[rowEnv][colEnv];
                                            const color = getElementColor(prod, classes);
                                            return (
                                                <td key={colEnv} style={{ backgroundColor: color }}>
                                                    <MathTex tex={group.elements.find(x => x.id === prod)?.label || prod} />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section id="elements" className="section">
                    <h2>Elements</h2>
                    <div>
                        {group.elements.map(e => (
                            <span
                                key={e.id}
                                style={{
                                    marginRight: '0.5rem',
                                    marginBottom: '0.5rem',
                                    display: 'inline-block',
                                    padding: '4px 8px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: getElementColor(e.id, classes)
                                }}
                                title={`Order: ${e.order || '?'}`}
                            >
                                <MathTex tex={e.label} />
                            </span>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};
