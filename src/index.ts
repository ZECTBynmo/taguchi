export type Factor = {
  name: string
  levels: any[]
}

export type ExperimentResult = {
  factors: Record<string, any>
  response: number
}

export type OrthogonalArrayType = 'L4' | 'L8' | 'L9' | 'L16' | 'L18'

export enum SNRatioType {
  LARGER_IS_BETTER = 'LARGER_IS_BETTER',
  SMALLER_IS_BETTER = 'SMALLER_IS_BETTER',
  NOMINAL_IS_BEST = 'NOMINAL_IS_BEST',
}

const STANDARD_ARRAYS = {
  L4: [
    [1, 1, 1],
    [1, 2, 2],
    [2, 1, 2],
    [2, 2, 1],
  ],
  L8: [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 2, 2, 2, 2],
    [1, 2, 2, 1, 1, 2, 2],
    [1, 2, 2, 2, 2, 1, 1],
    [2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 2, 1, 2, 1],
    [2, 2, 1, 1, 2, 2, 1],
    [2, 2, 1, 2, 1, 1, 2],
  ],
  L9: [
    [1, 1, 1, 1],
    [1, 2, 2, 2],
    [1, 3, 3, 3],
    [2, 1, 2, 3],
    [2, 2, 3, 1],
    [2, 3, 1, 2],
    [3, 1, 3, 2],
    [3, 2, 1, 3],
    [3, 3, 2, 1],
  ],
  L16: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2],
    [1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
    [1, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 2, 1, 1, 2, 2, 1, 1, 2, 2, 1, 1, 2, 1],
    [1, 2, 2, 1, 2, 1, 1, 2, 2, 1, 1, 2, 2, 1, 2],
    [2, 1, 1, 2, 1, 2, 2, 1, 2, 1, 1, 2, 2, 1, 1],
    [2, 1, 1, 2, 2, 1, 1, 2, 1, 2, 2, 1, 1, 2, 2],
    [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 1],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 2],
    [2, 2, 1, 2, 1, 1, 2, 2, 1, 1, 2, 2, 1, 2, 1],
    [2, 2, 1, 2, 2, 2, 1, 1, 2, 2, 1, 1, 2, 1, 2],
    [2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 1, 2, 2, 1, 2],
    [2, 2, 2, 1, 2, 2, 2, 1, 1, 1, 2, 1, 1, 2, 1],
  ],
  L18: [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 2, 2, 2, 2, 2, 2],
    [1, 1, 3, 3, 3, 3, 3, 3],
    [1, 2, 1, 1, 2, 2, 3, 3],
    [1, 2, 2, 2, 3, 3, 1, 1],
    [1, 2, 3, 3, 1, 1, 2, 2],
    [1, 3, 1, 2, 1, 3, 2, 3],
    [1, 3, 2, 3, 2, 1, 3, 1],
    [1, 3, 3, 1, 3, 2, 1, 2],
    [2, 1, 1, 3, 3, 2, 2, 1],
    [2, 1, 2, 1, 1, 3, 3, 2],
    [2, 1, 3, 2, 2, 1, 1, 3],
    [2, 2, 1, 2, 3, 1, 3, 2],
    [2, 2, 2, 3, 1, 2, 1, 3],
    [2, 2, 3, 1, 2, 3, 2, 1],
    [2, 3, 1, 3, 2, 3, 1, 2],
    [2, 3, 2, 1, 3, 1, 2, 3],
    [2, 3, 3, 2, 1, 2, 3, 1],
  ],
}

export interface TaguchiConfig {
  type: OrthogonalArrayType
  factors: Record<string, any[]>
  snRatioType: SNRatioType
  targetValue?: number // For nominal-is-best
  poolingThreshold?: number // F-ratio threshold for pooling (default: 2)
}

export type AnalysisResult = {
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
      confidenceInterval?: [number, number] // 95% confidence interval
      isPooled?: boolean // Whether this factor was pooled with error
    }
  >
  error?: {
    ss: number
    df: number
    ms: number
    pooledFactors: string[]
  }
}

export class Taguchi {
  private factors: Array<{ name: string; levels: any[] }> = []
  private orthogonalArray: number[][] = []
  private snRatioType: SNRatioType
  private targetValue?: number
  private poolingThreshold: number
  private error?: AnalysisResult['error']

  constructor(config: TaguchiConfig) {
    Object.entries(config.factors).forEach(([name, levels]) => {
      if (levels.length < 2) {
        throw new Error(`Factor ${name} must have at least 2 levels`)
      }
      this.factors.push({ name, levels })
    })
    this.validateArrayType(config.type)
    this.orthogonalArray = STANDARD_ARRAYS[config.type]
    this.snRatioType = config.snRatioType
    this.targetValue = config.targetValue
    this.poolingThreshold = config.poolingThreshold ?? 2

    if (this.snRatioType === SNRatioType.NOMINAL_IS_BEST && this.targetValue === undefined) {
      throw new Error('Target value must be specified for nominal-is-best optimization')
    }
  }

