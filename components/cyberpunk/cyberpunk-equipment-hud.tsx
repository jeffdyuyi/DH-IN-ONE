"use client"

import React, { useState } from 'react'
import { useSheetStore } from '@/lib/sheet-store'
import type {
  CyberpunkAugmentation,
  CyberpunkBodyZoneKey,
  CyberpunkExternalGear,
  CyberpunkSheetExtension,
} from '@/types/cyberpunk'
import {
  CYBERPUNK_TIER_SLOTS,
  CYBERPUNK_TIER_EQUIP_SLOTS,
} from '../../lib/cyberpunk/tier-constants'
import { CyberpunkPortraitFrame } from './cyberpunk-portrait-frame'
import { CyberpunkSquareIcon } from './cyberpunk-square-icon'
import { CardMarkdown } from '@/components/ui/card-markdown'
import {
  Cpu,
  Sword,
  Plus,
  Trash2,
  ArrowLeftRight,
  Pin,
  X,
} from 'lucide-react'

interface CyberpunkEquipmentHudProps {
  cyberpunkData: CyberpunkSheetExtension
  onChangeCyberpunk: (updated: CyberpunkSheetExtension) => void
  onOpenSelectModal: (
    type: 'weapon' | 'armor' | 'augmentation' | 'external',
    zoneKey?: CyberpunkBodyZoneKey | string,
    slotIndex?: number
  ) => void
}

interface ActiveItemDetail {
  id: string
  name: string
  icon?: string | null
  image?: string | null
  tier?: string
  zoneName?: string
  slotCost?: number
  typeLabel?: string
  stats?: Array<{ label: string; value: string | number; color?: string }>
  rulesText?: string
  description?: string
  onReplace?: () => void
  onRemove?: () => void
}

