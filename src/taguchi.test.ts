import { expect, test, describe } from 'bun:test'
import { Taguchi, type ExperimentResult, SNRatioType } from './index'

describe('Taguchi', () => {
  test('should create a new Taguchi instance', () => {
    const taguchi = new Taguchi({
      type: 'L9',
      factors: {
        Temperature: [150, 175, 200],
      },
      snRatioType: SNRatioType.LARGER_IS_BETTER,
    })
    expect(taguchi).toBeInstanceOf(Taguchi)
  })

  test('should throw error when adding factor with insufficient levels', () => {
    expect(
      () =>
        new Taguchi({
          type: 'L9',
          factors: {
            Invalid: [1],
          },
          snRatioType: SNRatioType.LARGER_IS_BETTER,
        })
    ).toThrow('must have at least 2 levels')
  })

  test('should throw error when using incompatible array type', () => {
    expect(
      () =>
        new Taguchi({
          type: 'L4',
          factors: {
            A: [1, 2, 3],
            B: [1, 2],
          },
          snRatioType: SNRatioType.LARGER_IS_BETTER,
        })
    ).toThrow('L4 can only accommodate 2 levels')
  })

  test('should throw error when too many factors for array type', () => {
    expect(
      () =>
        new Taguchi({
          type: 'L4',
          factors: {
            A: [1, 2],
            B: [1, 2],
            C: [1, 2],
            D: [1, 2],
          },
          snRatioType: SNRatioType.LARGER_IS_BETTER,
        })
    ).toThrow('L4 can only accommodate 3 factors')
  })

  test('should generate experiments using L4 array', () => {
    const taguchi = new Taguchi({
      type: 'L4',
      factors: {
        Material: ['Steel', 'Aluminum'],
        Temperature: [100, 200],
        Time: [30, 60],
      },
      snRatioType: SNRatioType.LARGER_IS_BETTER,
    })

    const experiments = taguchi.generateExperiments()
    expect(experiments).toHaveLength(4)
    expect(experiments[0]).toEqual({
      Material: 'Steel',
      Temperature: 100,
      Time: 30,
    })
  })

  test('should analyze L4 experiment results correctly', () => {
    const taguchi = new Taguchi({
      type: 'L4',
      factors: {
        Speed: [1000, 1500],
        Feed: [0.1, 0.2],
      },
      snRatioType: SNRatioType.LARGER_IS_BETTER,
      poolingThreshold: 0, // Disable pooling for this test
    })

    const experiments = taguchi.generateExperiments()
    const results: ExperimentResult[] = [
      { factors: experiments[0], result: 95 },
      { factors: experiments[1], result: 82 },
      { factors: experiments[2], result: 78 },
      { factors: experiments[3], result: 85 },
    ]

    const analysis = taguchi.analyzeResults(results)

    expect(analysis.optimalLevels).toHaveProperty('Speed')
    expect(analysis.optimalLevels).toHaveProperty('Feed')
    expect(analysis.optimalLevels.Speed).toBe(0)
    expect(analysis.optimalLevels.Feed).toBe(0)

    expect(analysis.snRatios).toHaveProperty('Speed')
    expect(analysis.snRatios).toHaveProperty('Feed')
    expect(analysis.snRatios.Speed).toHaveLength(2)
    expect(analysis.snRatios.Feed).toHaveLength(2)

    expect(analysis.mainEffects).toHaveProperty('Speed')
    expect(analysis.mainEffects).toHaveProperty('Feed')
    expect(analysis.mainEffects.Speed).toHaveLength(2)
    expect(analysis.mainEffects.Feed).toHaveLength(2)

    expect(analysis.contributions).toHaveProperty('Speed')
    expect(analysis.contributions).toHaveProperty('Feed')
    const totalContribution = analysis.contributions.Speed + analysis.contributions.Feed
    expect(totalContribution).toBeCloseTo(100, 1)

    expect(analysis.variance).toHaveProperty('Speed')
    expect(analysis.variance).toHaveProperty('Feed')
    expect(analysis.variance.Speed.df).toBe(1)
    expect(analysis.variance.Feed.df).toBe(1)
    expect(analysis.variance.Speed.f).toBeGreaterThanOrEqual(0)
    expect(analysis.variance.Feed.f).toBeGreaterThanOrEqual(0)
  })

  test('should handle a complex L9 experiment', () => {
    const taguchi = new Taguchi({
      type: 'L9',
      factors: {
        Temperature: [150, 175, 200],
        Time: [30, 45, 60],
        Pressure: [10, 15, 20],
      },
      snRatioType: SNRatioType.LARGER_IS_BETTER,
    })

    const experiments = taguchi.generateExperiments()
    expect(experiments).toHaveLength(9)

    const mockResult = (experiment: Record<string, any>): number => {
      return experiment.Temperature * 0.5 + experiment.Time * 0.3 + experiment.Pressure * 0.2
    }

    const results: ExperimentResult[] = experiments.map((exp) => ({
      factors: exp,
      result: mockResult(exp),
    }))

    const analysis = taguchi.analyzeResults(results)
    expect(Object.keys(analysis.optimalLevels)).toHaveLength(3)
    expect(Object.keys(analysis.snRatios)).toHaveLength(3)
    expect(Object.keys(analysis.mainEffects)).toHaveLength(3)
    expect(Object.keys(analysis.contributions)).toHaveLength(3)
    expect(Object.keys(analysis.variance)).toHaveLength(3)
  })

  describe('Statistical Analysis', () => {
    test('should calculate correct main effects', () => {
      const taguchi = new Taguchi({
        type: 'L4',
        factors: {
          A: [1, 2],
          B: [1, 2],
        },
        snRatioType: SNRatioType.LARGER_IS_BETTER,
      })

      const results: ExperimentResult[] = [
        { factors: { A: 1, B: 1 }, result: 10 },
        { factors: { A: 1, B: 2 }, result: 20 },
        { factors: { A: 2, B: 1 }, result: 30 },
        { factors: { A: 2, B: 2 }, result: 40 },
      ]

      const analysis = taguchi.analyzeResults(results)
      expect(analysis.mainEffects.A[0]).toBeCloseTo(15)
      expect(analysis.mainEffects.A[1]).toBeCloseTo(35)
      expect(analysis.mainEffects.B[0]).toBeCloseTo(20)
      expect(analysis.mainEffects.B[1]).toBeCloseTo(30)
    })

    test('should calculate correct ANOVA values', () => {
      const taguchi = new Taguchi({
        type: 'L4',
        factors: {
          A: [1, 2],
          B: [1, 2],
        },
        snRatioType: SNRatioType.LARGER_IS_BETTER,
        poolingThreshold: 0,
      })

      const results: ExperimentResult[] = [
        { factors: { A: 1, B: 1 }, result: 10 },
        { factors: { A: 1, B: 2 }, result: 12 },
        { factors: { A: 2, B: 1 }, result: 20 },
        { factors: { A: 2, B: 2 }, result: 22 },
      ]

      const analysis = taguchi.analyzeResults(results)

      const grandMean = (10 + 12 + 20 + 22) / 4
      const a1Mean = (10 + 12) / 2
      const a2Mean = (20 + 22) / 2
      const b1Mean = (10 + 20) / 2
      const b2Mean = (12 + 22) / 2

      const ssA = 2 * ((a1Mean - grandMean) ** 2 + (a2Mean - grandMean) ** 2)
      const ssB = 2 * ((b1Mean - grandMean) ** 2 + (b2Mean - grandMean) ** 2)
      const totalSS = results.reduce((sum, r) => sum + (r.result - grandMean) ** 2, 0)
      const errorSS = totalSS - ssA - ssB

      expect(analysis.variance.A.ss).toBeCloseTo(ssA, 1)
      expect(analysis.variance.B.ss).toBeCloseTo(ssB, 1)
      expect(analysis.error?.ss).toBeCloseTo(errorSS, 1)

      const msA = ssA
      const msB = ssB
      const msError = errorSS

      expect(analysis.variance.A.ms).toBeCloseTo(msA, 1)
      expect(analysis.variance.B.ms).toBeCloseTo(msB, 1)
      expect(analysis.error?.ms).toBeGreaterThan(0)

      const fRatioA = analysis.variance.A.f
      const fRatioB = analysis.variance.B.f
      expect(fRatioA).toBeGreaterThan(0)
      expect(fRatioB).toBeGreaterThan(0)

      const totalContribution = Object.values(analysis.contributions).reduce((sum, c) => sum + c, 0)
      expect(totalContribution).toBeCloseTo(100, 1)

      expect(analysis.contributions.A).toBeGreaterThan(analysis.contributions.B)
      expect(analysis.contributions.A + analysis.contributions.B).toBeCloseTo(100, 1)
    })

    test('should handle L9 array with three-level factors correctly', () => {
      const taguchi = new Taguchi({
        type: 'L9',
        factors: {
          A: [1, 2, 3],
          B: [1, 2, 3],
          C: [1, 2, 3],
        },
        snRatioType: SNRatioType.LARGER_IS_BETTER,
        poolingThreshold: 0,
      })

      const results: ExperimentResult[] = [
        { factors: { A: 1, B: 1, C: 1 }, result: 10 },
        { factors: { A: 1, B: 2, C: 2 }, result: 20 },
        { factors: { A: 1, B: 3, C: 3 }, result: 30 },
        { factors: { A: 2, B: 1, C: 2 }, result: 25 },
        { factors: { A: 2, B: 2, C: 3 }, result: 35 },
        { factors: { A: 2, B: 3, C: 1 }, result: 15 },
        { factors: { A: 3, B: 1, C: 3 }, result: 40 },
        { factors: { A: 3, B: 2, C: 1 }, result: 20 },
        { factors: { A: 3, B: 3, C: 2 }, result: 30 },
      ]

      const analysis = taguchi.analyzeResults(results)

      expect(analysis.variance.A.df).toBe(2)
      expect(analysis.variance.B.df).toBe(2)
      expect(analysis.variance.C.df).toBe(2)

      expect(analysis.mainEffects.A).toHaveLength(3)
      expect(analysis.mainEffects.B).toHaveLength(3)
      expect(analysis.mainEffects.C).toHaveLength(3)
      expect(analysis.snRatios.A).toHaveLength(3)
      expect(analysis.snRatios.B).toHaveLength(3)
      expect(analysis.snRatios.C).toHaveLength(3)

      const expectedA1 = (10 + 20 + 30) / 3
      const expectedA2 = (25 + 35 + 15) / 3
      const expectedA3 = (40 + 20 + 30) / 3
      expect(analysis.mainEffects.A[0]).toBeCloseTo(expectedA1)
      expect(analysis.mainEffects.A[1]).toBeCloseTo(expectedA2)
      expect(analysis.mainEffects.A[2]).toBeCloseTo(expectedA3)

      Object.values(analysis.variance).forEach(({ ss, df, ms }) => {
        expect(ss).toBeGreaterThanOrEqual(0)
        expect(df).toBeGreaterThan(0)
        expect(ms).toBeCloseTo(ss / df)
      })

      const totalDf = results.length - 1
      const factorDf = 2 * 3
      const errorDf = totalDf - factorDf
      expect(errorDf).toBeGreaterThanOrEqual(0)

      const totalContribution = Object.values(analysis.contributions).reduce((sum, c) => sum + c, 0)
      expect(totalContribution).toBeCloseTo(100, 1)

      Object.values(analysis.contributions).forEach((contribution) => {
        expect(contribution).toBeGreaterThanOrEqual(0)
        expect(contribution).toBeLessThanOrEqual(100)
      })

      Object.values(analysis.variance).forEach(({ f }) => {
        expect(Number.isFinite(f)).toBe(true)
        expect(f).toBeGreaterThanOrEqual(0)
      })
    })

    test('should identify correct optimal levels with known result pattern', () => {
      const taguchi = new Taguchi({
        type: 'L4',
        factors: {
          A: [10, 20],
          B: [100, 200],
        },
        snRatioType: SNRatioType.LARGER_IS_BETTER,
      })

      const results: ExperimentResult[] = [
        { factors: { A: 10, B: 100 }, result: 50 },
        { factors: { A: 10, B: 200 }, result: 40 },
        { factors: { A: 20, B: 100 }, result: 30 },
        { factors: { A: 20, B: 200 }, result: 20 },
      ]

      const analysis = taguchi.analyzeResults(results)
      expect(analysis.optimalLevels.A).toBe(0) // First level (10) gives better results
      expect(analysis.optimalLevels.B).toBe(0) // First level (100) gives better results
      expect(analysis.mainEffects.A[0]).toBeGreaterThan(analysis.mainEffects.A[1])
      expect(analysis.mainEffects.B[0]).toBeGreaterThan(analysis.mainEffects.B[1])
    })
  })

  describe('Signal-to-Noise Ratio Calculations', () => {
    test('should calculate correct S/N ratio for larger-is-better', () => {
      const taguchi = new Taguchi({
        type: 'L4',
        factors: {
          A: [1, 2],
          B: [1, 2],
        },
        snRatioType: SNRatioType.LARGER_IS_BETTER,
      })

      const results: ExperimentResult[] = [
        { factors: { A: 1, B: 1 }, result: 100 },
        { factors: { A: 1, B: 2 }, result: 120 },
        { factors: { A: 2, B: 1 }, result: 80 },
        { factors: { A: 2, B: 2 }, result: 90 },
      ]

      const analysis = taguchi.analyzeResults(results)
      const EPSILON = 1e-10

      const expectedSN1 =
        -10 *
        Math.log10(
          (1 / Math.max(Math.abs(100), EPSILON) ** 2 + 1 / Math.max(Math.abs(120), EPSILON) ** 2) /
            2
        )
      const expectedSN2 =
        -10 *
        Math.log10(
          (1 / Math.max(Math.abs(80), EPSILON) ** 2 + 1 / Math.max(Math.abs(90), EPSILON) ** 2) / 2
        )

      expect(analysis.snRatios.A[0]).toBeCloseTo(expectedSN1, 1)
      expect(analysis.snRatios.A[1]).toBeCloseTo(expectedSN2, 1)
      expect(analysis.snRatios.A[0]).toBeGreaterThan(analysis.snRatios.A[1])
    })

    test('should calculate correct S/N ratio for smaller-is-better', () => {
      const taguchi = new Taguchi({
        type: 'L4',
        factors: {
          A: [1, 2],
          B: [1, 2],
        },
        snRatioType: SNRatioType.SMALLER_IS_BETTER,
      })

      const results: ExperimentResult[] = [
        { factors: { A: 1, B: 1 }, result: 5 },
        { factors: { A: 1, B: 2 }, result: 4 },
        { factors: { A: 2, B: 1 }, result: 8 },
        { factors: { A: 2, B: 2 }, result: 7 },
      ]

      const analysis = taguchi.analyzeResults(results)
      const EPSILON = 1e-10

      const expectedSN1 = -10 * Math.log10(Math.max((5 * 5 + 4 * 4) / 2, EPSILON))
      const expectedSN2 = -10 * Math.log10(Math.max((8 * 8 + 7 * 7) / 2, EPSILON))

      expect(analysis.snRatios.A[0]).toBeCloseTo(expectedSN1, 1)
      expect(analysis.snRatios.A[1]).toBeCloseTo(expectedSN2, 1)
      expect(analysis.snRatios.A[0]).toBeGreaterThan(analysis.snRatios.A[1])
    })

    test('should calculate correct S/N ratio for nominal-is-best', () => {
      const taguchi = new Taguchi({
        type: 'L4',
        factors: {
          A: [1, 2],
          B: [1, 2],
        },
        snRatioType: SNRatioType.NOMINAL_IS_BEST,
        targetValue: 10,
      })

      const results: ExperimentResult[] = [
        { factors: { A: 1, B: 1 }, result: 9 },
        { factors: { A: 1, B: 2 }, result: 11 },
        { factors: { A: 2, B: 1 }, result: 8 },
        { factors: { A: 2, B: 2 }, result: 13 },
      ]

      const analysis = taguchi.analyzeResults(results)
      const EPSILON = 1e-10

      const msd1 = Math.max(((9 - 10) ** 2 + (11 - 10) ** 2) / 2, EPSILON)
      const msd2 = Math.max(((8 - 10) ** 2 + (13 - 10) ** 2) / 2, EPSILON)
      const expectedSN1 = -10 * Math.log10(msd1)
      const expectedSN2 = -10 * Math.log10(msd2)

      expect(analysis.snRatios.A[0]).toBeCloseTo(expectedSN1, 1)
      expect(analysis.snRatios.A[1]).toBeCloseTo(expectedSN2, 1)
      expect(analysis.snRatios.A[0]).toBeGreaterThan(analysis.snRatios.A[1])
    })
  })

  test('should handle a complex L9 experiment with three factors', () => {
    const taguchi = new Taguchi({
      type: 'L9',
      factors: {
        A: [1, 2, 3],
        B: [1, 2, 3],
        C: [1, 2, 3],
      },
      snRatioType: SNRatioType.LARGER_IS_BETTER,
    })

    const experiments = taguchi.generateExperiments()
    expect(experiments).toHaveLength(9)

    const results: ExperimentResult[] = experiments.map((exp) => ({
      factors: exp,
      result: exp.A * 2 + exp.B + exp.C,
    }))

    const analysis = taguchi.analyzeResults(results)
    expect(analysis.optimalLevels.A).toBe(2)
    expect(analysis.optimalLevels.B).toBe(2)
    expect(analysis.optimalLevels.C).toBe(2)
  })

  describe('Advanced Statistical Analysis', () => {
    test('should require target value for nominal-is-best', () => {
      expect(
        () =>
          new Taguchi({
            type: 'L4',
            factors: { A: [1, 2], B: [1, 2] },
            snRatioType: SNRatioType.NOMINAL_IS_BEST,
          })
      ).toThrow('Target value must be specified')
    })

    test('should pool insignificant factors', () => {
      const taguchi = new Taguchi({
        type: 'L4',
        factors: {
          A: [1, 2],
          B: [1, 2],
        },
        snRatioType: SNRatioType.LARGER_IS_BETTER,
        poolingThreshold: 2,
      })

      const results: ExperimentResult[] = [
        { factors: { A: 1, B: 1 }, result: 100.8 },
        { factors: { A: 1, B: 2 }, result: 100.2 },
        { factors: { A: 2, B: 1 }, result: 199.7 },
        { factors: { A: 2, B: 2 }, result: 200.3 },
      ]

      const analysis = taguchi.analyzeResults(results)

      const a1Mean = (100.8 + 100.2) / 2
      const a2Mean = (199.7 + 200.3) / 2
      const b1Mean = (100.8 + 199.7) / 2
      const b2Mean = (100.2 + 200.3) / 2
      const grandMean = (100.8 + 100.2 + 199.7 + 200.3) / 4

      const ssA = 2 * ((a1Mean - grandMean) ** 2 + (a2Mean - grandMean) ** 2)
      const ssB = 2 * ((b1Mean - grandMean) ** 2 + (b2Mean - grandMean) ** 2)

      expect(ssA).toBeGreaterThan(ssB * 100)

      expect(analysis.variance.B.isPooled).toBe(true)
      expect(analysis.error?.pooledFactors).toContain('B')
      expect(analysis.variance.A.isPooled).toBe(false)
      expect(analysis.error?.pooledFactors).not.toContain('A')

      expect(analysis.variance.A.f).toBeGreaterThan(2)
      expect(analysis.variance.B.f).toBe(0)

      expect(analysis.variance.B.contribution).toBe(0)
    })

    test('should calculate confidence intervals', () => {
      const taguchi = new Taguchi({
        type: 'L4',
        factors: { A: [1, 2], B: [1, 2] },
        snRatioType: SNRatioType.LARGER_IS_BETTER,
      })

      const results: ExperimentResult[] = [
        { factors: { A: 1, B: 1 }, result: 60 },
        { factors: { A: 1, B: 2 }, result: 65 },
        { factors: { A: 2, B: 1 }, result: 96 },
        { factors: { A: 2, B: 2 }, result: 90 },
      ]

      const analysis = taguchi.analyzeResults(results)

      expect(analysis.variance.A.confidenceInterval).toBeDefined()
      const [lower, upper] = analysis.variance.A.confidenceInterval!
      expect(-lower).toBeCloseTo(upper, 5)

      expect(lower).toBeLessThan(0)
      expect(upper).toBeGreaterThan(0)
      expect(Number.isFinite(lower)).toBe(true)
      expect(Number.isFinite(upper)).toBe(true)
    })

    test('should select correct optimal levels based on S/N ratio type', () => {
      const largerBetter = new Taguchi({
        type: 'L4',
        factors: { A: [1, 2] },
        snRatioType: SNRatioType.LARGER_IS_BETTER,
      })

      const smallerBetter = new Taguchi({
        type: 'L4',
        factors: { A: [1, 2] },
        snRatioType: SNRatioType.SMALLER_IS_BETTER,
      })

      const results: ExperimentResult[] = [
        { factors: { A: 1 }, result: 10 },
        { factors: { A: 1 }, result: 12 },
        { factors: { A: 2 }, result: 20 },
        { factors: { A: 2 }, result: 22 },
      ]

      const analysisLarger = largerBetter.analyzeResults(results)
      const analysisSmaller = smallerBetter.analyzeResults(results)

      expect(analysisLarger.optimalLevels.A).toBe(1)
      expect(analysisSmaller.optimalLevels.A).toBe(0)
    })
  })
})
