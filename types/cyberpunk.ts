/**
 * 爽博朋克：渊边行者 特化数据类型定义
 */

// 身体五大区枚举
export type CyberpunkBodyZoneKey = 'head' | 'torso' | 'arms' | 'legs' | 'external' | 'upper_limb' | 'lower_limb'

// 位阶类型
export type CyberpunkTier = 'T1' | 'T2' | 'T3' | 'T4'

// 义体类型
export type AugmentationType = 'bionic' | 'implant' | 'fashion' | 'custom'

// 单件义体/元件数据结构（开放式，支持自定义与卡牌工坊V3、官方战利品跨界直装）
export interface CyberpunkAugmentation {
  id: string
  name: string
  type?: AugmentationType
  cyberType?: string
  tier?: string
  zone: CyberpunkBodyZoneKey | string
  crossZone?: CyberpunkBodyZoneKey | string // 跨区支持
  slotCost?: number // 占用槽位数 (0, 1, 2...)
  slots?: number // 兼容槽位字段
  costCredits?: number // 改造费用 (信用点)
  restriction?: string
  effect?: string
  rulesText?: string
  description?: string
  tag?: string
  tags?: string[] // 特殊标签 (如【军规级】、【故障隐患】)
  compCost?: string
  surgCost?: string
  thresholdBonus?: {
    major: number // 重度加值
    severe: number // 严重加值
  }
  attributeBonus?: {
    strength?: number
    agility?: number
    finesse?: number
    instinct?: number
    presence?: number
    knowledge?: number
  }
  customModifiers?: Record<string, number | string> // 自定义属性/特性
}

// 消耗品数据结构
export interface CyberpunkConsumable {
  id: string
  name: string
  quantity?: number
  maxQuantity?: number
  effect?: string
  costCredits?: number
  description?: string
  used?: boolean
}

// 非法改造数据结构
export interface CyberpunkIllegalModData {
  enabled?: boolean
  harvestedOrgans?: string[]
  totalGainedCredits?: number
  customNotes?: string
  id?: string
  name?: string
  downside?: string
  bonus?: string
}

// 身体槽位组
export interface CyberpunkZoneSlotGroup {
  augmentations: CyberpunkAugmentation[]
}

// 爽博朋克车卡器特化拓展数据结构
export interface CyberpunkSheetExtension {
  tier?: CyberpunkTier
  credits?: number
  zones?: Partial<Record<CyberpunkBodyZoneKey, CyberpunkZoneSlotGroup>>
  illegalMods?: CyberpunkIllegalModData[] | CyberpunkIllegalModData
  illegalModifications?: any
  streetFame?: any
  activeEquipmentIds?: any
  consumables?: CyberpunkConsumable[]
  isLightPreview?: boolean
}
