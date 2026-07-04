export type ComplianceViolationCategory =
  | 'macro-advice'
  | 'cooldown-timer'
  | 'summoner-spell-timer'
  | 'ultimate-timer'
  | 'jungle-timer'
  | 'enemy-position-tracking'
  | 'objective-call'

export interface RecommendationOutputComplianceViolation {
  category: ComplianceViolationCategory
  ruleId: string
  path: string
  excerpt: string
}

export interface RecommendationOutputComplianceResult {
  allowed: boolean
  violations: RecommendationOutputComplianceViolation[]
}

interface ForbiddenOutputRule {
  category: ComplianceViolationCategory
  id: string
  pattern: RegExp
}

const forbiddenOutputRules: ForbiddenOutputRule[] = [
  {
    category: 'macro-advice',
    id: 'macro-map-movement',
    pattern:
      /\b(push (the )?wave|freeze (the )?wave|slow push|split push|roam to|rotate to|gank|ward (the )?\w+|set up vision|lane state)\b/i,
  },
  {
    category: 'cooldown-timer',
    id: 'cooldown-tracking',
    pattern:
      /\b(cooldown timer|track \w+ cooldown|spell cooldown|cooldown is (up|down)|cooldowns? (are )?(up|down))\b/i,
  },
  {
    category: 'summoner-spell-timer',
    id: 'summoner-spell-tracking',
    pattern:
      /\b(summoner spell timer|flash timer|ignite timer|teleport timer|ghost timer|cleanse timer|heal timer|barrier timer|exhaust timer|track flash|track ignite|track teleport)\b/i,
  },
  {
    category: 'ultimate-timer',
    id: 'ultimate-tracking',
    pattern:
      /\b(ultimate timer|ult timer|track (their )?ult|track (their )?ultimate|\w+ ult is (up|down)|\w+ ultimate is (up|down))\b/i,
  },
  {
    category: 'jungle-timer',
    id: 'jungle-camp-tracking',
    pattern:
      /\b(jungle timer|camp timer|red buff (timer|respawns?)|blue buff (timer|respawns?)|camp respawns?|raptors respawn|wolves respawn|gromp respawn|krugs respawn)\b/i,
  },
  {
    category: 'enemy-position-tracking',
    id: 'enemy-position-tracking',
    pattern:
      /\b(enemy position|enemy location|track enemy location|last seen|was seen|missing from|fog of war|enemy is (at|near|in)|jungler is (at|near|in))\b/i,
  },
  {
    category: 'objective-call',
    id: 'objective-call',
    pattern:
      /\b(take baron|start baron|force baron|contest baron|take dragon|start dragon|force dragon|contest dragon|take drake|contest drake|take rift herald|take herald|start herald|force herald|contest herald|take grubs|voidgrubs|take tower|take turret|take inhibitor|take nexus|push (for )?(tower|turret|inhibitor|nexus)|objective call)\b/i,
  },
]

export function validateRecommendationOutput(
  output: unknown,
): RecommendationOutputComplianceResult {
  const violations: RecommendationOutputComplianceViolation[] = []
  const seen = new WeakSet<object>()

  for (const { value, path } of readStringLeaves(output, '$', seen)) {
    for (const rule of forbiddenOutputRules) {
      if (rule.pattern.test(value)) {
        violations.push({
          category: rule.category,
          ruleId: rule.id,
          path,
          excerpt: toExcerpt(value),
        })
      }
    }
  }

  return {
    allowed: violations.length === 0,
    violations,
  }
}

export function assertRecommendationOutputAllowed(output: unknown): void {
  const result = validateRecommendationOutput(output)

  if (!result.allowed) {
    const summary = result.violations
      .map((violation) => `${violation.category} at ${violation.path}`)
      .join(', ')

    throw new Error(`Forbidden recommendation output: ${summary}`)
  }
}

function* readStringLeaves(
  value: unknown,
  path: string,
  seen: WeakSet<object>,
): Generator<{ value: string; path: string }> {
  if (typeof value === 'string') {
    yield { value, path }
    return
  }

  if (value === null || typeof value !== 'object') {
    return
  }

  if (seen.has(value)) {
    return
  }

  seen.add(value)

  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      yield* readStringLeaves(item, `${path}[${index}]`, seen)
    }
    return
  }

  for (const [key, item] of Object.entries(value)) {
    yield* readStringLeaves(item, `${path}.${key}`, seen)
  }
}

function toExcerpt(value: string): string {
  const compact = value.replace(/\s+/g, ' ').trim()

  if (compact.length <= 96) {
    return compact
  }

  return `${compact.slice(0, 93)}...`
}
