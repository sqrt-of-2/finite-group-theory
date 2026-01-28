
// src/components/SubgroupLattice.tsx
import React, { useMemo, useState, useRef } from 'react';
import type { Subgroup, IGroup } from '../engine/types';
import { MathTex } from './MathTex';

interface SubgroupLatticeProps {
    subgroups: Subgroup[];
    group: IGroup;
}

// Logic Helpers
const isSubset = (a: Set<string>, b: Set<string>) => {
    if (a.size > b.size) return false;
    for (const x of a) {
        if (!b.has(x)) return false;
    }
    return true;
};

const getCore = (group: IGroup, sub: Subgroup): Set<string> => {
    if (sub.isNormal) return sub.elements;
    let core = new Set(sub.elements);
    const elements = group.elements.map(e => e.id);
    for (const g of elements) {
        const gInv = group.invert(g);
        const conj = new Set<string>();
        for (const h of sub.elements) {
            conj.add(group.multiply(group.multiply(g, h), gInv));
        }
        // core = intersection(core, conj)
        core = new Set([...core].filter(x => conj.has(x)));
        if (core.size === 1) break;
    }
    return core;
};

const isCyclic = (group: IGroup, sub: Subgroup): boolean => {
    const subOrder = sub.order;
    // Check if any element has order equal to subOrder
    // We need element orders. We can compute them or assume group.elements handles it.
    // group.elements might cache them but here we deal with IDs.
    // We can rely on `ConcreteGroup` which probably cached them on `elements` list.
    // Or just recompute quickly.
    const identity = group.getIdentity();
    for (const h of sub.elements) {
        let curr = h;
        let ord = 1;
        while (curr !== identity && ord <= subOrder) {
            curr = group.multiply(curr, h);
            ord++;
        }
        // If we wrapped around to identity at exactly subOrder, it generates the group
        // But valid order check is: h^ord = e. Smallest positive ord.
        // My loop finds the order.
        if (ord === subOrder) return true;
    }
    return false;
};

const isAbelian = (group: IGroup, sub: Subgroup): boolean => {
    const elems = Array.from(sub.elements);
    // Standard check
    for (let i = 0; i < elems.length; i++) {
        for (let j = i + 1; j < elems.length; j++) {
            if (group.multiply(elems[i], elems[j]) !== group.multiply(elems[j], elems[i])) return false;
        }
    }
    return true;
};

const getPrimes = () => {
    const primes = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61]); // simplified
    return primes;
};

export const SubgroupLattice: React.FC<SubgroupLatticeProps> = ({ subgroups, group }) => {
    const groupOrder = group.getProperties().order;
    const { nodes, links } = useMemo(() => {
        // 1. Sort subgroups by order
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
            const cy = layerOrders.length > 1
                ? height - padding - (layerIdx / (layerOrders.length - 1)) * (height - 2 * padding)
                : height / 2;

            indices.forEach((idx, i) => {
                const cx = (width * (i + 1)) / (indices.length + 1);
                nodePositions.set(idx, { x: cx, y: cy });
            });
        });

        // Edges: Transitive reduction
        const edges: [number, number][] = [];

        for (let i = 0; i < sorted.length; i++) {
            for (let j = i + 1; j < sorted.length; j++) {
                const subA = sorted[i];
                const subB = sorted[j];

                if (subB.order % subA.order !== 0) continue;

                if (isSubset(subA.elements, subB.elements)) {
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
    }, [subgroups, groupOrder]);

    // Tooltip State
    const [hoverNode, setHoverNode] = useState<any | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = (node: any, e: React.MouseEvent) => {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
            setTooltipPos({
                x: e.clientX - containerRect.left + 10,
                y: e.clientY - containerRect.top + 10
            });
        }
        setHoverNode(node);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
            setTooltipPos({
                x: e.clientX - containerRect.left + 10,
                y: e.clientY - containerRect.top + 10
            });
        }
    };

    const handleMouseLeave = () => {
        setHoverNode(null);
    };

    // Render logic for tooltip content
    const renderTooltip = () => {
        if (!hoverNode) return null;

        const node = hoverNode as Subgroup & { id: number }; // cast
        const name = node.name || (node.order === 1 ? 'e' : (node.order === groupOrder ? 'G' : `H_${node.id}`));
        const groupName = group.displayName;
        const elementsList = Array.from(node.elements).map(e => group.elements.find(x => x.id === e)?.label || e).join(', ');
        const index = groupOrder / node.order;
        const isNorm = node.isNormal;

        // Compute properties on fly
        const isCyc = isCyclic(group, node);
        const isAb = isAbelian(group, node);
        const coreSet = getCore(group, node);
        const coreElements = Array.from(coreSet).map(e => group.elements.find(x => x.id === e)?.label || e).join(', ');

        const primes = getPrimes(60);
        const isPrime = primes.has(node.order);

        // Styling for tooltip
        return (
            <div style={{
                position: 'absolute',
                top: tooltipPos.y,
                left: tooltipPos.x,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                padding: '10px',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                pointerEvents: 'none',
                zIndex: 100,
                fontSize: '0.85rem',
                minWidth: '250px',
                maxWidth: '350px'
            }}>
                <div style={{ marginBottom: '4px' }}>
                    <strong>Subgroup:</strong> <MathTex tex={`${name} = \\{ ${elementsList} \\} \\leq ${groupName}`} />
                </div>
                <div><strong>Order:</strong> <MathTex tex={`|${name}| = ${node.order}`} /></div>
                <div><strong>Index:</strong> <MathTex tex={`[${groupName} : ${name}] = ${index}`} /> left cosets</div>
                <div>
                    <strong>{isNorm ? 'Normal' : 'Non-normal'} subgroup: </strong>
                    <MathTex tex={isNorm ? `${name} \\unlhd ${groupName}` : `${name} \\not\\unlhd ${groupName}`} />
                </div>
                <div><strong>Prime order:</strong> {isPrime ? 'yes' : 'no'}</div>
                <div><strong>Cyclic:</strong> {isCyc ? 'yes' : 'no'}</div>
                <div><strong>Abelian:</strong> {isAb ? 'yes' : 'no'}</div>
                <div style={{ marginTop: '4px', borderTop: '1px dotted #ccc', paddingTop: '4px' }}>
                    <strong>Core:</strong> <MathTex tex={`Core_{${groupName}}(${name}) = \\{ ${coreElements} \\}`} />
                </div>
            </div>
        );
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }} ref={containerRef}>
            <svg width="600" height="400" style={{ border: '1px solid #eee', background: 'white' }} onMouseMove={hoverNode ? handleMouseMove : undefined}>
                <SlightlyCurvedLinks links={links} nodes={nodes} />
                {nodes.map(node => (
                    <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onMouseEnter={(e) => handleMouseEnter(node, e)}
                        onMouseLeave={handleMouseLeave}
                        style={{ cursor: 'pointer' }}
                    >
                        <circle
                            r={node.isNormal ? 12 : 8}
                            fill={node.isNormal ? '#e6f0ff' : 'white'}
                            stroke="#0044cc"
                            strokeWidth={node.isNormal ? 2 : 1}
                        />
                        <foreignObject x="-20" y="-30" width="40" height="20">
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', pointerEvents: 'none' }}>
                                <span style={{ fontSize: '10px', color: '#666' }}>
                                    <MathTex tex={node.name || (node.order === 1 ? 'e' : (node.order === groupOrder ? 'G' : `H_${node.id}`))} />
                                </span>
                            </div>
                        </foreignObject>
                    </g>
                ))}
            </svg>
            {renderTooltip()}
        </div>
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
