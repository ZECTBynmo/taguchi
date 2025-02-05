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
const results = experiments.map((exp, i) => ({
  factors: exp,
  response: 95 + i * 2, // Example response values
}))

const analysis = experiment.analyzeResults(results)
```

Example analysis output:

```typescript
{
  optimalLevels: {
    Temperature: 2,    // Index of the optimal level (0-based)
    Time: 1,
    Pressure: 2
  },
  snRatios: {
    Temperature: [35.2, 38.1, 36.7],  // S/N ratio for each level
    Time: [37.1, 36.8, 35.9],
    Pressure: [36.2, 37.4, 38.5]
  },
  mainEffects: {
    Temperature: [92.3, 97.8, 94.5],  // Average response at each level
    Time: [96.2, 95.1, 93.4],
    Pressure: [93.8, 95.9, 98.2]
  },
  contributions: {
    Temperature: 28.5,  // Percentage contribution to variation
    Time: 31.2,
    Pressure: 40.3
  },
  variance: {
    Temperature: {
      ss: 156.2,    // Sum of squares
      df: 2,        // Degrees of freedom
      ms: 78.1,     // Mean square
      f: 12.3,      // F-ratio
      contribution: 28.5,  // Contribution percentage
      confidenceInterval: [25.2, 31.8],
      isPooled: false
    },
    Time: {
      ss: 123.4,
      df: 2,
      ms: 61.7,
      f: 10.2,
      contribution: 31.2,
      confidenceInterval: [28.9, 33.5],
      isPooled: false
    },
    Pressure: {
      ss: 187.6,
      df: 2,
      ms: 93.8,
      f: 15.4,
      contribution: 40.3,
      confidenceInterval: [37.1, 43.5],
      isPooled: false
    }
  }
}
```

## Statistical Analysis Features

The package provides comprehensive statistical analysis of experimental results:

### 1. Optimal Levels (`optimalLevels`)

- The best level for each factor

### 2. Signal-to-Noise Ratios (`snRatios`)

- Measures the robustness of each factor level
- Higher values indicate better stability and less sensitivity to noise

### 3. Main Effects (`mainEffects`)

- Shows the average response at each level of each factor
- Helps visualize how each factor affects the response
- Useful for:
  - Understanding factor impact
  - Identifying trends (linear, nonlinear)
  - Confirming optimal settings

### 4. Factor Contributions (`contributions`)

- Percentage of total variation attributed to each factor
- Higher percentages indicate more influential factors
- Use to:
  - Prioritize which factors to control tightly
  - Identify which factors can have looser tolerances
  - Focus improvement efforts on high-impact factors

### 5. Analysis of Variance (`variance`)

Detailed ANOVA results for each factor:

- `ss` (Sum of Squares): Total variation attributed to the factor
- `df` (Degrees of Freedom): Number of independent comparisons available
- `ms` (Mean Square): Average variation per degree of freedom
- `f` (F-ratio): Statistical significance of the factor
- `contribution`: Percentage contribution to total variation
- `confidenceInterval`: 95% confidence interval for the factor effect
- `isPooled`: Whether the factor was pooled into the error term

#### Interpreting ANOVA Results

1. **F-ratio (f)**

   - The F-ratio is a key indicator of factor significance
   - Higher F-ratios indicate stronger factor effects
   - Rule of thumb:
     - F > 2: Factor likely has a real effect
     - F > 4: Strong evidence of factor effect
     - F > 10: Very strong evidence of factor effect
   - Example: If factor A has F=12.5 and factor B has F=1.2:
     ```typescript
     if (analysis.variance.A.f > 4) {
       console.log('Factor A has a strong effect')
     }
     ```

2. **Confidence Intervals**

   - Shows the range where the true factor effect likely lies
   - If interval doesn't include 0, effect is statistically significant
   - Wider intervals indicate more uncertainty
   - Example:
     ```typescript
     const [lower, upper] = analysis.variance.A.confidenceInterval
     if (lower > 0) {
       console.log('Factor A has a positive effect (95% confidence)')
     }
     ```

3. **Pooling**

   - Factors with low F-ratios are automatically pooled
   - Pooled factors are considered insignificant
   - Check pooling status:
     ```typescript
     if (analysis.variance.B.isPooled) {
       console.log('Factor B is insignificant')
     }
     ```

4. **Contributions**
   - Shows relative importance of each factor
   - Higher percentages indicate more influential factors
   - Use for prioritizing control factors:
     ```typescript
     const significantFactors = Object.entries(analysis.contributions)
       .filter(([_, contribution]) => contribution > 10)
       .map(([factor]) => factor)
     ```

#### Example: Making Decisions with ANOVA Results

```typescript
function analyzeFactorImportance(analysis: AnalysisResult) {
  const criticalFactors = []
  const minorFactors = []
  const insignificantFactors = []

  Object.entries(analysis.variance).forEach(([factor, stats]) => {
    if (stats.isPooled) {
      insignificantFactors.push(factor)
    } else if (stats.f > 4 && stats.contribution > 20) {
      criticalFactors.push(factor)
    } else {
      minorFactors.push(factor)
    }
  })

  return {
    criticalFactors, // Need tight control
    minorFactors, // Monitor but less critical
    insignificantFactors, // Can have wider tolerances
  }
}
```

#### Using Results for Process Improvement

1. **Identify Critical Factors**

   ```typescript
   const analysis = taguchi.analyzeResults(results)

   // Find factors with strong effects
   const criticalFactors = Object.entries(analysis.variance)
     .filter(([_, stats]) => !stats.isPooled && stats.f > 4)
     .map(([factor]) => factor)
   ```

2. **Optimize Factor Levels**

   ```typescript
   // Get optimal settings for critical factors
   const optimalSettings = criticalFactors.reduce(
     (settings, factor) => ({
       ...settings,
       [factor]: analysis.optimalLevels[factor],
     }),
     {}
   )
   ```

3. **Assess Robustness**

   ```typescript
   // Check S/N ratios for stability
   const robustFactors = Object.entries(analysis.snRatios)
     .filter(([_, ratios]) => {
       const range = Math.max(...ratios) - Math.min(...ratios)
       return range > 3 // Significant effect on robustness
     })
     .map(([factor]) => factor)
   ```

4. **Validate Results**

   ```typescript
   function validateResults(analysis: AnalysisResult) {
     // Check for statistical validity
     const hasValidError = analysis.error && analysis.error.df >= 2
     const hasSignificantFactors = Object.values(analysis.variance).some(
       (stats) => stats.f > 2 && !stats.isPooled
     )

     return {
       isValid: hasValidError && hasSignificantFactors,
       errorDf: analysis.error?.df ?? 0,
       significantFactorCount: Object.values(analysis.variance).filter(
         (stats) => stats.f > 2 && !stats.isPooled
       ).length,
     }
   }
   ```

Use ANOVA results when you need:

- Statistical validation of factor effects
- Detailed understanding of variation sources
- Rigorous comparison of factor importance
- Documentation for quality systems or research
- Process optimization decisions
- Setting control limits and tolerances

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
- `analyzeResults(results: ExperimentResult[]): AnalysisResult`

#### Types

```typescript
type ExperimentResult = {
  factors: Record<string, any>
  response: number
}

type AnalysisResult = {
  optimalLevels: Record<string, number>
  snRatios: Record<string, number[]>
  mainEffects: Record<string, number[]>
  contributions: Record<string, number>
  variance: Record<
    string,
    {
      ss: number
      df: number
      ms: number
      f: number
      contribution: number
      confidenceInterval: [number, number]
      isPooled: boolean
    }
  >
}
```

## License

MIT
