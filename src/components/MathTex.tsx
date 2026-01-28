
// src/components/MathTex.tsx
import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathTexProps {
    tex: string;
    block?: boolean;
    inline?: boolean;
}

export const MathTex: React.FC<MathTexProps> = ({ tex, block, inline }) => {
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            // Priority: block > inline
            // If block is true, displayMode = true
            // If inline is true, displayMode = false
            // Default (both undefined) -> displayMode = false (inline)
            const isBlock = block === true;

            katex.render(tex, containerRef.current, {
                displayMode: isBlock,
                throwOnError: false
            });
        }
    }, [tex, block, inline]);

    return <span ref={containerRef} />;
};
