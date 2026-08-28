import type { UpgradeAutomationMetadata } from "@/automation/core/types"
import {
  getCharacterTierLevelRange,
  parseCharacterLevel,
  type CharacterTier,
} from "@/character/progression/tiers"

export interface UpgradeOptionData {
  label: string
  doubleBox: boolean
  boxCount: number
  automation: UpgradeAutomationMetadata
}

export type UpgradeBandKey = "tier1" | "tier2" | "tier3"

export const UPGRADE_BAND_CHARACTER_TIERS = {
  tier1: "2",
  tier2: "3",
  tier3: "4",
} as const satisfies Record<UpgradeBandKey, CharacterTier>

export function isUpgradeBandKey(value: string): value is UpgradeBandKey {
  return value === "tier1" || value === "tier2" || value === "tier3"
}

export function getUpgradeBandLevelRange(upgradeBandKey: UpgradeBandKey) {
  return getCharacterTierLevelRange(UPGRADE_BAND_CHARACTER_TIERS[upgradeBandKey])
}

export function getUpgradeBandTitle(upgradeBandKey: UpgradeBandKey): string {
  const characterTier = UPGRADE_BAND_CHARACTER_TIERS[upgradeBandKey]
  const { minLevel, maxLevel } = getUpgradeBandLevelRange(upgradeBandKey)
  return `T${characterTier} 等级 ${minLevel}-${maxLevel}`
}

export function getUpgradeDomainCardLevelFilter(
  upgradeBandKey: UpgradeBandKey,
  currentLevelValue: unknown,
): string[] {
  const { maxLevel } = getUpgradeBandLevelRange(upgradeBandKey)
  const currentLevel = parseCharacterLevel(currentLevelValue)
  const targetLevel = currentLevel === undefined
    ? maxLevel
    : Math.min(currentLevel, maxLevel)

  return Array.from({ length: targetLevel }, (_, index) => String(index + 1))
}

// 升级选项数据
export const upgradeOptionsData = {
  // 基础升级选项（所有职业通用）
  baseUpgrades: [
    { label: "两项未升级的角色属性+1，然后将该属性标记为已升级。", doubleBox: false, boxCount: 3, automation: { kind: "attributeSelection", count: 2 } },
    { label: "永久增加一个生命槽。", doubleBox: false, boxCount: 2, automation: { kind: "fixedTarget", target: "hpMax" } },
    { label: "永久增加一个压力槽。", doubleBox: false, boxCount: 2, automation: { kind: "fixedTarget", target: "stressMax" } },
    { label: "选择两项经历获得额外+1。", doubleBox: false, boxCount: 1, automation: { kind: "experienceSelection", count: 2 } },
    { label: "选择一张不高于你当前等级{LEVEL_CAP}的领域卡加入卡组。", doubleBox: false, boxCount: 1, automation: { kind: "none" } },
    { label: "获得闪避值+1。", doubleBox: false, boxCount: 1, automation: { kind: "fixedTarget", target: "evasion" } },
  ],

  // 特定等级升级选项
  tierSpecificUpgrades: {
    tier1: [
    ],
    tier2: [
      { label: "升级你的子职业，你不可再使用T3级别的“兼职”选项。", doubleBox: false, boxCount: 1, automation: { kind: "none" } },
      { label: "(同时标记两格) 获得熟练度+1。", doubleBox: true, boxCount: 2, automation: { kind: "fixedTarget", target: "proficiency" } },
      { label: "(同时标记两格) 兼职：获得一个额外的职业、子职业和一个领域。你不可再使用T3级别的“升级子职业”选项。也不可使用其他任何“兼职”选项。", doubleBox: true, boxCount: 2, automation: { kind: "none" } },
    ],
    tier3: [
      { label: "升级你的子职业，你不可再使用T4级别的“兼职”选项。", doubleBox: false, boxCount: 1, automation: { kind: "none" } },
      { label: "(同时标记两格) 获得熟练度+1。", doubleBox: true, boxCount: 2, automation: { kind: "fixedTarget", target: "proficiency" } },
      { label: "(同时标记两格) 兼职：获得一个额外的职业、子职业和一个领域。你不可再使用T4级别的“升级子职业”选项。也不可使用其他任何“兼职”选项。", doubleBox: true, boxCount: 2, automation: { kind: "none" } },
    ],
  },
} satisfies {
  baseUpgrades: UpgradeOptionData[]
  tierSpecificUpgrades: Record<UpgradeBandKey, UpgradeOptionData[]>
}

export function getUpgradeOptions(upgradeBandKey: UpgradeBandKey): UpgradeOptionData[] {
  const { maxLevel } = getUpgradeBandLevelRange(upgradeBandKey)
  const levelCap = `(上限${maxLevel}级)`
  const baseUpgrades = upgradeOptionsData.baseUpgrades.map(option => ({
    ...option,
    label: option.label.replace("{LEVEL_CAP}", levelCap),
  }))

  return [...baseUpgrades, ...upgradeOptionsData.tierSpecificUpgrades[upgradeBandKey]]
}