export function CyberpunkEquipmentHud({
  cyberpunkData,
  onChangeCyberpunk,
  onOpenSelectModal,
}: CyberpunkEquipmentHudProps) {
  const formData = useSheetStore((state) => state.sheetData)
  const setFormData = useSheetStore((state) => state.setSheetData)

  const currentTier = cyberpunkData.tier || 'T1'
  const defaultZoneSlots = CYBERPUNK_TIER_SLOTS[currentTier] || 2
  const defaultEquipSlots = CYBERPUNK_TIER_EQUIP_SLOTS[currentTier] || 2

  // 各部位槽位上限（优先读取用户手动微调的上限，若无则按规则位阶基准）
  const getZoneCapacity = (zoneKey: CyberpunkBodyZoneKey | 'external'): number => {
    if (cyberpunkData.zoneSlotLimits && cyberpunkData.zoneSlotLimits[zoneKey] !== undefined) {
      return cyberpunkData.zoneSlotLimits[zoneKey]!
    }
    return zoneKey === 'external' ? defaultEquipSlots : defaultZoneSlots
  }

  // 手动调整指定部位槽位上限
  const handleAdjustZoneCapacity = (zoneKey: CyberpunkBodyZoneKey | 'external', delta: number) => {
    const currentCap = getZoneCapacity(zoneKey)
    const newCap = Math.max(1, Math.min(10, currentCap + delta))
    const updatedLimits = {
      ...(cyberpunkData.zoneSlotLimits || {}),
      [zoneKey]: newCap,
    }
    onChangeCyberpunk({
      ...cyberpunkData,
      zoneSlotLimits: updatedLimits,
    })
  }

  // 浮窗状态：hoveredItem 为临时悬停，pinnedItem 为点击常驻
  const [hoveredItem, setHoveredItem] = useState<ActiveItemDetail | null>(null)
  const [pinnedItem, setPinnedItem] = useState<ActiveItemDetail | null>(null)
  const activeTooltip = pinnedItem || hoveredItem

  // 各身体区域已装配义体数据
  const upperLimbAugs = cyberpunkData.zones?.upper_limb?.augmentations || []
  const lowerLimbAugs = cyberpunkData.zones?.lower_limb?.augmentations || []
  const headAugs = cyberpunkData.zones?.head?.augmentations || []
  const torsoAugs = cyberpunkData.zones?.torso?.augmentations || []

  // 外置战术装备列表
  const externalGears = cyberpunkData.externalGear || []

  // 主武器、副武器、战术护甲
  const primaryWeapon = formData.equipment?.weaponSlots?.primary
  const secondaryWeapon = formData.equipment?.weaponSlots?.secondary
  const armorSlot = formData.equipment?.armorSlot

  const primaryWeaponName = primaryWeapon?.name || ''
  const secondaryWeaponName = secondaryWeapon?.name || ''
  const armorName = armorSlot?.name || ''

  // 卸载义体
  const handleRemoveAug = (zoneKey: CyberpunkBodyZoneKey, augIndex: number) => {
    const zoneGroup = cyberpunkData.zones?.[zoneKey]
    if (!zoneGroup) return
    const newAugs = zoneGroup.augmentations.filter((_, i) => i !== augIndex)
    onChangeCyberpunk({
      ...cyberpunkData,
      zones: {
        ...cyberpunkData.zones,
        [zoneKey]: { ...zoneGroup, augmentations: newAugs },
      },
    })
    if (pinnedItem) setPinnedItem(null)
  }

  // 卸载外置装备
  const handleRemoveGear = (gearIndex: number) => {
    const newGears = externalGears.filter((_, i) => i !== gearIndex)
    onChangeCyberpunk({
      ...cyberpunkData,
      externalGear: newGears,
    })
    if (pinnedItem) setPinnedItem(null)
  }

  // 卸载主武器/副武器/护甲
  const handleClearWeapon = (slot: 'primary' | 'secondary') => {
    setFormData((prev) => {
      if (!prev.equipment) return prev
      return {
        ...prev,
        equipment: {
          ...prev.equipment,
          weaponSlots: {
            ...prev.equipment.weaponSlots,
            [slot]: { name: '', trait: '', damage: '', feature: '', modifierContributions: [] },
          },
        },
      }
    })
    if (pinnedItem) setPinnedItem(null)
  }

  const handleClearArmor = () => {
    setFormData((prev) => {
      if (!prev.equipment) return prev
      return {
        ...prev,
        equipment: {
          ...prev.equipment,
          armorSlot: {
            name: '',
            baseArmorMax: null,
            baseThresholds: { minor: null, major: null },
            feature: '',
            modifierContributions: [],
          },
        },
      }
    })
    if (pinnedItem) setPinnedItem(null)
  }

  // 渲染身体部位 Icon 槽位组
  const renderZoneSlotGroup = (
    zoneKey: CyberpunkBodyZoneKey,
    zoneTitle: string,
    augs: CyberpunkAugmentation[],
    theme: 'cyberware' | 'weapon' | 'armor' | 'external' = 'cyberware'
  ) => {
    const capacity = getZoneCapacity(zoneKey)
    const totalSlotCost = augs.reduce((sum, a) => sum + (a.slotCost ?? a.slots ?? 1), 0)

    return (
      <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-3 shadow-md space-y-2.5">
        {/* 区域标题与槽位上限微调 */}
        <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-1.5">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#00FFA3]" />
            <span className="font-bold text-xs text-white">{zoneTitle}</span>
          </div>

          {/* 容量指示器与微调按钮 */}
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <span
              className={`font-bold px-1.5 py-0.5 rounded border ${
                totalSlotCost > capacity
                  ? 'bg-red-950 text-red-400 border-red-500'
                  : 'bg-[#00FFA3]/10 text-[#00FFA3] border-[#00FFA3]/30'
              }`}
            >
              {totalSlotCost}/{capacity} 槽
            </span>
            <div className="flex items-center gap-0.5 ml-1">
              <button
                type="button"
                onClick={() => handleAdjustZoneCapacity(zoneKey, -1)}
                className="w-4 h-4 rounded bg-[#0B0320] border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-[10px]"
                title="微调减少槽位上限"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => handleAdjustZoneCapacity(zoneKey, 1)}
                className="w-4 h-4 rounded bg-[#0B0320] border border-slate-700 text-slate-400 hover:text-[#00FFA3] flex items-center justify-center text-[10px]"
                title="微调增加槽位上限"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* 正方形 Icon 插槽阵列 */}
        <div className="flex flex-wrap gap-2.5 items-center">
          {augs.map((aug, idx) => {
            const slotCost = aug.slotCost ?? aug.slots ?? 1
            const isPinned = pinnedItem?.id === aug.id

            const itemDetail: ActiveItemDetail = {
              id: aug.id || `${zoneKey}-${idx}`,
              name: aug.name,
              icon: aug.icon,
              image: aug.image,
              tier: aug.tier || currentTier,
              zoneName: zoneTitle,
              slotCost,
              typeLabel: aug.cyberType || '义体元件',
              rulesText: aug.effect || aug.rulesText || aug.description,
              stats: [
                ...(aug.thresholdBonus?.major ? [{ label: '重度阈值', value: `+${aug.thresholdBonus.major}` }] : []),
                ...(aug.thresholdBonus?.severe ? [{ label: '严重阈值', value: `+${aug.thresholdBonus.severe}` }] : []),
                ...(aug.costCredits ? [{ label: '费用', value: `${aug.costCredits} 信用点` }] : []),
              ],
              onReplace: () => onOpenSelectModal('augmentation', zoneKey, idx),
              onRemove: () => handleRemoveAug(zoneKey, idx),
            }

            return (
              <div
                key={aug.id || idx}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredItem(itemDetail)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => setPinnedItem(pinnedItem?.id === aug.id ? null : itemDetail)}
              >
                <CyberpunkSquareIcon
                  name={aug.name}
                  icon={aug.icon}
                  image={aug.image}
                  size="md"
                  theme={theme}
                  className={`${isPinned ? 'ring-2 ring-[#00FFA3] shadow-[0_0_12px_rgba(0,255,163,0.6)]' : ''}`}
                />
                {/* 槽位占用角标 */}
                {slotCost > 1 && (
                  <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-[#FF007F] text-white font-mono font-bold text-[9px] border border-black shadow">
                    {slotCost}槽
                  </span>
                )}
              </div>
            )
          })}

          {/* 空插槽添加按钮 */}
          {totalSlotCost < capacity && (
            <button
              type="button"
              onClick={() => onOpenSelectModal('augmentation', zoneKey)}
              className="w-12 h-12 rounded-lg border-2 border-dashed border-[#6C00FF]/40 bg-[#0B0320]/60 hover:border-[#00FFA3] hover:bg-[#00FFA3]/10 text-slate-500 hover:text-[#00FFA3] flex flex-col items-center justify-center transition-all shadow-inner group"
              title={`安装新义体到${zoneTitle}`}
            >
              <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="text-[8px] font-mono mt-0.5">安装</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 font-sans text-slate-100 relative">
      {/* ======================= 上部：人体线框 + 四肢/头躯 4 大区 ======================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* 左侧 (3/12)：上肢 与 下肢 */}
        <div className="lg:col-span-3 space-y-4">
          {renderZoneSlotGroup('upper_limb', '上肢插槽', upperLimbAugs, 'cyberware')}
          {renderZoneSlotGroup('lower_limb', '下肢插槽', lowerLimbAugs, 'cyberware')}
        </div>

        {/* 中间 (6/12)：仿命运2居中人体线框与自由上传 */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <CyberpunkPortraitFrame
            portraitUrl={cyberpunkData.portrait}
            scale={cyberpunkData.portraitScale ?? 1}
            position={cyberpunkData.portraitPosition ?? { x: 0, y: 0 }}
            onChange={(patch) => onChangeCyberpunk({ ...cyberpunkData, ...patch })}
          />
        </div>

        {/* 右侧 (3/12)：头部 与 躯干 */}
        <div className="lg:col-span-3 space-y-4">
          {renderZoneSlotGroup('head', '头部插槽', headAugs, 'cyberware')}
          {renderZoneSlotGroup('torso', '躯干插槽', torsoAugs, 'cyberware')}
        </div>
      </div>

      {/* ======================= 下部：核心战备区 (主副手、护甲、外置挂载) ======================= */}
      <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-2">
          <div className="flex items-center gap-2">
            <Sword className="w-4 h-4 text-[#F5F500]" />
            <h3 className="text-sm font-bold text-white tracking-wide">核心战备与外置装备</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            主副手武器 · 战术护甲 · 外置挂载模块
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. 主手武器 */}
          <div className="rounded-xl border border-[#F5F500]/30 bg-[#0B0320] p-3 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {primaryWeaponName ? (
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    setPinnedItem(
                      pinnedItem?.id === 'weapon-primary'
                        ? null
                        : {
                            id: 'weapon-primary',
                            name: primaryWeaponName,
                            typeLabel: '主手武器',
                            tier: currentTier,
                            stats: [
                              { label: '伤害', value: primaryWeapon?.damage || '-' },
                              { label: '特性', value: primaryWeapon?.trait || '-' },
                            ],
                            rulesText: primaryWeapon?.feature,
                            onReplace: () => onOpenSelectModal('weapon', undefined, 0),
                            onRemove: () => handleClearWeapon('primary'),
                          }
                    )
                  }
                >
                  <CyberpunkSquareIcon name={primaryWeaponName} size="md" theme="weapon" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenSelectModal('weapon', undefined, 0)}
                  className="w-12 h-12 rounded-lg border-2 border-dashed border-[#F5F500]/40 bg-[#0B0320] text-[#F5F500] hover:border-[#F5F500] hover:bg-[#F5F500]/10 flex flex-col items-center justify-center transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}

              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-[#F5F500] font-bold block">主手武器</span>
                <div className="font-bold text-xs text-white truncate">
                  {primaryWeaponName || '（未装配）'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {primaryWeapon?.damage || '-'}
                </div>
              </div>
            </div>

            {primaryWeaponName && (
              <button
                type="button"
                onClick={() => onOpenSelectModal('weapon', undefined, 0)}
                className="text-[10px] font-bold text-[#F5F500] bg-[#F5F500]/10 hover:bg-[#F5F500]/20 px-2 py-1 rounded border border-[#F5F500]/30 transition-colors shrink-0"
              >
                更换 ⇄
              </button>
            )}
          </div>

          {/* 2. 副手武器 */}
          <div className="rounded-xl border border-[#F5F500]/30 bg-[#0B0320] p-3 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {secondaryWeaponName ? (
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    setPinnedItem(
                      pinnedItem?.id === 'weapon-secondary'
                        ? null
                        : {
                            id: 'weapon-secondary',
                            name: secondaryWeaponName,
                            typeLabel: '副手武器',
                            tier: currentTier,
                            stats: [
                              { label: '伤害', value: secondaryWeapon?.damage || '-' },
                              { label: '特性', value: secondaryWeapon?.trait || '-' },
                            ],
                            rulesText: secondaryWeapon?.feature,
                            onReplace: () => onOpenSelectModal('weapon', undefined, 1),
                            onRemove: () => handleClearWeapon('secondary'),
                          }
                    )
                  }
                >
                  <CyberpunkSquareIcon name={secondaryWeaponName} size="md" theme="weapon" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenSelectModal('weapon', undefined, 1)}
                  className="w-12 h-12 rounded-lg border-2 border-dashed border-[#F5F500]/40 bg-[#0B0320] text-[#F5F500] hover:border-[#F5F500] hover:bg-[#F5F500]/10 flex flex-col items-center justify-center transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}

              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-[#F5F500] font-bold block">副手武器</span>
                <div className="font-bold text-xs text-white truncate">
                  {secondaryWeaponName || '（未装配）'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {secondaryWeapon?.damage || '-'}
                </div>
              </div>
            </div>

            {secondaryWeaponName && (
              <button
                type="button"
                onClick={() => onOpenSelectModal('weapon', undefined, 1)}
                className="text-[10px] font-bold text-[#F5F500] bg-[#F5F500]/10 hover:bg-[#F5F500]/20 px-2 py-1 rounded border border-[#F5F500]/30 transition-colors shrink-0"
              >
                更换 ⇄
              </button>
            )}
          </div>

          {/* 3. 战术护甲 */}
          <div className="rounded-xl border border-[#00FFA3]/30 bg-[#0B0320] p-3 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {armorName ? (
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    setPinnedItem(
                      pinnedItem?.id === 'armor-0'
                        ? null
                        : {
                            id: 'armor-0',
                            name: armorName,
                            typeLabel: '战术护甲',
                            tier: currentTier,
                            stats: [
                              { label: '护甲值', value: armorSlot?.baseArmorMax ?? 0 },
                              { label: '阈值加成', value: `轻${armorSlot?.baseThresholds?.minor ?? 0}/重${armorSlot?.baseThresholds?.major ?? 0}` },
                            ],
                            rulesText: armorSlot?.feature,
                            onReplace: () => onOpenSelectModal('armor'),
                            onRemove: () => handleClearArmor(),
                          }
                    )
                  }
                >
                  <CyberpunkSquareIcon name={armorName} size="md" theme="armor" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenSelectModal('armor')}
                  className="w-12 h-12 rounded-lg border-2 border-dashed border-[#00FFA3]/40 bg-[#0B0320] text-[#00FFA3] hover:border-[#00FFA3] hover:bg-[#00FFA3]/10 flex flex-col items-center justify-center transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}

              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-[#00FFA3] font-bold block">战术护甲</span>
                <div className="font-bold text-xs text-white truncate">
                  {armorName || '（未装配）'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  护甲: {armorSlot?.baseArmorMax ?? 0}
                </div>
              </div>
            </div>

            {armorName && (
              <button
                type="button"
                onClick={() => onOpenSelectModal('armor')}
                className="text-[10px] font-bold text-[#00FFA3] bg-[#00FFA3]/10 hover:bg-[#00FFA3]/20 px-2 py-1 rounded border border-[#00FFA3]/30 transition-colors shrink-0"
              >
                更换 ⇄
              </button>
            )}
          </div>

          {/* 4. 外置挂载装备 (Icon 列表) */}
          <div className="rounded-xl border border-[#FF007F]/30 bg-[#0B0320] p-3 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between border-b border-[#FF007F]/20 pb-1 mb-2">
              <span className="text-[10px] text-[#FF007F] font-bold">外置挂载模块</span>
              <span className="text-[9px] text-slate-400 font-mono">
                {externalGears.length}/{getZoneCapacity('external')}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {externalGears.map((gear, idx) => {
                const isPinned = pinnedItem?.id === gear.id
                const itemDetail: ActiveItemDetail = {
                  id: gear.id || `external-${idx}`,
                  name: gear.name,
                  icon: gear.icon,
                  image: gear.image,
                  tier: gear.tier || currentTier,
                  typeLabel: gear.cyberType || '外置设备',
                  rulesText: gear.effect || gear.description,
                  onReplace: () => onOpenSelectModal('external', undefined, idx),
                  onRemove: () => handleRemoveGear(idx),
                }

                return (
                  <div
                    key={gear.id || idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredItem(itemDetail)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => setPinnedItem(isPinned ? null : itemDetail)}
                  >
                    <CyberpunkSquareIcon
                      name={gear.name}
                      icon={gear.icon}
                      image={gear.image}
                      size="sm"
                      theme="external"
                      className={`${isPinned ? 'ring-2 ring-[#FF007F]' : ''}`}
                    />
                  </div>
                )
              })}

              {externalGears.length < getZoneCapacity('external') && (
                <button
                  type="button"
                  onClick={() => onOpenSelectModal('external')}
                  className="w-9 h-9 rounded-lg border-2 border-dashed border-[#FF007F]/40 bg-[#0B0320] text-[#FF007F] hover:border-[#FF007F] hover:bg-[#FF007F]/10 flex items-center justify-center transition-all"
                  title="添加外置挂载"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================= 全量卡片悬停 / 钉住浮窗 (Popover) ======================= */}
      {activeTooltip && (
        <div className="fixed bottom-6 right-6 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-[#00FFA3]/60 bg-[#0B0320]/95 backdrop-blur-md p-4 shadow-[0_0_30px_rgba(0,255,163,0.35)] text-white animate-fade-in flex flex-col space-y-2.5">
          {/* 浮窗头部 */}
          <div className="flex items-start justify-between border-b border-[#6C00FF]/30 pb-2">
            <div className="flex items-center gap-2.5">
              <CyberpunkSquareIcon
                name={activeTooltip.name}
                icon={activeTooltip.icon}
                image={activeTooltip.image}
                size="sm"
              />
              <div>
                <span className="text-[10px] font-bold text-[#F5F500] font-mono block">
                  [{activeTooltip.tier || currentTier}] {activeTooltip.typeLabel || '装备'}
                </span>
                <h4 className="font-bold text-xs text-white truncate max-w-[170px]">
                  {activeTooltip.name}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {pinnedItem ? (
                <span
                  className="p-1 text-[#00FFA3] text-[10px] flex items-center gap-0.5"
                  title="已固定锁定显示"
                >
                  <Pin className="w-3 h-3 fill-current" />
                </span>
              ) : (
                <span className="text-[9px] text-slate-500 font-mono">悬停预览</span>
              )}
              <button
                type="button"
                onClick={() => {
                  setPinnedItem(null)
                  setHoveredItem(null)
                }}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 属性徽章 */}
          {activeTooltip.stats && activeTooltip.stats.length > 0 && (
            <div className="flex flex-wrap gap-1.5 py-1">
              {activeTooltip.stats.map((st, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-[#6C00FF]/25 border border-[#6C00FF]/40 text-[10px] font-mono text-[#00FFA3]"
                >
                  {st.label}: <strong>{st.value}</strong>
                </span>
              ))}
            </div>
          )}

          {/* 规则特性描述全文 */}
          <div className="text-[11px] text-slate-300 leading-relaxed max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            <CardMarkdown>{activeTooltip.rulesText || activeTooltip.description || '暂无详细描述'}</CardMarkdown>
          </div>

          {/* 底部操作按钮 */}
          {(activeTooltip.onReplace || activeTooltip.onRemove) && (
            <div className="flex justify-end gap-2 pt-2 border-t border-[#6C00FF]/20 text-xs">
              {activeTooltip.onRemove && (
                <button
                  type="button"
                  onClick={activeTooltip.onRemove}
                  className="flex items-center gap-1 text-[11px] text-[#FF007F] hover:bg-[#FF007F]/10 px-2 py-1 rounded border border-[#FF007F]/30 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>卸下</span>
                </button>
              )}
              {activeTooltip.onReplace && (
                <button
                  type="button"
                  onClick={activeTooltip.onReplace}
                  className="flex items-center gap-1 text-[11px] text-[#00FFA3] hover:bg-[#00FFA3]/10 px-2 py-1 rounded border border-[#00FFA3]/30 font-bold transition-colors"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>更换</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
