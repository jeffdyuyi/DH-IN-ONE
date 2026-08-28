"use client"

import React from 'react'
import type { CyberpunkConsumable } from '@/types/cyberpunk'
import { Pill, CheckCircle2, Circle } from 'lucide-react'

interface CyberpunkConsumablesBarProps {
  consumables?: CyberpunkConsumable[]
  onChange: (consumables: CyberpunkConsumable[]) => void
}

export function CyberpunkConsumablesBar({
  consumables = [],
  onChange,
}: CyberpunkConsumablesBarProps) {
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

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d0d1a] p-4 text-slate-100 font-sans shadow-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Pill className="h-4 w-4 text-[#FCEE0A]" />
          <h3 className="text-sm font-bold text-white">随身消耗品 (Consumables)</h3>
          <span className="text-xs text-slate-400">上限 5 份</span>
        </div>
        <span className="text-[10px] text-slate-500">点击圆圈快速标记使用/消耗</span>
      </div>

      <div className="space-y-2">
        {slots.map((item, idx) => (
          <div
            key={item.id || `consumable_${idx}`}
            className={`rounded-lg border p-2.5 transition-all flex items-start gap-2.5 ${
              item.used
                ? 'border-slate-800/60 bg-black/40 opacity-50'
                : 'border-slate-800 bg-[#0f0f22] hover:border-slate-700'
            }`}
          >
            <button
              type="button"
              onClick={() => handleToggleUsed(idx)}
              className="mt-0.5 text-slate-400 hover:text-[#00F0FF] transition-colors shrink-0"
              title={item.used ? '标记为未使用' : '标记为已消耗'}
            >
              {item.used ? (
                <CheckCircle2 className="h-4 w-4 text-slate-500" />
              ) : (
                <Circle className="h-4 w-4 text-cyan-400" />
              )}
            </button>

            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                <input
                  type="text"
                  value={item.name || ''}
                  onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                  placeholder={`消耗品 #${idx + 1} 名称...`}
                  className={`flex-1 bg-transparent border-none p-0 text-xs font-bold focus:outline-none ${
                    item.used ? 'line-through text-slate-500' : 'text-slate-200 focus:text-cyan-300'
                  }`}
                />
              </div>

              <input
                type="text"
                value={item.effect || ''}
                onChange={(e) => handleUpdate(idx, 'effect', e.target.value)}
                placeholder="效果与使用说明..."
                className="w-full bg-transparent border-none p-0 text-[11px] text-slate-400 focus:outline-none focus:text-slate-300"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
