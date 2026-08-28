"use client"

import React, { useState } from 'react'
import type { CyberpunkIllegalModData } from '@/types/cyberpunk'
import { AlertTriangle, Skull, Plus, Trash2, ShieldAlert, Sparkles, Check } from 'lucide-react'

interface CyberpunkIllegalModPanelProps {
  illegalModData: any
  onChange: (updated: any) => void
}

type CyberpunkHarvestedOrganKey =
  | 'heart'
  | 'brainstem'
  | 'prefrontal'
  | 'limb'
  | 'lung'
  | 'sensory'
  | 'digestive'

// 严格对齐《爽博朋克：渊边行者》战役机制 - 原生器官黑市交易
const HARVESTABLE_ORGANS: {
  key: CyberpunkHarvestedOrganKey
  label: string
  creditReward: number
  penalty: string
}[] = [
  {
    key: 'heart',
    label: '原生心脏',
    creditReward: 20000,
    penalty: '减少 1 点生命槽上限',
  },
  {
    key: 'brainstem',
    label: '原生脑干',
    creditReward: 20000,
    penalty: '减少 1 点压力槽上限',
  },
  {
    key: 'prefrontal',
    label: '原生前额叶',
    creditReward: 20000,
    penalty: '减少 1 点希望点上限',
  },
  {
    key: 'limb',
    label: '原生单肢 (手或足)',
    creditReward: 10000,
    penalty: '强制占用 1 个经历槽位，记录经历：假肢 + 0',
  },
  {
    key: 'lung',
    label: '原生肺部',
    creditReward: 10000,
    penalty: '身体阈值从 5/10 下调为 4/8',
  },
  {
    key: 'sensory',
    label: '原生眼球／耳蜗 (二选一)',
    creditReward: 10000,
    penalty: '涉及精细视觉或听觉的动作或反应掷骰时，自身必须额外标记 1 压力点，否则获得劣势',
  },
  {
    key: 'digestive',
    label: '原生消化道',
    creditReward: 10000,
    penalty: '无法正常从食物或需要吞咽的道具中获得完整收益',
  },
]

// 严格对齐《爽博朋克：渊边行者》战役机制 - 预设非法改装获取
const PRESET_ILLEGAL_MODS = [
  {
    id: 'preset_life_support',
    name: '维生件',
    cost: 10000,
    location: '躯干',
    type: '元件/义体/植入体',
    slots: 2,
    effect: '生命槽或压力槽上限 +1',
    penalty: '非法植入高发热与生物排异',
  },
  {
    id: 'preset_armor_plating',
    name: '强植外甲',
    cost: 10000,
    location: '躯干',
    type: '元件/义体/时尚件',
    slots: 1,
    effect: '护甲槽上限额外 +1',
    penalty: '皮下金属硬化，行动僵硬',
  },
  {
    id: 'preset_scale_skin',
    name: '鳞纹皮肤',
    cost: 20000,
    location: '躯干',
    type: '元件/义体/仿生件',
    slots: 1,
    effect: '获得 +1/+2 全伤害阈值',
    penalty: '汗腺退化，过载时承受额外压力',
  },
  {
    id: 'preset_core_capacitor',
    name: '内核电容',
    cost: 10000,
    location: '根据属性对应部位',
    type: '元件/义体/植入体',
    slots: 2,
    effect: '获得 +1 任意属性',
    penalty: '神经电压不稳',
  },
  {
    id: 'preset_strike_limb',
    name: '强袭肢体',
    cost: 30000,
    location: '上肢',
    type: '元件/义体/植入体',
    slots: 2,
    effect: '熟练值 +1',
    penalty: '肌束暴力拉扯，需定期更换阻尼液',
  },
  {
    id: 'preset_brain_chip',
    name: '脑容晶片',
    cost: 30000,
    location: '头部',
    type: '元件/义体/时尚件',
    slots: 2,
    effect: '获得任意 1 张额外 1 级领域卡',
    penalty: '记忆回溯与认知过载',
  },
]

