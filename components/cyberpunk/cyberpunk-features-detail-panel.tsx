"use client"

import React, { useState } from 'react'
import { useSheetStore } from '@/lib/sheet-store'
import { useCardStore } from '@/card/stores/unified-card-store'
import type { StandardCard } from '@/card/card-types'
import { BookOpen, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import { CardMarkdown } from '@/components/ui/card-markdown'

export function CyberpunkFeaturesDetailPanel() {
  const formData = useSheetStore((state) => state.sheetData)
  const cardStore = useCardStore()

  const [activeModalCard, setActiveModalCard] = useState<{
    title: string
    name: string
    card?: StandardCard | null
    text?: string
  } | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)

  // 严格根据 Daggerheart 底层卡槽映射：
  // cards[0] = 职业 (profession)
  // cards[1] = 子职业 (subclass)
  // cards[2] = 种族特性一 (ancestry1)
  // cards[3] = 种族特性二 (ancestry2)
  // cards[4] = 社群特性 (community)

  // 1. 职业卡
  const professionCard: StandardCard | undefined =
    (formData.professionRef?.id ? cardStore.getCardById(formData.professionRef.id) : undefined) ||
    (formData.cards && formData.cards[0])

  // 2. 子职业特性卡
  const subclassCard: StandardCard | undefined =
    (formData.subclassRef?.id ? cardStore.getCardById(formData.subclassRef.id) : undefined) ||
    (formData.cards && formData.cards[1])

  // 3. 种族特性一
  const ancestry1Card: StandardCard | undefined =
    (formData.ancestry1Ref?.id ? cardStore.getCardById(formData.ancestry1Ref.id) : undefined) ||
    (formData.cards && formData.cards[2])

  // 4. 种族特性二
  const ancestry2Card: StandardCard | undefined =
    (formData.ancestry2Ref?.id ? cardStore.getCardById(formData.ancestry2Ref.id) : undefined) ||
    (formData.cards && formData.cards[3])

  // 5. 社群特性卡
  const communityCard: StandardCard | undefined =
    (formData.communityRef?.id ? cardStore.getCardById(formData.communityRef.id) : undefined) ||
    (formData.cards && formData.cards[4])

  const getCardDescription = (card?: StandardCard | null, fallbackField?: string) => {
    if (!card) return fallbackField || '请先在上方基础信息中选择该项'
    return card.description || (card as any).feature || (card as any).ability || fallbackField || '暂无详细描述'
  }

  const featuresList = [
    {
      title: '职业特性',
      name: formData.profession || professionCard?.name || '（未选定职业）',
      card: professionCard,
      desc: getCardDescription(professionCard, formData.profession),
      tagColor: 'text-[#F5F500] border-[#F5F500]/40 bg-[#F5F500]/10',
    },
    {
      title: '子职业特性',
      name: formData.subclass || subclassCard?.name || '（未选定子职业）',
      card: subclassCard,
      desc: getCardDescription(subclassCard, formData.subclass),
      tagColor: 'text-[#6C00FF] border-[#6C00FF]/40 bg-[#6C00FF]/20',
    },
    {
      title: '种族特性一',
      name: formData.ancestry1 || ancestry1Card?.name || '（未选定种族一）',
      card: ancestry1Card,
      desc: getCardDescription(ancestry1Card, formData.ancestry1),
      tagColor: 'text-[#00FFA3] border-[#00FFA3]/40 bg-[#00FFA3]/10',
    },
    {
      title: '种族特性二',
      name: formData.ancestry2 || ancestry2Card?.name || '（未选定种族二）',
      card: ancestry2Card,
      desc: getCardDescription(ancestry2Card, formData.ancestry2),
      tagColor: 'text-[#00FFA3] border-[#00FFA3]/40 bg-[#00FFA3]/10',
    },
    {
      title: '社群特性',
      name: formData.community || communityCard?.name || '（未选定社群）',
      card: communityCard,
      desc: getCardDescription(communityCard, formData.community),
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
                    onClick={() =>
                      setActiveModalCard({
                        title: item.title,
                        name: item.name,
                        card: item.card,
                        text: item.desc,
                      })
                    }
                    className="text-slate-500 hover:text-[#00FFA3] p-0.5 rounded transition-colors"
                    title="查看卡牌全文"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h4 className="font-bold text-xs text-white mb-2">{item.name}</h4>

                <div className="text-xs text-slate-300 leading-relaxed space-y-1.5">
                  <CardMarkdown>{item.desc}</CardMarkdown>
                </div>
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
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#F5F500] px-2 py-0.5 rounded bg-[#F5F500]/10 border border-[#F5F500]/30">
                  {activeModalCard.title}
                </span>
                <span className="font-bold text-sm text-white">{activeModalCard.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalCard(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                关闭 ✕
              </button>
            </div>

            <div className="mt-3 flex-1 overflow-y-auto pr-1 text-xs text-slate-200 leading-relaxed custom-scrollbar">
              <CardMarkdown>
                {activeModalCard.text || activeModalCard.card?.description || '暂无详细描述'}
              </CardMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
