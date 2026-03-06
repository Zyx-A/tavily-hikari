export type QuotaSliderField = 'hourlyAnyLimit' | 'hourlyLimit' | 'dailyLimit' | 'monthlyLimit'

export interface QuotaSliderSeed {
  field: QuotaSliderField
  used: number
  initialLimit: number
  stableMax: number
  stages: number[]
}

const QUOTA_SLIDER_DEFAULT_BASELINES: Readonly<Record<QuotaSliderField, number>> = {
  hourlyAnyLimit: 1_000,
  hourlyLimit: 1_000,
  dailyLimit: 10_000,
  monthlyLimit: 100_000,
}

const QUOTA_STAGE_MULTIPLIERS = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10] as const

function coerceQuotaInteger(value: number, minimum: number): number {
  if (!Number.isFinite(value)) return minimum
  return Math.max(minimum, Math.trunc(value))
}

export function getQuotaSliderDefaultBaseline(field: QuotaSliderField): number {
  return QUOTA_SLIDER_DEFAULT_BASELINES[field]
}

export function parseQuotaDraftValue(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed)) return coerceQuotaInteger(fallback, 1)
  return coerceQuotaInteger(parsed, 1)
}

export function resolveQuotaSliderStableMax(field: QuotaSliderField, initialLimit: number, used: number): number {
  return Math.max(
    1,
    getQuotaSliderDefaultBaseline(field),
    coerceQuotaInteger(initialLimit, 1),
    coerceQuotaInteger(used, 0),
  )
}

export function buildQuotaSliderStages(stableMax: number, extras: number[] = []): number[] {
  const resolvedMax = coerceQuotaInteger(stableMax, 1)
  const stages = new Set<number>([1])

  for (let exp = 0; exp <= 12; exp += 1) {
    const base = 10 ** exp
    if (base > resolvedMax) break
    for (const multiplier of QUOTA_STAGE_MULTIPLIERS) {
      const value = Math.round(multiplier * base)
      if (value <= resolvedMax) {
        stages.add(value)
      }
    }
  }

  for (const extra of extras) {
    const value = coerceQuotaInteger(extra, 1)
    if (value <= resolvedMax) {
      stages.add(value)
    }
  }

  stages.add(resolvedMax)

  return [...stages].sort((left, right) => left - right)
}

export function createQuotaSliderSeed(
  field: QuotaSliderField,
  used: number,
  initialLimit: number,
): QuotaSliderSeed {
  const resolvedUsed = coerceQuotaInteger(used, 0)
  const resolvedInitialLimit = coerceQuotaInteger(initialLimit, 1)
  const stableMax = resolveQuotaSliderStableMax(field, resolvedInitialLimit, resolvedUsed)
  return {
    field,
    used: resolvedUsed,
    initialLimit: resolvedInitialLimit,
    stableMax,
    stages: buildQuotaSliderStages(stableMax, [resolvedInitialLimit, resolvedUsed]),
  }
}

export function findNearestQuotaSliderStageIndex(stages: readonly number[], value: number): number {
  if (stages.length === 0) return 0

  const resolvedValue = coerceQuotaInteger(value, 1)
  let bestIndex = 0
  let bestDistance = Number.POSITIVE_INFINITY

  for (const [index, stage] of stages.entries()) {
    const distance = Math.abs(stage - resolvedValue)
    if (distance < bestDistance || (distance === bestDistance && stage > stages[bestIndex])) {
      bestIndex = index
      bestDistance = distance
    }
  }

  return bestIndex
}

export function getQuotaSliderStagePosition(stages: readonly number[], value: number): number {
  if (stages.length <= 1) return 0

  const resolvedValue = coerceQuotaInteger(value, 0)
  if (resolvedValue <= stages[0]) return 0

  for (let index = 0; index < stages.length - 1; index += 1) {
    const left = stages[index] ?? 0
    const right = stages[index + 1] ?? left

    if (resolvedValue <= right) {
      if (right <= left) return index + 1
      return index + (resolvedValue - left) / (right - left)
    }
  }

  return stages.length - 1
}

export function getQuotaSliderStageValue(stages: readonly number[], index: number): number {
  if (stages.length === 0) return 1
  const resolvedIndex = Math.min(stages.length - 1, Math.max(0, coerceQuotaInteger(index, 0)))
  return stages[resolvedIndex] ?? stages[stages.length - 1] ?? 1
}

function toQuotaRatioPercent(stages: readonly number[], value: number): number {
  if (stages.length <= 1) return coerceQuotaInteger(value, 0) > 0 ? 100 : 0
  return Math.min(100, Math.max(0, (getQuotaSliderStagePosition(stages, value) / (stages.length - 1)) * 100))
}

export function buildQuotaSliderTrack(stages: readonly number[], used: number, draftLimit: number): string {
  const usedRatio = toQuotaRatioPercent(stages, used)
  const draftRatio = toQuotaRatioPercent(stages, draftLimit)
  const start = Math.min(usedRatio, draftRatio)
  const end = Math.max(usedRatio, draftRatio)
  return `linear-gradient(to right, hsl(var(--warning) / 0.34) 0% ${start}%, hsl(var(--primary) / 0.44) ${start}% ${end}%, hsl(var(--muted) / 0.5) ${end}% 100%)`
}
