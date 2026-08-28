"use client"

import React, { useState, useMemo } from 'react'
import type { CyberpunkConsumable } from '@/types/cyberpunk'
import { Pill, CheckCircle2, Circle, Search, Plus, Sparkles, X } from 'lucide-react'
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

  // 确保至少有 5 个消耗品槽位
  const slots: CyberpunkConsumable[] = Array.from({ length: 5 }, (_, i) => {
    return (
      consumables[i] || {
        id: `cons_${i + 1}`,
        name: '',
        effect: '',
        quantity: 1,
        used: false,
      }
    )
  })

  const handleToggleUsed = (idx: number) => {
    const updated = [...slots]
    updated[idx] = {
      ...updated[idx],
      used: !updated[idx].used,
    }
    onChange(updated)
  }

  const handleUpdate = (idx: number, field: keyof CyberpunkConsumable, val: any) => {
    const updated = [...slots]
    updated[idx] = {
      ...updated[idx],
      [field]: val,
    }
    onChange(updated)
  }

  const handleSelectCoreConsumable = (item: CoreConsumableSeed) => {
    if (modalTargetIndex === null) return
    const updated = [...slots]
    const effectText = item.data?.effect || item.description || ''
    updated[modalTargetIndex] = {
      id: `cons_${Date.now()}_${modalTargetIndex}`,
      name: item.name,
      effect: effectText,
      quantity: 1,
      used: false,
    }
    onChange(updated)
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
      <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Pill className="h-4 w-4 text-[#00FFA3]" />
          <h3 className="text-sm font-bold text-white tracking-wide">随身消耗品 (Consumables)</h3>
          <span className="text-xs text-[#00FFA3] font-mono font-bold bg-[#00FFA3]/10 px-1.5 py-0.5 rounded border border-[#00FFA3]/30">
            5 槽位
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalTargetIndex(0)}
            className="flex items-center gap-1 text-xs font-bold text-[#F5F500] bg-[#F5F500]/10 hover:bg-[#F5F500]/20 px-2 py-1 rounded border border-[#F5F500]/40 transition-colors shadow-[0_0_8px_rgba(245,245,0,0.15)]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>核心消耗品库</span>
          </button>
        </div>
      </div>

      {/* 5 个槽位列表 */}
      <div className="space-y-2.5">
        {slots.map((item, idx) => (
          <div
            key={item.id || `consumable_${idx}`}
            className={`rounded-lg border p-2.5 transition-all flex items-start gap-2.5 ${
              item.used
                ? 'border-[#6C00FF]/15 bg-[#0B0320]/60 opacity-50'
                : 'border-[#6C00FF]/30 bg-[#0B0320]/80 hover:border-[#00FFA3]/50 shadow-sm'
            }`}
          >
            {/* 使用/消耗切换 */}
            <button
              type="button"
              onClick={() => handleToggleUsed(idx)}
              className="mt-0.5 text-slate-400 hover:text-[#00FFA3] transition-colors shrink-0"
              title={item.used ? '标记为未使用' : '标记为已消耗'}
            >
              {item.used ? (
                <CheckCircle2 className="h-4 w-4 text-slate-500" />
              ) : (
                <Circle className="h-4 w-4 text-[#00FFA3]" />
              )}
            </button>

            {/* 槽位内容 */}
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#F5F500] font-mono font-bold bg-[#F5F500]/10 px-1 rounded">
                  #{idx + 1}
                </span>
                <input
                  type="text"
                  value={item.name || ''}
                  onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                  placeholder={`输入消耗品 #${idx + 1} 名称...`}
                  className={`flex-1 bg-transparent border-none p-0 text-xs font-bold focus:outline-none ${
                    item.used ? 'line-through text-slate-500' : 'text-white focus:text-[#00FFA3]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setModalTargetIndex(idx)}
                  className="text-[10px] text-[#00FFA3] hover:text-white bg-[#00FFA3]/10 hover:bg-[#00FFA3]/25 px-1.5 py-0.5 rounded border border-[#00FFA3]/30 transition-colors"
                  title="从核心库存选择"
                >
                  从库存选择 ⇄
                </button>
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
        ))}
      </div>

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
                  <p className="text-xs text-slate-400">将填入消耗品槽位 #{modalTargetIndex + 1}</p>
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
                filteredCoreList.map((item) => (
                  <div
                    key={item.id}
                    className="group rounded-lg border border-[#6C00FF]/30 bg-[#12072B] p-3 hover:border-[#00FFA3] hover:bg-[#180B38] transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#00FFA3]">{item.name}</span>
                        {item.data?.categoryTag && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#6C00FF]/30 text-[#F5F500] font-mono border border-[#6C00FF]/40">
                            {item.data.categoryTag}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                        {item.data?.effect || item.description || '无具体说明'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectCoreConsumable(item)}
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
