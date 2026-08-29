"use client"

import React, { useState } from 'react'
import { Printer, Check, X, FileText, LayoutGrid, Sparkles, Bot } from 'lucide-react'
import type { CyberpunkPrintOptions } from '../print/cyberpunk-print-renderer'

interface CyberpunkPrintModalProps {
  isOpen: boolean
  onClose: () => void
  onTriggerPrint: (opts: CyberpunkPrintOptions) => void
  hasCompanion?: boolean
}

export function CyberpunkPrintModal({
  isOpen,
  onClose,
  onTriggerPrint,
  hasCompanion = false,
}: CyberpunkPrintModalProps) {
  const [includeDossier, setIncludeDossier] = useState(true)
  const [includeGearCards, setIncludeGearCards] = useState(true)
  const [includeDomainCards, setIncludeDomainCards] = useState(true)
  const [includeCompanionStory, setIncludeCompanionStory] = useState(hasCompanion)

  if (!isOpen) return null

  const handleStartPrint = () => {
    onTriggerPrint({
      includeDossier,
      includeGearCards,
      includeDomainCards,
      includeCompanionStory,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#6C00FF]/50 bg-[#0B0320] text-slate-100 p-6 shadow-[0_0_50px_rgba(108,0,255,0.4)] flex flex-col gap-5">
        {/* 标题 */}
        <div className="flex items-center justify-between border-b border-[#6C00FF]/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#6C00FF]/20 text-[#00FFA3] border border-[#6C00FF]/40">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">A4 实体印刷与战术卡牌导出</h3>
              <p className="text-xs text-slate-400">独立印刷排版体系 · 所见不说得 · 毫米级不跨页</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 打印页面勾选项 */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#F5F500] uppercase tracking-wider">
            选择要输出的 A4 页面模块：
          </div>

          {/* 第 1 页：战术总档案 */}
          <label className="flex items-start gap-3 p-3 rounded-xl border border-[#6C00FF]/40 bg-[#12072B] hover:border-[#00FFA3] transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeDossier}
              onChange={(e) => setIncludeDossier(e.target.checked)}
              className="mt-1 accent-[#00FFA3] w-4 h-4 rounded"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <FileText className="w-4 h-4 text-[#00FFA3]" />
                <span>第 1 页：战术总任务档案 (A4 单页 100% 锁定)</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                包含：代号、位阶、6 属性、熟练度、经历加成、双伤害阈值、HP/压力/希望轨、消耗品、部位插槽与行动/改装特性全文。
              </p>
            </div>
          </label>

          {/* 第 2 页：赛博军备与义体卡牌 */}
          <label className="flex items-start gap-3 p-3 rounded-xl border border-[#6C00FF]/40 bg-[#12072B] hover:border-[#00FFA3] transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeGearCards}
              onChange={(e) => setIncludeGearCards(e.target.checked)}
              className="mt-1 accent-[#00FFA3] w-4 h-4 rounded"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <LayoutGrid className="w-4 h-4 text-[#F5F500]" />
                <span>第 2 页：已装配军备与义体 3×3 九宫格实体卡牌</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                包含：主副手武器、战术护甲、头部/躯干/上下肢义体与外置设备（63.5mm × 88.9mm 标卡尺寸，带虚线裁剪边框）。
              </p>
            </div>
          </label>

          {/* 第 3 页：激活领域技能卡牌 */}
          <label className="flex items-start gap-3 p-3 rounded-xl border border-[#6C00FF]/40 bg-[#12072B] hover:border-[#00FFA3] transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeDomainCards}
              onChange={(e) => setIncludeDomainCards(e.target.checked)}
              className="mt-1 accent-[#00FFA3] w-4 h-4 rounded"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Sparkles className="w-4 h-4 text-[#00F0FF]" />
                <span>第 3 页：已激活领域技能 3×3 九宫格实体卡牌</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                包含：角色当前 5 张核心领域卡、职业与子职业特权卡，带完整法术/动作规则与消耗。
              </p>
            </div>
          </label>

          {/* 第 4 页：战斗伙伴与故事笔记 */}
          <label className="flex items-start gap-3 p-3 rounded-xl border border-[#6C00FF]/40 bg-[#12072B] hover:border-[#00FFA3] transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeCompanionStory}
              onChange={(e) => setIncludeCompanionStory(e.target.checked)}
              className="mt-1 accent-[#00FFA3] w-4 h-4 rounded"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Bot className="w-4 h-4 text-[#FF007F]" />
                <span>第 4 页：战斗伙伴与身世战役笔记</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                包含：战术伙伴（生化兽/仿生兽/随从/搭档）完整面板与生命轨、渊边问卷与任务情报。
              </p>
            </div>
          </label>
        </div>

        {/* 底部操作按钮 */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#6C00FF]/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleStartPrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00FFA3] hover:bg-[#00FFA3]/80 text-black font-extrabold text-sm shadow-[0_0_20px_rgba(0,255,163,0.4)] transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>开始 A4 打印 / 导出 PDF</span>
          </button>
        </div>
      </div>
    </div>
  )
}
