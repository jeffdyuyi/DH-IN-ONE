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
  icon?: string // 自定义正方形图标/图片URL或Base64
  image?: string // 兼容image字段
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
  icon?: string
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

// 外置装备数据结构 (武器/护甲/副手/无人机/挂载等，具有基础特性与激活双态机制)
export interface CyberpunkExternalGear {
  id: string
  name: string
  icon?: string // 自定义正方形图标
  image?: string
  tier?: string
  cyberType?: string // "外置设备", "主武器", "副武器", "护甲", etc.
  zone?: string // "主武器", "副武器", "护甲", "通用挂载", etc.
  slots?: number // 占用激活槽位 (0, 1, 2, 3... 0 代表免激活槽)
  slotCost?: number
  active: boolean // 是否已激活该装备的激活特性与转置
  restriction?: string
  feature?: string // 普通特性 (常驻生效，无需激活即可拥有)
  effect?: string // 兼容描述文本
  activeFeature?: string // 激活特性 (仅当激活并占用槽位时触发)
  description?: string
  tag?: string
  compCost?: string
  surgCost?: string
  cost?: string
  // 基础作战属性 (无需激活直接生效)
  weaponStats?: {
    trait?: string // 敏捷, 力量, 灵巧, 本能, 风度, 知识
    damage?: string // 如 d10+3
    range?: string // 近战, 邻近, 近距离, 远距离, 极远
    burden?: string // 单手, 双手, 副手
    damageType?: string // 物理, 魔法, 能量
  }
  armorStats?: {
    armorScore?: number // 基础护甲值
    majorThreshold?: number // 护甲阈值加成 (轻伤)
    severeThreshold?: number // 护甲阈值加成 (重伤)
    thresholdBonusText?: string // 如 "+1/+2"
  }
  // 激活转置模板 (激活时覆盖基础作战属性)
  activeTransposition?: {
    weaponStats?: {
      trait?: string
      damage?: string // 激活后转置伤害，如 d10+1
      range?: string
      burden?: string
      damageType?: string
    }
    armorStats?: {
      armorScore?: number // 激活后转置护甲值
      majorThreshold?: number
      severeThreshold?: number
      thresholdBonusText?: string // 如 "+2/+3"
    }
  }
  sourceCardId?: string
}

// 身体槽位组
export interface CyberpunkZoneSlotGroup {
  augmentations: CyberpunkAugmentation[]
}

export interface CyberpunkSheetExtension {
  tier?: CyberpunkTier
  credits?: number
  streetFame?: number
  streetCred?: number
  zones?: Partial<Record<CyberpunkBodyZoneKey, CyberpunkZoneSlotGroup>>
  // 手动微调各部位槽位上限 (若未手动设定则按位阶规则计算)
  zoneSlotLimits?: Partial<Record<CyberpunkBodyZoneKey | 'external', number>>
  externalGear?: CyberpunkExternalGear[]
  illegalMods?: CyberpunkIllegalModData[] | CyberpunkIllegalModData
  illegalModifications?: any
  activeEquipmentIds?: any
  consumables?: CyberpunkConsumable[]
  isLightPreview?: boolean
  portrait?: string
  portraitScale?: number
  portraitPosition?: { x: number; y: number }
  // 自定义伤害阈值（用户可开启手动调整开关，覆盖自动化计算）
  customThresholds?: {
    enabled: boolean
    major?: number
    severe?: number
    massive?: number
  }
  // 角色故事精细档案
  story?: {
    gender?: string           // 性别
    age?: string              // 年龄
    appearance?: string       // 外貌特征 / 仿生外观
    personality?: string      // 性格
    ideals?: string           // 理想 / 动机
    flaws?: string            // 缺陷 / 赛博精神风险
    relationships?: string    // 人际关系 / 街头联系人
    catchphrase?: string      // 口头禅 / 标志性台词
    backstory?: string        // 背景故事 / 传记
    contacts?: Array<{ id: string; name: string; role: string; attitude: string; notes: string }> // 街头人际名录
  }
}
