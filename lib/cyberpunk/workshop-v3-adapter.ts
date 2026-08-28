/**
 * 卡牌工坊 V3 (匕首心卡牌工坊V3) 与 爽博朋克车卡器 数据适配器
 * 用于解析、转换并打通卡牌工坊中制作的 CyberwareData 及卡包数据
 */

import type { CyberpunkAugmentation, CyberpunkBodyZoneKey, CyberpunkConsumable } from '@/types/cyberpunk'

// 匹配卡牌工坊 V3 中的 CyberwareData 数据结构
export interface WorkshopV3CyberwareRaw {
  id: string
  type: 'cyberware' | string
  name: string
  description?: string
  creator?: string
  owner?: string
  tier?: string // "T1", "T2", "T3", "T4"
  cyberType?: string // "植入体", "仿生件", "时尚件", "外置设备", "消耗品", "自定义"
  zone?: string // "头部", "躯干", "上肢", "下肢", "自定义"
  slots?: string // "0", "1", "2", "跨区"
  restriction?: string
  effect?: string
  tag?: string
  compCost?: string // 元件费用
  surgCost?: string // 手术费用
}

/**
 * 将部位中文/文本映射为标准大区 Key
 */
export function mapZoneTextToKey(zoneText?: string): CyberpunkBodyZoneKey {
  if (!zoneText) return 'torso'
  const text = zoneText.trim().toLowerCase()
  if (text.includes('头') || text.includes('head')) return 'head'
  if (text.includes('上肢') || text.includes('手') || text.includes('臂') || text.includes('arm')) return 'upper_limb'
  if (text.includes('下肢') || text.includes('腿') || text.includes('足') || text.includes('leg')) return 'lower_limb'
  return 'torso'
}

/**
 * 解析义体类型
 */
export function mapCyberType(cyberType?: string): 'bionic' | 'implant' | 'fashion' | 'custom' {
  if (!cyberType) return 'implant'
  if (cyberType.includes('仿生') || cyberType.toLowerCase().includes('bionic')) return 'bionic'
  if (cyberType.includes('植入') || cyberType.toLowerCase().includes('implant')) return 'implant'
  if (cyberType.includes('时尚') || cyberType.toLowerCase().includes('fashion')) return 'fashion'
  return 'custom'
}

/**
 * 从规则文本或 effect 中提取伤害阈值加值 (+X/+Y)
 */
export function extractThresholdBonusFromEffect(effectText?: string): { major: number; severe: number } | undefined {
  if (!effectText) return undefined
  // 匹配类似 "+1/+2 全伤害阈值" 或 "阈值 +1/+2" 或 "伤害阈值+2/+4"
  const match = effectText.match(/[+＋]?\s*(\d+)\s*[/／]\s*[+＋]?\s*(\d+)\s*(?:全)?(?:伤害)?阈值/)
  if (match) {
    const major = parseInt(match[1], 10)
    const severe = parseInt(match[2], 10)
    if (!isNaN(major) && !isNaN(severe)) {
      return { major, severe }
    }
  }
  return undefined
}

/**
 * 将卡牌工坊导出的单张卡牌转换为车卡器义体元件
 */
export function convertWorkshopV3ToAugmentation(raw: WorkshopV3CyberwareRaw): CyberpunkAugmentation {
  const slotCount = parseInt(raw.slots || '1', 10)
  const cost = parseInt(raw.compCost?.replace(/[^0-9]/g, '') || '0', 10)
  const thresholdBonus = extractThresholdBonusFromEffect(raw.effect)

  const tags: string[] = []
  if (raw.tag) tags.push(raw.tag)
  if (raw.tier) tags.push(raw.tier)
  if (raw.restriction) tags.push(raw.restriction)

  return {
    id: raw.id || `aug_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: raw.name || '未命名元件',
    type: mapCyberType(raw.cyberType),
    zone: mapZoneTextToKey(raw.zone),
    slotCost: isNaN(slotCount) ? 1 : Math.max(0, slotCount),
    costCredits: isNaN(cost) ? 0 : cost,
    thresholdBonus,
    description: raw.description || '',
    rulesText: raw.effect || '',
    tags: tags.length > 0 ? tags : undefined,
  }
}

/**
 * 将卡牌工坊导出的消耗品卡牌转换为车卡器消耗品
 */
export function convertWorkshopV3ToConsumable(raw: any): CyberpunkConsumable {
  const cost = parseInt(raw.compCost?.replace(/[^0-9]/g, '') || raw.price?.replace(/[^0-9]/g, '') || '0', 10)

  return {
    id: raw.id || `con_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: raw.name || '未命名消耗品',
    quantity: 1,
    maxQuantity: 5,
    effect: raw.effect || raw.feature || raw.description || '',
    costCredits: isNaN(cost) ? 0 : cost,
    description: raw.description || '',
  }
}
