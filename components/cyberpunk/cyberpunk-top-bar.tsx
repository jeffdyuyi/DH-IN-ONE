"use client"

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Printer, Sparkles, Moon, Sun, Save } from 'lucide-react'

interface CyberpunkTopBarProps {
  characterName: string
  saveName: string
  level: string
  isLightPreview?: boolean
  onToggleLightPreview?: () => void
  onSave?: () => void
}

export function CyberpunkTopBar({
  characterName,
  saveName,
  level,
  isLightPreview,
  onToggleLightPreview,
  onSave
}: CyberpunkTopBarProps) {
  return (
    <header className="border-b border-white/10 backdrop-blur-md bg-black/40 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/character"
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>角色中心</span>
          </Link>
          <span className="text-slate-600">|</span>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30">
                渊边行者
              </span>
              <h1 className="font-extrabold text-sm text-white">{characterName || '未命名角色'}</h1>
              <span className="text-xs text-slate-400">({saveName || '默认存档'} · LV.{level || '1'})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {onToggleLightPreview && (
            <button
              onClick={onToggleLightPreview}
              className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                isLightPreview
                  ? 'bg-amber-400 text-black border-amber-400 font-bold'
                  : 'border-white/10 hover:bg-white/10 text-slate-300 hover:text-white'
              }`}
              title="切换浅色模式以预览 A4 打印版面"
            >
              {isLightPreview ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isLightPreview ? '浅色打印预览中' : '🌓 浅色打印预览'}</span>
            </button>
          )}

          {onSave && (
            <button
              onClick={onSave}
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#00FFA3] text-black hover:opacity-90 transition shadow-[0_0_12px_rgba(0,255,163,0.2)]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>保存</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition"
            title="A4 竖版打印 (0 墨水线框化)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>A4 打印</span>
          </button>
        </div>
      </div>
    </header>
  )
}
