# Taguchi Array Testing Package

A TypeScript package for implementing Taguchi Method design of experiments

# Motivation/Background

The Taguchi Method is a statistical approach to experimental design that helps optimize processes and products while minimizing the number of required experiments. Unlike traditional full factorial experiments that test every possible combination of factors, the Taguchi Method uses specially designed orthogonal arrays to test pairs of combinations, significantly reducing the number of required experiments while still capturing the main effects of each factor.

Key benefits of using the Taguchi Method include:

- Efficient Testing: Reduce the number of experiments needed while maintaining statistical validity
- Design for Robustness: Identify parameters that make your process or product less sensitive to variations
- Cheap Results: Save time and resources by running fewer experiments
- Improve Quality: Optimize multiple factors at the same time
- Clear Results: Determine exactly factors most strongly influence your desired outcome

For example, if you're optimizing a process time, temp, and pressure variables (3 factors), and you're trying 3 levels of each, a full factorial design would require 27 experiments. Using the Taguchi L9 array, you can get meaningful results with just 9 experiments.

## Installation

```bash
bun install taguchi
```

## Usage

```typescript
import { Taguchi } from 'taguchi'

// Create a new Taguchi experiment with factors and levels
const experiment = new Taguchi({
  type: 'L9',
  factors: {
    Temperature: [150, 175, 200],
    Time: [30, 45, 60],
    Pressure: [10, 15, 20],
  },
})

// Generate experiments
const experiments = experiment.generateExperiments()
console.log(experiments)

// After running experiments, analyze results
const results = experiments.map((factors, i) => ({
  factors,
  response: /* your measured response value */ 95 + i,
}))

const analysis = experiment.analyzeResults(results)
console.log('Optimal levels:', analysis)
```

## Features

- Create and manage Taguchi design of experiments
- Support for multiple factors with multiple levels
- Built-in standard orthogonal arrays (L4, L8, L9, L16, L18)
- Result analysis to find optimal factor levels
- Type-safe implementation

## Orthogonal Array Types

The package includes several standard orthogonal arrays:

- `L4`: 2 levels, up to 3 factors
- `L8`: 2 levels, up to 7 factors
- `L9`: 3 levels, up to 4 factors
- `L16`: 2 levels, up to 15 factors
- `L18`: 3 levels, up to 8 factors (mixed level design)

The appropriate array type should be selected based on your factors and their levels.

## API Reference

### Class: Taguchi

```typescript
new Taguchi({
  type: 'L4' | 'L8' | 'L9' | 'L16' | 'L18',
  factors: Record<string, any[]>,
})
```

#### Methods

- `generateExperiments(): Array<Record<string, any>>`
- `analyzeResults(results: ExperimentResult[]): Record<string, number>`

## License

MIT
