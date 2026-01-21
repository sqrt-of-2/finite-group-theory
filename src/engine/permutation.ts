
// src/engine/permutation.ts

// Helper to compute LCM
function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
}

function lcm(a: number, b: number): number {
    return (a * b) / gcd(a, b);
}

export class Permutation {
    // Maps index -> Value at that index.
    // e.g. [1, 0, 2] means 0->1, 1->0, 2->2
    private readonly map: number[];
    public readonly n: number;

    constructor(map: number[]) {
        this.map = [...map];
        this.n = map.length;
        // Basic validation could go here
    }

    static identity(n: number): Permutation {
        return new Permutation(Array.from({ length: n }, (_, i) => i));
    }

    // Create from cycle notation (1-based input, e.g. [[1,2], [3,4]])
    static fromCycles(n: number, cycles: number[][]): Permutation {
        const map = Array.from({ length: n }, (_, i) => i);
        for (const cycle of cycles) {
            for (let i = 0; i < cycle.length; i++) {
                const current = cycle[i] - 1; // 0-based
                const next = cycle[(i + 1) % cycle.length] - 1;
                map[current] = next;
            }
        }
        return new Permutation(map);
    }

    // For D_2n, it's often useful to treat logic carefully.
    // Note: In typical math notation (f * g)(x) = f(g(x)) or f then g?
    // In Algebra, usually f * g means "f following g" (right-to-left) or "g then f".
    // Dummit & Foote use right-to-left function composition: (sigma * tau)(x) = sigma(tau(x)).
    // Let's stick to D&F convention.
    multiply(other: Permutation): Permutation {
        if (this.n !== other.n) {
            throw new Error(`Permutation size mismatch: ${this.n} vs ${other.n}`);
        }
        const newMap = new Array(this.n);
        for (let i = 0; i < this.n; i++) {
            // (this * other)(i) = this(other(i))
            newMap[i] = this.map[other.map[i]];
        }
        return new Permutation(newMap);
    }

    inverse(): Permutation {
        const newMap = new Array(this.n);
        for (let i = 0; i < this.n; i++) {
            newMap[this.map[i]] = i;
        }
        return new Permutation(newMap);
    }

    equals(other: Permutation): boolean {
        if (this.n !== other.n) return false;
        for (let i = 0; i < this.n; i++) {
            if (this.map[i] !== other.map[i]) return false;
        }
        return true;
    }

    // canonical hash/id string
    toString(): string {
        return this.map.join(',');
    }

    // Convert to disjoint cycles (1-based)
    toCycles(): number[][] {
        const visited = new Set<number>();
        const cycles: number[][] = [];

        for (let i = 0; i < this.n; i++) {
            if (!visited.has(i)) {
                let current = i;
                const cycle: number[] = [];
                while (!visited.has(current)) {
                    visited.add(current);
                    cycle.push(current + 1); // 1-based
                    current = this.map[current];
                }
                if (cycle.length > 1) {
                    cycles.push(cycle);
                }
            }
        }
        return cycles;
    }

    // Cycle notation string e.g. (1 2)(3 4)
    format(): string {
        const cycles = this.toCycles();
        if (cycles.length === 0) return "(1)"; // Identity
        return cycles.map(c => `(${c.join(' ')})`).join('');
    }

    order(): number {
        const cycles = this.toCycles();
        if (cycles.length === 0) return 1;
        return cycles.reduce((acc, c) => lcm(acc, c.length), 1);
    }

    // Apply to a number (0-based)
    apply(x: number): number {
        return this.map[x];
    }
}
