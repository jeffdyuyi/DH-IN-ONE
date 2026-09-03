"use client"

import React, { useState } from 'react'
import type { CyberpunkExternalGear, CyberpunkSheetExtension } from '../../types/cyberpunk'
import { CYBERPUNK_TIER_EQUIP_SLOTS } from '../../lib/cyberpunk/tier-constants'
import { InstallExternalGearModal } from './modals/install-external-gear-modal'
import { Radio, Plus, Trash2, Power, Shield, Sword, Eye, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Crosshair, Zap, Package } from 'lucide-react'

interface CyberpunkExternalGearPanelProps {
  cyberpunkData: CyberpunkSheetExtension
  onChange: (updated: CyberpunkSheetExtension) => void
  onEquipToCombatWeapon?: (slot: 'primary' | 'secondary', gear: CyberpunkExternalGear) => void
  onEquipToCombatArmor?: (gear: CyberpunkExternalGear) => void
}

export function CyberpunkExternalGearPanel({
  cyberpunkData,
  onChange,
  onEquipToCombatWeapon,
  onEquipToCombatArmor,
}: CyberpunkExternalGearPanelProps) {
  const currentTier = cyberpunkData.tier || 'T1'
  const maxEquipSlots = CYBERPUNK_TIER_EQUIP_SLOTS[currentTier] || 2

  const gearList: CyberpunkExternalGear[] = cyberpunkData.externalGear || []

  // 辅助解析装备消耗的激活槽位 (0、空为免槽)
  const getGearSlotCost = (g: CyberpunkExternalGear): number => {
    if (g.slots !== undefined && g.slots !== null) {
      const num = Number(g.slots)
      return isNaN(num) || num < 0 ? 0 : num
    }
    if (g.slotCost !== undefined && g.slotCost !== null) {
      const num = Number(g.slotCost)
      return isNaN(num) || num < 0 ? 0 : num
    }
    return 1
  }

  // 计算当前已激活外置装备占用的槽位数 (仅计算已激活且槽位 > 0 的装备)
  const usedActiveSlots = gearList
    .filter((g) => g.active)
    .reduce((sum, g) => sum + getGearSlotCost(g), 0)

  const availableSlots = Math.max(0, maxEquipSlots - usedActiveSlots)

  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)
  const [expandedGearId, setExpandedGearId] = useState<string | null>(null)

  // 切换激活状态 (具有位阶激活限制)
  const handleToggleActive = (gearId: string) => {
    setWarningMessage(null)
    const gear = gearList.find((g) => g.id === gearId)
    if (!gear) return

    const slotCost = getGearSlotCost(gear)

    if (!gear.active) {
      // 准备激活，检查槽位是否超限 (若 slotCost 为 0 则免槽直接激活)
      if (slotCost > 0 && usedActiveSlots + slotCost > maxEquipSlots) {
        setWarningMessage(
          `【激活槽位不足】当前位阶 (${currentTier}) 外置激活上限为 ${maxEquipSlots} 槽，已占用 ${usedActiveSlots} 槽，无法激活需 ${slotCost} 槽的 "${gear.name}"！请先休眠其他外置装备或提升位阶。`
        )
        return
      }
    }

    const updatedList = gearList.map((g) =>
      g.id === gearId ? { ...g, active: !g.active } : g
    )

    onChange({
      ...cyberpunkData,
      externalGear: updatedList,
    })
  }

  // 移除外置设备
  const handleRemove = (gearId: string) => {
    const updatedList = gearList.filter((g) => g.id !== gearId)
    onChange({
      ...cyberpunkData,
      externalGear: updatedList,
    })
  }

  // 安装新外置设备
  const handleInstall = (newGear: CyberpunkExternalGear) => {
    setWarningMessage(null)
    const slotCost = getGearSlotCost(newGear)
    const willActive = slotCost === 0 || (usedActiveSlots + slotCost <= maxEquipSlots)

    const gearToSave = {
      ...newGear,
      active: willActive,
    }

    const updatedList = [...gearList, gearToSave]
    onChange({
      ...cyberpunkData,
      externalGear: updatedList,
    })

    if (!willActive) {
      setWarningMessage(
        `新装备 "${newGear.name}" 由于激活槽位已满 (${usedActiveSlots}/${maxEquipSlots})，已放入背包收纳（未激活），仍可使用基础特性与数值。`
      )
    }
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-[#0E0F17] p-4 text-slate-100 font-sans shadow-[0_4px_20px_rgba(0,0,0,0.6)] space-y-3.5">
      {/* 顶部标题与容量条 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-500/20 pb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>外置装备</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                位阶 {currentTier}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              包含主武器、副武器、护甲及其他外置设备，普通特性常驻生效，激活特性受激活槽位限制
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-xs font-mono">
            <span className="text-slate-400">激活槽位: </span>
            <span
              className={`font-black ${
                usedActiveSlots > maxEquipSlots
                  ? 'text-red-400'
                  : usedActiveSlots === maxEquipSlots
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {usedActiveSlots}
            </span>
            <span className="text-slate-500"> / {maxEquipSlots} 槽</span>
          </div>

          <button
            type="button"
            onClick={() => setIsInstallModalOpen(true)}
            className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加装备</span>
          </button>
        </div>
      </div>

      {/* 警告通知 */}
      {warningMessage && (
        <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-start gap-2 animate-fade-in">
          <div className="flex-1">{warningMessage}</div>
          <button
            type="button"
            onClick={() => setWarningMessage(null)}
            className="text-slate-400 hover:text-white text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 装备列表 */}
      {gearList.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 rounded-xl border border-dashed border-white/10 bg-black/20">
          <p>暂无外置装备</p>
          <p className="text-[11px] text-slate-600 mt-1">点击右上角“添加装备”从卡库选择或创建</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {gearList.map((gear) => {
            const slotCost = getGearSlotCost(gear)
            const isFreeSlot = slotCost === 0

            const isWeapon = Boolean(
              gear.weaponStats ||
              gear.zone?.includes('武器') ||
              gear.cyberType?.includes('武器') ||
              gear.effect?.match(/(敏捷|力量|灵巧|本能|风度|知识).*(d\d+)/i)
            )
            const isArmor = Boolean(
              gear.armorStats ||
              gear.zone?.includes('护甲') ||
              gear.cyberType?.includes('护甲') ||
              gear.effect?.includes('护甲')
            )
            const isExpanded = expandedGearId === gear.id

            // 是否有激活转置
            const hasTransposition = Boolean(
              gear.activeTransposition &&
              (gear.activeTransposition.weaponStats?.damage ||
               gear.activeTransposition.armorStats?.armorScore !== undefined ||
               gear.activeTransposition.armorStats?.thresholdBonusText)
            )

            // 当前有效数值（激活状态且有转置时显示转置数值）
            const displayDamage = (gear.active && gear.activeTransposition?.weaponStats?.damage)
              ? gear.activeTransposition.weaponStats.damage
              : gear.weaponStats?.damage

            const displayArmorScore = (gear.active && gear.activeTransposition?.armorStats?.armorScore !== undefined)
              ? gear.activeTransposition.armorStats.armorScore
              : gear.armorStats?.armorScore

            const displayThresholdText = (gear.active && gear.activeTransposition?.armorStats?.thresholdBonusText)
              ? gear.activeTransposition.armorStats.thresholdBonusText
              : (gear.armorStats?.thresholdBonusText || (gear.armorStats?.majorThreshold ? `+${gear.armorStats.majorThreshold}/+${gear.armorStats.severeThreshold || 0}` : ''))

            return (
              <div
                key={gear.id}
                className={`p-3 rounded-xl border transition-all ${
                  gear.active
                    ? 'border-amber-500/50 bg-[#141824] shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                    : 'border-white/10 bg-[#0B0D13]/70 opacity-80'
                }`}
              >
                {/* 第一行：激活按钮、状态标识、名称、槽位占用 */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(gear.id)}
                      title={gear.active ? '点击切换为背包收纳 (休眠)' : '点击激活运转'}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
                        gear.active
                          ? isFreeSlot
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                            : 'bg-amber-500/25 text-amber-400 border border-amber-500/50 shadow-sm'
                          : 'bg-white/10 text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      {gear.active ? (
                        <>
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>{isFreeSlot ? '常驻激活' : '已激活'}</span>
                        </>
                      ) : (
                        <>
                          <Package className="w-3 h-3 text-slate-400" />
                          <span>背包收纳</span>
                        </>
                      )}
                    </button>
                    <span className="font-bold text-xs text-white truncate">{gear.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isFreeSlot
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : gear.active
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold'
                        : 'bg-white/10 text-slate-400'
                    }`}>
                      {isFreeSlot ? '免槽位' : `${slotCost} 槽`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(gear.id)}
                      title="删除"
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 第二行：数值徽章（基础与激活转置） */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px]">
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {gear.zone || '外置设备'}
                  </span>

                  {displayDamage && (
                    <span className={`px-1.5 py-0.2 rounded border font-mono font-bold ${
                      gear.active && hasTransposition
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-red-500/15 text-red-300 border-red-500/30'
                    }`}>
                      {gear.weaponStats?.trait || '敏捷'} {displayDamage} {gear.weaponStats?.burden || '单手'}
                      {gear.active && hasTransposition && <span className="ml-1 text-amber-400">⚡转置</span>}
                    </span>
                  )}

                  {displayArmorScore !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded border font-mono font-bold ${
                      gear.active && hasTransposition
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
                    }`}>
                      +{displayArmorScore} 护甲
                      {displayThresholdText ? ` · 阈值 ${displayThresholdText}` : ''}
                      {gear.active && hasTransposition && <span className="ml-1 text-amber-400">⚡转置</span>}
                    </span>
                  )}

                  {gear.tag && (
                    <span className="px-1.5 py-0.2 rounded bg-white/10 text-slate-400">
                      {gear.tag}
                    </span>
                  )}
                </div>

                {/* 限制条件 */}
                {gear.restriction && (
                  <div className="mt-1.5 text-[10px] text-amber-400/90 leading-tight">
                    限制: {gear.restriction}
                  </div>
                )}

                {/* 普通特性（常驻生效） */}
                {gear.feature && (
                  <div className="mt-1.5 p-1.5 rounded bg-black/25 border border-white/5 text-[11px] text-slate-300 leading-relaxed">
                    <span className="text-[10px] font-bold text-slate-400 mr-1">[普通特性]</span>
                    {gear.feature}
                  </div>
                )}

                {/* 激活特性（仅当激活生效） */}
                {(gear.activeFeature || gear.effect) && (
                  <div className={`mt-1.5 p-1.5 rounded border text-[11px] leading-relaxed transition-all ${
                    gear.active
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-200 shadow-sm'
                      : 'bg-black/20 border-white/5 text-slate-500 line-through opacity-70'
                  }`}>
                    <span className={`text-[10px] font-bold mr-1 ${gear.active ? 'text-amber-400' : 'text-slate-500'}`}>
                      [⚡ 激活特性{gear.active ? '' : ' - 未激活'}]
                    </span>
                    {gear.activeFeature || gear.effect}
                  </div>
                )}

                {/* 操作栏：挂载到战斗插槽（无需激活即可使用基础性能，激活后按强化性能结算） */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    {isWeapon && (
                      <>
                        <button
                          type="button"
                          onClick={() => onEquipToCombatWeapon?.('primary', gear)}
                          title={gear.active ? '以激活数值设为主手' : '以基础数值设为主手'}
                          className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 flex items-center gap-1 transition-colors"
                        >
                          <Crosshair className="w-3 h-3" />
                          <span>设为主手</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onEquipToCombatWeapon?.('secondary', gear)}
                          title={gear.active ? '以激活数值设为副手' : '以基础数值设为副手'}
                          className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                        >
                          设为副手
                        </button>
                      </>
                    )}

                    {isArmor && (
                      <button
                        type="button"
                        onClick={() => onEquipToCombatArmor?.(gear)}
                        title={gear.active ? '以激活数值设为护甲' : '以基础数值设为护甲'}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 flex items-center gap-1 transition-colors"
                      >
                        <Shield className="w-3 h-3" />
                        <span>设为护甲</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedGearId(isExpanded ? null : gear.id)}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5"
                  >
                    <span>{isExpanded ? '收起' : '详情'}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* 展开的详情描述 */}
                {isExpanded && (
                  <div className="mt-2 p-2 rounded bg-black/40 border border-white/5 text-[11px] text-slate-300 space-y-1 animate-fade-in">
                    {gear.description && (
                      <p className="italic text-slate-400">{gear.description}</p>
                    )}
                    {hasTransposition && (
                      <div className="text-[10px] text-amber-400/90 font-mono">
                        转置数值: 伤害 {gear.activeTransposition?.weaponStats?.damage || '-'} | 护甲 {gear.activeTransposition?.armorStats?.armorScore || '-'} (阈值 {gear.activeTransposition?.armorStats?.thresholdBonusText || '-'})
                      </div>
                    )}
                    {gear.cost && (
                      <p className="text-[10px] text-slate-400">价格: {gear.cost}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 装配模态框 */}
      {isInstallModalOpen && (
        <InstallExternalGearModal
          isOpen={isInstallModalOpen}
          availableSlots={availableSlots}
          maxSlots={maxEquipSlots}
          onClose={() => setIsInstallModalOpen(false)}
          onInstall={handleInstall}
        />
      )}
    </div>
  )
}
