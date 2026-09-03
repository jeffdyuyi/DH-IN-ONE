import { describe, it, expect } from 'vitest'
import {
  convertWorkshopV3ToAugmentation,
  convertWorkshopV3ToConsumable,
  mapZoneTextToKey,
  mapCyberType,
  extractThresholdBonusFromEffect,
} from '../../lib/cyberpunk/workshop-v3-adapter'
import {
  compileVaultToExternalGear,
  compileVaultToWeapon,
  compileVaultToArmor,
} from '../../lib/vault/cross-flavor-equipper'
import type { VaultCard } from '../../lib/vault/vault-types'

describe('卡牌工坊 V3 数据适配器', () => {
  it('正确映射部位文本至标准 Key', () => {
    expect(mapZoneTextToKey('头部')).toBe('head')
    expect(mapZoneTextToKey('上肢')).toBe('upper_limb')
    expect(mapZoneTextToKey('下肢')).toBe('lower_limb')
    expect(mapZoneTextToKey('躯干')).toBe('torso')
    expect(mapZoneTextToKey('机械臂')).toBe('upper_limb')
    expect(mapZoneTextToKey('')).toBe('torso')
  })

  it('正确映射义体类型', () => {
    expect(mapCyberType('仿生件')).toBe('bionic')
    expect(mapCyberType('植入体')).toBe('implant')
    expect(mapCyberType('时尚件')).toBe('fashion')
    expect(mapCyberType('自定义')).toBe('custom')
  })

  it('从机制效果中提取阈值加成', () => {
    expect(extractThresholdBonusFromEffect('获得 +1/+2 伤害阈值')).toEqual({ major: 1, severe: 2 })
    expect(extractThresholdBonusFromEffect('+2/+4 全伤害阈值')).toEqual({ major: 2, severe: 4 })
    expect(extractThresholdBonusFromEffect('熟练值 +1')).toBeUndefined()
  })

  it('完整转换卡牌工坊 CyberwareData', () => {
    const rawCard = {
      id: 'cw_001',
      type: 'cyberware',
      name: '强植外骨骼',
      description: '重装军工改造',
      tier: 'T2',
      cyberType: '仿生件',
      zone: '上肢',
      slots: '2',
      restriction: '【力量 ≥ 2】',
      effect: '力量 +1; +1/+2 伤害阈值',
      tag: '【军规级】',
      compCost: '25,000 信用点',
      surgCost: '5,000 信用点',
    }

    const converted = convertWorkshopV3ToAugmentation(rawCard)

    expect(converted.id).toBe('cw_001')
    expect(converted.name).toBe('强植外骨骼')
    expect(converted.type).toBe('bionic')
    expect(converted.zone).toBe('upper_limb')
    expect(converted.slotCost).toBe(2)
    expect(converted.costCredits).toBe(25000)
    expect(converted.thresholdBonus).toEqual({ major: 1, severe: 2 })
    expect(converted.tags).toContain('【军规级】')
    expect(converted.tags).toContain('T2')
  })

  it('完整转换卡牌工坊 ConsumableData', () => {
    const rawConsumable = {
      id: 'con_001',
      type: 'consumable',
      name: '纳米修复喷雾',
      description: '紧急医疗战利品',
      effect: '立即移除 2 点生命标记',
      compCost: '3,000 信用点',
    }

    const converted = convertWorkshopV3ToConsumable(rawConsumable)

    expect(converted.id).toBe('con_001')
    expect(converted.name).toBe('纳米修复喷雾')
    expect(converted.quantity).toBe(1)
    expect(converted.maxQuantity).toBe(5)
    expect(converted.costCredits).toBe(3000)
  })

  it('正确解析赛博外置武器卡片 (如 红丸武士刀)', () => {
    const redBladeCard: VaultCard = {
      id: 'cw_red_blade',
      name: '红丸',
      category: 'cyberware',
      description: '无耻地从并不知道名字的赤鬼帮的小头目身上抢夺的武士刀',
      data: {
        tier: 'T2',
        cyberType: '外置设备',
        zone: '主武器',
        slots: 1,
        restriction: '——',
        effect: '敏捷 近战 d10+6 双手；激活时伤害提升至d12+6',
      },
      sourceApp: 'workshop',
      schemaVersion: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const compiledGear = compileVaultToExternalGear(redBladeCard)
    expect(compiledGear.name).toBe('红丸')
    expect(compiledGear.slots).toBe(1)
    expect(compiledGear.weaponStats).toBeDefined()
    expect(compiledGear.weaponStats?.trait).toBe('敏捷')
    expect(compiledGear.weaponStats?.damage).toBe('d10+6')
    expect(compiledGear.weaponStats?.range).toBe('近战')
    expect(compiledGear.weaponStats?.burden).toBe('双手')

    const compiledWeapon = compileVaultToWeapon(redBladeCard)
    expect(compiledWeapon.trait).toBe('agility')
    expect(compiledWeapon.damage).toBe('d10+6')
    expect(compiledWeapon.burden).toBe('twoHanded')
  })

  it('即使数据字段存在默认单手，正文双手依然严格优先识别为双手', () => {
    const cardWithDefaultedBurden: VaultCard = {
      id: 'cw_heavy_hammer',
      name: '动力重锤',
      category: 'cyberware',
      description: '',
      data: {
        cyberType: '外置设备',
        zone: '主武器',
        burden: '单手', // 模拟被表单默认值污染的情况
        effect: '力量 近战 d12+4 双手',
      },
      sourceApp: 'workshop',
      schemaVersion: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const compiledGear = compileVaultToExternalGear(cardWithDefaultedBurden)
    expect(compiledGear.weaponStats?.burden).toBe('双手')

    const compiledWeapon = compileVaultToWeapon(cardWithDefaultedBurden)
    expect(compiledWeapon.burden).toBe('twoHanded')
  })

  it('正确解析具有普通特性、激活特性与激活转置的外置装备卡片', () => {
    const breakerBlade: VaultCard = {
      id: 'ext_breaker_blade',
      name: '破甲刀',
      category: 'external_gear',
      description: '军用级高频近战刀刃',
      data: {
        tier: 'T1',
        gearType: '主武器',
        activeSlots: '1',
        trait: '敏捷',
        range: '近战',
        damage: 'd10+3',
        damageType: '物理',
        burden: '双手',
        feature: '锋利：对未装备护甲的目标伤害+2。',
        activeFeature: '强力：额外掷一个伤害骰并去掉其中最小的一个。',
        hasTransposition: true,
        transDamage: 'd12+3',
      },
      sourceApp: 'workshop',
      schemaVersion: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const compiled = compileVaultToExternalGear(breakerBlade)
    expect(compiled.name).toBe('破甲刀')
    expect(compiled.slots).toBe(1)
    expect(compiled.feature).toBe('锋利：对未装备护甲的目标伤害+2。')
    expect(compiled.activeFeature).toBe('强力：额外掷一个伤害骰并去掉其中最小的一个。')
    expect(compiled.weaponStats?.damage).toBe('d10+3')
    expect(compiled.activeTransposition?.weaponStats?.damage).toBe('d12+3')
  })

  it('正确识别 0、空白、- 等免激活槽位设定', () => {
    const freeCard: VaultCard = {
      id: 'ext_free_item',
      name: '战术目镜',
      category: 'external_gear',
      description: '',
      data: {
        gearType: '其他外置',
        activeSlots: '0',
        feature: '夜视：黑暗环境中检定不受劣势。',
      },
      sourceApp: 'workshop',
      schemaVersion: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const compiled = compileVaultToExternalGear(freeCard)
    expect(compiled.slots).toBe(0)
    expect(compiled.active).toBe(true) // 免槽位自动常驻激活
    expect(compiled.feature).toBe('夜视：黑暗环境中检定不受劣势。')
  })
})

