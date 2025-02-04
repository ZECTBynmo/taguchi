import { expect, test, describe } from 'bun:test'
import { Taguchi, type ExperimentResult } from './index'

describe('Taguchi', () => {
  test('should create a new Taguchi instance', () => {
    const taguchi = new Taguchi('Test Experiment')
    expect(taguchi).toBeInstanceOf(Taguchi)
  })

  test('should add factors with levels', () => {
    const taguchi = new Taguchi('Manufacturing Process')
    taguchi.addFactor('Temperature', [100, 150, 200])
    taguchi.addFactor('Pressure', [50, 75, 100])
    expect(() => taguchi.generateExperiments()).toThrow('Orthogonal array type must be set')
  })

  test('should throw error when adding factor with insufficient levels', () => {
    const taguchi = new Taguchi('Test')
    expect(() => taguchi.addFactor('Invalid', [1])).toThrow('must have at least 2 levels')
  })

  test('should throw error when using incompatible array type', () => {
    const taguchi = new Taguchi('Incompatible Test')
    taguchi.addFactor('A', [1, 2, 3])
    taguchi.addFactor('B', [1, 2, 3])
    expect(() => taguchi.setOrthogonalArrayType('L4')).toThrow('L4 can only accommodate 2 levels')
  })

  test('should throw error when too many factors for array type', () => {
    const taguchi = new Taguchi('Too Many Factors')
    taguchi.addFactor('A', [1, 2])
    taguchi.addFactor('B', [1, 2])
    taguchi.addFactor('C', [1, 2])
    taguchi.addFactor('D', [1, 2])
    expect(() => taguchi.setOrthogonalArrayType('L4')).toThrow('L4 can only accommodate 3 factors')
  })

  test('should generate experiments using L4 array', () => {
    const taguchi = new Taguchi('L4 Test')
    taguchi.addFactor('Material', ['Steel', 'Aluminum'])
    taguchi.addFactor('Temperature', [100, 200])
    taguchi.addFactor('Time', [30, 60])

    taguchi.setOrthogonalArrayType('L4')

    const experiments = taguchi.generateExperiments()
    expect(experiments).toHaveLength(4)
    expect(experiments[0]).toEqual({
      Material: 'Steel',
      Temperature: 100,
      Time: 30,
    })
  })

  test('should analyze results and find optimal levels', () => {
    const taguchi = new Taguchi('Quality Optimization')
    taguchi.addFactor('Speed', [1000, 1500])
    taguchi.addFactor('Feed', [0.1, 0.2])

    taguchi.setOrthogonalArrayType('L4')

    const experiments = taguchi.generateExperiments()
    const results: ExperimentResult[] = [
      { factors: experiments[0], response: 95 },
      { factors: experiments[1], response: 82 },
      { factors: experiments[2], response: 78 },
      { factors: experiments[3], response: 85 },
    ]

    const analysis = taguchi.analyzeResults(results)
    expect(analysis).toHaveProperty('Speed')
    expect(analysis).toHaveProperty('Feed')
    expect(analysis.Speed).toBe(0)
    expect(analysis.Feed).toBe(0)
  })

  test('should handle a complex L9 experiment', () => {
    const taguchi = new Taguchi('Complex Manufacturing')
    taguchi.addFactor('Temperature', [150, 175, 200])
    taguchi.addFactor('Time', [30, 45, 60])
    taguchi.addFactor('Pressure', [10, 15, 20])

    taguchi.setOrthogonalArrayType('L9')

    const experiments = taguchi.generateExperiments()
    expect(experiments).toHaveLength(9)

    const mockResponse = (experiment: Record<string, any>): number => {
      return experiment.Temperature * 0.5 + experiment.Time * 0.3 + experiment.Pressure * 0.2
    }

    const results: ExperimentResult[] = experiments.map((exp) => ({
      factors: exp,
      response: mockResponse(exp),
    }))

    const analysis = taguchi.analyzeResults(results)
    expect(Object.keys(analysis)).toHaveLength(3)
  })
})
