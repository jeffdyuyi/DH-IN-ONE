"use client"

import React, { useState } from 'react'
import type { StandardCard } from '../../card/card-types'
import { Eye, X, BookOpen, Layers } from 'lucide-react'

interface ModalCardState {
  title: string
  card?: StandardCard | null
  text?: string
}

interface CyberpunkFeaturesDetailPanelProps {
  cards?: StandardCard[]
  professionCard?: StandardCard | null
  subclassCard?: StandardCard | null
  ancestry1Card?: StandardCard | null
  ancestry2Card?: StandardCard | null
  communityCard?: StandardCard | null
}

export function CyberpunkFeaturesDetailPanel({
  cards = [],
  professionCard,
  subclassCard,
  ancestry1Card,
  ancestry2Card,
  communityCard,
}: CyberpunkFeaturesDetailPanelProps) {
  const [activeModalCard, setActiveModalCard] = useState<ModalCardState | null>(null)

  const featureItems = [
    { title: '职业特性', card: professionCard },
    { title: '子职业特性', card: subclassCard },
    { title: '种族特性一', card: ancestry1Card },
    { title: '种族特性二', card: ancestry2Card },
    { title: '社群特性', card: communityCard },
  ].filter(item => item.card && item.card.name)

  return (
    <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-xs text-[#00FFA3] uppercase tracking-wider flex items-center space-x-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          <span>核心角色与背景特性文案 ({featureItems.length})</span>
        </h3>
        <span className="text-[10px] text-slate-500">点击卡片展开阅读完整裁决文案</span>
      </div>

      {featureItems.length === 0 ? (
        <p className="text-xs text-slate-500 py-3 text-center">暂未选择基础职业或种族社群</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {featureItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setActiveModalCard(item)}
              className="p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#00FFA3]/50 transition cursor-pointer flex items-center justify-between group"
            >
              <div className="pr-2">
                <span className="text-[10px] text-slate-400 block">{item.title}</span>
                <h4 className="font-bold text-xs text-white group-hover:text-[#00FFA3] transition truncate">
                  {item.card?.name}
                </h4>
              </div>
              <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00FFA3] transition flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* 特性全文弹窗 */}
      {activeModalCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0B0320] text-slate-100 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00FFA3]/10 text-[#00FFA3]">
                  {activeModalCard.title}
                </span>
                <h3 className="font-bold text-base text-white mt-1">
                  {activeModalCard.card?.name || '特性详情'}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalCard(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-1 text-xs text-slate-300 leading-relaxed bg-black/30 p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
              {activeModalCard.card?.description || (activeModalCard.card as any)?.feature || activeModalCard.text || '暂无详细描述'}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setActiveModalCard(null)}
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
