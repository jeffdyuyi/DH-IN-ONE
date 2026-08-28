"use client"

import React from 'react'
import type { CyberpunkAugmentation } from '../../types/cyberpunk'
import { Trash2, Cpu, Sparkles } from 'lucide-react'

interface CyberpunkSlotItemProps {
  aug: CyberpunkAugmentation
  onUninstall: (id: string) => void
}

export function CyberpunkSlotItem({ aug, onUninstall }: CyberpunkSlotItemProps) {
  const isOriginalLoot = (aug as any).isOriginalLoot || aug.tag?.includes('跨界')

  return (
    <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition flex items-start justify-between gap-2 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#6C00FF]/20 text-[#6C00FF] border border-[#6C00FF]/30">
            {aug.tier || 'T1'}
          </span>
          <span className="text-[10px] text-slate-400">
            {aug.cyberType} ({aug.slots}槽)
          </span>
          {isOriginalLoot && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F5F500]/10 text-[#F5F500] border border-[#F5F500]/30">
              奇幻遗宝跨界
            </span>
          )}
        </div>

        <h4 className="font-bold text-xs text-white group-hover:text-[#00FFA3] transition truncate">
          {aug.name}
        </h4>

        <p className="text-[11px] text-slate-300 leading-relaxed mt-1 line-clamp-2">
          {aug.effect}
        </p>
      </div>

      <button
        onClick={() => onUninstall(aug.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition flex-shrink-0"
        title="卸下此义体至背包"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
