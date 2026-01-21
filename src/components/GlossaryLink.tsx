
// src/components/GlossaryLink.tsx
import React, { useState } from 'react';
import { glossaryTerms } from '../data/glossary';
import { Link } from 'react-router-dom';

interface GlossaryLinkProps {
    termKey: string;
    children?: React.ReactNode;
    capitalize?: boolean;
}

export const GlossaryLink: React.FC<GlossaryLinkProps> = ({ termKey, children, capitalize }) => {
    const entry = glossaryTerms[termKey.toLowerCase()];
    const [showTooltip, setShowTooltip] = useState(false);

    if (!entry) {
        // Fallback if term not found
        return <span>{children || termKey}</span>;
    }

    const displayText = children || (capitalize ? entry.term : entry.term.toLowerCase());

    return (
        <span
            style={{ position: 'relative', display: 'inline-block', borderBottom: '1px dotted #666', cursor: 'help' }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <Link to={`/glossary#${termKey}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {displayText}
            </Link>

            {showTooltip && (
                <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#333',
                    color: '#fff',
                    padding: '8px',
                    borderRadius: '4px',
                    width: '250px',
                    zIndex: 1000,
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    marginBottom: '8px'
                }}>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>{entry.term}</strong>
                    {entry.definition}
                    {entry.example && (
                        <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#ccc', fontStyle: 'italic' }}>
                            Ex: {entry.example}
                        </div>
                    )}
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        marginLeft: '-5px',
                        borderWidth: '5px',
                        borderStyle: 'solid',
                        borderColor: '#333 transparent transparent transparent'
                    }} />
                </div>
            )}
        </span>
    );
};
