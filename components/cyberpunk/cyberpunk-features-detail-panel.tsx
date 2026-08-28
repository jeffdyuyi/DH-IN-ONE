"use client"

import React, { useState } from 'react'
import { useSheetStore } from '@/lib/sheet-store'
import { useCardStore } from '@/card/stores/unified-card-store'
import type { StandardCard } from '@/card/card-types'
import { BookOpen, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import { CardMarkdown } from '@/components/ui/card-markdown'
import rehypeRaw from 'rehype-raw'

export function CyberpunkFeaturesDetailPanel() {
  const formData = useSheetStore((state) => state.sheetData)
  const cardStore = useCardStore()

  const [activeModalCard, setActiveModalCard] = useState<{
    title: string
    card?: StandardCard | null
    text?: string
  } | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)

  // 1. 职业卡 (cards[0] 或 professionRef)
  const professionCard: StandardCard | undefined =
    (formData.cards && formData.cards[0]) ||
    (formData.professionRef?.id ? cardStore.getCardById(formData.professionRef.id) : undefined)

  // 2. 种族特性一 (cards[1] 或 ancestry1Ref)
  const ancestry1Card: StandardCard | undefined =
    (formData.cards && formData.cards[1]) ||
    (formData.ancestry1Ref?.id ? cardStore.getCardById(formData.ancestry1Ref.id) : undefined)

  // 3. 种族特性二 (cards[2] 或 ancestry2Ref)
  const ancestry2Card: StandardCard | undefined =
    (formData.cards && formData.cards[2]) ||
    (formData.ancestry2Ref?.id ? cardStore.getCardById(formData.ancestry2Ref.id) : undefined)

  // 4. 社群特性 (cards[3] 或 communityRef)
  const communityCard: StandardCard | undefined =
    (formData.cards && formData.cards[3]) ||
    (formData.communityRef?.id ? cardStore.getCardById(formData.communityRef.id) : undefined)

  // 5. 子职业特性 (cards[4] 或 subclassRef)
  const subclassCard: StandardCard | undefined =
    (formData.cards && formData.cards[4]) ||
    (formData.subclassRef?.id ? cardStore.getCardById(formData.subclassRef.id) : undefined)

  const featuresList = [
    {
      title: '职业特性',
      name: formData.profession || professionCard?.name || '（未选定职业）',
      card: professionCard,
      desc: professionCard?.description || (professionCard as any)?.feature || '请先在基础信息中选择职业',
      tagColor: 'text-[#F5F500] border-[#F5F500]/40 bg-[#F5F500]/10',
    },
    {
      title: '子职业特性',
      name: formData.subclass || subclassCard?.name || '（未选定子职业）',
      card: subclassCard,
      desc: subclassCard?.description || (subclassCard as any)?.feature || '请先在基础信息中选择子职业',
      tagColor: 'text-[#6C00FF] border-[#6C00FF]/40 bg-[#6C00FF]/20',
    },
    {
      title: '种族特性一',
      name: formData.ancestry1 || ancestry1Card?.name || '（未选定种族一）',
      card: ancestry1Card,
      desc: ancestry1Card?.description || (ancestry1Card as any)?.feature || '请先在基础信息中选择种族特性一',
      tagColor: 'text-[#00FFA3] border-[#00FFA3]/40 bg-[#00FFA3]/10',
    },
    {
      title: '种族特性二',
      name: formData.ancestry2 || ancestry2Card?.name || '（未选定种族二）',
      card: ancestry2Card,
      desc: ancestry2Card?.description || (ancestry2Card as any)?.feature || '请先在基础信息中选择种族特性二',
      tagColor: 'text-[#00FFA3] border-[#00FFA3]/40 bg-[#00FFA3]/10',
    },
    {
      title: '社群特性',
      name: formData.community || communityCard?.name || '（未选定社群）',
      card: communityCard,
      desc: communityCard?.description || (communityCard as any)?.feature || '请先在基础信息中选择社群',
      tagColor: 'text-[#FF007F] border-[#FF007F]/40 bg-[#FF007F]/10',
    },
  ]

  return (
    <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 text-slate-100 font-sans shadow-[0_4px_20px_rgba(11,3,32,0.6)]">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#00FFA3]" />
          <h3 className="text-sm font-bold text-white tracking-wide">身份与特性详情 (Features)</h3>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
        >
          <span>{isExpanded ? '收起详情' : '展开详情'}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* 特性卡片流 */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {featuresList.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-[#6C00FF]/30 bg-[#0B0320] p-3 flex flex-col justify-between hover:border-[#00FFA3]/50 transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${item.tagColor}`}>
                    {item.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveModalCard({ title: item.title, card: item.card, text: item.desc })}
                    className="text-slate-500 hover:text-[#00FFA3] p-0.5 rounded transition-colors"
                    title="查看卡牌全文"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h4 className="font-bold text-xs text-white truncate">{item.name}</h4>

                <div className="text-[11px] text-slate-300 leading-relaxed mt-1.5 line-clamp-3">
                  <CardMarkdown>{item.desc}</CardMarkdown>
                </div>
              </div>

              <div className="mt-2 pt-1 border-t border-[#6C00FF]/20 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveModalCard({ title: item.title, card: item.card, text: item.desc })}
                  className="text-[10px] text-[#00FFA3] hover:text-white transition-colors"
                >
                  阅读全文 ↗
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 弹窗查看特性全文 */}
      {activeModalCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#6C00FF]/60 bg-[#0B0320] p-5 shadow-[0_0_30px_rgba(108,0,255,0.4)] text-white max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#6C00FF]/30 pb-2.5">
              <span className="text-xs font-bold text-[#F5F500] px-2 py-0.5 rounded bg-[#F5F500]/10 border border-[#F5F500]/30">
                {activeModalCard.title}
              </span>
              <button
                type="button"
                onClick={() => setActiveModalCard(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                关闭 ✕
              </button>
            </div>

            <div className="mt-3 font-bold text-base text-white">
              {activeModalCard.card?.name || '特性详情'}
            </div>

            <div className="mt-2.5 flex-1 overflow-y-auto pr-1 text-xs text-slate-200 leading-relaxed custom-scrollbar">
              <CardMarkdown>
                {activeModalCard.text || activeModalCard.card?.description || ''}
              </CardMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
