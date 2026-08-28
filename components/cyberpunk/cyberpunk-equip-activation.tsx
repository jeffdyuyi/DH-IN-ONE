"use client"

import React from 'react'
import { Zap, Shield, Sparkles } from 'lucide-react'

export function CyberpunkEquipActivation() {
  return (
    <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
      <div className="flex items-center space-x-2 mb-2">
        <Zap className="w-4 h-4 text-[#00FFA3]" />
        <h3 className="font-bold text-xs text-[#00FFA3] uppercase tracking-wider">
          机体状态与激活判定
        </h3>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">
        义体与被动特性均已就绪。所有装备数值与阈值加成已自动结算至状态面板，详细机制可随时点击对应插槽卡片查看原文。
      </p>
    </div>
  )
}