  private validateArrayType(type: OrthogonalArrayType) {
    const array = STANDARD_ARRAYS[type]
    const maxLevels = Math.max(...array.flat())

    for (const factor of this.factors) {
      if (factor.levels.length > maxLevels) {
        throw new Error(
          `Factor ${factor.name} has ${factor.levels.length} levels, but ${type} can only accommodate ${maxLevels} levels`
        )
      }
      if (factor.levels.length < 2) {
        throw new Error(`Factor ${factor.name} must have at least 2 levels`)
      }
    }

    const factorCount = this.factors.length
    const maxFactors = array[0].length
    if (factorCount > maxFactors) {
      throw new Error(
        `${type} can only accommodate ${maxFactors} factors, but ${factorCount} were provided`
      )
    }

    const uniqueLevels = new Set(array.flat())
    for (const level of uniqueLevels) {
      const factorsWithLevel = this.factors.filter((f) => f.levels.length >= level)
      if (factorsWithLevel.length === 0) {
        throw new Error(
          `${type} requires factors with at least ${level} levels, but none were provided`
        )
      }
    }
  }

  generateExperiments(): Array<Record<string, any>> {
    if (this.factors.length === 0) {
      throw new Error('At least one factor must be added before generating experiments')
    }
    return this.orthogonalArray.map((row) => {
      const experiment: Record<string, any> = {}
      this.factors.forEach((factor, index) => {
        const levelIndex = row[index] - 1
        experiment[factor.name] = factor.levels[levelIndex]
      })
      return experiment
    })
  }

  private calculateSNRatio(responses: number[]): number {
    const n = responses.length
    const EPSILON = 1e-10

    switch (this.snRatioType) {
      case SNRatioType.LARGER_IS_BETTER: {
        const sum = responses.reduce((acc, y) => {
          const value = Math.max(Math.abs(y), EPSILON)
          return acc + 1 / (value * value)
        }, 0)
        return -10 * Math.log10(sum / n)
      }
      case SNRatioType.SMALLER_IS_BETTER: {
        const sum = responses.reduce((acc, y) => acc + y * y, 0)
        return -10 * Math.log10(Math.max(sum / n, EPSILON))
      }
      case SNRatioType.NOMINAL_IS_BEST: {
        const target = this.targetValue!
        const deviations = responses.map((y) => (y - target) ** 2)
        const msd = Math.max(deviations.reduce((sum, d) => sum + d, 0) / n, EPSILON)
        return -10 * Math.log10(msd)
      }
      default:
        throw new Error('Invalid S/N ratio type')
    }
  }

  private calculateConfidenceInterval(
    ms: number,
    errorMS: number,
    n: number,
    alpha: number = 0.05
  ): [number, number] {
    const tTable: Record<number, number> = {
      1: 12.706,
      2: 4.303,
      3: 3.182,
      4: 2.776,
      5: 2.571,
      6: 2.447,
      7: 2.365,
      8: 2.306,
      9: 2.262,
      10: 2.228,
      15: 2.131,
      20: 2.086,
      30: 2.042,
      60: 2.0,
      120: 1.98,
      Infinity: 1.96,
    }

    const errorDf = this.error?.df ?? 4

    // Linear interpolation for t-value
    const keys = Object.keys(tTable)
      .map(Number)
      .sort((a, b) => a - b)
    let tValue: number

    if (errorDf <= keys[0]) {
      tValue = tTable[keys[0]]
    } else if (errorDf >= keys[keys.length - 1]) {
      tValue = tTable[keys[keys.length - 1]]
    } else {
      const lowerKey = keys.filter((k) => k <= errorDf).pop()!
      const upperKey = keys.find((k) => k > errorDf)!
      const ratio = (errorDf - lowerKey) / (upperKey - lowerKey)
      tValue = tTable[lowerKey] + ratio * (tTable[upperKey] - tTable[lowerKey])
    }

    const se = Math.sqrt((2 * errorMS) / n)
    const margin = tValue * se
    return [-margin, margin]
  }

  private calculateMainEffects(results: ExperimentResult[]): Record<string, number[]> {
    const mainEffects: Record<string, number[]> = {}

    this.factors.forEach((factor) => {
      mainEffects[factor.name] = factor.levels.map((_, levelIndex) => {
        const experimentsWithLevel = results.filter(
          (result) => result.factors[factor.name] === factor.levels[levelIndex]
        )
        return (
          experimentsWithLevel.reduce((sum, exp) => sum + exp.response, 0) /
          experimentsWithLevel.length
        )
      })
    })

    return mainEffects
  }

