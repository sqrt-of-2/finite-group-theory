
// src/pages/GlossaryPage.tsx
import React, { useEffect } from 'react';
import { glossaryTerms } from '../data/glossary';
import { useLocation } from 'react-router-dom';

export const GlossaryPage: React.FC = () => {
    const { hash } = useLocation();

    useEffect(() => {
        if (hash) {
            const id = hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [hash]);

    const sortedTerms = Object.keys(glossaryTerms).sort();

    return (
        <div className="container">
            <h1>Glossary</h1>
            <dl className="dense-list">
                {sortedTerms.map(key => {
                    const item = glossaryTerms[key];
                    return (
                        <div key={key} id={key} style={{ padding: '1rem 0', borderBottom: '1px solid #eee' }}>
                            <dt style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                                {item.term}
                            </dt>
                            <dd style={{ margin: 0 }}>
                                <p style={{ margin: '0 0 0.5rem 0' }}>{item.definition}</p>
                                {item.example && (
                                    <p style={{ margin: 0, fontStyle: 'italic', color: '#666' }}>
                                        Example: {item.example}
                                    </p>
                                )}
                            </dd>
                        </div>
                    );
                })}
            </dl>
        </div>
    );
};
