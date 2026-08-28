/**
 * 爽博朋克位阶常量与默认配置表
 */

import type { CyberpunkBodyZoneKey, CyberpunkSheetExtension } from '@/types/cyberpunk'

export type CyberpunkTier = 'T1' | 'T2' | 'T3' | 'T4'

// 各大区位阶槽位上限
export const CYBERPUNK_TIER_SLOTS: Record<CyberpunkTier, number> = {
  T1: 2,
  T2: 3,
  T3: 4,
  T4: 5,
}

// 外置装备激活槽位上限
export const CYBERPUNK_TIER_EQUIP_SLOTS: Record<CyberpunkTier, number> = {
  T1: 2,
  T2: 3,
  T3: 4,
  T4: 5,
}

// 躯干位阶提供的伤害阈值加成 (+重度 / +严重)
export const CYBERPUNK_TORSO_TIER_THRESHOLDS: Record<CyberpunkTier, { major: number; severe: number }> = {
  T1: { major: 1, severe: 2 },
  T2: { major: 2, severe: 4 },
  T3: { major: 5, severe: 10 },
  T4: { major: 8, severe: 16 },
}

// 身体四大区元数据
export const CYBERPUNK_BODY_ZONES: Array<{
  id: CyberpunkBodyZoneKey
  name: string
  suggestedTraits: string
}> = [
  { id: 'head', name: '头部 (Head)', suggestedTraits: '压力/希望上限、卡牌配置、知识、本能、风度等' },
  { id: 'torso', name: '躯干 (Torso)', suggestedTraits: '生命上限、护甲值、伤害阈值等' },
  { id: 'upper_limb', name: '上肢 (Arms)', suggestedTraits: '熟练值、力量、近战改装等' },
  { id: 'lower_limb', name: '下肢 (Legs)', suggestedTraits: '闪避值、敏捷、灵巧、移动特化等' },
]

// 原生器官黑市切除项目定义
export interface IllegalHarvestOrganDef {
  id: string
  name: string
  creditsGain: number
  penaltyText: string
  effects: {
    hpMaxDelta?: number
    stressMaxDelta?: number
    hopeMaxDelta?: number
    nativeThresholdDrop?: boolean // 5/10 -> 4/8
    experienceSlotBurden?: string // 假肢+0
    notes?: string
  }
}

export const ILLEGAL_HARVEST_ORGANS: IllegalHarvestOrganDef[] = [
  {
    id: 'heart',
    name: '原生心脏',
    creditsGain: 20000,
    penaltyText: '减少 1 点生命槽上限',
    effects: { hpMaxDelta: -1 },
  },
  {
    id: 'brainstem',
    name: '原生脑干',
    creditsGain: 20000,
    penaltyText: '减少 1 点压力槽上限',
    effects: { stressMaxDelta: -1 },
  },
  {
    id: 'prefrontal',
    name: '原生前额叶',
    creditsGain: 20000,
    penaltyText: '减少 1 点希望点上限',
    effects: { hopeMaxDelta: -1 },
  },
  {
    id: 'limb',
    name: '原生单肢 (手或足)',
    creditsGain: 10000,
    penaltyText: '强制占用 1 个经历槽位，记录经历：假肢 + 0',
    effects: { experienceSlotBurden: '假肢 + 0' },
  },
  {
    id: 'lung',
    name: '原生肺部',
    creditsGain: 10000,
    penaltyText: '身体阈值基准从 5/10 下调为 4/8',
    effects: { nativeThresholdDrop: true },
  },
  {
    id: 'sensory',
    name: '原生眼球／耳蜗 (二选一)',
    creditsGain: 10000,
    penaltyText: '涉及精细视听动作反应掷骰时，自身须额外标记 1 压力点或受劣势',
    effects: { notes: '精细视听需加压或承受劣势' },
  },
  {
    id: 'digestive',
    name: '原生消化道',
    creditsGain: 10000,
    penaltyText: '无法正常从食物或吞咽道具中获得完整收益',
    effects: { notes: '食物与吞咽收益失效' },
  },
]

// 默认爽博朋克扩展数据
export const defaultCyberpunkSheetData: CyberpunkSheetExtension = {
  streetFame: 1,
  credits: 0,
  tier: 'T1',
  zones: {
    head: { augmentations: [] },
    torso: { augmentations: [] },
    upper_limb: { augmentations: [] },
    lower_limb: { augmentations: [] },
  },
  externalGear: [],
  activeEquipmentIds: [],
  consumables: [],
  illegalModifications: {
    enabled: false,
    harvestedOrgans: [],
    totalGainedCredits: 0,
  },
}

export const DEFAULT_CYBERPUNK_EXTENSION = defaultCyberpunkSheetData

