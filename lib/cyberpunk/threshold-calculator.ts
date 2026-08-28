/**
 * 爽博朋克特化伤害阈值计算器
 * 核心原则：护甲阈值作为加值（Bonus）累加，而非替换原生基准。
 */

import type { CyberpunkAugmentation, CyberpunkSheetExtension } from '@/types/cyberpunk'
import { CYBERPUNK_TORSO_TIER_THRESHOLDS, type CyberpunkTier } from './tier-constants'

export interface ArmorThresholdBonus {
  majorBonus?: number
  severeBonus?: number
}

export interface ThresholdCalculationResult {
  nativeBase: { major: number; severe: number }
  torsoTierBonus: { major: number; severe: number }
  augmentationsBonus: { major: number; severe: number }
  armorBonus: { major: number; severe: number }
  totalMajor: number
  totalSevere: number
  massiveThreshold: number // 严重阈值 * 2
}

/**
 * 计算爽博朋克角色的伤害阈值
 * @param cyberpunkData 爽博朋克扩展数据
 * @param armorBonus 护甲提供的阈值加值（默认为 0/0）
 */
export function calculateCyberpunkThresholds(
  cyberpunkData?: Partial<CyberpunkSheetExtension>,
  armorBonus: ArmorThresholdBonus = { majorBonus: 0, severeBonus: 0 }
): ThresholdCalculationResult {
  const safeData = cyberpunkData || {}

  // 1. 原生基准（检查非法改造中是否切除肺部）
  const isLungHarvested =
    safeData.illegalModifications?.enabled &&
    safeData.illegalModifications.harvestedOrgans?.includes('lung')

  const nativeBase = {
    major: isLungHarvested ? 4 : 5,
    severe: isLungHarvested ? 8 : 10,
  }

  // 2. 躯干位阶加成
  const tier: CyberpunkTier = (safeData.tier as CyberpunkTier) || 'T1'
  const torsoTierBonus = CYBERPUNK_TORSO_TIER_THRESHOLDS[tier] || { major: 1, severe: 2 }

  // 3. 所有身体大区义体元件加成累加
  let augMajorBonus = 0
  let augSevereBonus = 0

  const allAugs: CyberpunkAugmentation[] = [
    ...(safeData.zones?.head?.augmentations || []),
    ...(safeData.zones?.torso?.augmentations || []),
    ...(safeData.zones?.upper_limb?.augmentations || []),
    ...(safeData.zones?.lower_limb?.augmentations || []),
  ]

  for (const aug of allAugs) {
    if (aug && aug.thresholdBonus) {
      if (typeof aug.thresholdBonus.major === 'number' && !isNaN(aug.thresholdBonus.major)) {
        augMajorBonus += aug.thresholdBonus.major
      }
      if (typeof aug.thresholdBonus.severe === 'number' && !isNaN(aug.thresholdBonus.severe)) {
        augSevereBonus += aug.thresholdBonus.severe
      }
    }
  }

  const augmentationsBonus = {
    major: augMajorBonus,
    severe: augSevereBonus,
  }

  // 4. 护甲加值（支持正负值与0）
  const validatedArmorBonus = {
    major: Number(armorBonus.majorBonus) || 0,
    severe: Number(armorBonus.severeBonus) || 0,
  }

  // 5. 累加总阈值
  const totalMajor = Math.max(
    1,
    nativeBase.major + torsoTierBonus.major + augmentationsBonus.major + validatedArmorBonus.major
  )
  const totalSevere = Math.max(
    totalMajor + 1,
    nativeBase.severe + torsoTierBonus.severe + augmentationsBonus.severe + validatedArmorBonus.severe
  )

  return {
    nativeBase,
    torsoTierBonus,
    augmentationsBonus,
    armorBonus: validatedArmorBonus,
    totalMajor,
    totalSevere,
    massiveThreshold: totalSevere * 2,
  }
}
