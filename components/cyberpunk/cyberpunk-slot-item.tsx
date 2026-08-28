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
    <div className="p-2.5 rounded-xl border border-[#6C00FF]/30 bg-[#12072B] hover:border-[#00FFA3]/50 transition flex items-start justify-between gap-2 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1.5 mb-1 flex-wrap gap-y-1">
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#6C00FF]/30 text-[#F5F500] border border-[#6C00FF]/50 font-mono">
            {aug.tier || 'T1'}
          </span>
          <span className="text-[10px] text-slate-300 font-mono">
            {aug.cyberType} ({aug.slots}槽)
          </span>
        </div>

        <h4 className="font-bold text-xs text-white group-hover:text-[#00FFA3] transition truncate">
          {aug.name}
        </h4>

        <div className="text-[11px] text-slate-300 leading-relaxed mt-1 whitespace-pre-wrap break-words">
          {formatMarkdownEffect(aug.effect)}
        </div>
      </div>

      <button
        onClick={() => onUninstall(aug.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-[#FF007F] rounded transition flex-shrink-0"
        title="卸下此义体"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function formatMarkdownEffect(text: string | undefined) {
  if (!text) return null
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-bold text-amber-300">{part.slice(2, -2)}</strong>
    }
    return part
  })
}
