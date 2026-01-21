# Finite Group Explorer

**Finite Group Explorer** is an interactive educational tool designed to help students and enthusiasts explore the properties of finite groups. Built with **React** and **TypeScript**, it provides an intuitive interface for visualizing group structures, computing properties, and comparing different groups.

## Features

- **Comprehensive Group Catalog**: Explore all groups of order up to 12, plus the Alternating Group $A_5$ (Order 60).
- **Interactive Cayley Tables**: Visualize group multiplication tables with interactive highlighting.
- **Subgroup Lattices**: Graphical representation of the subgroup inclusion hierarchy.
- **Deep Group Analysis**:
    - Order, Abelian/Cyclic/Simple properties.
    - Center and Conjugacy Classes.
    - Generators and Relations.
    - Full list of elements and subgroups.
- **Quotient Groups**: Create and analyze quotient groups $G/N$ interactively.
- **Compare Mode**: Side-by-side comparison of any two groups to spot isomorphisms or structural differences.
- **Educational Glossary**: Integrated glossary of group theory terms with tooltip definitions.

## Live Demo

(Add your deployed link here if applicable)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sqrt-of-2/finite-group-theory.git
   cd finite-group-theory
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`.

## Testing

The project includes a comprehensive test suite using **Vitest**, covering core algebraic logic, group generators, and UI components.

To run the tests:
```bash
npm run test
```

## Technologies

- **Frontend**: React, TypeScript, Vite
- **Math Rendering**: KaTeX
- **Testing**: Vitest, React Testing Library
- **Styling**: CSS Modules / Plain CSS

## License

MIT
