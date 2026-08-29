"use client"

import React, { useState } from 'react'
import type {
  CyberpunkAugmentation,
  CyberpunkBodyZoneKey,
  CyberpunkExternalGear,
  CyberpunkSheetExtension,
} from '../../types/cyberpunk'
import type { EquipmentData } from '@/automation/equipment/types'
import { CYBERPUNK_TIER_SLOTS, CYBERPUNK_TIER_EQUIP_SLOTS } from '../../lib/cyberpunk/tier-constants'
import { CyberpunkPortraitFrame } from './cyberpunk-portrait-frame'
import { CyberpunkSlotItem } from './cyberpunk-slot-item'
import { InstallAugmentationModal } from './modals/install-augmentation-modal'
import { CustomAugmentationModal } from './modals/custom-augmentation-modal'
import { InstallExternalGearModal } from './modals/install-external-gear-modal'
import {
  Sword,
  Shield,
  Radio,
  Plus,
  Trash2,
  Power,
  ChevronDown,
  ChevronUp,
  Cpu,
  Eye,
  Hand,
  Activity,
  Footprints,
} from 'lucide-react'

interface CyberpunkEquipmentHudProps {
  cyberpunkData: CyberpunkSheetExtension
  equipment?: EquipmentData
  onChangeCyberpunk: (updated: CyberpunkSheetExtension) => void
  onOpenWeaponModal: (slot: 'primary' | 'secondary') => void
  onOpenArmorModal: () => void
}

