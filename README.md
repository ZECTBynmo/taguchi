# Taguchi Array Testing Package

A TypeScript package for implementing Taguchi Method design of experiments

## Installation

```bash
bun install taguchi
```

## Usage

```typescript
import { Taguchi } from 'taguchi'

// Create a new Taguchi experiment
const experiment = new Taguchi('Temperature Optimization')

// Add factors with their levels
experiment.addFactor('Temperature', [150, 175, 200])
experiment.addFactor('Time', [30, 45, 60])
experiment.addFactor('Pressure', [10, 15, 20])

// Set the orthogonal array type (L9 supports up to 4 factors with 3 levels each)
experiment.setOrthogonalArrayType('L9')

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

The appropriate array type will be selected based on your factors and their levels.

## API Reference

### Class: Taguchi

#### Constructor

- `constructor(name: string)`

#### Methods

- `addFactor(name: string, levels: any[]): void`
- `setOrthogonalArrayType(type: 'L4' | 'L8' | 'L9' | 'L16' | 'L18'): void`
- `generateExperiments(): Array<Record<string, any>>`
- `analyzeResults(results: ExperimentResult[]): Record<string, number>`

## License

MIT
