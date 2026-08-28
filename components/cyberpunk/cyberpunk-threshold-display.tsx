"use client"

import React, { useState } from 'react'
import type { CyberpunkSheetExtension } from '@/types/cyberpunk'
import { calculateCyberpunkThresholds } from '@/lib/cyberpunk/threshold-calculator'
import { Activity, ShieldAlert, Sparkles } from 'lucide-react'

interface CyberpunkThresholdDisplayProps {
  cyberpunkData: CyberpunkSheetExtension
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
    cyberpunkData?.illegalModifications?.enabled &&
    cyberpunkData?.illegalModifications?.harvestedOrgans?.includes('lung')
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
    <div className="rounded-xl border border-slate-800 bg-[#0d0d1a] p-4 shadow-md font-sans">
      {/* 标题栏 */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#00F0FF]" />
          <h3 className="text-sm font-bold text-white">伤害阈值 (Damage Thresholds)</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {/* 巨额伤害可选房规快捷开关 */}
          <button
            type="button"
            onClick={() => setMassiveDamageRuleEnabled(!massiveDamageRuleEnabled)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-colors ${
              massiveDamageRuleEnabled
                ? 'bg-purple-950/40 border-purple-500/50 text-purple-300'
                : 'bg-slate-900 border-slate-700 text-slate-500'
            }`}
            title="点击切换巨额伤害可选房规"
          >
            <span>巨额伤害房规: {massiveDamageRuleEnabled ? '已开启' : '已关闭'}</span>
          </button>

          {hasHarvestedLung ? (
            <span className="text-[11px] text-[#FF003C] font-bold">
              ⚠️ 肺部切除 (基准 4/8)
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">基准 5/10 (累加算式)</span>
          )}
        </div>
      </div>

      {/* 核心大数字展示 */}
      <div className="mt-3 grid grid-cols-3 gap-3 text-center font-mono">
        {/* 重度伤害 */}
        <div className="rounded-lg border border-[#FCEE0A]/40 bg-[#FCEE0A]/5 p-2.5">
          <div className="text-[11px] text-[#FCEE0A] font-bold">重度伤害 (Major)</div>
          <div className="text-2xl font-black text-[#FCEE0A] mt-0.5">{totalMajor}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">≥ {totalMajor} 扣 2 命</div>
        </div>

        {/* 严重伤害 */}
        <div className="rounded-lg border border-[#FF003C]/40 bg-[#FF003C]/5 p-2.5">
          <div className="text-[11px] text-[#FF003C] font-bold">严重伤害 (Severe)</div>
          <div className="text-2xl font-black text-[#FF003C] mt-0.5">{totalSevere}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">≥ {totalSevere} 扣 3 命</div>
        </div>

        {/* 巨额伤害（可选房规） */}
        <div className={`rounded-lg border p-2.5 transition-all ${
          massiveDamageRuleEnabled
            ? 'border-purple-500/40 bg-purple-950/20 shadow-[0_0_12px_rgba(168,85,247,0.1)]'
            : 'border-slate-800 bg-black/40 opacity-60'
        }`}>
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-purple-400">
            <span>巨额伤害 (Massive)</span>
          </div>
          <div className="text-2xl font-black text-purple-300 mt-0.5">
            {massiveDamageRuleEnabled ? massiveThreshold : '—'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {massiveDamageRuleEnabled ? `≥ ${massiveThreshold} 标记 4 命` : '房规未启用'}
          </div>
        </div>
      </div>

      {/* 巨额伤害规则文案与算式拆解 */}
      <div className="mt-3 space-y-2">
        {massiveDamageRuleEnabled && (
          <div className="rounded-lg border border-purple-500/20 bg-purple-950/15 p-2.5 text-xs text-purple-200/90 leading-relaxed">
            <span className="font-bold text-purple-300">可选规则：巨额伤害</span> — 为了让游戏过程更为险象环生，你可以引入巨额伤害阈值规则：如果你受到的伤害大于等于严重伤害阈值的两倍（即 ≥ {massiveThreshold} 点），你将标记 4 生命点。
          </div>
        )}

        <div className="rounded-lg border border-slate-800 bg-[#070710] p-2.5 text-xs text-slate-300 font-mono">
          <div className="text-[11px] font-bold text-slate-400 mb-1 font-sans">
            算式拆解：
          </div>

          <div className="space-y-1 text-[11px] leading-relaxed">
            <div className="flex justify-between items-center text-slate-300">
              <span>1. 原生基准: <span className="text-[#00F0FF] font-bold">{nativeBase.major} / {nativeBase.severe}</span></span>
              <span className="text-slate-500">{hasHarvestedLung ? '肺部切除 (4/8)' : '健康肉身 (5/10)'}</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>2. 躯干位阶 ({currentTier}): <span className="text-[#FCEE0A] font-bold">+{torsoTierBonus.major} / +{torsoTierBonus.severe}</span></span>
              <span className="text-slate-500">{currentTier} 躯干加成</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>3. 义体元件加值: <span className="text-emerald-400 font-bold">+{augmentationsBonus.major} / +{augmentationsBonus.severe}</span></span>
              <span className="text-slate-500">已装配元件</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>4. 护甲加值: <span className="text-cyan-400 font-bold">+{armorBonus.major} / +{armorBonus.severe}</span></span>
              <span className="text-slate-500">{displayArmorLabel}</span>
            </div>

            <div className="border-t border-slate-800 pt-1 flex justify-between font-bold text-[#00F0FF]">
              <span>合计:</span>
              <span>重度 {totalMajor} / 严重 {totalSevere} {massiveDamageRuleEnabled ? `(巨额 ${massiveThreshold})` : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
