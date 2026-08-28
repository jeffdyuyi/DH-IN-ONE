import { describe, expect, it } from "vitest"
import {
  CHARACTER_TIER_LEVEL_RANGES,
  getCharacterTier,
  getCharacterTierLevelRange,
  parseCharacterLevel,
  type CharacterTier,
} from "../tiers"

describe("character progression tiers", () => {
  it.each([
    [1, "1"],
    [2, "2"],
    [3, "2"],
    [4, "2"],
    [5, "3"],
    [6, "3"],
    [7, "3"],
    [8, "4"],
    [9, "4"],
    [10, "4"],
  ] as const)("maps level %s to tier %s", (level, tier) => {
    expect(getCharacterTier(level)).toBe(tier)
  })

  it.each([
    ["1", 1],
    ["2", 2],
    ["10", 10],
    [" 5 ", 5],
  ] as const)("parses valid Character Level %j", (value, expected) => {
    expect(parseCharacterLevel(value)).toBe(expected)
  })

  it.each([
    "",
    " ",
    "abc",
    "1+1",
    0,
    11,
    -1,
    1.5,
    "2.5",
    Number.NaN,
    Number.POSITIVE_INFINITY,
    null,
    undefined,
  ])("rejects invalid Character Level %j", (value) => {
    expect(parseCharacterLevel(value)).toBeUndefined()
    expect(getCharacterTier(value)).toBeUndefined()
  })

  it("declares contiguous non-overlapping ranges covering levels 1 through 10", () => {
    const tiers = Object.keys(CHARACTER_TIER_LEVEL_RANGES) as CharacterTier[]
    const coveredLevels = tiers.flatMap((tier) => {
      const range = getCharacterTierLevelRange(tier)
      return Array.from(
        { length: range.maxLevel - range.minLevel + 1 },
        (_, index) => range.minLevel + index,
      )
    })

    expect(tiers).toEqual(["1", "2", "3", "4"])
    expect(coveredLevels).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(new Set(coveredLevels).size).toBe(coveredLevels.length)
  })
})