export function CyberpunkEquipmentHud({
  cyberpunkData,
  equipment,
  onChangeCyberpunk,
  onOpenWeaponModal,
  onOpenArmorModal,
}: CyberpunkEquipmentHudProps) {
  const currentTier = cyberpunkData.tier || 'T1'
  const maxSlotsPerZone = CYBERPUNK_TIER_SLOTS[currentTier] || 2
  const maxEquipSlots = CYBERPUNK_TIER_EQUIP_SLOTS[currentTier] || 2

  // 模态框状态
  const [selectedZone, setSelectedZone] = useState<CyberpunkBodyZoneKey | null>(null)
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false)
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const [isExternalModalOpen, setIsExternalModalOpen] = useState(false)
  const [expandedGearId, setExpandedGearId] = useState<string | null>(null)

  // 义体卸载
  const handleUninstallAugmentation = (zoneKey: CyberpunkBodyZoneKey, augId: string) => {
    const currentZone = cyberpunkData.zones?.[zoneKey]
    if (!currentZone) return

    const updatedAugs = currentZone.augmentations.filter((a) => a.id !== augId)
    onChangeCyberpunk({
      ...cyberpunkData,
      zones: {
        ...cyberpunkData.zones,
        [zoneKey]: { augmentations: updatedAugs },
      },
    })
  }

  // 义体安装
  const handleInstallAugmentation = (zoneKey: CyberpunkBodyZoneKey, newAug: CyberpunkAugmentation) => {
    const currentZone = cyberpunkData.zones?.[zoneKey] || { augmentations: [] }
    const updatedAugs = [...currentZone.augmentations, newAug]

    onChangeCyberpunk({
      ...cyberpunkData,
      zones: {
        ...cyberpunkData.zones,
        [zoneKey]: { augmentations: updatedAugs },
      },
    })
  }

  // 打开安装义体弹窗
  const handleOpenInstall = (zoneKey: CyberpunkBodyZoneKey) => {
    setSelectedZone(zoneKey)
    setIsInstallModalOpen(true)
  }

  // 外置装备列表
  const gearList: CyberpunkExternalGear[] = cyberpunkData.externalGear || []
  const usedActiveSlots = gearList
    .filter((g) => g.active)
    .reduce((sum, g) => sum + (Number(g.slots || g.slotCost) || 1), 0)

  // 切换外置装备激活状态
  const handleToggleExternalActive = (gearId: string) => {
    const gear = gearList.find((g) => g.id === gearId)
    if (!gear) return

    const slotCost = Number(gear.slots || gear.slotCost) || 1
    if (!gear.active && usedActiveSlots + slotCost > maxEquipSlots) {
      alert(`【激活槽位不足】当前位阶 (${currentTier}) 外置激活上限为 ${maxEquipSlots} 槽，已占用 ${usedActiveSlots} 槽！`)
      return
    }

    const updatedList = gearList.map((g) =>
      g.id === gearId ? { ...g, active: !g.active } : g
    )
    onChangeCyberpunk({
      ...cyberpunkData,
      externalGear: updatedList,
    })
  }

  // 移除外置装备
  const handleRemoveExternalGear = (gearId: string) => {
    onChangeCyberpunk({
      ...cyberpunkData,
      externalGear: gearList.filter((g) => g.id !== gearId),
    })
  }

  // 安装外置装备
  const handleInstallExternalGear = (newGear: CyberpunkExternalGear) => {
    const slotCost = Number(newGear.slots || newGear.slotCost) || 1
    const willActive = usedActiveSlots + slotCost <= maxEquipSlots
    onChangeCyberpunk({
      ...cyberpunkData,
      externalGear: [...gearList, { ...newGear, active: willActive }],
    })
  }

  // 获取各区数据
  const renderZoneCard = (
    zoneKey: CyberpunkBodyZoneKey,
    title: string,
    enTitle: string,
    IconComponent: React.ComponentType<{ className?: string }>
  ) => {
    const zoneState = cyberpunkData.zones?.[zoneKey] || { augmentations: [] }
    const installedAugs = zoneState.augmentations || []
    const usedSlots = installedAugs.reduce((sum, a) => sum + (Number(a.slots || a.slotCost) || 1), 0)
    const availableSlots = Math.max(0, maxSlotsPerZone - usedSlots)

    return (
      <div className="rounded-xl border border-[#6C00FF]/30 bg-[#0B0320] p-3 flex flex-col justify-between hover:border-[#6C00FF]/60 transition-all shadow-md min-h-[220px]">
        <div>
          {/* 区标头 */}
          <div className="flex items-center justify-between pb-2 border-b border-[#6C00FF]/20 mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <IconComponent className="w-3.5 h-3.5 text-[#00FFA3] shrink-0" />
              <span className="font-bold text-xs text-white">{title}</span>
              <span className="text-[10px] text-[#F5F500] font-mono truncate">{enTitle}</span>
            </div>
            <div className="text-[11px] font-mono shrink-0">
              <span className={usedSlots > maxSlotsPerZone ? 'text-[#FF007F] font-bold' : 'text-[#00FFA3] font-bold'}>
                {usedSlots}
              </span>
              <span className="text-slate-400">/{maxSlotsPerZone}</span>
            </div>
          </div>

          {/* 已安装列表 */}
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-0.5 custom-scrollbar">
            {installedAugs.map((aug) => (
              <CyberpunkSlotItem
                key={aug.id}
                aug={aug}
                onUninstall={(id) => handleUninstallAugmentation(zoneKey, id)}
              />
            ))}
            {installedAugs.length === 0 && (
              <div className="text-[11px] text-slate-500 italic py-3 text-center">
                尚未安装义体元件
              </div>
            )}
          </div>
        </div>

        {/* 底部安装按钮 */}
        <div className="pt-2 mt-2 border-t border-[#6C00FF]/15">
          <button
            type="button"
            onClick={() => handleOpenInstall(zoneKey)}
            className="w-full py-1 px-2 rounded-lg bg-[#00FFA3]/10 hover:bg-[#00FFA3]/20 border border-[#00FFA3]/30 text-[#00FFA3] text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>安装义体 ({availableSlots}空槽)</span>
          </button>
        </div>
      </div>
    )
  }

  const primaryWeapon = equipment?.weaponSlots?.primary
  const secondaryWeapon = equipment?.weaponSlots?.secondary
  const armorSlot = equipment?.armorSlot

  return (
    <div className="space-y-4">
      {/* 上方核心装配区：左二区 + 中心人体立绘 + 右二区 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* 左侧：左上上肢 + 左下下肢 (3/12) */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-3">
          {/* 左上：上肢槽位 */}
          {renderZoneCard('arms', '上肢槽位', 'Arms / 上肢', Hand)}
          {/* 左下：下肢槽位 */}
          {renderZoneCard('legs', '下肢槽位', 'Legs / 下肢', Footprints)}
        </div>

        {/* 中心：人体框与自由上传立绘 (6/12) */}
        <div className="lg:col-span-6 flex flex-col justify-center min-h-[460px]">
          <CyberpunkPortraitFrame
            portraitUrl={cyberpunkData.portrait}
            scale={cyberpunkData.portraitScale}
            position={cyberpunkData.portraitPosition}
            onChange={(update) => {
              onChangeCyberpunk({
                ...cyberpunkData,
                ...update,
              })
            }}
          />
        </div>

        {/* 右侧：右上头部 + 右下躯干 (3/12) */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-3">
          {/* 右上：头部槽位 */}
          {renderZoneCard('head', '头部槽位', 'Head / 头部', Eye)}
          {/* 右下：躯干槽位 */}
          {renderZoneCard('torso', '躯干槽位', 'Torso / 躯干', Activity)}
        </div>
      </div>

      {/* 下方装备与挂载配件横排区 (4 格网格) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* 1. 主手武器 */}
        <div className="rounded-xl border border-[#6C00FF]/30 bg-[#0B0320] p-3 flex flex-col justify-between hover:border-[#00FFA3]/50 transition-colors shadow-md">
          <div>
            <div className="flex items-center justify-between pb-1.5 border-b border-[#6C00FF]/20">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sword className="w-3.5 h-3.5 text-[#F5F500]" />
                <span>主手武器</span>
              </span>
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
              <div className="mt-1 text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                {primaryWeapon.feature}
              </div>
            )}
          </div>
        </div>

        {/* 2. 副手武器 */}
        <div className="rounded-xl border border-[#6C00FF]/30 bg-[#0B0320] p-3 flex flex-col justify-between hover:border-[#00FFA3]/50 transition-colors shadow-md">
          <div>
            <div className="flex items-center justify-between pb-1.5 border-b border-[#6C00FF]/20">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sword className="w-3.5 h-3.5 text-[#00FFA3]" />
                <span>副手 / 备用</span>
              </span>
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
              <div className="mt-1 text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                {secondaryWeapon.feature}
              </div>
            )}
          </div>
        </div>

        {/* 3. 战术护甲 */}
        <div className="rounded-xl border border-[#6C00FF]/30 bg-[#0B0320] p-3 flex flex-col justify-between hover:border-[#F5F500]/50 transition-colors shadow-md">
          <div>
            <div className="flex items-center justify-between pb-1.5 border-b border-[#6C00FF]/20">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#F5F500]" />
                <span>战术护甲</span>
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
              {armorSlot?.name || '（未穿戴战术护甲）'}
            </div>
            {armorSlot?.name && (
              <div className="mt-1 text-[11px] text-[#F5F500] font-mono flex items-center gap-1.5 flex-wrap">
                <span>护甲值: {armorSlot?.baseArmorMax ?? 0}</span>
                {armorSlot?.baseThresholds && (
                  <span>
                    (加成: +{armorSlot.baseThresholds.minor ?? 0}/+{armorSlot.baseThresholds.major ?? 0})
                  </span>
                )}
              </div>
            )}
            {armorSlot?.feature && (
              <div className="mt-1 text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                {armorSlot.feature}
              </div>
            )}
          </div>
        </div>

        {/* 4. 外置装备槽 */}
        <div className="rounded-xl border border-[#00FFA3]/30 bg-[#0B0320] p-3 flex flex-col justify-between hover:border-[#00FFA3]/60 transition-colors shadow-md">
          <div>
            <div className="flex items-center justify-between pb-1.5 border-b border-[#00FFA3]/20">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#00FFA3]" />
                <span className="font-bold text-slate-200">外置设备</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-[#00FFA3]">
                  {usedActiveSlots}/{maxEquipSlots}
                </span>
                <button
                  type="button"
                  onClick={() => setIsExternalModalOpen(true)}
                  className="text-[10px] font-bold text-[#00FFA3] bg-[#00FFA3]/15 hover:bg-[#00FFA3]/25 px-1.5 py-0.5 rounded border border-[#00FFA3]/30 transition-colors flex items-center gap-0.5"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>添加</span>
                </button>
              </div>
            </div>

            {/* 外置设备列表 */}
            <div className="mt-2 space-y-1.5 max-h-[85px] overflow-y-auto pr-0.5 custom-scrollbar">
              {gearList.map((gear) => (
                <div
                  key={gear.id}
                  className={`p-1.5 rounded-lg border text-[11px] flex items-center justify-between gap-1 transition ${
                    gear.active
                      ? 'border-[#00FFA3]/40 bg-[#00FFA3]/10 text-white'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
                    <span className="font-mono text-[9px] text-[#F5F500] shrink-0">
                      [{gear.tier || 'T1'}]
                    </span>
                    <span className="font-bold truncate">{gear.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleExternalActive(gear.id)}
                      className={`p-0.5 rounded ${gear.active ? 'text-[#00FFA3]' : 'text-slate-500 hover:text-white'}`}
                      title={gear.active ? '休眠' : '激活'}
                    >
                      <Power className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveExternalGear(gear.id)}
                      className="p-0.5 text-slate-500 hover:text-[#FF007F]"
                      title="卸载"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              {gearList.length === 0 && (
                <div className="text-[10px] text-slate-500 italic py-2 text-center">
                  暂无外置挂载装备
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 义体安装弹窗 */}
      {selectedZone && isInstallModalOpen && (
        <InstallAugmentationModal
          isOpen={isInstallModalOpen}
          onClose={() => {
            setIsInstallModalOpen(false)
            setSelectedZone(null)
          }}
          zone={selectedZone}
          zoneName={
            selectedZone === 'arms'
              ? '上肢'
              : selectedZone === 'legs'
              ? '下肢'
              : selectedZone === 'head'
              ? '头部'
              : '躯干'
          }
          availableSlots={Math.max(
            0,
            maxSlotsPerZone -
              ((cyberpunkData.zones?.[selectedZone]?.augmentations || []).reduce(
                (sum, a) => sum + (Number(a.slots || a.slotCost) || 1),
                0
              ))
          )}
          onInstall={(newAug) => handleInstallAugmentation(selectedZone, newAug)}
          onOpenCustomModal={() => {
            setIsInstallModalOpen(false)
            setIsCustomModalOpen(true)
          }}
        />
      )}

      {/* 自定义义体弹窗 */}
      {selectedZone && isCustomModalOpen && (
        <CustomAugmentationModal
          isOpen={isCustomModalOpen}
          defaultZone={selectedZone}
          onClose={() => setIsCustomModalOpen(false)}
          onSave={(newAug) => handleInstallAugmentation(selectedZone, newAug)}
        />
      )}

      {/* 外置装备安装弹窗 */}
      {isExternalModalOpen && (
        <InstallExternalGearModal
          isOpen={isExternalModalOpen}
          availableSlots={Math.max(0, maxEquipSlots - usedActiveSlots)}
          maxSlots={maxEquipSlots}
          onClose={() => setIsExternalModalOpen(false)}
          onInstall={handleInstallExternalGear}
        />
      )}
    </div>
  )
}
