"use client"

import React, { useState, useMemo, useEffect } from 'react'
import {
  CYBERPUNK_STARTER_ARMORS,
  type CyberpunkStarterArmor,
} from '@/lib/cyberpunk/cyberpunk-starter-equipment'
import type { ArmorSelectionInput } from '@/lib/sheet-store'
import { X, Search, Shield, RefreshCw, Box } from 'lucide-react'
import { ArmorSelectionModal } from '@/components/modals/armor-selection-modal'
import { CyberpunkSquareIcon } from '../cyberpunk-square-icon'
import { vaultStorage, type VaultCard } from '@/lib/vault/vault-storage'
import { compileVaultToArmor } from '@/lib/vault/cross-flavor-equipper'

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
  const [sourceFilter, setSourceFilter] = useState<'all' | 'starter' | 'custom'>('all')

  // 本地/工坊外置护甲卡牌
  const [customVaultArmors, setCustomVaultArmors] = useState<VaultCard[]>([])
  const [loadingVault, setLoadingVault] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const fetchVaultArmors = async () => {
      try {
        setLoadingVault(true)
        await vaultStorage.initialize()
        const cards = await vaultStorage.queryCards({
          category: ['cyberware', 'armor'] as any,
        })

        // 筛选符合护甲的外置装备
        const matched = cards.filter((card) => {
          const data = (card.data || {}) as Record<string, any>
          const type = (data.cyberType || '').toLowerCase()
          const zone = (data.zone || '').toLowerCase()
          const text = `${card.name} ${card.description || ''} ${data.effect || ''} ${data.feature || ''}`

          return (
            card.category === 'armor' ||
            zone.includes('护甲') ||
            type.includes('护甲') ||
            Boolean(data.armorScore || data.score) ||
            text.includes('护甲值')
          )
        })

        setCustomVaultArmors(matched)
      } catch (e) {
        console.error('Failed to load custom armors from vault:', e)
      } finally {
        setLoadingVault(false)
      }
    }

    fetchVaultArmors()
  }, [isOpen])

  // 过滤官方护甲
  const filteredStarters = useMemo(() => {
    if (sourceFilter === 'custom') return []
    return CYBERPUNK_STARTER_ARMORS.filter((ar) => {
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase()
        const matchName = ar.name.toLowerCase().includes(term)
        const matchFeature = (ar.feature || '').toLowerCase().includes(term)
        if (!matchName && !matchFeature) return false
      }
      return true
    })
  }, [searchTerm, sourceFilter])

  // 过滤自制/工坊外置护甲
  const filteredCustomArmors = useMemo(() => {
    if (sourceFilter === 'starter') return []
    return customVaultArmors.filter((card) => {
      const data = (card.data || {}) as Record<string, any>
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase()
        const matchName = card.name.toLowerCase().includes(term)
        const matchDesc = (card.description || '').toLowerCase().includes(term)
        const matchFeature = (data.effect || '').toLowerCase().includes(term)
        if (!matchName && !matchDesc && !matchFeature) return false
      }
      return true
    })
  }, [customVaultArmors, searchTerm, sourceFilter])

  if (!isOpen) return null

  // 切换至标准奇幻库
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
          title={title || '选择战术护甲'}
        />
        <div className="fixed top-4 right-4 z-[60]">
          <button
            type="button"
            onClick={() => setActiveTab('cyberpunk')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00FFA3] text-black font-bold text-xs shadow-lg hover:bg-emerald-400 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            返回渊边行者护甲
          </button>
        </div>
      </div>
    )
  }

  // 选择官方护甲
  const handleSelectStarter = (ar: CyberpunkStarterArmor) => {
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

  // 选择自制/工坊外置护甲
  const handleSelectCustomVault = (card: VaultCard) => {
    const compiled = compileVaultToArmor(card)
    onSelect({
      type: 'custom',
      draft: {
        name: compiled.name,
        tier: (compiled.tier as any) || 'T1',
        baseArmorMax: compiled.baseArmorMax,
        baseThresholds: {
          minor: compiled.baseThresholds.minor,
          major: compiled.baseThresholds.major,
        },
        featureName: compiled.featureName || compiled.name,
        description: compiled.description,
        modifierContributions: (compiled.modifierContributions as any) || [],
      },
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0D0D0D] border-2 border-[#1F2229] rounded-2xl shadow-[0_0_50px_rgba(0,255,163,0.15)] flex flex-col overflow-hidden text-white">
        {/* 顶部 Header */}
        <div className="p-4 px-6 bg-[#15181E] border-b border-[#2B313D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#00FFA3] text-black flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">{title || '选择战术护甲'}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                支持《爽博朋克》官方护甲与工坊自制外置护甲 · 自动同步护甲值与阈值加成
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('standard')}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#00F0FF]/40 text-[#00F0FF] bg-[#00F0FF]/10 hover:bg-[#00F0FF]/25 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              切换奇幻护甲库
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 过滤控制栏 */}
        <div className="p-3.5 px-6 bg-[#0E1015] border-b border-[#1F2229] flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索护甲名称、特性或规则描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#15181E] border border-[#2B313D] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00FFA3]"
            />
          </div>

          {/* 来源切换 */}
          <div className="flex items-center gap-1 bg-[#15181E] p-1 rounded-lg border border-[#2B313D] text-xs">
            <button
              type="button"
              onClick={() => setSourceFilter('all')}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                sourceFilter === 'all' ? 'bg-[#00FFA3] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              全部 ({filteredStarters.length + filteredCustomArmors.length})
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter('starter')}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                sourceFilter === 'starter' ? 'bg-[#00FFA3] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              官方初始 ({filteredStarters.length})
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter('custom')}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                sourceFilter === 'custom' ? 'bg-[#00FFA3] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              自制外置 ({filteredCustomArmors.length})
            </button>
          </div>
        </div>

        {/* 护甲列表区 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* 1. 自制与工坊外置护甲 */}
          {filteredCustomArmors.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00F0FF] border-b border-[#00F0FF]/20 pb-1">
                <Box className="w-3.5 h-3.5" />
                <span>工坊与卡库外置护甲 ({filteredCustomArmors.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredCustomArmors.map((card) => {
                  const data = (card.data || {}) as Record<string, any>
                  const compiled = compileVaultToArmor(card)
                  return (
                    <div
                      key={card.id}
                      onClick={() => handleSelectCustomVault(card)}
                      className="group relative bg-[#12151D] border border-[#2B313D] hover:border-[#00F0FF] p-3.5 rounded-xl cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] flex items-start gap-3"
                    >
                      <CyberpunkSquareIcon
                        name={card.name}
                        icon={data.icon}
                        image={data.image}
                        size="md"
                        theme="armor"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-sm text-white group-hover:text-[#00F0FF] transition-colors truncate">
                            {card.name}
                          </h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 font-bold">
                            自制外置
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/40 text-[10px] font-bold">
                            护甲值: {compiled.baseArmorMax}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[#1F2430] text-[#00F0FF] text-[10px] font-mono">
                            轻{compiled.baseThresholds.minor} / 重{compiled.baseThresholds.major}
                          </span>
                        </div>
                        {compiled.description && (
                          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                            {compiled.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 2. 官方初始护甲 */}
          {filteredStarters.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00FFA3] border-b border-[#00FFA3]/20 pb-1">
                <Shield className="w-3.5 h-3.5" />
                <span>《爽博朋克：渊边行者》官方初始护甲 ({filteredStarters.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredStarters.map((ar) => (
                  <div
                    key={ar.name}
                    onClick={() => handleSelectStarter(ar)}
                    className="group relative bg-[#12151D] border border-[#2B313D] hover:border-[#00FFA3] p-3.5 rounded-xl cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(0,255,163,0.15)] flex items-start gap-3"
                  >
                    <CyberpunkSquareIcon name={ar.name} size="md" theme="armor" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm text-white group-hover:text-[#00FFA3] transition-colors truncate">
                          {ar.name}
                        </h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1F2430] text-slate-300">
                          {ar.tier}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/40 text-[10px] font-bold">
                          护甲值: {ar.baseArmorScore}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#1F2430] text-[#00F0FF] text-[10px] font-mono">
                          轻{ar.majorThresholdBonus} / 重{ar.severeThresholdBonus}
                        </span>
                      </div>
                      {ar.feature && ar.feature !== '——' && (
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {ar.feature}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredStarters.length === 0 && filteredCustomArmors.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs">
              未找到匹配的战术护甲，请尝试更改搜索词或过滤器。
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
