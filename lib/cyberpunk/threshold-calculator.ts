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

/**
 * 标准化护甲阈值加成
 * 匕首心核心规则中，官方护甲卡面印制的阈值包含 5/11 基础基准。
 * 当作为加成累加到爽博朋克的原生 5/10 基准时，需隐性按 -5 / -11 进行换算：
 * 例如卡面数值为 6/13 时，实际提供的净加成为：
 *   重度加成 = 6 - 5 = +1
 *   严重加成 = 13 - 11 = +2
 */
export function normalizeArmorThresholdBonus(
  rawMinor?: number,
  rawMajor?: number
): { majorBonus: number; severeBonus: number; rawMinor: number; rawMajor: number; isImplicitConverted: boolean } {
  const numMinor = Number(rawMinor) || 0
  const numMajor = Number(rawMajor) || 0

  // 若数值达到核心护甲基线（minor >= 5 或 major >= 11），进行 -5/-11 隐性换算
  const isImplicitConverted = numMinor >= 5 || numMajor >= 11
  const majorBonus = isImplicitConverted ? Math.max(0, numMinor - 5) : numMinor
  const severeBonus = isImplicitConverted ? Math.max(0, numMajor - 11) : numMajor

  return { majorBonus, severeBonus, rawMinor: numMinor, rawMajor: numMajor, isImplicitConverted }
}

export interface ThresholdCalculationResult {
  nativeBase: { major: number; severe: number }
  torsoTierBonus: { major: number; severe: number }
  augmentationsBonus: { major: number; severe: number }
  armorBonus: { major: number; severe: number }
  totalMajor: number
  totalSevere: number
  massiveThreshold: number // 严重阈值 * 2
  rawArmorThresholds?: { minor: number; major: number }
  isImplicitArmorConverted?: boolean
}

/**
 * 计算爽博朋克角色的伤害阈值
 * @param cyberpunkData 爽博朋克扩展数据
 * @param armorBonus 护甲提供的阈值加值（支持直接加值或核心卡面绝对阈值）
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

  // 4. 护甲加值隐性换算（核心护甲卡面 -5/-11 处理）
  const normalizedArmor = normalizeArmorThresholdBonus(armorBonus.majorBonus, armorBonus.severeBonus)
  const validatedArmorBonus = {
    major: normalizedArmor.majorBonus,
    severe: normalizedArmor.severeBonus,
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
    rawArmorThresholds: { minor: normalizedArmor.rawMinor, major: normalizedArmor.rawMajor },
    isImplicitArmorConverted: normalizedArmor.isImplicitConverted,
  }
}
