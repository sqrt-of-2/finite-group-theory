
// src/pages/ComparePage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { registry } from '../engine/registry';
import { MathTex } from '../components/MathTex';
import type { IGroup } from '../engine/types';

export const ComparePage: React.FC = () => {
    const { search } = useLocation();
    const query = new URLSearchParams(search);
    const gId = query.get('g');
    const hId = query.get('h');

    const [group1, setGroup1] = useState<IGroup | null>(null);
    const [group2, setGroup2] = useState<IGroup | null>(null);

    useEffect(() => {
        if (gId) setGroup1(registry.get(gId) || null);
        if (hId) setGroup2(registry.get(hId) || null);
    }, [gId, hId]);

    if (!group1 || !group2) return <div className="container">Select groups to compare.</div>;

    const p1 = group1.getProperties();
    const p2 = group2.getProperties();

    const rows = [
        { label: 'Name', v1: <MathTex tex={group1.displayName} />, v2: <MathTex tex={group2.displayName} /> },
        { label: 'Order', v1: p1.order, v2: p2.order },
        { label: 'Abelian?', v1: p1.isAbelian ? 'Yes' : 'No', v2: p2.isAbelian ? 'Yes' : 'No' },
        { label: 'Cyclic?', v1: p1.isCyclic ? 'Yes' : 'No', v2: p2.isCyclic ? 'Yes' : 'No' },
        { label: 'Simple?', v1: p1.isSimple ? 'Yes' : 'No', v2: p2.isSimple ? 'Yes' : 'No' },
        { label: 'Center Size', v1: p1.center?.length, v2: p2.center?.length },
        { label: 'Min Generators', v1: p1.minGenerators || '?', v2: p2.minGenerators || '?' },
        { label: 'Conjugacy Classes', v1: group1.conjugacyClasses().length, v2: group2.conjugacyClasses().length },
        { label: 'Normal Subgroups', v1: group1.getSubgroups().filter(s => s.isNormal).length, v2: group2.getSubgroups().filter(s => s.isNormal).length }
    ];

    return (
        <div className="container">
            <h1>Compare Groups</h1>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left', borderBottom: '2px solid #ccc', padding: '8px' }}>Property</th>
                        <th style={{ textAlign: 'left', borderBottom: '2px solid #ccc', padding: '8px' }}><MathTex tex={group1.displayName} /></th>
                        <th style={{ textAlign: 'left', borderBottom: '2px solid #ccc', padding: '8px' }}><MathTex tex={group2.displayName} /></th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px', fontWeight: 'bold' }}>{row.label}</td>
                            <td style={{ padding: '8px', background: row.v1 === row.v2 ? 'inherit' : '#fafafa' }}>{row.v1}</td>
                            <td style={{ padding: '8px', background: row.v1 === row.v2 ? 'inherit' : '#fafafa' }}>{row.v2}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
