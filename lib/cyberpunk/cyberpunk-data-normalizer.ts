import type {
  CyberpunkBodyZoneKey,
  CyberpunkSheetExtension,
  CyberpunkAugmentation,
  CyberpunkTier,
} from '@/types/cyberpunk'
import {
  CYBERPUNK_TIER_SLOTS,
  CYBERPUNK_TIER_EQUIP_SLOTS,
} from './tier-constants'

/**
 * 标准化部位键名 (将历史 arms/legs 统一收敛为 upper_limb/lower_limb)
 */
export function canonicalZoneKey(zone: string): CyberpunkBodyZoneKey {
  if (zone === 'arms') return 'upper_limb'
  if (zone === 'legs') return 'lower_limb'
  if (
    zone === 'head' ||
    zone === 'torso' ||
    zone === 'upper_limb' ||
    zone === 'lower_limb' ||
    zone === 'external'
  ) {
    return zone as CyberpunkBodyZoneKey
  }
  return 'torso'
}

/**
 * 提取指定身体部位的已装配义体列表（兼容历史 augmentations 对象与新 zones 结构）
 */
export function getZoneAugmentations(
  data: CyberpunkSheetExtension | undefined,
  zone: CyberpunkBodyZoneKey
): CyberpunkAugmentation[] {
  if (!data) return []
  const cZone = canonicalZoneKey(zone)

  // 1. 从规范 zones 读取
  if (data.zones?.[cZone]?.augmentations) {
    return data.zones[cZone]!.augmentations
  }

  // 2. 兼容历史别名读取 (arms / legs)
  if (cZone === 'upper_limb' && data.zones?.arms?.augmentations) {
    return data.zones.arms.augmentations
  }
  if (cZone === 'lower_limb' && data.zones?.legs?.augmentations) {
    return data.zones.legs.augmentations
  }

  // 3. 兼容历史顶层 augmentations 字典
  const legacyAugs = (data as any).augmentations
  if (legacyAugs && typeof legacyAugs === 'object') {
    if (legacyAugs[cZone]) return legacyAugs[cZone]
    if (cZone === 'upper_limb' && legacyAugs.arms) return legacyAugs.arms
    if (cZone === 'lower_limb' && legacyAugs.legs) return legacyAugs.legs
  }

  return []
}

/**
 * 获取指定部位的插槽容量上限（位阶基础槽位 + 自定义调整）
 */
export function getZoneSlotLimit(
  data: CyberpunkSheetExtension | undefined,
  zone: CyberpunkBodyZoneKey | 'external'
): number {
  const currentTier: CyberpunkTier = data?.tier || 'T1'
  if (zone === 'external') {
    const baseLimit = CYBERPUNK_TIER_EQUIP_SLOTS[currentTier] ?? 2
    return data?.zoneSlotLimits?.external ?? baseLimit
  }

  const cZone = canonicalZoneKey(zone)
  const baseSlots = CYBERPUNK_TIER_SLOTS[currentTier] ?? 2
  return (
    data?.zoneSlotLimits?.[cZone] ??
    (cZone === 'upper_limb' ? data?.zoneSlotLimits?.arms : undefined) ??
    (cZone === 'lower_limb' ? data?.zoneSlotLimits?.legs : undefined) ??
    baseSlots
  )
}

/**
 * 计算指定部位已占用的槽位数
 */
export function getUsedZoneSlots(
  data: CyberpunkSheetExtension | undefined,
  zone: CyberpunkBodyZoneKey
): number {
  const augs = getZoneAugmentations(data, zone)
  return augs.reduce((sum, aug) => sum + (aug.slotCost ?? aug.slots ?? 1), 0)
}

/**
 * 完整数据正规化（归一化为纯净的 zones 结构，消除脏数据）
 */
export function normalizeCyberpunkData(
  data?: Partial<CyberpunkSheetExtension>
): CyberpunkSheetExtension {
  const safeData = data || {}
  const tier: CyberpunkTier = safeData.tier || 'T1'

  const headAugs = getZoneAugmentations(safeData as CyberpunkSheetExtension, 'head')
  const torsoAugs = getZoneAugmentations(safeData as CyberpunkSheetExtension, 'torso')
  const upperLimbAugs = getZoneAugmentations(safeData as CyberpunkSheetExtension, 'upper_limb')
  const lowerLimbAugs = getZoneAugmentations(safeData as CyberpunkSheetExtension, 'lower_limb')

  return {
    ...safeData,
    tier,
    credits: typeof safeData.credits === 'number' ? safeData.credits : 100,
    streetCred: typeof safeData.streetCred === 'number' ? safeData.streetCred : 0,
    zones: {
      head: { augmentations: headAugs },
      torso: { augmentations: torsoAugs },
      upper_limb: { augmentations: upperLimbAugs },
      lower_limb: { augmentations: lowerLimbAugs },
    },
    zoneSlotLimits: {
      head: safeData.zoneSlotLimits?.head ?? CYBERPUNK_TIER_SLOTS[tier],
      torso: safeData.zoneSlotLimits?.torso ?? CYBERPUNK_TIER_SLOTS[tier],
      upper_limb: safeData.zoneSlotLimits?.upper_limb ?? safeData.zoneSlotLimits?.arms ?? CYBERPUNK_TIER_SLOTS[tier],
      lower_limb: safeData.zoneSlotLimits?.lower_limb ?? safeData.zoneSlotLimits?.legs ?? CYBERPUNK_TIER_SLOTS[tier],
      external: safeData.zoneSlotLimits?.external ?? CYBERPUNK_TIER_EQUIP_SLOTS[tier],
    },
    externalGear: safeData.externalGear || [],
    consumables: safeData.consumables || [],
  }
}
