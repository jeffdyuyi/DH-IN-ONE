"use client"

import React, { useState } from 'react'
import type { CyberpunkAugmentation, CyberpunkBodyZoneKey, CyberpunkSheetExtension } from '../../types/cyberpunk'
import { CYBERPUNK_BODY_ZONES, CYBERPUNK_TIER_SLOTS } from '../../lib/cyberpunk/tier-constants'
import { CyberpunkSlotItem } from './cyberpunk-slot-item'
import { InstallAugmentationModal } from './modals/install-augmentation-modal'
import { CustomAugmentationModal } from './modals/custom-augmentation-modal'
import { Cpu, Plus } from 'lucide-react'

interface CyberpunkZonePanelProps {
  cyberpunkData: CyberpunkSheetExtension
  onChange: (updated: CyberpunkSheetExtension) => void
}

export function CyberpunkZonePanel({ cyberpunkData, onChange }: CyberpunkZonePanelProps) {
  const currentTier = cyberpunkData.tier || 'T1'
  const maxSlotsPerZone = CYBERPUNK_TIER_SLOTS[currentTier] || 2

  const [selectedZone, setSelectedZone] = useState<CyberpunkBodyZoneKey | null>(null)
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false)
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)

  const handleUninstall = (zoneKey: CyberpunkBodyZoneKey, augId: string) => {
    const currentZone = cyberpunkData.zones?.[zoneKey]
    if (!currentZone) return

    const updatedAugs = currentZone.augmentations.filter(a => a.id !== augId)
    onChange({
      ...cyberpunkData,
      zones: {
        ...cyberpunkData.zones,
        [zoneKey]: { augmentations: updatedAugs },
      },
    })
  }

  const handleInstall = (zoneKey: CyberpunkBodyZoneKey, newAug: CyberpunkAugmentation) => {
    const currentZone = cyberpunkData.zones?.[zoneKey] || { augmentations: [] }
    const updatedAugs = [...currentZone.augmentations, newAug]

    onChange({
      ...cyberpunkData,
      zones: {
        ...cyberpunkData.zones,
        [zoneKey]: { augmentations: updatedAugs },
      },
    })
  }

  const handleOpenInstall = (zoneKey: CyberpunkBodyZoneKey) => {
    setSelectedZone(zoneKey)
    setIsInstallModalOpen(true)
  }

  const selectedZoneMeta = CYBERPUNK_BODY_ZONES.find(z => z.id === selectedZone)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-[#00FFA3]" />
          <h2 className="text-base font-bold text-white tracking-wider">
            身体 5 大区改造插槽 (当前位阶 {currentTier} · 各区容量 {maxSlotsPerZone} 格)
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CYBERPUNK_BODY_ZONES.map((zone) => {
          const zoneKey = zone.id as CyberpunkBodyZoneKey
          const zoneState = cyberpunkData.zones?.[zoneKey] || { augmentations: [] }
          const installedAugs = zoneState.augmentations || []
          const usedSlots = installedAugs.reduce((sum, a) => sum + (Number(a.slots || a.slotCost) || 1), 0)
          const availableSlots = Math.max(0, maxSlotsPerZone - usedSlots)

          return (
            <div
              key={zone.id}
              className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white">{zone.name}</span>
                    <span className="text-[10px] text-slate-500">{(zone as any).english || zone.suggestedTraits}</span>
                  </div>
                  <div className="text-xs">
                    <span className={usedSlots > maxSlotsPerZone ? 'text-rose-400 font-bold' : 'text-[#00FFA3] font-bold'}>
                      {usedSlots}
                    </span>
                    <span className="text-slate-500"> / {maxSlotsPerZone} 槽</span>
                  </div>
                </div>

                {installedAugs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">暂未安装任何义体或战利品</p>
                ) : (
                  <div className="space-y-2 mb-3">
                    {installedAugs.map((aug) => (
                      <CyberpunkSlotItem
                        key={aug.id}
                        aug={aug}
                        onUninstall={(id) => handleUninstall(zoneKey, id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleOpenInstall(zoneKey)}
                disabled={availableSlots <= 0}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 mt-2 ${
                  availableSlots > 0
                    ? 'bg-[#00FFA3]/10 hover:bg-[#00FFA3] text-[#00FFA3] hover:text-black border border-[#00FFA3]/30 shadow-[0_0_12px_rgba(0,255,163,0.1)]'
                    : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{availableSlots > 0 ? `+ 安装义体 / 战利品 (${availableSlots}空闲)` : '插槽已满'}</span>
              </button>
            </div>
          )
        })}
      </div>

      {/* 安装选择弹窗 */}
      {selectedZone && (
        <InstallAugmentationModal
          isOpen={isInstallModalOpen}
          zone={selectedZone}
          zoneName={selectedZoneMeta?.name || '未知部位'}
          availableSlots={maxSlotsPerZone - ((cyberpunkData.zones?.[selectedZone]?.augmentations || []).reduce((s, a) => s + (Number(a.slots || a.slotCost) || 1), 0))}
          onClose={() => {
            setIsInstallModalOpen(false)
            setSelectedZone(null)
          }}
          onInstall={(aug) => handleInstall(selectedZone, aug)}
          onOpenCustomModal={() => {
            setIsInstallModalOpen(false)
            setIsCustomModalOpen(true)
          }}
        />
      )}

      {/* 手动创建弹窗 */}
      {selectedZone && (
        <CustomAugmentationModal
          isOpen={isCustomModalOpen}
          defaultZone={selectedZone}
          onClose={() => {
            setIsCustomModalOpen(false)
            setSelectedZone(null)
          }}
          onSave={(aug) => handleInstall(selectedZone, aug)}
        />
      )}
    </div>
  )
}
