"use client"

import React, { useState } from 'react'
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'

export interface ConsumableItem {
  id: string
  name: string
  effect: string
  used: boolean
}

interface CyberpunkConsumablesBarProps {
  consumables?: ConsumableItem[]
  onChange?: (updated: ConsumableItem[]) => void
}

export function CyberpunkConsumablesBar({
  consumables = [],
  onChange
}: CyberpunkConsumablesBarProps) {
  const [items, setItems] = useState<ConsumableItem[]>(
    consumables.length > 0
      ? consumables
      : [
          { id: 'c1', name: '神经兴奋剂', effect: '清除 2 点压力，下一次灵巧检定获得优势。', used: false },
          { id: 'c2', name: '小型战术凝胶', effect: '立即恢复 1d4 生命点。', used: false },
          { id: 'c3', name: '', effect: '', used: false },
          { id: 'c4', name: '', effect: '', used: false }
        ]
  )

  const handleToggleUsed = (idx: number) => {
    const updated = [...items]
    updated[idx].used = !updated[idx].used
    setItems(updated)
    onChange?.(updated)
  }

  const handleUpdate = (idx: number, field: 'name' | 'effect', val: string) => {
    const updated = [...items]
    updated[idx][field] = val
    setItems(updated)
    onChange?.(updated)
  }

  return (
    <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-xs text-[#F5F500] uppercase tracking-wider flex items-center space-x-1.5">
          <span>🧪 随身赛博消耗品快捷槽 (4格)</span>
        </h3>
        <span className="text-[10px] text-slate-500">点击圆圈快速标记使用状态</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item, idx) => {
          return (
            <div
              key={item.id || idx}
              className={`p-3 rounded-xl border transition flex items-start space-x-2.5 ${
                item.used
                  ? 'border-white/5 bg-black/40 opacity-50'
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <button
                onClick={() => handleToggleUsed(idx)}
                className="mt-0.5 text-slate-400 hover:text-[#00FFA3] transition flex-shrink-0"
              >
                {item.used ? (
                  <CheckCircle2 className="w-4 h-4 text-slate-500" />
                ) : (
                  <Circle className="w-4 h-4 text-[#00FFA3]" />
                )}
              </button>

              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                  placeholder={`消耗品 #${idx + 1} 名称`}
                  className={`w-full bg-transparent border-none p-0 text-xs font-bold outline-none ${
                    item.used ? 'line-through text-slate-500' : 'text-white focus:text-[#00FFA3]'
                  }`}
                />
                <textarea
                  rows={2}
                  value={item.effect}
                  onChange={(e) => handleUpdate(idx, 'effect', e.target.value)}
                  placeholder="效果文案描述..."
                  className="w-full bg-transparent border-none p-0 text-[11px] text-slate-400 outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
