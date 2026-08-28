import { describe, expect, it } from "vitest"
import { buildCardAutomationSnapshot } from "../snapshot"
import { makeSheet } from "./helpers"

describe("card automation snapshot progression", () => {
  it.each([
    ["1", 1, "1"],
    ["2", 2, "2"],
    ["5", 5, "3"],
    ["8", 8, "4"],
  ] as const)("derives stored level %s as level %s and Character Tier %s", (storedLevel, level, tier) => {
    expect(buildCardAutomationSnapshot(makeSheet({ level: storedLevel }))).toMatchObject({
      level,
      tier,
    })
  })

  it.each(["", "unknown", "1+1", "2.5", "0", "11"])(
    "does not expose malformed Character Level %j",
    (level) => {
      expect(buildCardAutomationSnapshot(makeSheet({ level }))).toMatchObject({
        level: undefined,
        tier: undefined,
      })
    },
  )

  it("keeps other finite numeric snapshot facts independent of Character Level parsing", () => {
    const snapshot = buildCardAutomationSnapshot(makeSheet({
      level: "unknown",
      evasion: "12.5",
    }))

    expect(snapshot).toMatchObject({
      level: undefined,
      tier: undefined,
      targetValues: { evasion: 12.5 },
    })
  })
})
