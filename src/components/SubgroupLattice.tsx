
// src/components/SubgroupLattice.tsx
import React, { useMemo } from 'react';
import type { Subgroup } from '../engine/types';
// import { MathTex } from './MathTex';

interface SubgroupLatticeProps {
    subgroups: Subgroup[];
    groupOrder: number;
}

// Helper to check subset
const isSubset = (a: Set<string>, b: Set<string>) => {
    if (a.size > b.size) return false;
    for (const x of a) {
        if (!b.has(x)) return false;
    }
    return true;
};

export const SubgroupLattice: React.FC<SubgroupLatticeProps> = ({ subgroups, groupOrder }) => {
    const { nodes, links } = useMemo(() => {
        // 1. Sort subgroups by order
        // We'll give them IDs based on index
        const sorted = [...subgroups].sort((a, b) => a.order - b.order);

        // Layers: map order -> list of indices
        const layers = new Map<number, number[]>();
        sorted.forEach((sub, i) => {
            if (!layers.has(sub.order)) layers.set(sub.order, []);
            layers.get(sub.order)!.push(i);
        });

        const layerOrders = Array.from(layers.keys()).sort((a, b) => a - b);

        // Compute positions
        const width = 600;
        const height = 400;
        const padding = 50;

        const nodePositions = new Map<number, { x: number, y: number }>();

        layerOrders.forEach((ord, layerIdx) => {
            const indices = layers.get(ord)!;
            const cy = height - padding - (layerIdx / (layerOrders.length - 1)) * (height - 2 * padding);

            indices.forEach((idx, i) => {
                const cx = (width * (i + 1)) / (indices.length + 1);
                nodePositions.set(idx, { x: cx, y: cy });
            });
        });

        // Edges: Transitive reduction
        const edges: [number, number][] = [];

        for (let i = 0; i < sorted.length; i++) {
            for (let j = i + 1; j < sorted.length; j++) {
                const subA = sorted[i]; // Smaller
                const subB = sorted[j]; // Larger

                // Only consider if A divides B? (Lagrange). Yes.
                if (subB.order % subA.order !== 0) continue;

                if (isSubset(subA.elements, subB.elements)) {
                    // Check if indirect
                    // Is there a k such that A < K < B?
                    let direct = true;
                    for (let k = i + 1; k < j; k++) {
                        const subK = sorted[k];
                        if (subK.order === subA.order || subK.order === subB.order) continue;
                        if (subK.order % subA.order === 0 && subB.order % subK.order === 0) {
                            if (isSubset(subA.elements, subK.elements) && isSubset(subK.elements, subB.elements)) {
                                direct = false;
                                break;
                            }
                        }
                    }
                    if (direct) {
                        edges.push([i, j]);
                    }
                }
            }
        }

        return {
            nodes: sorted.map((s, i) => ({ ...s, ...nodePositions.get(i)!, id: i })),
            links: edges
        };
    }, [subgroups]);

    return (
        <svg width="600" height="400" style={{ border: '1px solid #eee', background: 'white' }}>
            <SlightlyCurvedLinks links={links} nodes={nodes} />
            {nodes.map(node => (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                    <circle
                        r={node.isNormal ? 12 : 8}
                        fill={node.isNormal ? '#e6f0ff' : 'white'}
                        stroke="#0044cc"
                        strokeWidth={node.isNormal ? 2 : 1}
                        style={{ cursor: 'pointer' }}
                    >
                        <title>
                            Order: {node.order}
                            {node.isNormal ? ' (Normal)' : ''}
                        </title>
                    </circle>
                    <text
                        dy={-15}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#666"
                    >
                        {node.name || (node.order === 1 ? 'e' : (node.order === groupOrder ? 'G' : `H${node.id}`))}
                    </text>
                </g>
            ))}
        </svg>
    );
};

// Component to draw links
const SlightlyCurvedLinks = ({ links, nodes }: { links: [number, number][], nodes: any[] }) => {
    return (
        <>
            {links.map(([sourceId, targetId], i) => {
                const s = nodes[sourceId];
                const t = nodes[targetId];
                return (
                    <line
                        key={i}
                        x1={s.x} y1={s.y}
                        x2={t.x} y2={t.y}
                        stroke="#ccc"
                        strokeWidth="1"
                    />
                );
            })}
        </>
    );
};
