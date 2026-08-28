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
  const validVaultCards = (vaultCards || []).filter(c => c && !isEmptyCard(c))

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-[#0d0d1a] p-4 text-slate-100 font-sans">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#00F0FF]" />
          <h3 className="text-sm font-bold text-white">领域卡 (Domain Cards)</h3>
          <span className="text-xs text-slate-400">已配置 {activeSlots.filter(c => c && !isEmptyCard(c)).length}/5</span>
        </div>

        {/* 卡组 / 宝库切换 */}
        <div className="flex items-center rounded-lg border border-slate-800 bg-[#070710] p-0.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('loadout')}
            className={`rounded px-3 py-1 font-bold transition-colors ${
              activeTab === 'loadout'
                ? 'bg-[#00F0FF] text-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            激活卡组 ({activeSlots.filter(c => c && !isEmptyCard(c)).length}/5)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vault')}
            className={`rounded px-3 py-1 font-bold transition-colors ${
              activeTab === 'vault'
                ? 'bg-[#FCEE0A] text-black'
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
                  className="group flex h-36 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-800 bg-[#0f0f22]/60 p-3 text-center transition-all hover:border-[#00F0FF] hover:bg-[#00F0FF]/5 cursor-pointer"
                >
                  <Plus className="h-5 w-5 text-slate-500 group-hover:text-[#00F0FF] transition-colors" />
                  <div className="mt-1.5 text-xs font-bold text-slate-400 group-hover:text-[#00F0FF]">
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
                className="flex h-36 flex-col justify-between rounded-lg border border-[#00F0FF]/40 bg-[#0f0f22] p-2.5 transition-all hover:border-[#00F0FF]"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 text-[10px]">
                    <span className="rounded bg-[#00F0FF]/20 px-1.5 py-0.5 font-bold text-[#00F0FF] truncate">
                      {domainName}
                    </span>
                    <span className="rounded bg-[#FCEE0A] px-1 py-0.2 font-bold text-black font-mono">
                      Lv.{levelNum}
                    </span>
                  </div>

                  <div className="mt-1 font-bold text-xs text-white truncate" title={card.name}>
                    {card.name}
                  </div>

                  <div className="mt-1 text-[11px] text-slate-300 line-clamp-2 leading-tight">
                    {card.description || (card as any)?.feature || '无效果描述'}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPreviewCard(card)}
                    className="flex items-center gap-1 text-cyan-400 hover:underline font-bold"
                  >
                    <Eye className="h-3 w-3" />
                    <span>查看</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveCard(actualIndex, false)}
                    className="text-slate-500 hover:text-red-400 p-0.5"
                    title="移除卡牌"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 宝库 */}
      {activeTab === 'vault' && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="text-slate-400">宝库中备用的领域卡：</span>
            <button
              type="button"
              onClick={() => onSelectSlot(validVaultCards.length, true)}
              className="flex items-center gap-1 rounded bg-[#FCEE0A] px-2.5 py-1 font-bold text-black hover:bg-[#FCEE0A]/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>添加至宝库</span>
            </button>
          </div>

          {validVaultCards.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
              宝库中暂无卡片，点击右上角添加备用领域卡。
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {validVaultCards.map((card, idx) => (
                <div
                  key={card.id || `vault_${idx}`}
                  className="rounded-lg border border-slate-800 bg-[#0f0f22] p-2.5 text-slate-300"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#FCEE0A] font-bold">{card.class || '领域'}</span>
                    <span className="text-slate-400 font-mono">Lv.{card.level || 1}</span>
                  </div>
                  <div className="font-bold text-xs text-white mt-1">{card.name}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">{card.description}</div>
                  <div className="flex justify-end gap-2 mt-2 pt-1 border-t border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPreviewCard(card)}
                      className="text-cyan-400 hover:underline font-bold"
                    >
                      查看
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveCard(idx, true)}
                      className="text-red-400 hover:underline"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 弹窗预览 */}
      {previewCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-white text-gray-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <div>
                <div className="text-xs font-bold text-cyan-600 uppercase">
                  {previewCard.class || '领域'} · LV.{previewCard.level || 1}
                </div>
                <div className="text-base font-bold text-gray-900">{previewCard.name}</div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCard(null)}
                className="h-7 w-7 rounded bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-gray-700 max-h-[50vh] overflow-y-auto pr-1">
              <CardMarkdown rehypePlugins={[rehypeRaw]}>
                {previewCard.description || (previewCard as any)?.feature || '暂无描述'}
              </CardMarkdown>
            </div>

            <div className="mt-4 flex justify-end border-t pt-2">
              <button
                type="button"
                onClick={() => setPreviewCard(null)}
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
