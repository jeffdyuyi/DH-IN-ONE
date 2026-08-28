"use client"

import React, { useState } from 'react'
import type { StandardCard } from '../../card/card-types'
import { Sparkles, Eye, X, BookOpen, Layers } from 'lucide-react'

interface CyberpunkDomainDeckProps {
  cards?: StandardCard[]
  domain1?: string
  domain2?: string
}

export function CyberpunkDomainDeck({
  cards = [],
  domain1,
  domain2,
}: CyberpunkDomainDeckProps) {
  const [activeCard, setActiveCard] = useState<StandardCard | null>(null)

  return (
    <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-xs text-[#6C00FF] uppercase tracking-wider flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>领域法术与网络协议手牌 ({cards.length})</span>
        </h3>
        <div className="flex items-center space-x-1 text-[10px] text-slate-400">
          {domain1 && <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">{domain1}</span>}
          {domain2 && <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">{domain2}</span>}
        </div>
      </div>

      {cards.length === 0 ? (
        <p className="text-xs text-slate-500 py-4 text-center">暂未装备任何领域法术或技能卡</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {cards.map((c) => {
            const domainName = (c as any).domain || (c as any).category || '领域法术'
            const levelVal = (c as any).level || 1

            return (
              <div
                key={c.id}
                onClick={() => setActiveCard(c)}
                className="p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#6C00FF]/50 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="pr-2 min-w-0">
                  <span className="text-[10px] text-[#6C00FF] font-semibold block truncate">
                    {domainName} (LV.{levelVal})
                  </span>
                  <h4 className="font-bold text-xs text-white group-hover:text-[#6C00FF] transition truncate">
                    {c.name}
                  </h4>
                </div>
                <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#6C00FF] transition flex-shrink-0" />
              </div>
            )
          })}
        </div>
      )}

      {/* 手牌详情弹窗 */}
      {activeCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0B0320] text-slate-100 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#6C00FF]/20 text-[#6C00FF]">
                  {(activeCard as any).domain || (activeCard as any).category || '领域技能'} · LV.{(activeCard as any).level || 1}
                </span>
                <h3 className="font-bold text-base text-white mt-1">
                  {activeCard.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveCard(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-1 text-xs text-slate-300 leading-relaxed bg-black/30 p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
              {activeCard.description || (activeCard as any).feature || (activeCard as any).ability || '暂无详细描述'}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setActiveCard(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
