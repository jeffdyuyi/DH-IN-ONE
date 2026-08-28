import { describe, it, expect } from 'vitest'
import {
  convertWorkshopV3ToAugmentation,
  convertWorkshopV3ToConsumable,
  mapZoneTextToKey,
  mapCyberType,
  extractThresholdBonusFromEffect,
} from '@/lib/cyberpunk/workshop-v3-adapter'
import {
  compileVaultToExternalGear,
  compileVaultToWeapon,
  compileVaultToArmor,
} from '@/lib/vault/cross-flavor-equipper'
import { VaultCard } from '@/lib/vault/vault-types'

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
})

