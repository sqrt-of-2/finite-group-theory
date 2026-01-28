
import React, { useMemo, useState, useRef } from 'react';
import type { Subgroup, IGroup } from '../engine/types';
import { MathTex } from './MathTex';
import { calculateLattice } from '../engine/lattice';

interface SubgroupLatticeProps {
    subgroups: Subgroup[];
    group: IGroup;
}

// Logic Helpers for Tooltips
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
    const identity = group.getIdentity();
    for (const h of sub.elements) {
        let curr = h;
        let ord = 1;
        while (curr !== identity && ord <= subOrder) {
            curr = group.multiply(curr, h);
            ord++;
        }
        if (ord === subOrder) return true;
    }
    return false;
};

const isAbelian = (group: IGroup, sub: Subgroup): boolean => {
    const elems = Array.from(sub.elements);
    for (let i = 0; i < elems.length; i++) {
        for (let j = i + 1; j < elems.length; j++) {
            if (group.multiply(elems[i], elems[j]) !== group.multiply(elems[j], elems[i])) return false;
        }
    }
    return true;
};

const getPrimes = () => {
    return new Set([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61]);
};

export const SubgroupLattice: React.FC<SubgroupLatticeProps> = ({ subgroups, group }) => {
    const groupOrder = group.getProperties().order;

    // Use Engine Logic
    const { nodes: latticeNodes, links: latticeLinks, layers } = useMemo(() => {
        return calculateLattice(subgroups);
    }, [subgroups]);

    // Layout Logic
    const { nodes, links } = useMemo(() => {
        const layerKeys = Array.from(layers.keys()).sort((a, b) => a - b);
        const width = 600;
        const height = 400;
        const padding = 60;

        const nodePositions = new Map<number, { x: number, y: number }>();
        const layerCount = layerKeys.length;

        layerKeys.forEach((rank) => {
            const indices = layers.get(rank)!;
            const cy = layerCount > 1
                ? height - padding - (rank / (layerCount - 1)) * (height - 2 * padding)
                : height / 2;

            indices.forEach((idx, i) => {
                const cx = (width * (i + 1)) / (indices.length + 1);
                nodePositions.set(idx, { x: cx, y: cy });
            });
        });

        // Map latticeNodes (which already contain 'rank' and 'originalIndex') to UI nodes
        const uiNodes = latticeNodes.map((node, i) => ({
            ...node,
            ...nodePositions.get(i)!
        }));

        return {
            nodes: uiNodes,
            links: latticeLinks
        };
    }, [latticeNodes, latticeLinks, layers]);

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

    const renderTooltip = () => {
        if (!hoverNode) return null;

        const node = hoverNode;
        // Note: node is LatticeNode & position. It has Subgroup props.
        const name = node.name || (node.order === 1 ? '\\{e\\}' : (node.order === groupOrder ? 'G' : `H_{${node.id}}`));
        const groupName = group.displayName;
        const elementsList = Array.from(node.elements).map((e: any) => group.elements.find(x => x.id === e)?.label || e).join(', ');
        const index = groupOrder / node.order;
        const isNorm = node.isNormal;

        const isCyc = isCyclic(group, node);
        const isAb = isAbelian(group, node);
        const coreSet = getCore(group, node);
        const coreElements = Array.from(coreSet).map(e => group.elements.find(x => x.id === e)?.label || e).join(', ');

        const primes = getPrimes();
        const isPrime = primes.has(node.order);

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
                        <foreignObject x="-60" y="-35" width="120" height="30">
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', pointerEvents: 'none' }}>
                                <span style={{ fontSize: '10px', color: '#666', whiteSpace: 'nowrap' }}>
                                    <MathTex tex={node.name || (node.order === 1 ? '\\{e\\}' : (node.order === groupOrder ? `G = ${group.displayName}` : `H_{${node.id}}`))} />
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
