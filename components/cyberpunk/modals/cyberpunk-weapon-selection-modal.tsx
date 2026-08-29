"use client"

import React, { useState, useMemo, useEffect } from 'react'
import {
  CYBERPUNK_STARTER_PRIMARY_WEAPONS,
  CYBERPUNK_STARTER_SECONDARY_WEAPONS,
  type CyberpunkStarterWeapon,
} from '@/lib/cyberpunk/cyberpunk-starter-equipment'
import type { WeaponSelectionInput } from '@/lib/sheet-store'
import { X, Search, Crosshair, RefreshCw, Box, ShieldAlert } from 'lucide-react'
import { WeaponSelectionModal } from '@/components/modals/weapon-selection-modal'
import { CyberpunkSquareIcon } from '../cyberpunk-square-icon'
import { vaultStorage, type VaultCard } from '@/lib/vault/vault-storage'
import { compileVaultToWeapon } from '@/lib/vault/cross-flavor-equipper'

interface CyberpunkWeaponModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (input: WeaponSelectionInput) => void
  title?: string
  weaponSlotType: 'primary' | 'secondary'
}

export function CyberpunkWeaponSelectionModal({
  isOpen,
  onClose,
  onSelect,
  title,
  weaponSlotType,
}: CyberpunkWeaponModalProps) {
  const [activeTab, setActiveTab] = useState<'cyberpunk' | 'standard'>('cyberpunk')
  const [searchTerm, setSearchTerm] = useState('')
  const [traitFilter, setTraitFilter] = useState<string>('all')
  const [damageTypeFilter, setDamageTypeFilter] = useState<'all' | '物理' | '能量'>('all')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'starter' | 'custom'>('all')

  // 本地/工坊外置武器卡牌
  const [customVaultWeapons, setCustomVaultWeapons] = useState<VaultCard[]>([])
  const [loadingVault, setLoadingVault] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const fetchVaultWeapons = async () => {
      try {
        setLoadingVault(true)
        await vaultStorage.initialize()
        const cards = await vaultStorage.queryCards({
          category: ['cyberware', 'weapon'] as any,
        })

        // 筛选符合当前主副手槽位的外置装备
        const matched = cards.filter((card) => {
          const data = (card.data || {}) as Record<string, any>
          const type = (data.cyberType || '').toLowerCase()
          const zone = (data.zone || '').toLowerCase()
          const text = `${card.name} ${card.description || ''} ${data.effect || ''} ${data.feature || ''}`

          if (weaponSlotType === 'primary') {
            // 主武器：明确标注主武器、或者武器类且非副手
            if (zone.includes('副手') || zone.includes('副武器') || type.includes('副武器')) {
              return false
            }
            return (
              card.category === 'weapon' ||
              zone.includes('主武器') ||
              type.includes('主武器') ||
              Boolean(data.damage && !text.includes('副手') && !text.includes('offHand'))
            )
          } else {
            // 副武器：明确标注副武器、副手、或者武器类
            return (
              zone.includes('副手') ||
              zone.includes('副武器') ||
              type.includes('副武器') ||
              text.includes('副手') ||
              text.includes('offHand') ||
              card.category === 'weapon' ||
              Boolean(data.damage)
            )
          }
        })

        setCustomVaultWeapons(matched)
      } catch (e) {
        console.error('Failed to load custom weapons from vault:', e)
      } finally {
        setLoadingVault(false)
      }
    }

    fetchVaultWeapons()
  }, [isOpen, weaponSlotType])

  const starterList: CyberpunkStarterWeapon[] = useMemo(() => {
    return weaponSlotType === 'secondary'
      ? CYBERPUNK_STARTER_SECONDARY_WEAPONS
      : CYBERPUNK_STARTER_PRIMARY_WEAPONS
  }, [weaponSlotType])

  // 过滤官方军备
  const filteredStarters = useMemo(() => {
    if (sourceFilter === 'custom') return []
    return starterList.filter((wp) => {
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase()
        const matchName = wp.name.toLowerCase().includes(term)
        const matchFeature = (wp.feature || '').toLowerCase().includes(term)
        const matchTrait = wp.trait.toLowerCase().includes(term)
        if (!matchName && !matchFeature && !matchTrait) return false
      }
      if (traitFilter !== 'all' && wp.trait !== traitFilter) return false
      if (damageTypeFilter !== 'all' && wp.damageType !== damageTypeFilter) return false
      return true
    })
  }, [starterList, searchTerm, traitFilter, damageTypeFilter, sourceFilter])

  // 过滤自制/工坊外置武器
  const filteredCustomWeapons = useMemo(() => {
    if (sourceFilter === 'starter') return []
    return customVaultWeapons.filter((card) => {
      const data = (card.data || {}) as Record<string, any>
      const compiled = compileVaultToWeapon(card)
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase()
        const matchName = card.name.toLowerCase().includes(term)
        const matchDesc = (card.description || '').toLowerCase().includes(term)
        const matchFeature = (data.effect || '').toLowerCase().includes(term)
        if (!matchName && !matchDesc && !matchFeature) return false
      }
      if (traitFilter !== 'all') {
        const traitNameMap: Record<string, string> = {
          agility: '敏捷',
          strength: '力量',
          finesse: '灵巧',
          instinct: '本能',
          presence: '风度',
          knowledge: '知识',
        }
        const cardTraitName = traitNameMap[compiled.trait] || compiled.trait
        if (cardTraitName !== traitFilter) return false
      }
      if (damageTypeFilter !== 'all') {
        const isMagic = compiled.damageType === 'magical'
        if (damageTypeFilter === '能量' && !isMagic) return false
        if (damageTypeFilter === '物理' && isMagic) return false
      }
      return true
    })
  }, [customVaultWeapons, searchTerm, traitFilter, damageTypeFilter, sourceFilter])

  if (!isOpen) return null

  // 切换至标准奇幻库
  if (activeTab === 'standard') {
    return (
      <div className="relative z-50">
        <WeaponSelectionModal
          isOpen={isOpen}
          onClose={onClose}
          onSelect={(input) => {
            onSelect(input)
            onClose()
          }}
          title={title || (weaponSlotType === 'primary' ? '选择主武器' : '选择副武器')}
          weaponSlotType={weaponSlotType}
        />
        <div className="fixed top-4 right-4 z-[60]">
          <button
            type="button"
            onClick={() => setActiveTab('cyberpunk')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FCEE0A] text-black font-bold text-xs shadow-lg hover:bg-yellow-400 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            返回渊边行者军备
          </button>
        </div>
      </div>
    )
  }

  // 选择官方军备
  const handleSelectStarter = (wp: CyberpunkStarterWeapon) => {
    onSelect({
      type: 'custom',
      draft: {
        name: wp.name,
        tier: wp.tier,
        weaponType: wp.category,
        trait: wp.traitKey,
        damageType: wp.damageType === '能量' ? 'magic' : 'physical',
        range: wp.rangeKey,
        burden: wp.burdenKey,
        damage: wp.damage,
        featureName: wp.name,
        description: wp.feature === '——' ? '' : wp.feature,
        modifierContributions: [],
      },
    })
    onClose()
  }

  // 选择工坊/自制外置武器
  const handleSelectCustomVault = (card: VaultCard) => {
    const compiled = compileVaultToWeapon(card)
    onSelect({
      type: 'custom',
      draft: {
        name: compiled.name,
        tier: (compiled.tier as any) || 'T1',
        weaponType: weaponSlotType,
        trait: compiled.trait as any,
        damageType: compiled.damageType === 'magical' ? 'magic' : 'physical',
        range: compiled.range as any,
        burden: compiled.burden as any,
        damage: compiled.damage,
        featureName: compiled.featureName || compiled.name,
        description: compiled.description,
        modifierContributions: (compiled.modifierContributions as any) || [],
      },
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0D0D0D] border-2 border-[#1F2229] rounded-2xl shadow-[0_0_50px_rgba(252,238,10,0.15)] flex flex-col overflow-hidden text-white">
        {/* 顶部 Header */}
        <div className="p-4 px-6 bg-[#15181E] border-b border-[#2B313D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FCEE0A] text-black flex items-center justify-center font-bold">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {title || (weaponSlotType === 'primary' ? '选择主手战术武器' : '选择副手/备用武器')}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                支持《爽博朋克》官方军备与工坊自制外置武器 · 自动同步伤害与规则特性
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
              切换奇幻装备库
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
              placeholder="搜索武器名称、特性或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#15181E] border border-[#2B313D] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FCEE0A]"
            />
          </div>

          {/* 来源切换 */}
          <div className="flex items-center gap-1 bg-[#15181E] p-1 rounded-lg border border-[#2B313D] text-xs">
            <button
              type="button"
              onClick={() => setSourceFilter('all')}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                sourceFilter === 'all' ? 'bg-[#FCEE0A] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              全部 ({filteredStarters.length + filteredCustomWeapons.length})
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter('starter')}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                sourceFilter === 'starter' ? 'bg-[#FCEE0A] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              官方初始 ({filteredStarters.length})
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter('custom')}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                sourceFilter === 'custom' ? 'bg-[#FCEE0A] text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              自制外置 ({filteredCustomWeapons.length})
            </button>
          </div>

          {/* 属性过滤 */}
          <select
            value={traitFilter}
            onChange={(e) => setTraitFilter(e.target.value)}
            className="bg-[#15181E] border border-[#2B313D] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FCEE0A]"
          >
            <option value="all">全部属性</option>
            <option value="敏捷">敏捷</option>
            <option value="力量">力量</option>
            <option value="灵巧">灵巧</option>
            <option value="本能">本能</option>
            <option value="风度">风度</option>
            <option value="知识">知识</option>
          </select>

          {/* 伤害类型过滤 */}
          <select
            value={damageTypeFilter}
            onChange={(e) => setDamageTypeFilter(e.target.value as any)}
            className="bg-[#15181E] border border-[#2B313D] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FCEE0A]"
          >
            <option value="all">全部伤害类型</option>
            <option value="物理">物理伤害</option>
            <option value="能量">能量伤害</option>
          </select>
        </div>

        {/* 武器列表区 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* 1. 自制与工坊外置武器 */}
          {filteredCustomWeapons.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00F0FF] border-b border-[#00F0FF]/20 pb-1">
                <Box className="w-3.5 h-3.5" />
                <span>工坊与卡库外置武器 ({filteredCustomWeapons.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredCustomWeapons.map((card) => {
                  const data = (card.data || {}) as Record<string, any>
                  const compiled = compileVaultToWeapon(card)
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
                        theme="weapon"
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
                          <span className="px-1.5 py-0.5 rounded bg-[#1F2430] text-[#00F0FF] text-[10px] font-bold">
                            {compiled.trait === 'agility' ? '敏捷' : compiled.trait === 'strength' ? '力量' : compiled.trait === 'finesse' ? '灵巧' : '属性'}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[#FF003C]/20 text-[#FF003C] border border-[#FF003C]/40 text-[10px] font-mono font-bold">
                            {compiled.damage}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[#1F2430] text-zinc-300 text-[10px]">
                            {compiled.range === 'melee' ? '近战' : compiled.range}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[#1F2430] text-zinc-300 text-[10px]">
                            {compiled.burden === 'twoHanded' ? '双手' : compiled.burden === 'offHand' ? '副手' : '单手'}
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

          {/* 2. 官方初始军备 */}
          {filteredStarters.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FCEE0A] border-b border-[#FCEE0A]/20 pb-1">
                <Crosshair className="w-3.5 h-3.5" />
                <span>《爽博朋克：渊边行者》官方初始武器 ({filteredStarters.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredStarters.map((wp) => (
                  <div
                    key={wp.name}
                    onClick={() => handleSelectStarter(wp)}
                    className="group relative bg-[#12151D] border border-[#2B313D] hover:border-[#FCEE0A] p-3.5 rounded-xl cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(252,238,10,0.15)] flex items-start gap-3"
                  >
                    <CyberpunkSquareIcon name={wp.name} size="md" theme="weapon" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm text-white group-hover:text-[#FCEE0A] transition-colors truncate">
                          {wp.name}
                        </h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1F2430] text-slate-300">
                          {wp.tier} · {wp.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 text-[10px] font-bold">
                          {wp.trait}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#FF003C]/20 text-[#FF003C] border border-[#FF003C]/40 text-[10px] font-mono font-bold">
                          {wp.damage}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#1F2430] text-zinc-300 text-[10px]">
                          {wp.range}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#1F2430] text-zinc-300 text-[10px]">
                          {wp.burden}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#1F2430] text-zinc-400 text-[10px]">
                          {wp.damageType}
                        </span>
                      </div>
                      {wp.feature && wp.feature !== '——' && (
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {wp.feature}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredStarters.length === 0 && filteredCustomWeapons.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs">
              未找到匹配的战术武器，请尝试更改搜索词或过滤器。
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
