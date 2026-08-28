"use client"

import React, { useState, useMemo } from 'react'
import type { CyberpunkConsumable } from '@/types/cyberpunk'
import { Pill, CheckCircle2, Circle, Search, Plus, Sparkles, X, Trash2, Minus } from 'lucide-react'
import coreConsumablesData from '@/lib/vault/seeds/core-consumables.json'

interface CyberpunkConsumablesBarProps {
  consumables?: CyberpunkConsumable[]
  onChange: (consumables: CyberpunkConsumable[]) => void
}

interface CoreConsumableSeed {
  id: string
  name: string
  category: string
  description?: string
  data?: {
    effect?: string
    categoryTag?: string
  }
}

export function CyberpunkConsumablesBar({
  consumables = [],
  onChange,
}: CyberpunkConsumablesBarProps) {
  const [modalTargetIndex, setModalTargetIndex] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState<string>('all')

  // 默认至少提供 2 个空条目供填写
  const items: CyberpunkConsumable[] = useMemo(() => {
    if (consumables && consumables.length > 0) {
      return consumables
    }
    return [
      {
        id: 'cons_default_1',
        name: '神经兴奋剂',
        effect: '清除 2 点压力，下一次灵巧检定获得优势。',
        quantity: 1,
        used: false,
      },
      {
        id: 'cons_default_2',
        name: '小型战术凝胶',
        effect: '立即恢复 1d4 生命点。',
        quantity: 1,
        used: false,
      },
    ]
  }, [consumables])

  const handleToggleUsed = (idx: number) => {
    const updated = [...items]
    updated[idx] = {
      ...updated[idx],
      used: !updated[idx].used,
    }
    onChange(updated)
  }

  const handleUpdate = (idx: number, field: keyof CyberpunkConsumable, val: any) => {
    const updated = [...items]
    updated[idx] = {
      ...updated[idx],
      [field]: val,
    }
    onChange(updated)
  }

  // 数量堆叠调节（1~5 份）
  const handleQuantityChange = (idx: number, delta: number) => {
    const updated = [...items]
    const currentQty = typeof updated[idx].quantity === 'number' ? updated[idx].quantity : 1
    const nextQty = Math.max(1, Math.min(5, currentQty + delta))
    updated[idx] = {
      ...updated[idx],
      quantity: nextQty,
    }
    onChange(updated)
  }

  const handleAddNewItem = () => {
    const newItem: CyberpunkConsumable = {
      id: `cons_${Date.now()}`,
      name: '',
      effect: '',
      quantity: 1,
      used: false,
    }
    onChange([...items, newItem])
  }

  const handleRemoveItem = (idx: number) => {
    const updated = items.filter((_, i) => i !== idx)
    onChange(updated)
  }

  const handleSelectCoreConsumable = (seed: CoreConsumableSeed) => {
    const effectText = seed.data?.effect || seed.description || ''
    if (modalTargetIndex !== null && modalTargetIndex < items.length) {
      const updated = [...items]
      updated[modalTargetIndex] = {
        id: `cons_${Date.now()}_${modalTargetIndex}`,
        name: seed.name,
        effect: effectText,
        quantity: 1,
        used: false,
      }
      onChange(updated)
    } else {
      // 追加新条目
      const newItem: CyberpunkConsumable = {
        id: `cons_${Date.now()}`,
        name: seed.name,
        effect: effectText,
        quantity: 1,
        used: false,
      }
      onChange([...items, newItem])
    }
    setModalTargetIndex(null)
    setSearchQuery('')
  }

  const coreList: CoreConsumableSeed[] = useMemo(() => {
    return (coreConsumablesData as any[]) || []
  }, [])

  const filteredCoreList = useMemo(() => {
    return coreList.filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.data?.effect && item.data.effect.toLowerCase().includes(searchQuery.toLowerCase()))

      const tag = item.data?.categoryTag || 'other'
      const matchTag = filterTag === 'all' || tag === filterTag

      return matchSearch && matchTag
    })
  }, [coreList, searchQuery, filterTag])

  return (
    <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 text-slate-100 font-sans shadow-[0_4px_20px_rgba(11,3,32,0.6)]">
      {/* 标题栏 */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#6C00FF]/20 pb-2.5 mb-3 gap-2">
        <div className="flex items-center gap-2">
          <Pill className="h-4 w-4 text-[#00FFA3]" />
          <h3 className="text-sm font-bold text-white tracking-wide">随身消耗品 (Consumables)</h3>
          <span className="text-[10px] text-[#F5F500] font-mono font-bold bg-[#F5F500]/10 px-2 py-0.5 rounded border border-[#F5F500]/30">
            同名最多堆叠 5 份
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddNewItem}
            className="flex items-center gap-1 text-xs font-bold text-[#00FFA3] bg-[#00FFA3]/10 hover:bg-[#00FFA3]/20 px-2.5 py-1 rounded border border-[#00FFA3]/40 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>添加消耗品</span>
          </button>

          <button
            type="button"
            onClick={() => setModalTargetIndex(items.length)}
            className="flex items-center gap-1 text-xs font-bold text-[#F5F500] bg-[#F5F500]/10 hover:bg-[#F5F500]/20 px-2.5 py-1 rounded border border-[#F5F500]/40 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>核心库导入</span>
          </button>
        </div>
      </div>

      {/* 消耗品列表 */}
      {items.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-[#6C00FF]/30 rounded-lg">
          暂无携带消耗品，点击右上角「添加消耗品」或「核心库导入」。
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, idx) => {
            const qty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1

            return (
              <div
                key={item.id || `consumable_${idx}`}
                className={`rounded-lg border p-2.5 transition-all flex items-start gap-2.5 group ${
                  item.used
                    ? 'border-[#6C00FF]/15 bg-[#0B0320]/60 opacity-50'
                    : 'border-[#6C00FF]/30 bg-[#0B0320]/80 hover:border-[#00FFA3]/50 shadow-sm'
                }`}
              >
                {/* 使用/消耗切换 */}
                <button
                  type="button"
                  onClick={() => handleToggleUsed(idx)}
                  className="mt-1 text-slate-400 hover:text-[#00FFA3] transition-colors shrink-0"
                  title={item.used ? '标记为未使用' : '标记为已消耗'}
                >
                  {item.used ? (
                    <CheckCircle2 className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-[#00FFA3]" />
                  )}
                </button>

                {/* 槽位内容 */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                        placeholder={`消耗品 #${idx + 1} 名称...`}
                        className={`flex-1 bg-transparent border-none p-0 text-xs font-bold focus:outline-none ${
                          item.used ? 'line-through text-slate-500' : 'text-white focus:text-[#00FFA3]'
                        }`}
                      />
                    </div>

                    {/* 数量调节（1~5 份堆叠） */}
                    <div className="flex items-center gap-1 rounded bg-[#12072B] px-1.5 py-0.5 border border-[#6C00FF]/30 text-xs font-mono">
                      <span className="text-[10px] text-slate-400">数量:</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(idx, -1)}
                        disabled={qty <= 1}
                        className="h-4 w-4 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <Minus className="h-2.5 w-2.5" />
                      </button>
                      <span className="font-bold text-[#F5F500] px-1 text-xs">{qty}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(idx, 1)}
                        disabled={qty >= 5}
                        className="h-4 w-4 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30"
                        title="同名消耗品最多堆叠 5 份"
                      >
                        <Plus className="h-2.5 w-2.5" />
                      </button>
                      <span className="text-[9px] text-slate-500">/5</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setModalTargetIndex(idx)}
                        className="text-[10px] text-[#00FFA3] hover:text-white bg-[#00FFA3]/10 hover:bg-[#00FFA3]/25 px-1.5 py-0.5 rounded border border-[#00FFA3]/30 transition-colors"
                        title="从核心库存选择"
                      >
                        更换 ⇄
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-500 hover:text-red-400 p-0.5 rounded transition-colors"
                        title="删除此消耗品"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={item.effect || ''}
                    onChange={(e) => handleUpdate(idx, 'effect', e.target.value)}
                    placeholder="效果与使用说明..."
                    className="w-full bg-transparent border-none p-0 text-[11px] text-slate-300 focus:outline-none focus:text-white"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 核心消耗品选择模态框 */}
      {modalTargetIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-xl border border-[#6C00FF]/50 bg-[#0B0320] p-5 shadow-[0_0_30px_rgba(108,0,255,0.4)] text-white flex flex-col max-h-[85vh]">
            {/* 模态框头部 */}
            <div className="flex items-center justify-between border-b border-[#6C00FF]/30 pb-3">
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-[#00FFA3]" />
                <div>
                  <h3 className="font-bold text-base text-white">选择核心规则消耗品</h3>
                  <p className="text-xs text-slate-400">
                    {modalTargetIndex < items.length
                      ? `将装填至消耗品条目 #${modalTargetIndex + 1}`
                      : '将添加为新消耗品条目'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalTargetIndex(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#6C00FF]/20 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 搜索与分类过滤 */}
            <div className="my-3 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#F5F500]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索药水 / 消耗品名称或效果..."
                  className="w-full rounded-lg border border-[#6C00FF]/40 bg-[#12072B] pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00FFA3] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'heal', label: '生命恢复' },
                  { key: 'stamina', label: '压力清除' },
                  { key: 'buff', label: '属性增益' },
                  { key: 'utility', label: '功能效用' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilterTag(tab.key)}
                    className={`px-2.5 py-1 rounded border transition-colors ${
                      filterTag === tab.key
                        ? 'bg-[#6C00FF] border-[#00FFA3] text-white font-bold'
                        : 'bg-[#12072B] border-[#6C00FF]/30 text-slate-300 hover:border-[#6C00FF]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 核心消耗品列表 */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[260px]">
              {filteredCoreList.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">没有找到匹配的消耗品</div>
              ) : (
                filteredCoreList.map((seed) => (
                  <div
                    key={seed.id}
                    className="group rounded-lg border border-[#6C00FF]/30 bg-[#12072B] p-3 hover:border-[#00FFA3] hover:bg-[#180B38] transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#00FFA3]">{seed.name}</span>
                        {seed.data?.categoryTag && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#6C00FF]/30 text-[#F5F500] font-mono border border-[#6C00FF]/40">
                            {seed.data.categoryTag}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                        {seed.data?.effect || seed.description || '无具体说明'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectCoreConsumable(seed)}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-[#00FFA3]/15 text-[#00FFA3] hover:bg-[#00FFA3] hover:text-black font-bold text-xs border border-[#00FFA3]/40 transition-colors shadow-sm"
                    >
                      装填 ↵
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* 模态框底部 */}
            <div className="mt-3 border-t border-[#6C00FF]/30 pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>共找到 {filteredCoreList.length} 件核心消耗品</span>
              <button
                type="button"
                onClick={() => setModalTargetIndex(null)}
                className="px-3 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
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
