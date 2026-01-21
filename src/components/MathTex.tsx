
// src/components/MathTex.tsx
import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathTexProps {
    tex: string;
    block?: boolean;
}

export const MathTex: React.FC<MathTexProps> = ({ tex, block = false }) => {
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            katex.render(tex, containerRef.current, {
                displayMode: block,
                throwOnError: false
            });
        }
    }, [tex, block]);

    return <span ref={containerRef} />;
};
