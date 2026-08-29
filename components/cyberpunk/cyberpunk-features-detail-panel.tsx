"use client"

import React, { useState } from 'react'
import { useSheetStore } from '@/lib/sheet-store'
import { useCardStore } from '@/card/stores/unified-card-store'
import type { StandardCard } from '@/card/card-types'
import { BookOpen, Eye, ChevronDown, ChevronUp, Lock, Unlock, ArrowLeftRight } from 'lucide-react'
import { CardMarkdown } from '@/components/ui/card-markdown'

interface CyberpunkFeaturesDetailPanelProps {
  onOpenSelectModal: (
    type: 'profession' | 'ancestry' | 'community' | 'subclass',
    field?: string,
    levelFilter?: number
  ) => void
  isLocked?: boolean
  onToggleLock?: () => void
}

export function CyberpunkFeaturesDetailPanel({
  onOpenSelectModal,
  isLocked = false,
  onToggleLock,
}: CyberpunkFeaturesDetailPanelProps) {
  const formData = useSheetStore((state) => state.sheetData)
  const cardStore = useCardStore()

  const [activeModalCard, setActiveModalCard] = useState<{
    title: string
    name: string
    card?: StandardCard | null
    text?: string
  } | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)

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
    if (!card) return fallbackField ? `已选定：${fallbackField}` : '暂无详细描述，点击右上方按钮选择'
    return card.description || (card as any).feature || (card as any).ability || fallbackField || '暂无详细描述'
  }

  const featuresList = [
    {
      title: '职业特性',
      name: formData.profession || professionCard?.name || '（未选定职业）',
      card: professionCard,
      desc: getCardDescription(professionCard, formData.profession),
      tagColor: 'text-[#F5F500] border-[#F5F500]/40 bg-[#F5F500]/10',
      btnColor: 'text-[#F5F500] bg-[#F5F500]/15 hover:bg-[#F5F500]/25 border-[#F5F500]/30',
      btnText: '职业 ⇄',
      onSelect: () => onOpenSelectModal('profession'),
    },
    {
      title: '子职业特性',
      name: formData.subclass || subclassCard?.name || '（未选定子职业）',
      card: subclassCard,
      desc: getCardDescription(subclassCard, formData.subclass),
      tagColor: 'text-[#6C00FF] border-[#6C00FF]/40 bg-[#6C00FF]/20',
      btnColor: 'text-[#6C00FF] bg-[#6C00FF]/20 hover:bg-[#6C00FF]/35 border-[#6C00FF]/50',
      btnText: '子职 ⇄',
      onSelect: () => onOpenSelectModal('subclass', undefined, 1),
    },
    {
      title: '种族特性一',
      name: formData.ancestry1 || ancestry1Card?.name || '（未选定种族一）',
      card: ancestry1Card,
      desc: getCardDescription(ancestry1Card, formData.ancestry1),
      tagColor: 'text-[#00FFA3] border-[#00FFA3]/40 bg-[#00FFA3]/10',
      btnColor: 'text-[#00FFA3] bg-[#00FFA3]/15 hover:bg-[#00FFA3]/25 border-[#00FFA3]/30',
      btnText: '选择 ⇄',
      onSelect: () => onOpenSelectModal('ancestry', 'ancestry1', 1),
    },
    {
      title: '种族特性二',
      name: formData.ancestry2 || ancestry2Card?.name || '（未选定种族二）',
      card: ancestry2Card,
      desc: getCardDescription(ancestry2Card, formData.ancestry2),
      tagColor: 'text-[#00FFA3] border-[#00FFA3]/40 bg-[#00FFA3]/10',
      btnColor: 'text-[#00FFA3] bg-[#00FFA3]/15 hover:bg-[#00FFA3]/25 border-[#00FFA3]/30',
      btnText: '选择 ⇄',
      onSelect: () => onOpenSelectModal('ancestry', 'ancestry2', 2),
    },
    {
      title: '社群特性',
      name: formData.community || communityCard?.name || '（未选定社群）',
      card: communityCard,
      desc: getCardDescription(communityCard, formData.community),
      tagColor: 'text-[#FF007F] border-[#FF007F]/40 bg-[#FF007F]/10',
      btnColor: 'text-[#FF007F] bg-[#FF007F]/15 hover:bg-[#FF007F]/25 border-[#FF007F]/30',
      btnText: '选择 ⇄',
      onSelect: () => onOpenSelectModal('community'),
    },
  ]

  return (
    <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 text-slate-100 font-sans shadow-[0_4px_20px_rgba(11,3,32,0.6)]">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#00FFA3]" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            身份与特性 (Features & Traits)
          </h3>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            所选即所得 · 一体化选择与阅读
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 选择固定开关 (锁定/解锁按钮) */}
          {onToggleLock && (
            <button
              type="button"
              onClick={onToggleLock}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border font-bold transition-all ${
                isLocked
                  ? 'bg-[#FF007F]/15 text-[#FF007F] border-[#FF007F]/40 shadow-[0_0_8px_rgba(255,0,127,0.2)]'
                  : 'bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/40 shadow-[0_0_8px_rgba(0,255,163,0.2)]'
              }`}
              title={isLocked ? '当前已锁定选择，点击解锁更换' : '当前处于自由选择模式，点击锁定以防误触'}
            >
              {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              <span>{isLocked ? '已锁定选择' : '自由选择'}</span>
            </button>
          )}

          {/* 展开/收起 */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-1.5 py-1 rounded hover:bg-white/5 transition-colors"
          >
            <span>{isExpanded ? '收起' : '展开'}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* 融合后的一行 5 列所选即所得卡片 */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {featuresList.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#6C00FF]/30 bg-[#0B0320] p-3 flex flex-col justify-between hover:border-[#00FFA3]/50 transition-colors group shadow-sm min-h-[190px]"
            >
              <div>
                {/* 顶部标签与操作按钮 */}
                <div className="flex items-center justify-between gap-1 mb-2 pb-1.5 border-b border-[#6C00FF]/20">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${item.tagColor}`}>
                    {item.title}
                  </span>

                  <div className="flex items-center gap-1">
                    {/* 未锁定时显示选择/更换按钮 */}
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={item.onSelect}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-colors ${item.btnColor}`}
                      >
                        {item.btnText}
                      </button>
                    )}

                    {/* 全屏/全文查看模态按钮 */}
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
                      title="查看全文详情"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* 选定名称 */}
                <h4 className="font-bold text-xs text-white mb-1.5 truncate" title={item.name}>
                  {item.name}
                </h4>

                {/* 正文效果阅读 */}
                <div className="text-[11px] text-slate-300 leading-relaxed max-h-[105px] overflow-y-auto pr-0.5 custom-scrollbar">
                  <CardMarkdown>{item.desc}</CardMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 弹窗查看特性全文 */}
      {activeModalCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
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
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
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
