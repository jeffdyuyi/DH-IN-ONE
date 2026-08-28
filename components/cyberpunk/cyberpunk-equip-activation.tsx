"use client"

import React from 'react'
import type { EquipmentData } from '@/automation/equipment/types'
import { Shield, Sword, Sparkles } from 'lucide-react'

interface CyberpunkEquipActivationProps {
  equipment?: EquipmentData
  onOpenWeaponModal: (slot: 'primary' | 'secondary') => void
  onOpenArmorModal: () => void
}

export function CyberpunkEquipActivation({
  equipment,
  onOpenWeaponModal,
  onOpenArmorModal,
}: CyberpunkEquipActivationProps) {
  const primaryWeapon = equipment?.weaponSlots?.primary
  const secondaryWeapon = equipment?.weaponSlots?.secondary
  const armorSlot = equipment?.armorSlot

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d0d1a] p-4 text-slate-100 font-sans shadow-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Sword className="h-4 w-4 text-[#00F0FF]" />
          <h3 className="text-sm font-bold text-white">作战装备与战术护甲</h3>
        </div>
        <span className="text-[11px] text-slate-400">点击插槽配置武器与护甲（自动联动伤害与阈值）</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* 主手武器 */}
        <div className="rounded-lg border border-slate-800 bg-[#0f0f22] p-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300">主手武器 (Primary)</span>
              <button
                type="button"
                onClick={() => onOpenWeaponModal('primary')}
                className="text-[10px] font-bold text-[#00F0FF] bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 px-1.5 py-0.5 rounded border border-[#00F0FF]/30 transition-colors"
              >
                更换 ⇄
              </button>
            </div>
            <div className="mt-2 font-bold text-sm text-white truncate">
              {primaryWeapon?.name || '（未装备主手）'}
            </div>
            {primaryWeapon?.damage && (
              <div className="mt-1 text-[11px] text-cyan-300 font-mono">
                伤害: {primaryWeapon.damage} {primaryWeapon.trait ? `· ${primaryWeapon.trait}` : ''}
              </div>
            )}
            {primaryWeapon?.feature && (
              <div className="mt-1 text-[11px] text-slate-400 line-clamp-2">
                {primaryWeapon.feature}
              </div>
            )}
          </div>
        </div>

        {/* 副手 / 备用武器 */}
        <div className="rounded-lg border border-slate-800 bg-[#0f0f22] p-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300">副手 / 备用武器 (Secondary)</span>
              <button
                type="button"
                onClick={() => onOpenWeaponModal('secondary')}
                className="text-[10px] font-bold text-[#00F0FF] bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 px-1.5 py-0.5 rounded border border-[#00F0FF]/30 transition-colors"
              >
                更换 ⇄
              </button>
            </div>
            <div className="mt-2 font-bold text-sm text-white truncate">
              {secondaryWeapon?.name || '（未装备副手）'}
            </div>
            {secondaryWeapon?.damage && (
              <div className="mt-1 text-[11px] text-cyan-300 font-mono">
                伤害: {secondaryWeapon.damage} {secondaryWeapon.trait ? `· ${secondaryWeapon.trait}` : ''}
              </div>
            )}
            {secondaryWeapon?.feature && (
              <div className="mt-1 text-[11px] text-slate-400 line-clamp-2">
                {secondaryWeapon.feature}
              </div>
            )}
          </div>
        </div>

        {/* 战术护甲 */}
        <div className="rounded-lg border border-slate-800 bg-[#0f0f22] p-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-cyan-400" />
                <span>战术护甲 (Armor)</span>
              </span>
              <button
                type="button"
                onClick={onOpenArmorModal}
                className="text-[10px] font-bold text-[#FCEE0A] bg-[#FCEE0A]/15 hover:bg-[#FCEE0A]/25 px-1.5 py-0.5 rounded border border-[#FCEE0A]/30 transition-colors"
              >
                更换 ⇄
              </button>
            </div>
            <div className="mt-2 font-bold text-sm text-white truncate">
              {armorSlot?.name || '（未装备护甲）'}
            </div>
            {armorSlot?.baseThresholds && (
              <div className="mt-1 text-[11px] text-amber-300 font-mono">
                阈值加值: +{armorSlot.baseThresholds.minor || 0} / +{armorSlot.baseThresholds.major || 0}
              </div>
            )}
            {armorSlot?.baseArmorMax && (
              <div className="mt-0.5 text-[11px] text-slate-400 font-mono">
                护甲格: {armorSlot.baseArmorMax} 格
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
