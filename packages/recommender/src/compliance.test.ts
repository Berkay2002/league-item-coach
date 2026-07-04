import { describe, expect, test } from 'bun:test'

import {
  assertRecommendationOutputAllowed,
  validateRecommendationOutput,
} from './compliance'

describe('recommendation output compliance guard', () => {
  test('allows itemization explanation text', () => {
    const result = validateRecommendationOutput({
      targetItem: 'Maw of Malmortius',
      explanation:
        'Build magic resist now because the strongest threat is magic damage.',
      learningRule:
        'When the main threat is magic damage, defensive damage items can keep your build on track.',
    })

    expect(result.allowed).toBe(true)
    expect(result.violations).toEqual([])
  })

  test.each([
    ['macro-advice', 'Push the wave before recall.'],
    ['cooldown-timer', 'Track Lux Q cooldown timer before fighting.'],
    ['summoner-spell-timer', 'Start a Flash timer after Ahri uses it.'],
    ['ultimate-timer', 'Malphite ult is down for the next fight.'],
    ['jungle-timer', 'Red buff respawns at 7:20.'],
    ['enemy-position-tracking', 'The enemy jungler was last seen bot side.'],
    ['objective-call', 'Take Baron now.'],
    ['objective-call', 'Take Rift Herald now.'],
    ['objective-call', 'Take tower after recall.'],
    ['objective-call', 'Take inhibitor now.'],
  ])('rejects %s', (category, text) => {
    const result = validateRecommendationOutput(text)

    expect(result.allowed).toBe(false)
    expect(result.violations).toContainEqual(
      expect.objectContaining({ category }),
    )
  })

  test('scans nested recommendation output and reports the field path', () => {
    const result = validateRecommendationOutput({
      recommendation: {
        explanation: ['Buy armor now.', 'Contest dragon after recall.'],
      },
    })

    expect(result.allowed).toBe(false)
    expect(result.violations[0]).toEqual(
      expect.objectContaining({
        category: 'objective-call',
        path: '$.recommendation.explanation[1]',
      }),
    )
  })

  test('throws with matched categories for hard boundaries', () => {
    expect(() =>
      assertRecommendationOutputAllowed({
        explanation: 'Track enemy location before starting Baron.',
      }),
    ).toThrow(/enemy-position-tracking/)
  })
})
