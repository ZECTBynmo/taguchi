export type Factor = {
  name: string
  levels: any[]
}

export type ExperimentResult = {
  factors: Record<string, any>
  response: number
}

export type OrthogonalArrayType = 'L4' | 'L8' | 'L9' | 'L16' | 'L18'

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

interface TaguchiConfig {
  type: OrthogonalArrayType
  factors: Record<string, any[]>
}

export class Taguchi {
  private factors: Array<{ name: string; levels: any[] }> = []
  private orthogonalArray: number[][] = []

  constructor(config: TaguchiConfig) {
    Object.entries(config.factors).forEach(([name, levels]) => {
      if (levels.length < 2) {
        throw new Error(`Factor ${name} must have at least 2 levels`)
      }
      this.factors.push({ name, levels })
    })
    this.validateArrayType(config.type)
    this.orthogonalArray = STANDARD_ARRAYS[config.type]
  }

  private validateArrayType(type: OrthogonalArrayType) {
    const array = STANDARD_ARRAYS[type]
    const maxLevels = Math.max(...array.flat())
    const hasInvalidLevels = this.factors.some((factor) => factor.levels.length > maxLevels)
    if (hasInvalidLevels) {
      throw new Error(`${type} can only accommodate ${maxLevels} levels per factor`)
    }

    const factorCount = this.factors.length
    const maxFactors = array[0].length
    if (factorCount > maxFactors) {
      throw new Error(
        `${type} can only accommodate ${maxFactors} factors, but ${factorCount} were provided`
      )
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

  analyzeResults(results: ExperimentResult[]): Record<string, number> {
    const analysis: Record<string, number> = {}
    this.factors.forEach((factor) => {
      const levelEffects = factor.levels.map((_, levelIndex) => {
        const experimentsWithLevel = results.filter(
          (result) => result.factors[factor.name] === factor.levels[levelIndex]
        )
        const avgResponse =
          experimentsWithLevel.reduce((sum, exp) => sum + exp.response, 0) /
          experimentsWithLevel.length
        return avgResponse
      })
      const optimalLevelIndex = levelEffects.indexOf(Math.max(...levelEffects))
      analysis[factor.name] = optimalLevelIndex
    })
    return analysis
  }
}
