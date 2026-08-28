"use client"

import React, { useState } from 'react'
import { Dices, Sparkles, X, Copy, Check, ArrowRight } from 'lucide-react'
import { BUILTIN_LOOT_SEEDS, BUILTIN_CONSUMABLE_SEEDS } from '../../lib/vault/seeds'
import { VaultCard } from '../../lib/vault/vault-types'

interface D60InspirationDrawerProps {
  isOpen: boolean
  onClose: () => void
  onApplyToDraft?: (card: VaultCard) => void
}

export function D60InspirationDrawer({
  isOpen,
  onClose,
  onApplyToDraft
}: D60InspirationDrawerProps) {
  const [selectedPool, setSelectedPool] = useState<'loot' | 'consumable'>('loot')
  const [currentResult, setCurrentResult] = useState<VaultCard | null>(null)
  const [isRolling, setIsRolling] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)

  if (!isOpen) return null

  const handleRoll = () => {
    setIsRolling(true)
    setCopied(false)

    let count = 0
    const pool = selectedPool === 'loot' ? BUILTIN_LOOT_SEEDS : BUILTIN_CONSUMABLE_SEEDS

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * pool.length)
      setCurrentResult(pool[randomIndex])
      count++
      if (count >= 10) {
        clearInterval(interval)
        setIsRolling(false)
      }
    }, 50)
  }

  const handleCopyText = () => {
    if (!currentResult) return
    const rollIndex = (currentResult.data as any)?.rollIndex || ''
    const text = `【d60 结果 #${rollIndex} ${currentResult.name}】\n${currentResult.description || (currentResult.data as any)?.effect || ''}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0B0320] text-slate-100 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#F5F500]/10 flex items-center justify-center text-[#F5F500]">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">官方 d60 掉落灵感抽取器</h3>
              <p className="text-xs text-slate-400">基于《Daggerheart Core Rulebook》60 战利品与 60 消耗品</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 my-5 p-1 rounded-xl bg-white/[0.03] border border-white/5">
          <button
            onClick={() => { setSelectedPool('loot'); setCurrentResult(null); }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              selectedPool === 'loot'
                ? 'bg-[#00FFA3] text-black shadow-lg shadow-[#00FFA3]/20 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            💎 官方 60 种战利品库
          </button>
          <button
            onClick={() => { setSelectedPool('consumable'); setCurrentResult(null); }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              selectedPool === 'consumable'
                ? 'bg-[#FF007F] text-white shadow-lg shadow-[#FF007F]/20 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🧪 官方 60 种消耗品库
          </button>
        </div>

        <div className="min-h-[160px] flex flex-col justify-center items-center p-6 rounded-xl border border-white/10 bg-white/[0.02] mb-5 text-center">
          {currentResult ? (
            <div className="space-y-3 w-full animate-in zoom-in-95 duration-200">
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-slate-300">
                <span>d60 结果: #{(currentResult.data as any)?.rollIndex}</span>
                <span>•</span>
                <span>{selectedPool === 'loot' ? '战利品' : '消耗品'}</span>
              </div>
              <h4 className="text-xl font-extrabold text-white">
                {currentResult.name}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5">
                {currentResult.description || (currentResult.data as any)?.effect}
              </p>
            </div>
          ) : (
            <div className="text-slate-500 text-xs">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <span>点击下方按钮即可随机掷骰抽取 1 项官方灵感</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleRoll}
            disabled={isRolling}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
              selectedPool === 'loot'
                ? 'bg-gradient-to-r from-[#00FFA3] to-[#F5F500] text-black hover:opacity-90'
                : 'bg-gradient-to-r from-[#FF007F] to-[#6C00FF] text-white hover:opacity-90'
            }`}
          >
            <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
            <span>{isRolling ? '掷骰抽取中...' : '🎲 立即掷骰 d60'}</span>
          </button>

          {currentResult && (
            <>
              <button
                onClick={handleCopyText}
                className="py-3 px-4 rounded-xl text-xs font-semibold border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition flex items-center space-x-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '已复制' : '复制文案'}</span>
              </button>

              {onApplyToDraft && (
                <button
                  onClick={() => { onApplyToDraft(currentResult); onClose(); }}
                  className="py-3 px-4 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition flex items-center space-x-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>套用此卡</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
