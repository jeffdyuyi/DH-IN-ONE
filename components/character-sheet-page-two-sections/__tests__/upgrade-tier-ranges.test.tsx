import { describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DomainCardSelector } from "@/components/upgrade-popover/domain-card-selector"
import { defaultSheetData } from "@/lib/default-sheet-data"
import {
  UPGRADE_BAND_CHARACTER_TIERS,
  getUpgradeBandTitle,
  getUpgradeOptions,
} from "@/data/list/upgrade"
import type { CharacterLevel } from "@/character/progression/tiers"

describe("upgrade band Character Tier ranges", () => {
  it("maps legacy Upgrade Band keys to Character Tiers without renaming them", () => {
    expect(UPGRADE_BAND_CHARACTER_TIERS).toEqual({
      tier1: "2",
      tier2: "3",
      tier3: "4",
    })
  })

  it("derives unchanged headings and option level-cap copy", () => {
    expect([
      getUpgradeBandTitle("tier1"),
      getUpgradeBandTitle("tier2"),
      getUpgradeBandTitle("tier3"),
    ]).toEqual([
      "T2 等级 2-4",
      "T3 等级 5-7",
      "T4 等级 8-10",
    ])

    expect([
      getUpgradeOptions("tier1")[4].label,
      getUpgradeOptions("tier2")[4].label,
      getUpgradeOptions("tier3")[4].label,
    ]).toEqual([
      "选择一张不高于你当前等级(上限4级)的领域卡加入卡组。",
      "选择一张不高于你当前等级(上限7级)的领域卡加入卡组。",
      "选择一张不高于你当前等级(上限10级)的领域卡加入卡组。",
    ])
  })

  it.each([
    { currentLevel: "3", maxLevel: 4, expectedCap: 3 },
    { currentLevel: "9", maxLevel: 7, expectedCap: 7 },
    { currentLevel: "10", maxLevel: 10, expectedCap: 10 },
    { currentLevel: "", maxLevel: 4, expectedCap: 4 },
    { currentLevel: "invalid", maxLevel: 7, expectedCap: 7 },
  ] as const)(
    "filters domain cards through level $expectedCap for current level $currentLevel and band cap $maxLevel",
    async ({ currentLevel, maxLevel, expectedCap }) => {
      const user = userEvent.setup()
      const onOpenModal = vi.fn()
      render(
        <DomainCardSelector
          formData={{ ...defaultSheetData, level: currentLevel }}
          maxLevel={maxLevel as CharacterLevel}
          onOpenModal={onOpenModal}
        />,
      )

      await user.click(screen.getByRole("button", { name: "选择领域卡" }))

      expect(onOpenModal).toHaveBeenCalledWith(
        5,
        Array.from({ length: expectedCap }, (_, index) => String(index + 1)),
      )
    },
  )
})
