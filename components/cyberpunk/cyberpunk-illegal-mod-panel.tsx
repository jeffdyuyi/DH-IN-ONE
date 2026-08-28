"use client"

import React, { useState } from 'react'
import { AlertTriangle, Plus, Trash2, Skull } from 'lucide-react'

export interface IllegalModItem {
  id: string
  name: string
  downside: string
  bonus: string
}

interface CyberpunkIllegalModPanelProps {
  mods?: IllegalModItem[]
  onChange?: (updated: IllegalModItem[]) => void
}

export function CyberpunkIllegalModPanel({
  mods = [],
  onChange
}: CyberpunkIllegalModPanelProps) {
  const [items, setItems] = useState<IllegalModItem[]>(mods)

  const handleAdd = () => {
    const newItem: IllegalModItem = {
      id: `illegal_${Date.now()}`,
      name: '未命名黑市改装',
      bonus: '正面超载加值...',
      downside: '代价/神经负荷副作用...'
    }
    const updated = [...items, newItem]
    setItems(updated)
    onChange?.(updated)
  }

  const handleDelete = (id: string) => {
    const updated = items.filter(i => i.id !== id)
    setItems(updated)
    onChange?.(updated)
  }

  return (
    <div className="p-4 rounded-2xl border border-[#FF007F]/20 bg-[#FF007F]/[0.02] backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Skull className="w-4 h-4 text-[#FF007F]" />
          <h3 className="font-bold text-xs text-[#FF007F] uppercase tracking-wider">
            黑市非法改造与神经代价 ({items.length})
          </h3>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold bg-[#FF007F]/10 hover:bg-[#FF007F]/20 text-[#FF007F] border border-[#FF007F]/30 transition"
        >
          <Plus className="w-3 h-3" />
          <span>添加黑市改造</span>
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-slate-500 py-3 text-center">暂未安装任何非法黑市改造</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-white/10 bg-black/40 flex items-start justify-between gap-3 group"
            >
              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => {
                    const updated = items.map(i => i.id === item.id ? { ...i, name: e.target.value } : i)
                    setItems(updated)
                    onChange?.(updated)
                  }}
                  className="bg-transparent border-none text-xs font-bold text-white outline-none w-full"
                />
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="text-emerald-400">
                    <span className="text-[10px] text-slate-500 block">收益:</span>
                    <input
                      type="text"
                      value={item.bonus}
                      onChange={(e) => {
                        const updated = items.map(i => i.id === item.id ? { ...i, bonus: e.target.value } : i)
                        setItems(updated)
                        onChange?.(updated)
                      }}
                      className="bg-transparent border-none text-emerald-300 outline-none w-full"
                    />
                  </div>
                  <div className="text-rose-400">
                    <span className="text-[10px] text-slate-500 block">代价:</span>
                    <input
                      type="text"
                      value={item.downside}
                      onChange={(e) => {
                        const updated = items.map(i => i.id === item.id ? { ...i, downside: e.target.value } : i)
                        setItems(updated)
                        onChange?.(updated)
                      }}
                      className="bg-transparent border-none text-rose-300 outline-none w-full"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
