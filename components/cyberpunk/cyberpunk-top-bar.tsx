"use client"

import React from 'react'
import type { CyberpunkSheetExtension } from '@/types/cyberpunk'
import { CYBERPUNK_TIER_SLOTS } from '@/lib/cyberpunk/tier-constants'
import { Shield, Coins, Sparkles, FolderOpen, Sun, Moon, Printer, Save, Award } from 'lucide-react'

interface CyberpunkTopBarProps {
  cyberpunkData: CyberpunkSheetExtension
  characterName: string
  saveName?: string
  level?: string
  onChange: (data: CyberpunkSheetExtension) => void
  onOpenCharacterManagement: () => void
  isLightPreview?: boolean
  onToggleLightPreview?: () => void
  onSave?: () => void
}

export function CyberpunkTopBar({
  cyberpunkData,
  characterName,
  saveName = '默认角色',
  level = '1',
  onChange,
  onOpenCharacterManagement,
  isLightPreview,
  onToggleLightPreview,
  onSave,
}: CyberpunkTopBarProps) {
  const currentTier = cyberpunkData?.tier || 'T1'
  const credits = typeof cyberpunkData?.credits === 'number' ? cyberpunkData.credits : 0
  const streetCred = typeof cyberpunkData?.streetCred === 'number' ? cyberpunkData.streetCred : 0

  const handleTierChange = (newTier: 'T1' | 'T2' | 'T3' | 'T4') => {
    onChange({
      ...cyberpunkData,
      tier: newTier,
    })
  }

  const handleCreditsChange = (newCredits: number) => {
    onChange({
      ...cyberpunkData,
      credits: Math.max(0, newCredits),
    })
  }

  const handleStreetCredChange = (newCred: number) => {
    onChange({
      ...cyberpunkData,
      streetCred: Math.max(0, newCred),
    })
  }

  return (
    <header className="sticky top-0 z-30 rounded-xl border border-slate-800 bg-[#0d0d1a]/95 backdrop-blur-md p-3 shadow-xl font-sans transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* 左侧：角色身份、存档与位阶 */}
        <div className="flex items-center gap-3">
          {/* 角色与存档 */}
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#00F0FF]/15 px-2 py-0.5 text-xs font-bold text-[#00F0FF] border border-[#00F0FF]/30">
              渊边行者
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">{characterName || '未命名角色'}</span>
                <span className="text-xs text-slate-400 font-mono">({saveName} · LV.{level})</span>
              </div>
            </div>
            {/* 存档管理按钮 */}
            <button
              type="button"
              onClick={onOpenCharacterManagement}
              className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-2 py-1 text-xs text-slate-300 hover:border-[#00F0FF] hover:text-white transition-colors ml-1"
              title="切换/管理角色存档"
            >
              <FolderOpen className="h-3.5 w-3.5 text-[#00F0FF]" />
              <span>存档</span>
            </button>
          </div>

          {/* 位阶选择 (T1 ~ T4) */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-[#070710] p-0.5 text-xs font-mono">
            {(['T1', 'T2', 'T3', 'T4'] as const).map((tierKey) => (
              <button
                key={tierKey}
                type="button"
                onClick={() => handleTierChange(tierKey)}
                className={`rounded px-2 py-0.5 font-bold transition-all ${
                  currentTier === tierKey
                    ? 'bg-[#00F0FF] text-black shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`位阶 ${tierKey}: 各区容量 ${CYBERPUNK_TIER_SLOTS[tierKey]} 格`}
              >
                {tierKey}
              </button>
            ))}
          </div>
        </div>

        {/* 右侧：经济点数、街头声望、浅色打印预览与 A4 打印 */}
        <div className="flex items-center gap-3">
          {/* 信用点 (Credits) */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#070710] px-2.5 py-1 text-xs">
            <Coins className="h-3.5 w-3.5 text-[#FCEE0A]" />
            <span className="text-slate-400 font-medium">信用点:</span>
            <input
              type="number"
              value={credits}
              onChange={(e) => handleCreditsChange(parseInt(e.target.value, 10) || 0)}
              className="w-16 bg-transparent font-bold text-[#FCEE0A] font-mono focus:outline-none text-right"
            />
            <span className="text-[10px] text-slate-500 font-mono">CR</span>
          </div>

          {/* 街头声望 (Street Cred) */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#070710] px-2.5 py-1 text-xs">
            <Award className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-slate-400 font-medium">声望:</span>
            <input
              type="number"
              value={streetCred}
              onChange={(e) => handleStreetCredChange(parseInt(e.target.value, 10) || 0)}
              className="w-10 bg-transparent font-bold text-purple-300 font-mono focus:outline-none text-center"
            />
          </div>

          {/* 浅色/极简黑白打印预览切换 */}
          {onToggleLightPreview && (
            <button
              type="button"
              onClick={onToggleLightPreview}
              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                isLightPreview
                  ? 'bg-white text-slate-900 border-white shadow-md font-bold'
                  : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:border-slate-500'
              }`}
              title="切换浅色模式以预览 A4 打印版面"
            >
              {isLightPreview ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-slate-400" />}
              <span>{isLightPreview ? '极简黑白预览' : '🌓 浅色打印预览'}</span>
            </button>
          )}

          {/* A4 打印按钮 */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:border-[#00F0FF] transition-all"
            title="A4 竖版打印 (0 墨水线框化)"
          >
            <Printer className="h-3.5 w-3.5 text-cyan-400" />
            <span>A4 打印</span>
          </button>

          {/* 快速保存 */}
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="flex items-center gap-1 rounded bg-[#00F0FF] px-3 py-1 text-xs font-bold text-black hover:bg-[#00F0FF]/90 transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)]"
            >
              <Save className="h-3.5 w-3.5" />
              <span>保存</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
