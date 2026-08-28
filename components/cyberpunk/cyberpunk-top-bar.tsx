"use client"

import React from 'react'
import Link from 'next/link'
import type { CyberpunkSheetExtension } from '@/types/cyberpunk'
import { CYBERPUNK_TIER_SLOTS } from '@/lib/cyberpunk/tier-constants'
import { Shield, Coins, Sparkles, FolderOpen, Sun, Moon, Printer, Save, Award, Home, LayoutGrid } from 'lucide-react'

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
    <header className="sticky top-0 z-30 rounded-xl border border-[#6C00FF]/40 bg-[#0B0320]/95 backdrop-blur-md p-3 shadow-[0_4px_20px_rgba(11,3,32,0.8)] font-sans transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* 左侧：返回主页、角色身份、存档与位阶 */}
        <div className="flex items-center gap-3">
          {/* 返回主站 Hub */}
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg border border-[#6C00FF]/40 bg-[#12072B] px-2.5 py-1 text-xs text-slate-300 hover:border-[#00FFA3] hover:text-[#00FFA3] transition-colors"
            title="返回 匕首心&爽博朋克in one 主页门户"
          >
            <Home className="h-3.5 w-3.5" />
            <span>主站</span>
          </Link>

          <span className="text-slate-600">|</span>

          {/* 角色与存档 */}
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#6C00FF] px-2 py-0.5 text-xs font-bold text-white shadow-[0_0_8px_rgba(108,0,255,0.6)]">
              渊边行者
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">{characterName || '未命名角色'}</span>
                <span className="text-xs text-[#F5F500] font-mono font-bold">({saveName} · LV.{level})</span>
              </div>
            </div>
            {/* 存档管理按钮 */}
            <button
              type="button"
              onClick={onOpenCharacterManagement}
              className="flex items-center gap-1 rounded border border-[#6C00FF]/40 bg-[#12072B] px-2 py-1 text-xs text-slate-300 hover:border-[#00FFA3] hover:text-[#00FFA3] transition-colors ml-1"
              title="切换/管理角色存档"
            >
              <FolderOpen className="h-3.5 w-3.5 text-[#00FFA3]" />
              <span>存档</span>
            </button>
          </div>

          {/* 位阶选择 (T1 ~ T4) */}
          <div className="flex items-center rounded-lg border border-[#6C00FF]/40 bg-[#12072B] p-0.5 text-xs font-mono">
            {(['T1', 'T2', 'T3', 'T4'] as const).map((tierKey) => (
              <button
                key={tierKey}
                type="button"
                onClick={() => handleTierChange(tierKey)}
                className={`rounded px-2.5 py-0.5 font-bold transition-all ${
                  currentTier === tierKey
                    ? 'bg-[#F5F500] text-black shadow-[0_0_10px_#F5F500]'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`位阶 ${tierKey}: 各区容量 ${CYBERPUNK_TIER_SLOTS[tierKey]} 格`}
              >
                {tierKey}
              </button>
            ))}
          </div>
        </div>

        {/* 右侧：经济点数 (信用点 / 街头声望)、浅色打印切换与操作按钮 */}
        <div className="flex items-center gap-3">
          {/* 信用点 (Credits) */}
          <div className="flex items-center gap-1.5 rounded-lg border border-[#F5F500]/40 bg-[#12072B] px-2.5 py-1 text-xs shadow-[0_0_10px_rgba(245,245,0,0.1)]">
            <Coins className="h-3.5 w-3.5 text-[#F5F500]" />
            <span className="text-slate-400">信用点:</span>
            <input
              type="number"
              value={credits}
              onChange={(e) => handleCreditsChange(parseInt(e.target.value, 10) || 0)}
              className="w-16 bg-transparent text-right font-mono font-bold text-[#F5F500] focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 font-mono">信用点</span>
          </div>

          {/* 街头声望 (Street Cred) */}
          <div className="flex items-center gap-1.5 rounded-lg border border-[#00FFA3]/40 bg-[#12072B] px-2.5 py-1 text-xs shadow-[0_0_10px_rgba(0,255,163,0.1)]">
            <Award className="h-3.5 w-3.5 text-[#00FFA3]" />
            <span className="text-slate-400">声望:</span>
            <input
              type="number"
              value={streetCred}
              onChange={(e) => handleStreetCredChange(parseInt(e.target.value, 10) || 0)}
              className="w-10 bg-transparent text-right font-mono font-bold text-[#00FFA3] focus:outline-none"
            />
          </div>

          {/* 快捷工具入口 */}
          <div className="hidden sm:flex items-center gap-1 border-r border-[#6C00FF]/30 pr-2 mr-1">
            <Link
              href="/workshop"
              className="rounded px-2 py-1 text-[11px] text-slate-300 hover:text-[#F5F500] hover:bg-[#6C00FF]/20 transition-colors"
              title="前往 卡牌工坊 V3"
            >
              工坊
            </Link>
            <Link
              href="/campaign"
              className="rounded px-2 py-1 text-[11px] text-slate-300 hover:text-[#FF007F] hover:bg-[#6C00FF]/20 transition-colors"
              title="前往 战役编辑器"
            >
              战役
            </Link>
            <Link
              href="/vault"
              className="rounded px-2 py-1 text-[11px] text-slate-300 hover:text-[#00FFA3] hover:bg-[#6C00FF]/20 transition-colors"
              title="前往 公共卡牌库 (Vault)"
            >
              卡牌库
            </Link>
          </div>

          {/* 浅色打印预览切换 (极简黑白灰) */}
          <button
            type="button"
            onClick={onToggleLightPreview}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition-all ${
              isLightPreview
                ? 'border-slate-400 bg-slate-200 text-slate-900 shadow-sm'
                : 'border-[#6C00FF]/40 bg-[#12072B] text-slate-300 hover:border-[#F5F500] hover:text-[#F5F500]'
            }`}
            title="切换极简黑白打印预览模式"
          >
            {isLightPreview ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-[#F5F500]" />}
            <span>{isLightPreview ? '极简浅色 (ON)' : '浅色打印预览'}</span>
          </button>

          {/* A4 打印按钮 */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1 rounded-lg border border-[#00FFA3]/50 bg-[#00FFA3]/15 px-2.5 py-1 text-xs font-bold text-[#00FFA3] hover:bg-[#00FFA3] hover:text-black transition-all shadow-[0_0_10px_rgba(0,255,163,0.2)]"
            title="调用系统打印，适配 A4 纸张排版"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>A4 打印</span>
          </button>

          {/* 保存按钮 */}
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="flex items-center gap-1 rounded-lg bg-[#FF007F] px-3 py-1 text-xs font-bold text-white hover:bg-[#FF007F]/90 shadow-[0_0_12px_rgba(255,0,127,0.5)] transition-all"
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
