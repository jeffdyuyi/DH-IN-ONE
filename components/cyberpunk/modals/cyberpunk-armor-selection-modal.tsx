"use client"

import React, { useState, useMemo } from 'react'
import {
  CYBERPUNK_STARTER_ARMORS,
  type CyberpunkStarterArmor,
} from '@/lib/cyberpunk/cyberpunk-starter-equipment'
import type { ArmorSelectionInput } from '@/lib/sheet-store'
import { X, Search, Shield, RefreshCw } from 'lucide-react'
import { ArmorSelectionModal } from '@/components/modals/armor-selection-modal'
import { CyberpunkSquareIcon } from '../cyberpunk-square-icon'

interface CyberpunkArmorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (input: ArmorSelectionInput) => void
  title?: string
}

export function CyberpunkArmorSelectionModal({
  isOpen,
  onClose,
  onSelect,
  title,
}: CyberpunkArmorModalProps) {
  const [activeTab, setActiveTab] = useState<'cyberpunk' | 'standard'>('cyberpunk')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredArmors = useMemo(() => {
    return CYBERPUNK_STARTER_ARMORS.filter((ar) => {
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase()
        const matchName = ar.name.toLowerCase().includes(term)
        const matchFeature = (ar.feature || '').toLowerCase().includes(term)
        if (!matchName && !matchFeature) return false
      }
      return true
    })
  }, [searchTerm])

  if (!isOpen) return null

  // 切换到奇幻装备库
  if (activeTab === 'standard') {
    return (
      <div className="relative z-50">
        <ArmorSelectionModal
          isOpen={isOpen}
          onClose={onClose}
          onSelect={(input) => {
            onSelect(input)
            onClose()
          }}
          title={title || '选择护甲'}
        />
        <div className="fixed top-4 right-4 z-[60]">
          <button
            type="button"
            onClick={() => setActiveTab('cyberpunk')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FCEE0A] text-black font-bold text-xs shadow-lg hover:bg-yellow-400 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            返回渊边行者护甲
          </button>
        </div>
      </div>
    )
  }

  const handleSelectArmor = (ar: CyberpunkStarterArmor) => {
    onSelect({
      type: 'custom',
      draft: {
        name: ar.name,
        tier: ar.tier,
        baseArmorMax: ar.baseArmorScore,
        baseThresholds: {
          minor: ar.majorThresholdBonus,
          major: ar.severeThresholdBonus,
        },
        featureName: ar.name,
        description: ar.feature === '——' ? '' : ar.feature,
        modifierContributions: [],
      },
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 font-sans">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border-2 border-[#00FFA3]/60 bg-[#0B0320] text-slate-100 shadow-[0_0_50px_rgba(0,255,163,0.25)]">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between border-b border-[#6C00FF]/30 bg-[#12072B] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00FFA3] flex items-center justify-center text-black font-black text-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                  {title || '选择战术护甲'}
                </h2>
                <span className="rounded bg-[#00FFA3]/15 px-2 py-0.5 text-[11px] font-bold text-[#00FFA3] border border-[#00FFA3]/30">
                  渊边行者初始护甲
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                依《爽博朋克：渊边行者》官方规则库定义，共 {CYBERPUNK_STARTER_ARMORS.length} 款防护战术护甲
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('standard')}
              className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white bg-[#6C00FF]/20 hover:bg-[#6C00FF]/40 border border-[#6C00FF]/40 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>切换奇幻护甲库</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 搜索 */}
        <div className="border-b border-[#6C00FF]/20 bg-[#0B0320] px-5 py-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索护甲名称或特性..."
              className="w-full rounded-lg border border-slate-700 bg-[#12072B] pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-[#00FFA3] focus:outline-none"
            />
          </div>
        </div>

        {/* 护甲列表 */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredArmors.map((ar) => (
              <div
                key={ar.id}
                onClick={() => handleSelectArmor(ar)}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-[#12072B]/80 hover:border-[#00FFA3] hover:bg-[#12072B] p-4 transition-all duration-200 cursor-pointer shadow-md hover:shadow-[0_0_20px_rgba(0,255,163,0.2)]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <CyberpunkSquareIcon name={ar.name} size="md" theme="armor" />
                      <div>
                        <h3 className="font-black text-sm text-white group-hover:text-[#00FFA3] transition-colors">
                          {ar.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-mono">
                          护甲阈值加成: <strong className="text-[#00FFA3]">{ar.thresholdBonusText}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block font-mono">基础护甲值</span>
                      <div className="font-mono font-black text-lg text-[#00FFA3]">
                        {ar.baseArmorScore}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#0B0320] p-2.5 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans min-h-[42px]">
                    {ar.feature !== '——' ? (
                      <span>{ar.feature}</span>
                    ) : (
                      <span className="text-slate-600">标准无额外被动特性</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">
                    初始装备 · 不占外置激活槽位
                  </span>
                  <button
                    type="button"
                    className="flex items-center gap-1 px-3 py-1 rounded bg-[#00FFA3]/15 group-hover:bg-[#00FFA3] text-[#00FFA3] group-hover:text-black font-bold text-xs transition-colors"
                  >
                    <span>装配此护甲</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
