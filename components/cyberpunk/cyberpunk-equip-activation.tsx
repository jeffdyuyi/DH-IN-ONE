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
    <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 text-slate-100 font-sans shadow-[0_4px_20px_rgba(11,3,32,0.6)]">
      <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Sword className="h-4 w-4 text-[#F5F500]" />
          <h3 className="text-sm font-bold text-white tracking-wide">作战装备与战术护甲</h3>
        </div>
        <span className="text-[11px] text-slate-400">点击插槽配置武器与护甲（自动联动伤害与阈值）</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* 主手武器 */}
        <div className="rounded-lg border border-[#6C00FF]/30 bg-[#0B0320] p-3 flex flex-col justify-between hover:border-[#00FFA3]/50 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300">主手武器 (Primary)</span>
              <button
                type="button"
                onClick={() => onOpenWeaponModal('primary')}
                className="text-[10px] font-bold text-[#00FFA3] bg-[#00FFA3]/15 hover:bg-[#00FFA3]/25 px-1.5 py-0.5 rounded border border-[#00FFA3]/30 transition-colors"
              >
                更换 ⇄
              </button>
            </div>
            <div className="mt-2 font-bold text-sm text-white truncate">
              {primaryWeapon?.name || '（未装备主手）'}
            </div>
            {primaryWeapon?.damage && (
              <div className="mt-1 text-[11px] text-[#00FFA3] font-mono">
                伤害: {primaryWeapon.damage} {primaryWeapon.trait ? `· ${primaryWeapon.trait}` : ''}
              </div>
            )}
            {primaryWeapon?.feature && (
              <div className="mt-1 text-[11px] text-slate-300 line-clamp-2">
                {primaryWeapon.feature}
              </div>
            )}
          </div>
        </div>

        {/* 副手 / 备用武器 */}
        <div className="rounded-lg border border-[#6C00FF]/30 bg-[#0B0320] p-3 flex flex-col justify-between hover:border-[#00FFA3]/50 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300">副手 / 备用武器 (Secondary)</span>
              <button
                type="button"
                onClick={() => onOpenWeaponModal('secondary')}
                className="text-[10px] font-bold text-[#00FFA3] bg-[#00FFA3]/15 hover:bg-[#00FFA3]/25 px-1.5 py-0.5 rounded border border-[#00FFA3]/30 transition-colors"
              >
                更换 ⇄
              </button>
            </div>
            <div className="mt-2 font-bold text-sm text-white truncate">
              {secondaryWeapon?.name || '（未装备副手）'}
            </div>
            {secondaryWeapon?.damage && (
              <div className="mt-1 text-[11px] text-[#00FFA3] font-mono">
                伤害: {secondaryWeapon.damage} {secondaryWeapon.trait ? `· ${secondaryWeapon.trait}` : ''}
              </div>
            )}
            {secondaryWeapon?.feature && (
              <div className="mt-1 text-[11px] text-slate-300 line-clamp-2">
                {secondaryWeapon.feature}
              </div>
            )}
          </div>
        </div>

        {/* 战术护甲 */}
        <div className="rounded-lg border border-[#6C00FF]/30 bg-[#0B0320] p-3 flex flex-col justify-between hover:border-[#F5F500]/50 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-[#F5F500]" />
                <span>战术护甲 (Armor)</span>
              </span>
              <button
                type="button"
                onClick={onOpenArmorModal}
                className="text-[10px] font-bold text-[#F5F500] bg-[#F5F500]/15 hover:bg-[#F5F500]/25 px-1.5 py-0.5 rounded border border-[#F5F500]/30 transition-colors"
              >
                更换 ⇄
              </button>
            </div>
            <div className="mt-2 font-bold text-sm text-white truncate">
              {armorSlot?.name || '（未装备护甲）'}
            </div>
            <div className="mt-1 text-[11px] text-[#F5F500] font-mono flex items-center gap-2">
              <span>护甲值: {armorSlot?.baseArmorMax ?? 0}</span>
              <span>
                阈值加成: +{armorSlot?.baseThresholds?.minor ?? 0} / +{armorSlot?.baseThresholds?.major ?? 0}
              </span>
            </div>
            {armorSlot?.feature && (
              <div className="mt-1 text-[11px] text-slate-300 line-clamp-2">
                {armorSlot.feature}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
