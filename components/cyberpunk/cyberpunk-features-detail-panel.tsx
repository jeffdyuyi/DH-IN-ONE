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

  const [activeModalCard, setActiveModalCard] = useState<{ title: string; card?: StandardCard | null; text?: string } | null>(null)
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
      tagColor: 'text-[#FCEE0A] border-[#FCEE0A]/40 bg-[#FCEE0A]/10',
    },
    {
      title: '子职业特性',
      name: formData.subclass || subclassCard?.name || '（未选定子职业）',
      card: subclassCard,
      desc: subclassCard?.description || (subclassCard as any)?.feature || '请先在基础信息中选择子职业',
      tagColor: 'text-purple-400 border-purple-500/40 bg-purple-950/30',
    },
    {
      title: '种族特性一',
      name: formData.ancestry1 || ancestry1Card?.name || '（未选定种族一）',
      card: ancestry1Card,
      desc: ancestry1Card?.description || (ancestry1Card as any)?.feature || '请先在基础信息中选择种族特性一',
      tagColor: 'text-[#00F0FF] border-[#00F0FF]/40 bg-[#00F0FF]/10',
    },
    {
      title: '种族特性二',
      name: formData.ancestry2 || ancestry2Card?.name || '（未选定种族二）',
      card: ancestry2Card,
      desc: ancestry2Card?.description || (ancestry2Card as any)?.feature || '请先在基础信息中选择种族特性二',
      tagColor: 'text-[#00F0FF] border-[#00F0FF]/40 bg-[#00F0FF]/10',
    },
    {
      title: '社群特性',
      name: formData.community || communityCard?.name || '（未选定社群）',
      card: communityCard,
      desc: communityCard?.description || (communityCard as any)?.feature || '请先在基础信息中选择社群',
      tagColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30',
    },
  ]

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d0d1a] p-4 text-slate-100 font-sans shadow-md">
      {/* 头部切换 */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#00F0FF]" />
          <h3 className="text-sm font-bold text-white">身份特性与能力详情</h3>
          <span className="text-[11px] text-slate-400">（职业专精、子职、双种族特性与社群）</span>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
        >
          <span>{isExpanded ? '收起' : '展开'}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {featuresList.map((item, idx) => (
            <div
              key={`feature_${idx}`}
              className="flex flex-col justify-between rounded-lg border border-slate-800 bg-[#0f0f22] p-3 hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${item.tagColor}`}>
                    {item.title}
                  </span>
                  {item.card && (
                    <button
                      type="button"
                      onClick={() => setActiveModalCard({ title: `${item.title}: ${item.name}`, card: item.card })}
                      className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline font-bold"
                    >
                      <Eye className="h-3 w-3" />
                      <span>全文</span>
                    </button>
                  )}
                </div>

                <div className="mt-1.5 font-bold text-xs text-white truncate" title={item.name}>
                  {item.name}
                </div>

                <div className="mt-1 text-[11px] text-slate-300 leading-relaxed max-h-24 overflow-hidden">
                  <CardMarkdown rehypePlugins={[rehypeRaw]}>
                    {item.desc}
                  </CardMarkdown>
                </div>
              </div>

              {item.card?.level && (
                <div className="mt-2 pt-1 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                  等级: Lv.{item.card.level}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 全文查看弹窗 */}
      {activeModalCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-white text-gray-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <div>
                <div className="text-xs font-bold text-cyan-700">{activeModalCard.title}</div>
                <div className="text-base font-bold text-gray-900 mt-0.5">
                  {activeModalCard.card?.name || '特性详情'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalCard(null)}
                className="h-7 w-7 rounded bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2 text-xs text-gray-800 space-y-2 leading-relaxed">
              <CardMarkdown rehypePlugins={[rehypeRaw]}>
                {activeModalCard.card?.description || (activeModalCard.card as any)?.feature || activeModalCard.text || '暂无详细描述'}
              </CardMarkdown>
            </div>

            <div className="mt-4 flex justify-end border-t pt-2">
              <button
                type="button"
                onClick={() => setActiveModalCard(null)}
                className="rounded bg-gray-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-gray-800"
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
