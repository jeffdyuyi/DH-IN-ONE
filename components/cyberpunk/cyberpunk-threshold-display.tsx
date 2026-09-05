"use client"

import React, { useState } from 'react'
import type { CyberpunkSheetExtension } from '@/types/cyberpunk'
import { calculateCyberpunkThresholds } from '@/lib/cyberpunk/threshold-calculator'
import { Activity, ShieldAlert, Sparkles, Sliders, RotateCcw, Check } from 'lucide-react'

interface CyberpunkThresholdDisplayProps {
  cyberpunkData?: CyberpunkSheetExtension
  armorMinor?: number
  armorMajor?: number
  equippedArmorName?: string
  onUpdateCyberpunkData?: (patch: Partial<CyberpunkSheetExtension>) => void
}

export function CyberpunkThresholdDisplay({
  cyberpunkData,
  armorMinor = 0,
  armorMajor = 0,
  equippedArmorName,
  onUpdateCyberpunkData,
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

  const {
    nativeBase,
    torsoTierBonus,
    augmentationsBonus,
    armorBonus,
    rawArmorThresholds,
    isImplicitArmorConverted,
    totalMajor: autoMajor,
    totalSevere: autoSevere,
    massiveThreshold: autoMassive,
  } = thresholdResult

  // 自定义伤害阈值状态
  const isCustomEnabled = !!cyberpunkData?.customThresholds?.enabled
  const currentMajor = isCustomEnabled
    ? (cyberpunkData?.customThresholds?.major ?? autoMajor)
    : autoMajor
  const currentSevere = isCustomEnabled
    ? (cyberpunkData?.customThresholds?.severe ?? autoSevere)
    : autoSevere
  const currentMassive = isCustomEnabled
    ? (cyberpunkData?.customThresholds?.massive ?? autoMassive)
    : autoMassive

  // 切换自定义开关
  const handleToggleCustom = () => {
    const nextEnabled = !isCustomEnabled
    onUpdateCyberpunkData?.({
      customThresholds: {
        enabled: nextEnabled,
        major: nextEnabled ? currentMajor : undefined,
        severe: nextEnabled ? currentSevere : undefined,
        massive: nextEnabled ? currentMassive : undefined,
      },
    })
  }

  // 修改自定义阈值数值
  const handleCustomValueChange = (field: 'major' | 'severe' | 'massive', val: number) => {
    onUpdateCyberpunkData?.({
      customThresholds: {
        enabled: true,
        major: field === 'major' ? val : currentMajor,
        severe: field === 'severe' ? val : currentSevere,
        massive: field === 'massive' ? val : currentMassive,
      },
    })
  }

  // 重置为自动计算
  const handleResetToAuto = () => {
    onUpdateCyberpunkData?.({
      customThresholds: {
        enabled: false,
        major: undefined,
        severe: undefined,
        massive: undefined,
      },
    })
  }

  const displayArmorLabel = equippedArmorName ? `护甲: ${equippedArmorName}` : '未装备护甲'

  return (
    <div className="rounded-xl border border-[#6C00FF]/30 bg-[#0B0320]/80 p-3.5 shadow-md font-sans">
      {/* 标题栏 */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#6C00FF]/20 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#00FFA3]" />
          <h3 className="text-xs font-bold text-white tracking-wide">伤害阈值 (Damage Thresholds)</h3>
          {isCustomEnabled && (
            <span className="text-[10px] font-bold bg-[#F5F500]/20 text-[#F5F500] px-1.5 py-0.5 rounded border border-[#F5F500]/40 animate-pulse">
              手动自定义模式
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* 自定义调整开关 */}
          <button
            type="button"
            onClick={handleToggleCustom}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
              isCustomEnabled
                ? 'bg-[#F5F500]/20 border-[#F5F500] text-[#F5F500] shadow-[0_0_8px_rgba(245,245,0,0.25)]'
                : 'bg-[#12072B] border-slate-700 text-slate-300 hover:text-white hover:border-[#6C00FF]'
            }`}
            title="点击开启或关闭伤害阈值手动自定义调整"
          >
            <Sliders className="h-3 w-3" />
            <span>{isCustomEnabled ? '自定义调整: 已开启' : '自定义调整: 自动计算'}</span>
          </button>

          {isCustomEnabled && (
            <button
              type="button"
              onClick={handleResetToAuto}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono text-slate-400 bg-black/40 border border-slate-800 hover:text-white hover:border-slate-600 transition-colors"
              title="重置为自动公式计算值"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              <span>重置</span>
            </button>
          )}

          {/* 巨额伤害可选房规快捷开关 */}
          <button
            type="button"
            onClick={() => setMassiveDamageRuleEnabled(!massiveDamageRuleEnabled)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-bold border transition-colors ${
              massiveDamageRuleEnabled
                ? 'bg-[#6C00FF]/25 border-[#00FFA3] text-[#00FFA3] shadow-[0_0_8px_rgba(0,255,163,0.2)]'
                : 'bg-[#12072B] border-slate-700 text-slate-400'
            }`}
            title="点击切换巨额伤害可选房规"
          >
            <span>巨额房规: {massiveDamageRuleEnabled ? '开启 (4血)' : '关闭'}</span>
          </button>

          {hasHarvestedLung ? (
            <span className="text-[10px] text-[#FF007F] font-bold bg-[#FF007F]/10 px-1.5 py-0.5 rounded border border-[#FF007F]/30">
              ⚠️ 肺部切除 (基准 4/8)
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono">基准 5/10</span>
          )}
        </div>
      </div>

      {/* 核心大数字展示 (带自定义输入支持) */}
      <div className="mt-2.5 grid grid-cols-3 gap-2.5 text-center font-mono">
        {/* 重度伤害 */}
        <div className="rounded-lg border border-[#F5F500]/40 bg-[#F5F500]/10 p-2 shadow-[0_0_10px_rgba(245,245,0,0.08)] flex flex-col justify-between">
          <div className="text-[10px] text-[#F5F500] font-bold">重度伤害 (Major)</div>
          <div className="my-0.5 flex justify-center items-center">
            {isCustomEnabled ? (
              <input
                type="number"
                value={currentMajor}
                onChange={(e) => handleCustomValueChange('major', Math.max(1, parseInt(e.target.value) || 0))}
                className="w-16 text-center text-xl font-black text-[#F5F500] bg-black/60 border border-[#F5F500]/50 rounded focus:outline-none focus:border-[#F5F500] focus:ring-1 focus:ring-[#F5F500]"
              />
            ) : (
              <div className="text-xl font-black text-[#F5F500]">{currentMajor}</div>
            )}
          </div>
          <div className="text-[10px] text-slate-300">≥ {currentMajor} 扣 2 命</div>
        </div>

        {/* 严重伤害 */}
        <div className="rounded-lg border border-[#FF007F]/40 bg-[#FF007F]/10 p-2 shadow-[0_0_10px_rgba(255,0,127,0.1)] flex flex-col justify-between">
          <div className="text-[10px] text-[#FF007F] font-bold">严重伤害 (Severe)</div>
          <div className="my-0.5 flex justify-center items-center">
            {isCustomEnabled ? (
              <input
                type="number"
                value={currentSevere}
                onChange={(e) => handleCustomValueChange('severe', Math.max(1, parseInt(e.target.value) || 0))}
                className="w-16 text-center text-xl font-black text-[#FF007F] bg-black/60 border border-[#FF007F]/50 rounded focus:outline-none focus:border-[#FF007F] focus:ring-1 focus:ring-[#FF007F]"
              />
            ) : (
              <div className="text-xl font-black text-[#FF007F]">{currentSevere}</div>
            )}
          </div>
          <div className="text-[10px] text-slate-300">≥ {currentSevere} 扣 3 命</div>
        </div>

        {/* 巨额伤害（可选房规） */}
        <div
          className={`rounded-lg border p-2 transition-all flex flex-col justify-between ${
            massiveDamageRuleEnabled
              ? 'border-[#6C00FF] bg-[#6C00FF]/15 shadow-[0_0_12px_rgba(108,0,255,0.2)]'
              : 'border-slate-800 bg-black/40 opacity-50'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#00FFA3]">
            <span>巨额伤害 (Massive)</span>
          </div>
          <div className="my-0.5 flex justify-center items-center">
            {massiveDamageRuleEnabled ? (
              isCustomEnabled ? (
                <input
                  type="number"
                  value={currentMassive}
                  onChange={(e) => handleCustomValueChange('massive', Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-16 text-center text-xl font-black text-white bg-black/60 border border-[#00FFA3]/50 rounded focus:outline-none focus:border-[#00FFA3] focus:ring-1 focus:ring-[#00FFA3]"
                />
              ) : (
                <div className="text-xl font-black text-white">{currentMassive}</div>
              )
            ) : (
              <div className="text-xl font-black text-slate-500">—</div>
            )}
          </div>
          <div className="text-[10px] text-slate-300">
            {massiveDamageRuleEnabled ? `≥ ${currentMassive} 扣 4 命` : '房规未开启'}
          </div>
        </div>
      </div>

      {/* 伤害算式拆解与隐性换算提示 */}
      <div className="mt-2 space-y-1.5">
        <div className="rounded-md bg-[#12072B] px-2.5 py-1.5 border border-[#6C00FF]/20 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <span className="text-[#00FFA3] font-bold">算式拆解:</span>
            <span>
              原生基准({nativeBase.major}/{nativeBase.severe}) + 躯干位阶({torsoTierBonus.major}/{torsoTierBonus.severe}) + 护甲/义体({armorBonus.major + augmentationsBonus.major}/{armorBonus.severe + augmentationsBonus.severe})
            </span>
          </div>
          <span className="text-[10px] text-[#F5F500] font-mono">{displayArmorLabel}</span>
        </div>

        {/* 核心护甲 -5/-11 隐性换算提示 */}
        {rawArmorThresholds && (rawArmorThresholds.minor > 0 || rawArmorThresholds.major > 0) && (
          <div className="rounded-md bg-[#00FFA3]/5 px-2.5 py-1 border border-[#00FFA3]/20 text-[10px] text-[#00FFA3] flex items-center justify-between">
            <span>
              🛡️ 核心规则护甲换算：护甲卡面原始阈值 ({rawArmorThresholds.minor}/{rawArmorThresholds.major})
              {isImplicitArmorConverted
                ? ` 经官方基准(-5/-11)换算为有效加值 (+${armorBonus.major}/+${armorBonus.severe})`
                : ` 直接提供有效加值 (+${armorBonus.major}/+${armorBonus.severe})`}
            </span>
            <span className="text-slate-400 font-mono">避免阈值虚高</span>
          </div>
        )}
      </div>
    </div>
  )
}
