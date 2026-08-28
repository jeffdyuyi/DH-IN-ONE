"use client"

import React, { useState } from 'react'
import type { StandardCard } from '@/card/card-types'
import { isEmptyCard } from '@/card/card-types'
import { Plus, Trash2, Eye, Layers } from 'lucide-react'
import { CardMarkdown } from '@/components/ui/card-markdown'
import rehypeRaw from 'rehype-raw'

interface CyberpunkDomainDeckProps {
  cards: StandardCard[]
  vaultCards?: StandardCard[]
  onSelectSlot: (slotIndex: number, isVault?: boolean) => void
  onRemoveCard: (slotIndex: number, isVault?: boolean) => void
}

export function CyberpunkDomainDeck({
  cards = [],
  vaultCards = [],
  onSelectSlot,
  onRemoveCard,
}: CyberpunkDomainDeckProps) {
  const [previewCard, setPreviewCard] = useState<StandardCard | null>(null)
  const [activeTab, setActiveTab] = useState<'loadout' | 'vault'>('loadout')

  // 激活领域卡槽位（对应聚焦卡组 index 5 ~ 9，共 5 槽）
  const activeSlots = Array.from({ length: 5 }, (_, i) => cards[5 + i] || null)
  const validVaultCards = (vaultCards || []).filter((c) => c && !isEmptyCard(c))

  return (
    <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 text-slate-100 font-sans shadow-[0_4px_20px_rgba(11,3,32,0.6)]">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#00FFA3]" />
          <h3 className="text-sm font-bold text-white tracking-wide">领域卡 (Domain Cards)</h3>
          <span className="text-xs text-[#00FFA3] font-mono font-bold bg-[#00FFA3]/10 px-1.5 py-0.5 rounded border border-[#00FFA3]/30">
            已激活 {activeSlots.filter((c) => c && !isEmptyCard(c)).length}/5
          </span>
        </div>

        {/* 卡组 / 宝库切换 */}
        <div className="flex items-center rounded-lg border border-[#6C00FF]/40 bg-[#0B0320] p-0.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('loadout')}
            className={`rounded px-3 py-1 font-bold transition-colors ${
              activeTab === 'loadout'
                ? 'bg-[#00FFA3] text-black shadow-[0_0_8px_rgba(0,255,163,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            激活卡组 ({activeSlots.filter((c) => c && !isEmptyCard(c)).length}/5)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vault')}
            className={`rounded px-3 py-1 font-bold transition-colors ${
              activeTab === 'vault'
                ? 'bg-[#F5F500] text-black shadow-[0_0_8px_rgba(245,245,0,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            宝库 ({validVaultCards.length})
          </button>
        </div>
      </div>

      {/* 激活卡组 (5 槽) */}
      {activeTab === 'loadout' && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {activeSlots.map((card, idx) => {
            const actualIndex = 5 + idx
            const hasCard = card && !isEmptyCard(card)

            if (!hasCard) {
              return (
                <button
                  key={`domain_slot_${idx}`}
                  type="button"
                  onClick={() => onSelectSlot(actualIndex, false)}
                  className="group flex h-36 flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#6C00FF]/30 bg-[#0B0320]/60 p-3 text-center transition-all hover:border-[#00FFA3] hover:bg-[#00FFA3]/5 cursor-pointer"
                >
                  <Plus className="h-5 w-5 text-slate-500 group-hover:text-[#00FFA3] transition-colors" />
                  <div className="mt-1.5 text-xs font-bold text-slate-400 group-hover:text-[#00FFA3]">
                    卡槽 {idx + 1}
                  </div>
                  <div className="text-[11px] text-slate-500">点击添加领域卡</div>
                </button>
              )
            }

            const domainName = card.class || card.cardSelectDisplay?.item1 || '领域'
            const levelNum = card.level || 1

            return (
              <div
                key={card.id || `domain_active_${idx}`}
                className="flex h-36 flex-col justify-between rounded-lg border border-[#00FFA3]/40 bg-[#0B0320] p-2.5 transition-all hover:border-[#00FFA3] shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    <span className="rounded bg-[#6C00FF]/30 px-1.5 py-0.5 font-bold text-[#F5F500] border border-[#6C00FF]/40">
                      LV.{levelNum} · {domainName}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewCard(card)}
                        className="rounded p-0.5 text-slate-400 hover:text-[#00FFA3]"
                        title="查看卡牌大图/详情"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveCard(actualIndex, false)}
                        className="rounded p-0.5 text-slate-400 hover:text-red-400"
                        title="移出激活卡组"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="mt-1.5 font-bold text-xs text-white truncate">{card.name}</h4>

                  <p className="mt-1 text-[11px] text-slate-300 leading-snug line-clamp-3">
                    {card.description || '无描述'}
                  </p>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-[#6C00FF]/20 pt-1">
                  <span>卡槽 #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => onSelectSlot(actualIndex, false)}
                    className="text-[#00FFA3] hover:underline"
                  >
                    更换 ⇄
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 宝库 (Vault Cards) */}
      {activeTab === 'vault' && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">存储于宝库中的备选卡牌</span>
            <button
              type="button"
              onClick={() => onSelectSlot(validVaultCards.length, true)}
              className="flex items-center gap-1 text-xs font-bold text-[#F5F500] bg-[#F5F500]/10 hover:bg-[#F5F500]/20 px-2 py-1 rounded border border-[#F5F500]/30 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>存入新领域卡</span>
            </button>
          </div>

          {validVaultCards.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-[#6C00FF]/30 p-8 text-center text-xs text-slate-400 bg-[#0B0320]/40">
              宝库中暂无领域卡，点击上方按钮从卡牌库选卡存入宝库。
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {validVaultCards.map((card, idx) => (
                <div
                  key={card.id || `vault_card_${idx}`}
                  className="flex flex-col justify-between rounded-lg border border-[#6C00FF]/30 bg-[#0B0320] p-2.5 transition-all hover:border-[#F5F500]"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="rounded bg-[#6C00FF]/30 px-1.5 py-0.5 font-bold text-[#F5F500]">
                        {card.class || '领域'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewCard(card)}
                          className="text-slate-400 hover:text-white"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveCard(idx, true)}
                          className="text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="mt-1 font-bold text-xs text-white truncate">{card.name}</h4>
                    <p className="mt-1 text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 卡牌详情弹窗 */}
      {previewCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-[#6C00FF]/50 bg-[#0B0320] p-5 shadow-[0_0_30px_rgba(108,0,255,0.4)] text-white">
            <div className="flex items-center justify-between border-b border-[#6C00FF]/30 pb-2">
              <span className="text-xs font-bold text-[#00FFA3]">{previewCard.class || '领域卡'}</span>
              <button
                type="button"
                onClick={() => setPreviewCard(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                关闭 ✕
              </button>
            </div>
            <div className="mt-3 font-bold text-base text-white">{previewCard.name}</div>
            <div className="mt-2 text-xs text-slate-200 leading-relaxed max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              <CardMarkdown>{previewCard.description || ''}</CardMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
