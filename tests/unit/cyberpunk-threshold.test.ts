import { describe, it, expect } from 'vitest'
import { calculateCyberpunkThresholds } from '@/lib/cyberpunk/threshold-calculator'
import { defaultCyberpunkSheetData } from '@/lib/cyberpunk/tier-constants'
import type { CyberpunkSheetExtension } from '@/types/cyberpunk'

describe('爽博朋克特化伤害阈值计算器', () => {
  it('T1 裸装初始角色阈值应为 6/12', () => {
    const data: CyberpunkSheetExtension = {
      ...defaultCyberpunkSheetData,
      tier: 'T1',
    }

    const result = calculateCyberpunkThresholds(data, { majorBonus: 0, severeBonus: 0 })

    expect(result.nativeBase).toEqual({ major: 5, severe: 10 })
    expect(result.torsoTierBonus).toEqual({ major: 1, severe: 2 })
    expect(result.totalMajor).toBe(6)
    expect(result.totalSevere).toBe(12)
    expect(result.massiveThreshold).toBe(24)
  })

  it('T1 角色装配作战服(+1/+2 护甲加值)阈值应为 7/14', () => {
    const data: CyberpunkSheetExtension = {
      ...defaultCyberpunkSheetData,
      tier: 'T1',
    }

    const result = calculateCyberpunkThresholds(data, { majorBonus: 1, severeBonus: 2 })

    expect(result.totalMajor).toBe(7)
    expect(result.totalSevere).toBe(14)
    expect(result.massiveThreshold).toBe(28)
  })

  it('T2 角色安装皮下护甲(+1/+2)并穿防弹背心(+2/+4)阈值应为 10/20', () => {
    const data: CyberpunkSheetExtension = {
      ...defaultCyberpunkSheetData,
      tier: 'T2',
      zones: {
        ...defaultCyberpunkSheetData.zones,
        torso: {
          augmentations: [
            {
              id: 'aug_skin',
              name: '鳞纹皮下护甲',
              type: 'bionic',
              zone: 'torso',
              slotCost: 1,
              thresholdBonus: { major: 1, severe: 2 },
              description: '',
              rulesText: '',
            },
          ],
        },
      },
    }

    const result = calculateCyberpunkThresholds(data, { majorBonus: 2, severeBonus: 4 })

    expect(result.torsoTierBonus).toEqual({ major: 2, severe: 4 })
    expect(result.augmentationsBonus).toEqual({ major: 1, severe: 2 })
    expect(result.armorBonus).toEqual({ major: 2, severe: 4 })
    expect(result.totalMajor).toBe(10) // 5 + 2 + 1 + 2
    expect(result.totalSevere).toBe(20) // 10 + 4 + 2 + 4
    expect(result.massiveThreshold).toBe(40)
  })

  it('切除原生肺部后，原生基准应下调为 4/8', () => {
    const data: CyberpunkSheetExtension = {
      ...defaultCyberpunkSheetData,
      tier: 'T1',
      illegalModifications: {
        enabled: true,
        harvestedOrgans: ['lung'],
        totalGainedCredits: 10000,
      },
    }

    const result = calculateCyberpunkThresholds(data, { majorBonus: 0, severeBonus: 0 })

    expect(result.nativeBase).toEqual({ major: 4, severe: 8 })
    expect(result.totalMajor).toBe(5) // 4 + 1
    expect(result.totalSevere).toBe(10) // 8 + 2
  })
})
