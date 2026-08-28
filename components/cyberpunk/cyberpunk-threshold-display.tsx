"use client"

import React from 'react'
import { Shield, AlertTriangle, Skull } from 'lucide-react'

interface CyberpunkThresholdDisplayProps {
  armorScore: number
  minorThreshold: number
  majorThreshold: number
  severeThreshold: number
}

export function CyberpunkThresholdDisplay({
  armorScore,
  minorThreshold,
  majorThreshold,
  severeThreshold
}: CyberpunkThresholdDisplayProps) {
  return (
    <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
      {/* 战术护甲值 */}
      <div className="p-2 rounded-xl bg-[#F5F500]/5 border border-[#F5F500]/20">
        <div className="text-[10px] text-slate-400 font-semibold mb-1 flex items-center justify-center space-x-1">
          <Shield className="w-3 h-3 text-[#F5F500]" />
          <span>战术护甲</span>
        </div>
        <div className="text-xl font-black text-[#F5F500]">{armorScore}</div>
      </div>

      {/* 轻伤阈值 */}
      <div className="p-2 rounded-xl bg-white/5 border border-white/10">
        <div className="text-[10px] text-slate-400 font-semibold mb-1">轻伤 (Minor)</div>
        <div className="text-xl font-bold text-slate-200">1 ~ {minorThreshold}</div>
      </div>

      {/* 中伤阈值 */}
      <div className="p-2 rounded-xl bg-[#FF007F]/10 border border-[#FF007F]/30">
        <div className="text-[10px] text-[#FF007F] font-semibold mb-1 flex items-center justify-center space-x-1">
          <AlertTriangle className="w-3 h-3" />
          <span>中伤 (Major)</span>
        </div>
        <div className="text-xl font-black text-[#FF007F]">{majorThreshold}+</div>
      </div>

      {/* 重伤阈值 */}
      <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30">
        <div className="text-[10px] text-rose-400 font-semibold mb-1 flex items-center justify-center space-x-1">
          <Skull className="w-3 h-3" />
          <span>重伤 (Severe)</span>
        </div>
        <div className="text-xl font-black text-rose-400">{severeThreshold}+</div>
      </div>
    </div>
  )
}
