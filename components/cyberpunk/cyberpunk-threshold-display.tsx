"use client"

import React, { useState } from 'react'
import type { CyberpunkSheetExtension } from '@/types/cyberpunk'
import { calculateCyberpunkThresholds } from '@/lib/cyberpunk/threshold-calculator'
import { Activity, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react'

interface CyberpunkThresholdDisplayProps {
  cyberpunkData?: CyberpunkSheetExtension
  armorMinor?: number
  armorMajor?: number
  equippedArmorName?: string
}

export function CyberpunkThresholdDisplay({
  cyberpunkData,
  armorMinor = 0,
  armorMajor = 0,
  equippedArmorName,
}: CyberpunkThresholdDisplayProps) {
  const currentTier = cyberpunkData?.tier || 'T1'
  const hasHarvestedLung = !!(
    (cyberpunkData?.illegalMods as any)?.harvestedOrgans?.includes('lung') ||
    (cyberpunkData?.illegalModifications as any)?.harvestedOrgans?.includes('lung')
  )

  // 巨额伤害可选房规开关状态（默认开启）
  const [massiveDamageRuleEnabled, setMassiveDamageRuleEnabled] = useState(true)

  const numArmorMajorBonus = Number(armorMinor) || 0
  const numArmorSevereBonus = Number(armorMajor) || 0

  const thresholdResult = calculateCyberpunkThresholds(cyberpunkData, {
    majorBonus: numArmorMajorBonus,
    severeBonus: numArmorSevereBonus,
  })

  const { nativeBase, torsoTierBonus, augmentationsBonus, armorBonus, totalMajor, totalSevere, massiveThreshold } =
    thresholdResult

  const displayArmorLabel = equippedArmorName ? `护甲: ${equippedArmorName}` : '未装备护甲'

  return (
    <div className="rounded-xl border border-[#6C00FF]/30 bg-[#0B0320]/80 p-3.5 shadow-md font-sans">
      {/* 标题栏 */}
      <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#00FFA3]" />
          <h3 className="text-xs font-bold text-white tracking-wide">伤害阈值 (Damage Thresholds)</h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {/* 巨额伤害可选房规快捷开关 */}
          <button
            type="button"
            onClick={() => setMassiveDamageRuleEnabled(!massiveDamageRuleEnabled)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
              massiveDamageRuleEnabled
                ? 'bg-[#6C00FF]/25 border-[#00FFA3] text-[#00FFA3] shadow-[0_0_8px_rgba(0,255,163,0.2)]'
                : 'bg-[#12072B] border-slate-700 text-slate-400'
            }`}
            title="点击切换巨额伤害可选房规"
          >
            <span>巨额伤害房规: {massiveDamageRuleEnabled ? '已开启 (扣4血)' : '已关闭'}</span>
          </button>

          {hasHarvestedLung ? (
            <span className="text-[10px] text-[#FF007F] font-bold bg-[#FF007F]/10 px-1.5 py-0.5 rounded border border-[#FF007F]/30">
              ⚠️ 肺部切除 (基准 4/8)
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono">基准 5/10 (累加算式)</span>
          )}
        </div>
      </div>

      {/* 核心大数字展示 */}
      <div className="mt-2.5 grid grid-cols-3 gap-2.5 text-center font-mono">
        {/* 重度伤害 */}
        <div className="rounded-lg border border-[#F5F500]/40 bg-[#F5F500]/10 p-2 shadow-[0_0_10px_rgba(245,245,0,0.08)]">
          <div className="text-[10px] text-[#F5F500] font-bold">重度伤害 (Major)</div>
          <div className="text-xl font-black text-[#F5F500] mt-0.5">{totalMajor}</div>
          <div className="text-[10px] text-slate-300 mt-0.5">≥ {totalMajor} 扣 2 命</div>
        </div>

        {/* 严重伤害 */}
        <div className="rounded-lg border border-[#FF007F]/40 bg-[#FF007F]/10 p-2 shadow-[0_0_10px_rgba(255,0,127,0.1)]">
          <div className="text-[10px] text-[#FF007F] font-bold">严重伤害 (Severe)</div>
          <div className="text-xl font-black text-[#FF007F] mt-0.5">{totalSevere}</div>
          <div className="text-[10px] text-slate-300 mt-0.5">≥ {totalSevere} 扣 3 命</div>
        </div>

        {/* 巨额伤害（可选房规） */}
        <div
          className={`rounded-lg border p-2 transition-all ${
            massiveDamageRuleEnabled
              ? 'border-[#6C00FF] bg-[#6C00FF]/15 shadow-[0_0_12px_rgba(108,0,255,0.2)]'
              : 'border-slate-800 bg-black/40 opacity-50'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#00FFA3]">
            <span>巨额伤害 (Massive)</span>
          </div>
          <div className="text-xl font-black text-white mt-0.5">
            {massiveDamageRuleEnabled ? massiveThreshold : '—'}
          </div>
          <div className="text-[10px] text-slate-300 mt-0.5">
            {massiveDamageRuleEnabled ? `≥ ${massiveThreshold} 扣 4 命` : '房规未开启'}
          </div>
        </div>
      </div>

      {/* 伤害算式拆解提示 */}
      <div className="mt-2 rounded-md bg-[#12072B] px-2.5 py-1.5 border border-[#6C00FF]/20 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <span className="text-[#00FFA3] font-bold">算式拆解:</span>
          <span>
            原生基准({nativeBase.major}/{nativeBase.severe}) + 躯干位阶({torsoTierBonus.major}/{torsoTierBonus.severe}) + 护甲/义体({armorBonus.major + augmentationsBonus.major}/{armorBonus.severe + augmentationsBonus.severe})
          </span>
        </div>
        <span className="text-[10px] text-[#F5F500] font-mono">{displayArmorLabel}</span>
      </div>
    </div>
  )
}
