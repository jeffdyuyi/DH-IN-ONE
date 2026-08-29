"use client"

import React, { useState } from 'react'
import type { CyberpunkExternalGear, CyberpunkSheetExtension } from '../../types/cyberpunk'
import { CYBERPUNK_TIER_EQUIP_SLOTS } from '../../lib/cyberpunk/tier-constants'
import { InstallExternalGearModal } from './modals/install-external-gear-modal'
import { Radio, Plus, Trash2, Power, Shield, Sword, Eye, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Crosshair } from 'lucide-react'

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

  // 计算当前已激活外置装备占用的槽位数
  const usedActiveSlots = gearList
    .filter((g) => g.active)
    .reduce((sum, g) => sum + (Number(g.slots || g.slotCost) || 1), 0)

  const availableSlots = Math.max(0, maxEquipSlots - usedActiveSlots)

  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)
  const [expandedGearId, setExpandedGearId] = useState<string | null>(null)

  // 切换激活状态 (具有激活限制)
  const handleToggleActive = (gearId: string) => {
    setWarningMessage(null)
    const gear = gearList.find((g) => g.id === gearId)
    if (!gear) return

    const slotCost = Number(gear.slots || gear.slotCost) || 1

    if (!gear.active) {
      // 准备激活，检查槽位是否超限
      if (usedActiveSlots + slotCost > maxEquipSlots) {
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
    const slotCost = Number(newGear.slots || newGear.slotCost) || 1
    const willActive = usedActiveSlots + slotCost <= maxEquipSlots

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
        `新装配的 "${newGear.name}" 由于激活槽位已满 (${usedActiveSlots}/${maxEquipSlots})，已默认放入休眠备用状态。`
      )
    }
  }

  return (
    <div className="rounded-xl border border-[#00FFA3]/30 bg-[#12072B] p-4 text-slate-100 font-sans shadow-[0_4px_20px_rgba(11,3,32,0.6)] space-y-3.5">
      {/* 顶部标题与容量条 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#00FFA3]/20 pb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#00FFA3] animate-pulse" />
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>外置装备</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30">
                位阶 {currentTier}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              包含主武器、副武器、护甲及其他外置设备，受位阶激活槽位限制
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-xs font-mono">
            <span className="text-slate-400">已激活: </span>
            <span
              className={`font-black ${
                usedActiveSlots > maxEquipSlots
                  ? 'text-[#FF007F]'
                  : usedActiveSlots === maxEquipSlots
                  ? 'text-[#F5F500]'
                  : 'text-[#00FFA3]'
              }`}
            >
              {usedActiveSlots}
            </span>
            <span className="text-slate-400"> / {maxEquipSlots} 槽</span>
          </div>

          <button
            type="button"
            onClick={() => setIsInstallModalOpen(true)}
            className="flex items-center gap-1 text-xs font-bold text-black bg-[#00FFA3] hover:bg-[#00FFA3]/90 px-2.5 py-1 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加装备</span>
          </button>
        </div>
      </div>

      {/* 警告通知 */}
      {warningMessage && (
        <div className="p-2.5 rounded-lg bg-[#FF007F]/15 border border-[#FF007F]/40 text-[#FF007F] text-xs flex items-start gap-2 animate-fade-in">
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
        <div className="py-6 text-center text-xs text-slate-500 rounded-xl border border-dashed border-white/10 bg-[#0B0320]/60">
          <p>暂无外置装备</p>
          <p className="text-[11px] text-slate-600 mt-1">点击右上角“添加装备”从卡库选择或创建</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {gearList.map((gear) => {
            const isWeapon = Boolean(
              gear.weaponStats ||
              gear.zone?.includes('武器') ||
              gear.effect?.match(/(敏捷|力量|灵巧|本能|风度|知识).*(d\d+)/i)
            )
            const isArmor = Boolean(
              gear.armorStats ||
              gear.zone?.includes('护甲') ||
              gear.effect?.includes('护甲')
            )
            const isExpanded = expandedGearId === gear.id

            return (
              <div
                key={gear.id}
                className={`p-3 rounded-xl border transition-all ${
                  gear.active
                    ? 'border-[#00FFA3]/40 bg-[#0B0320] shadow-[0_0_15px_rgba(0,255,163,0.08)]'
                    : 'border-white/10 bg-[#0B0320]/40 opacity-75'
                }`}
              >
                {/* 第一行：激活按钮、名称、槽位占用 */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(gear.id)}
                      title={gear.active ? '点击休眠' : '点击激活'}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
                        gear.active
                          ? 'bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00FFA3]/40 shadow-sm'
                          : 'bg-white/10 text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{gear.active ? '已激活' : '休眠中'}</span>
                    </button>
                    <span className="font-bold text-xs text-white truncate">{gear.name}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                      {gear.slots || 1} 槽
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(gear.id)}
                      title="删除"
                      className="p-1 text-slate-500 hover:text-[#FF007F] transition-colors rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 第二行：数值与分类徽章 */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px]">
                  <span className="px-1.5 py-0.2 rounded bg-[#6C00FF]/20 text-[#6C00FF] border border-[#6C00FF]/30">
                    {gear.zone || '外置设备'}
                  </span>

                  {gear.weaponStats && (
                    <span className="px-1.5 py-0.2 rounded bg-[#FF003C]/20 text-[#FF003C] border border-[#FF003C]/40 font-mono font-bold">
                      {gear.weaponStats.trait || '敏捷'} {gear.weaponStats.damage} {gear.weaponStats.burden || '单手'}
                    </span>
                  )}

                  {gear.armorStats && (gear.armorStats.armorScore !== undefined) && (
                    <span className="px-1.5 py-0.2 rounded bg-[#F5F500]/20 text-[#F5F500] border border-[#F5F500]/40 font-mono font-bold">
                      +{gear.armorStats.armorScore} 护甲
                      {gear.armorStats.majorThreshold ? ` · 阈值 +${gear.armorStats.majorThreshold}/+${gear.armorStats.severeThreshold || 0}` : ''}
                    </span>
                  )}

                  {gear.tag && (
                    <span className="px-1.5 py-0.2 rounded bg-white/10 text-slate-400">
                      {gear.tag}
                    </span>
                  )}
                </div>

                {/* 机制说明与限制 */}
                {gear.restriction && (
                  <div className="mt-1.5 text-[10px] text-[#00FFA3] leading-tight">
                    限制: {gear.restriction}
                  </div>
                )}

                {gear.effect && (
                  <div className="mt-1.5 text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                    {gear.effect}
                  </div>
                )}

                {/* 操作栏：挂载到战斗插槽 */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    {isWeapon && (
                      <>
                        <button
                          type="button"
                          disabled={!gear.active}
                          onClick={() => onEquipToCombatWeapon?.('primary', gear)}
                          title={gear.active ? '设为主手' : '需激活后使用'}
                          className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                        >
                          <Crosshair className="w-3 h-3" />
                          <span>设为主手</span>
                        </button>
                        <button
                          type="button"
                          disabled={!gear.active}
                          onClick={() => onEquipToCombatWeapon?.('secondary', gear)}
                          title={gear.active ? '设为副手' : '需激活后使用'}
                          className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          设为副手
                        </button>
                      </>
                    )}

                    {isArmor && (
                      <button
                        type="button"
                        disabled={!gear.active}
                        onClick={() => onEquipToCombatArmor?.(gear)}
                        title={gear.active ? '设为护甲' : '需激活后使用'}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
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
                    {gear.compCost && (
                      <p className="text-[10px] text-slate-500">元件价格: {gear.compCost}</p>
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