  private calculateANOVA(results: ExperimentResult[]): {
    variance: AnalysisResult['variance']
    error: AnalysisResult['error']
  } {
    const MIN_ERROR_MS = 1e-10
    const grandMean = results.reduce((sum, r) => sum + r.response, 0) / results.length
    const totalSS = results.reduce((sum, r) => sum + (r.response - grandMean) ** 2, 0)

    const anova: AnalysisResult['variance'] = {}

    // First calculate SS and df for all factors
    this.factors.forEach((factor) => {
      const levelMeans = factor.levels.map((_, levelIndex) => {
        const experimentsWithLevel = results.filter(
          (result) => result.factors[factor.name] === factor.levels[levelIndex]
        )
        return {
          mean:
            experimentsWithLevel.reduce((sum, exp) => sum + exp.response, 0) /
            experimentsWithLevel.length,
          n: experimentsWithLevel.length,
        }
      })

      const ss = levelMeans.reduce((sum, { mean, n }) => sum + n * (mean - grandMean) ** 2, 0)
      const df = factor.levels.length - 1
      anova[factor.name] = {
        ss,
        df,
        ms: ss / df,
        f: 0,
        contribution: 0,
        isPooled: false,
      }
    })

    // Calculate initial error terms
    let errorSS = totalSS - Object.values(anova).reduce((sum, { ss }) => sum + ss, 0)
    let errorDf = results.length - 1 - Object.values(anova).reduce((sum, { df }) => sum + df, 0)

    if (errorDf <= 0) {
      throw new Error('Insufficient degrees of freedom for error calculation')
    }

    let errorMS = Math.max(errorSS / errorDf, MIN_ERROR_MS)

    // Initial F-ratios
    Object.entries(anova).forEach(([factor, analysis]) => {
      analysis.f = analysis.ms / errorMS
    })

    // Sort factors by F-ratio to ensure consistent pooling order
    const sortedFactors = Object.entries(anova)
      .sort(([, a], [, b]) => b.f - a.f)
      .map(([name]) => name)

    // Pool insignificant factors
    const pooledFactors: string[] = []
    let hasPooledFactors = false

    // Iteratively pool factors and update F-ratios
    let changed = true
    while (changed) {
      changed = false

      // Calculate current F-ratios
      Object.entries(anova).forEach(([factor, analysis]) => {
        if (!analysis.isPooled) {
          analysis.f = errorMS === 0 ? 1e6 : analysis.ms / errorMS
        }
      })

      // Find lowest F-ratio
      let minF = Infinity
      let minFactor = ''
      Object.entries(anova).forEach(([factor, analysis]) => {
        if (!analysis.isPooled && analysis.f < minF) {
          minF = analysis.f
          minFactor = factor
        }
      })

      // Pool if below threshold
      if (minF < this.poolingThreshold) {
        const analysis = anova[minFactor]
        analysis.isPooled = true
        analysis.f = 0
        pooledFactors.push(minFactor)
        errorSS += analysis.ss
        errorDf += analysis.df
        errorMS = errorSS / Math.max(errorDf, 1)
        hasPooledFactors = true
        changed = true
      }
    }

    // Calculate confidence intervals and contributions
    const nonPooledSS = Object.values(anova)
      .filter((a) => !a.isPooled)
      .reduce((sum, { ss }) => sum + ss, 0)

    Object.entries(anova).forEach(([factorName, analysis]) => {
      if (!analysis.isPooled) {
        const factor = this.factors.find((f) => f.name === factorName)!
        analysis.confidenceInterval = this.calculateConfidenceInterval(
          analysis.ms,
          errorMS,
          results.length / factor.levels.length
        )
        analysis.contribution = nonPooledSS > 0 ? (analysis.ss / nonPooledSS) * 100 : 0
      } else {
        analysis.contribution = 0
        analysis.confidenceInterval = undefined
      }
    })

    // Ensure contributions are normalized to 100%
    const totalContribution = Object.values(anova)
      .filter((a) => !a.isPooled)
      .reduce((sum, { contribution }) => sum + contribution, 0)

    if (totalContribution > 0) {
      Object.values(anova).forEach((analysis) => {
        if (!analysis.isPooled) {
          analysis.contribution = (analysis.contribution / totalContribution) * 100
        }
      })
    }

    return {
      variance: anova,
      error: {
        ss: errorSS,
        df: errorDf,
        ms: errorMS,
        pooledFactors,
      },
    }
  }

  analyzeResults(results: ExperimentResult[]): AnalysisResult {
    const optimalLevels: Record<string, number> = {}
    const snRatios: Record<string, number[]> = {}
    const mainEffects = this.calculateMainEffects(results)
    const { variance, error } = this.calculateANOVA(results)

    this.factors.forEach((factor) => {
      snRatios[factor.name] = factor.levels.map((_, levelIndex) => {
        const experimentsWithLevel = results.filter(
          (result) => result.factors[factor.name] === factor.levels[levelIndex]
        )
        return this.calculateSNRatio(experimentsWithLevel.map((exp) => exp.response))
      })

      const values = mainEffects[factor.name]
      const optimalValue =
        this.snRatioType === SNRatioType.SMALLER_IS_BETTER
          ? Math.min(...values)
          : Math.max(...values)

      // Find optimal level with tie-breaking strategy
      optimalLevels[factor.name] = values.findIndex((value, index) => {
        if (value === optimalValue) {
          // Check if there's a previous occurrence of this value
          return !values.slice(0, index).includes(value)
        }
        return false
      })
    })

    const contributions = Object.fromEntries(
      Object.entries(variance)
        .filter(([_, analysis]) => !analysis.isPooled)
        .map(([factor, analysis]) => [factor, analysis.contribution])
    )

    return {
      optimalLevels,
      snRatios,
      mainEffects,
      contributions,
      variance,
      error,
    }
  }
}