export function CyberpunkIllegalModPanel({
  illegalModData,
  onChange,
}: CyberpunkIllegalModPanelProps) {
  const isEnabled = !!illegalModData?.enabled
  const harvestedOrgans: string[] = Array.isArray(illegalModData?.harvestedOrgans)
    ? illegalModData.harvestedOrgans
    : []
  const customMods: any[] = Array.isArray(illegalModData?.customMods)
    ? illegalModData.customMods
    : []

  const handleToggleEnable = () => {
    onChange({
      ...illegalModData,
      enabled: !isEnabled,
    })
  }

  const handleToggleOrgan = (organKey: CyberpunkHarvestedOrganKey) => {
    const isHarvested = harvestedOrgans.includes(organKey)
    const nextOrgans = isHarvested
      ? harvestedOrgans.filter((k: string) => k !== organKey)
      : [...harvestedOrgans, organKey]

    onChange({
      ...illegalModData,
      harvestedOrgans: nextOrgans,
    })
  }

  const handleAddPresetMod = (preset: typeof PRESET_ILLEGAL_MODS[0]) => {
    const newMod = {
      id: `illegal_${Date.now()}`,
      name: preset.name,
      bonus: preset.effect,
      penalty: preset.penalty,
      location: preset.location,
      type: preset.type,
      slots: preset.slots,
      cost: preset.cost,
    }
    onChange({
      ...illegalModData,
      customMods: [...customMods, newMod],
    })
  }

  const handleAddCustomMod = () => {
    const newMod = {
      id: `illegal_${Date.now()}`,
      name: '黑市过载改装',
      bonus: '伤害输出 +1d6',
      penalty: '每次过载标记 1 压力点',
      location: '躯干',
      type: '元件/义体/植入体',
      slots: 1,
      cost: 10000,
    }
    onChange({
      ...illegalModData,
      customMods: [...customMods, newMod],
    })
  }

  const handleRemoveCustomMod = (id: string) => {
    onChange({
      ...illegalModData,
      customMods: customMods.filter((m: any) => m.id !== id),
    })
  }

  const handleUpdateCustomMod = (id: string, field: string, val: any) => {
    onChange({
      ...illegalModData,
      customMods: customMods.map((m: any) => (m.id === id ? { ...m, [field]: val } : m)),
    })
  }

  // 统计通过器官黑市交易获得的启动资金
  const totalHarvestCredits = harvestedOrgans.reduce((sum, key) => {
    const organ = HARVESTABLE_ORGANS.find((o) => o.key === key)
    return sum + (organ ? organ.creditReward : 0)
  }, 0)

  return (
    <div className="rounded-xl border border-[#6C00FF]/40 bg-[#12072B] p-4 text-slate-100 font-sans shadow-[0_4px_20px_rgba(11,3,32,0.6)]">
      {/* 头部标题与房规开关 */}
      <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Skull className="h-4 w-4 text-[#FF007F]" />
          <h3 className="text-sm font-bold text-white tracking-wide">可选规则：初始非法改造</h3>
        </div>

        <button
          type="button"
          onClick={handleToggleEnable}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all border ${
            isEnabled
              ? 'bg-[#FF007F]/20 text-[#FF007F] border-[#FF007F]/60 shadow-[0_0_10px_rgba(255,0,127,0.3)]'
              : 'bg-[#0B0320] text-slate-400 border-slate-700 hover:border-slate-500'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>{isEnabled ? '规则已启用 (Active)' : '点击启用可选房规'}</span>
        </button>
      </div>

      {!isEnabled ? (
        <p className="text-xs text-slate-400 leading-relaxed">
          在 1 级创建角色时，若希望角色更为极端、狂野、粗粝，可出卖健康的原生肉体换取启动资金（单位：信用点），并将其投入到违规的黑市改装中。
        </p>
      ) : (
        <div className="space-y-4">
          {/* 1. 原生器官黑市交易 */}
          <div className="rounded-lg border border-[#FF007F]/30 bg-[#0B0320]/80 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF007F]">
                <ShieldAlert className="h-4 w-4" />
                <span>原生器官黑市交易 (每项限售 1 次)</span>
              </div>
              <div className="text-xs font-mono font-bold text-[#F5F500]">
                累计出卖获利: +{totalHarvestCredits.toLocaleString()} 信用点
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
              {HARVESTABLE_ORGANS.map((organ) => {
                const isHarvested = harvestedOrgans.includes(organ.key)
                return (
                  <button
                    key={organ.key}
                    type="button"
                    onClick={() => handleToggleOrgan(organ.key)}
                    className={`text-left p-2 rounded-lg border transition-all flex items-start gap-2 ${
                      isHarvested
                        ? 'border-[#FF007F] bg-[#FF007F]/15 shadow-[0_0_10px_rgba(255,0,127,0.2)]'
                        : 'border-[#6C00FF]/25 bg-[#12072B] hover:border-[#FF007F]/50'
                    }`}
                  >
                    <div
                      className={`mt-0.5 h-4 w-4 rounded flex items-center justify-center border shrink-0 ${
                        isHarvested
                          ? 'border-[#FF007F] bg-[#FF007F] text-black font-bold'
                          : 'border-slate-600 bg-black/40'
                      }`}
                    >
                      {isHarvested && <Check className="h-3 w-3" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-bold ${isHarvested ? 'text-[#FF007F]' : 'text-slate-200'}`}>
                          {organ.label}
                        </span>
                        <span className="text-[#F5F500] font-mono font-bold text-[11px]">
                          +{organ.creditReward.toLocaleString()} 信用点
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        代价: {organ.penalty}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. 预设非法改装快速选配 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#00FFA3]">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span>预设非法改装项目 (选购装配)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">点击快速添加至黑市清单</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {PRESET_ILLEGAL_MODS.map((preset) => (
                <div
                  key={preset.id}
                  className="rounded-lg border border-[#6C00FF]/30 bg-[#0B0320] p-2.5 flex flex-col justify-between hover:border-[#00FFA3]/50 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{preset.name}</span>
                      <span className="text-[10px] text-[#F5F500] font-mono font-bold">
                        {preset.cost.toLocaleString()} 信用点
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {preset.location} · {preset.slots} 槽位
                    </div>
                    <p className="text-[11px] text-[#00FFA3] mt-1 font-medium">{preset.effect}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddPresetMod(preset)}
                    className="mt-2 text-[10px] font-bold text-[#00FFA3] bg-[#00FFA3]/10 hover:bg-[#00FFA3]/20 py-1 px-2 rounded border border-[#00FFA3]/30 transition-colors text-center"
                  >
                    + 装配此改装
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. 已装配的黑市改装清单与自定义 */}
          <div className="space-y-2 border-t border-[#6C00FF]/20 pt-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span>已装配黑市非法改造 ({customMods.length})</span>
              <button
                type="button"
                onClick={handleAddCustomMod}
                className="flex items-center gap-1 text-[11px] font-bold text-[#F5F500] bg-[#F5F500]/10 hover:bg-[#F5F500]/20 px-2 py-0.5 rounded border border-[#F5F500]/40 transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>添加自定义改装</span>
              </button>
            </div>

            {customMods.length === 0 ? (
              <div className="py-2 text-xs text-slate-500">暂未选购或添加黑市过载改装。</div>
            ) : (
              <div className="space-y-2">
                {customMods.map((mod: any) => (
                  <div
                    key={mod.id}
                    className="rounded-lg border border-[#6C00FF]/30 bg-[#0B0320] p-2.5 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={mod.name}
                        onChange={(e) => handleUpdateCustomMod(mod.id, 'name', e.target.value)}
                        className="flex-1 bg-transparent font-bold text-[#FF007F] border-b border-slate-700 focus:border-[#FF007F] focus:outline-none"
                      />
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={mod.cost || 0}
                          onChange={(e) =>
                            handleUpdateCustomMod(mod.id, 'cost', parseInt(e.target.value, 10) || 0)
                          }
                          className="w-20 bg-transparent text-right font-mono text-[#F5F500] font-bold border-b border-slate-700 focus:outline-none text-[11px]"
                        />
                        <span className="text-[10px] text-slate-400 font-mono">信用点</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomMod(mod.id)}
                          className="text-slate-500 hover:text-red-400 p-0.5 ml-1"
                          title="移除改装"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[#00FFA3] font-bold block">过载增益:</span>
                        <input
                          type="text"
                          value={mod.bonus || ''}
                          onChange={(e) => handleUpdateCustomMod(mod.id, 'bonus', e.target.value)}
                          placeholder="例如: 伤害 +1d6"
                          className="w-full bg-transparent border-b border-slate-800 text-slate-300 focus:outline-none focus:border-[#00FFA3]"
                        />
                      </div>
                      <div>
                        <span className="text-[#FF007F] font-bold block">副作用代价:</span>
                        <input
                          type="text"
                          value={mod.penalty || ''}
                          onChange={(e) => handleUpdateCustomMod(mod.id, 'penalty', e.target.value)}
                          placeholder="例如: 每次过载标记 1 压力"
                          className="w-full bg-transparent border-b border-slate-800 text-slate-300 focus:outline-none focus:border-[#FF007F]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
