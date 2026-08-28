export type CharacterLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type CharacterTier = "1" | "2" | "3" | "4"

export const CHARACTER_TIER_LEVEL_RANGES = {
  "1": { minLevel: 1, maxLevel: 1 },
  "2": { minLevel: 2, maxLevel: 4 },
  "3": { minLevel: 5, maxLevel: 7 },
  "4": { minLevel: 8, maxLevel: 10 },
} as const satisfies Record<
  CharacterTier,
  { minLevel: CharacterLevel; maxLevel: CharacterLevel }
>

export function parseCharacterLevel(value: unknown): CharacterLevel | undefined {
  const parsed = typeof value === "string"
    ? value.trim() === "" ? undefined : Number(value)
    : value

  if (
    typeof parsed !== "number"
    || !Number.isInteger(parsed)
    || parsed < 1
    || parsed > 10
  ) {
    return undefined
  }

  return parsed as CharacterLevel
}

export function getCharacterTier(value: unknown): CharacterTier | undefined {
  const level = parseCharacterLevel(value)
  if (level === undefined) return undefined

  return (Object.entries(CHARACTER_TIER_LEVEL_RANGES) as Array<[
    CharacterTier,
    { minLevel: CharacterLevel; maxLevel: CharacterLevel },
  ]>).find(([, range]) => level >= range.minLevel && level <= range.maxLevel)?.[0]
}

export function getCharacterTierLevelRange(tier: CharacterTier): {
  minLevel: CharacterLevel
  maxLevel: CharacterLevel
} {
  return CHARACTER_TIER_LEVEL_RANGES[tier]
}
