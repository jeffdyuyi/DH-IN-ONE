"use client"

import React, { useState, useMemo } from 'react'
import {
  CYBERPUNK_STARTER_PRIMARY_WEAPONS,
  CYBERPUNK_STARTER_SECONDARY_WEAPONS,
  type CyberpunkStarterWeapon,
} from '@/lib/cyberpunk/cyberpunk-starter-equipment'
import type { WeaponSelectionInput } from '@/lib/sheet-store'
import { X, Search, Shield, Crosshair, Sparkles, RefreshCw } from 'lucide-react'
import { WeaponSelectionModal } from '@/components/modals/weapon-selection-modal'
import { CyberpunkSquareIcon } from '../cyberpunk-square-icon'

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
  // 模式：'cyberpunk' (渊边行者初始军备) | 'standard' (标准奇幻装备)
  const [activeTab, setActiveTab] = useState<'cyberpunk' | 'standard'>('cyberpunk')
  const [searchTerm, setSearchTerm] = useState('')
  const [traitFilter, setTraitFilter] = useState<string>('all')
  const [damageTypeFilter, setDamageTypeFilter] = useState<'all' | '物理' | '能量'>('all')

  const starterList: CyberpunkStarterWeapon[] = useMemo(() => {
    return weaponSlotType === 'secondary'
      ? CYBERPUNK_STARTER_SECONDARY_WEAPONS
      : CYBERPUNK_STARTER_PRIMARY_WEAPONS
  }, [weaponSlotType])

  const filteredWeapons = useMemo(() => {
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
  }, [starterList, searchTerm, traitFilter, damageTypeFilter])

  if (!isOpen) return null

  // 若用户切换到“标准奇幻装备”，直接渲染原版标准装备模态框
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
        {/* 浮动返回按钮 */}
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 font-sans">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border-2 border-[#00FFA3]/60 bg-[#0B0320] text-slate-100 shadow-[0_0_50px_rgba(0,255,163,0.25)]">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between border-b border-[#6C00FF]/30 bg-[#12072B] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FCEE0A] flex items-center justify-center text-black font-black text-sm">
              {weaponSlotType === 'primary' ? '主' : '副'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                  {title || (weaponSlotType === 'primary' ? '选择主武器' : '选择副武器')}
                </h2>
                <span className="rounded bg-[#00FFA3]/15 px-2 py-0.5 text-[11px] font-bold text-[#00FFA3] border border-[#00FFA3]/30">
                  渊边行者初始军备
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                依《爽博朋克：渊边行者》官方规则库定义，共 {starterList.length} 款战备枪械与冷兵器
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 切换到标准奇幻装备 */}
            <button
              type="button"
              onClick={() => setActiveTab('standard')}
              className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white bg-[#6C00FF]/20 hover:bg-[#6C00FF]/40 border border-[#6C00FF]/40 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>切换奇幻装备库</span>
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

        {/* 筛选与搜索工具条 */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#6C00FF]/20 bg-[#0B0320] px-5 py-3">
          {/* 搜索框 */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索武器名称、属性或特性关键词..."
              className="w-full rounded-lg border border-slate-700 bg-[#12072B] pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-[#00FFA3] focus:outline-none"
            />
          </div>

          {/* 属性过滤 */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">关联属性:</span>
            <select
              value={traitFilter}
              onChange={(e) => setTraitFilter(e.target.value)}
              className="rounded bg-[#12072B] border border-slate-700 px-2 py-1 text-xs text-slate-200 focus:border-[#00FFA3] focus:outline-none"
            >
              <option value="all">全部属性</option>
              <option value="敏捷">敏捷</option>
              <option value="力量">力量</option>
              <option value="灵巧">灵巧</option>
              <option value="本能">本能</option>
              <option value="风度">风度</option>
              <option value="知识">知识</option>
            </select>

            <span className="text-slate-400 text-[11px] ml-2">伤害类型:</span>
            <select
              value={damageTypeFilter}
              onChange={(e) => setDamageTypeFilter(e.target.value as any)}
              className="rounded bg-[#12072B] border border-slate-700 px-2 py-1 text-xs text-slate-200 focus:border-[#00FFA3] focus:outline-none"
            >
              <option value="all">全部类型</option>
              <option value="物理">物理</option>
              <option value="能量">能量</option>
            </select>
          </div>
        </div>

        {/* 军备列表网格 */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredWeapons.map((wp) => (
              <div
                key={wp.id}
                onClick={() => handleSelectStarter(wp)}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-[#12072B]/80 hover:border-[#00FFA3] hover:bg-[#12072B] p-4 transition-all duration-200 cursor-pointer shadow-md hover:shadow-[0_0_20px_rgba(0,255,163,0.2)]"
              >
                <div>
                  {/* 武器头部 */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <CyberpunkSquareIcon name={wp.name} size="md" theme="weapon" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-sm text-white group-hover:text-[#00FFA3] transition-colors">
                            {wp.name}
                          </h3>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              wp.damageType === '能量'
                                ? 'bg-cyan-950 text-cyan-400 border border-cyan-700/50'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {wp.damageType}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {wp.burden} · {wp.range}射程
                        </span>
                      </div>
                    </div>

                    {/* 伤害与属性大徽章 */}
                    <div className="text-right shrink-0">
                      <div className="font-mono font-black text-sm text-[#FCEE0A]">
                        {wp.damage}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400">
                        {wp.trait}
                      </div>
                    </div>
                  </div>

                  {/* 特性描述 */}
                  <div className="rounded-lg bg-[#0B0320] p-2.5 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans min-h-[42px]">
                    {wp.feature !== '——' ? (
                      <span>{wp.feature}</span>
                    ) : (
                      <span className="text-slate-600">标准无额外被动特性</span>
                    )}
                  </div>
                </div>

                {/* 底部一键装配按钮 */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">
                    初始装备 · 不占外置激活槽位
                  </span>
                  <button
                    type="button"
                    className="flex items-center gap-1 px-3 py-1 rounded bg-[#00FFA3]/15 group-hover:bg-[#00FFA3] text-[#00FFA3] group-hover:text-black font-bold text-xs transition-colors"
                  >
                    <span>装配此武器</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredWeapons.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Crosshair className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">未找到匹配的军备武器</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
