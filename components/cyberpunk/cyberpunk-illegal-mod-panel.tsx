"use client"

import React from 'react'
import type { CyberpunkIllegalModData } from '@/types/cyberpunk'
import { AlertTriangle, Skull, Plus, Trash2 } from 'lucide-react'

interface CyberpunkIllegalModPanelProps {
  illegalModData: any
  onChange: (updated: any) => void
}

type CyberpunkHarvestedOrganKey = 'kidney' | 'eye' | 'lung' | 'limb'

const HARVESTABLE_ORGANS: { key: CyberpunkHarvestedOrganKey; label: string; creditReward: number; penalty: string }[] = [
  { key: 'kidney', label: '次要肾脏 (Kidney)', creditReward: 200, penalty: '压力上限永久 -1' },
  { key: 'eye', label: '原生单眼 (Eye)', creditReward: 300, penalty: '远距离感知与射击检定劣势' },
  { key: 'lung', label: '部分肺叶 (Lung)', creditReward: 400, penalty: '伤害阈值基准降为 4/8 (更易受伤)' },
  { key: 'limb', label: '原生肢体骨髓 (Bone/Limb)', creditReward: 250, penalty: '力量/敏捷对抗检定加值 -1' },
]

export function CyberpunkIllegalModPanel({
  illegalModData,
  onChange,
}: CyberpunkIllegalModPanelProps) {
  const isEnabled = !!illegalModData?.enabled
  const harvestedOrgans = illegalModData?.harvestedOrgans || []
  const customMods = illegalModData?.customMods || []

  const handleToggleEnable = () => {
    onChange({
      ...illegalModData,
      enabled: !isEnabled,
    })
  }

  const handleToggleOrgan = (organKey: CyberpunkHarvestedOrganKey) => {
    const isHarvested = (harvestedOrgans as string[]).includes(organKey)
    const nextOrgans = isHarvested
      ? (harvestedOrgans as string[]).filter((k: string) => k !== organKey)
      : [...(harvestedOrgans as string[]), organKey]

    onChange({
      ...illegalModData,
      harvestedOrgans: nextOrgans,
    })
  }

  const handleAddCustomMod = () => {
    const newMod = {
      id: `illegal_${Date.now()}`,
      name: '黑市过载核心',
      bonus: '伤害输出 +1d6',
      penalty: '每次过载标记 1 压力点',
    }
    onChange({
      ...illegalModData,
      customMods: [...(customMods as any[]), newMod],
    })
  }

  const handleRemoveCustomMod = (id: string) => {
    onChange({
      ...illegalModData,
      customMods: (customMods as any[]).filter((m: any) => m.id !== id),
    })
  }

  const handleUpdateCustomMod = (id: string, field: 'name' | 'bonus' | 'penalty', val: string) => {
    onChange({
      ...illegalModData,
      customMods: (customMods as any[]).map((m: any) => (m.id === id ? { ...m, [field]: val } : m)),
    })
  }

  return (
    <div className="rounded-xl border border-red-900/40 bg-[#0d0d1a] p-4 text-slate-100 font-sans shadow-md">
      {/* 头部开关 */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Skull className="h-4 w-4 text-[#FF003C]" />
          <h3 className="text-sm font-bold text-white">黑市与非法义体 (Illegal Mods)</h3>
        </div>

        <button
          type="button"
          onClick={handleToggleEnable}
          className={`px-2.5 py-1 text-xs font-bold rounded border transition-colors ${
            isEnabled
              ? 'bg-[#FF003C]/20 border-[#FF003C]/50 text-[#FF003C]'
              : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}
        >
          {isEnabled ? '已启用黑市系统' : '未启用 (点击开启)'}
        </button>
      </div>

      {!isEnabled ? (
        <div className="py-4 text-center text-xs text-slate-500">
          如需使用「原生器官变现」或「黑市非法义体过载」，请点击右上角开启。
        </div>
      ) : (
        <div className="space-y-4">
          {/* 原生器官黑市切除套现 */}
          <div>
            <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span>原生肉身器官抵押切除（套取信用点，永久承受生理代价）：</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {HARVESTABLE_ORGANS.map(({ key, label, creditReward, penalty }) => {
                const isHarvested = harvestedOrgans.includes(key)

                return (
                  <div
                    key={key}
                    onClick={() => handleToggleOrgan(key)}
                    className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                      isHarvested
                        ? 'border-[#FF003C] bg-[#FF003C]/10 text-slate-100 shadow-[0_0_10px_rgba(255,0,60,0.2)]'
                        : 'border-slate-800 bg-[#0f0f22] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className={isHarvested ? 'text-[#FF003C]' : 'text-slate-200'}>
                        {isHarvested ? '⚠️ 已切除: ' : '🫀 '}
                        {label}
                      </span>
                      <span className="font-mono text-[#FCEE0A]">+{creditReward} CR</span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      代价: {penalty}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 自定义黑市改造 */}
          <div className="border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">黑市过载改装项：</span>
              <button
                type="button"
                onClick={handleAddCustomMod}
                className="flex items-center gap-1 rounded bg-[#FF003C]/20 border border-[#FF003C]/40 px-2 py-0.5 text-xs font-bold text-[#FF003C] hover:bg-[#FF003C]/30 transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>添加黑市改造</span>
              </button>
            </div>

            {customMods.length === 0 ? (
              <div className="py-2 text-xs text-slate-500">暂无自定义黑市过载改装。</div>
            ) : (
              <div className="space-y-2">
                {(customMods as any[]).map((mod: any) => (
                  <div
                    key={mod.id}
                    className="rounded-lg border border-slate-800 bg-[#0f0f22] p-2.5 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={mod.name}
                        onChange={(e) => handleUpdateCustomMod(mod.id, 'name', e.target.value)}
                        className="flex-1 bg-transparent font-bold text-[#FF003C] border-b border-slate-700 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomMod(mod.id)}
                        className="text-slate-500 hover:text-red-400 p-0.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-emerald-400 font-bold block">过载增益:</span>
                        <input
                          type="text"
                          value={mod.bonus}
                          onChange={(e) => handleUpdateCustomMod(mod.id, 'bonus', e.target.value)}
                          className="w-full bg-black/40 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200"
                        />
                      </div>
                      <div>
                        <span className="text-red-400 font-bold block">神经代价:</span>
                        <input
                          type="text"
                          value={mod.penalty}
                          onChange={(e) => handleUpdateCustomMod(mod.id, 'penalty', e.target.value)}
                          className="w-full bg-black/40 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200"
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
