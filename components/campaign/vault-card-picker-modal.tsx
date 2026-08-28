"use client"

import React, { useState, useEffect } from 'react'
import { Database, Search, X, Plus, Sparkles, Layers, Shield, Sword, Cpu, Skull, Flame } from 'lucide-react'
import { vaultStorage } from '../../lib/vault/vault-storage'
import { VaultCard, VaultCardCategory } from '../../lib/vault/vault-types'
import { vaultCardToCampaignBlock, CampaignBlock } from './types'

interface VaultCardPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onInsertBlock: (block: CampaignBlock) => void
}

const CATEGORY_TABS: Array<{ category?: VaultCardCategory; label: string; icon: string }> = [
  { label: '全部卡牌', icon: '🌟' },
  { category: 'enemy', label: '战斗敌人', icon: '👾' },
  { category: 'environment', label: '环境险境', icon: '🌋' },
  { category: 'loot', label: '战利品', icon: '💎' },
  { category: 'consumable', label: '消耗品', icon: '🧪' },
  { category: 'cyberware', label: '赛博装备', icon: '🦾' },
  { category: 'weapon', label: '武器', icon: '⚔️' },
  { category: 'armor', label: '护甲', icon: '🛡️' }
]

export function VaultCardPickerModal({
  isOpen,
  onClose,
  onInsertBlock
}: VaultCardPickerModalProps) {
  const [cards, setCards] = useState<VaultCard[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedCat, setSelectedCat] = useState<VaultCardCategory | undefined>(undefined)
  const [searchKeyword, setSearchKeyword] = useState<string>('')

  const fetchCards = async () => {
    try {
      setLoading(true)
      await vaultStorage.initialize()
      const result = await vaultStorage.queryCards({
        category: selectedCat,
        keyword: searchKeyword
      })
      setCards(result)
    } catch (err) {
      console.error('Failed to load cards for picker:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchCards()
    }
  }, [isOpen, selectedCat, searchKeyword])

  if (!isOpen) return null

  const handleSelectCard = (card: VaultCard) => {
    const block = vaultCardToCampaignBlock(card)
    onInsertBlock(block)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[85vh] rounded-2xl border border-white/10 bg-[#0B0320] text-slate-100 p-6 shadow-2xl flex flex-col">
        {/* 头部标题与关闭 */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF007F]/10 flex items-center justify-center text-[#FF007F]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">从公共本地卡牌库插入战役区块</h3>
              <p className="text-xs text-slate-400">选择官方种子物品或自制卡牌，自动转为模组对应内容块</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 搜索与分类 Tab */}
        <div className="py-4 space-y-3 flex-shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索卡牌名称、特性、效果关键词..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-[#00FFA3] outline-none"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const isSelected = selectedCat === tab.category
              return (
                <button
                  key={tab.label}
                  onClick={() => setSelectedCat(tab.category)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-[#FF007F] text-white shadow-lg shadow-[#FF007F]/20'
                      : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 卡牌列表区 */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-500">正在检索本地卡牌库...</div>
          ) : cards.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">未找到符合条件的卡牌</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cards.map((card) => {
                const isBuiltin = Boolean(card.isBuiltin)
                const effectText = (card.data as any)?.effect || (card.data as any)?.feature || card.description || ''

                return (
                  <div
                    key={card.id}
                    onClick={() => handleSelectCard(card)}
                    className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#00FFA3]/50 transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300">
                          {card.category.toUpperCase()}
                        </span>
                        {isBuiltin && (
                          <span className="text-[10px] text-amber-400 font-medium">官方内置</span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-white group-hover:text-[#00FFA3] transition mb-1">
                        {card.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {effectText}
                      </p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                      <span>来源: {card.sourceApp}</span>
                      <span className="text-[#00FFA3] font-semibold flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                        <Plus className="w-3 h-3" />
                        <span>插入模组</span>
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
