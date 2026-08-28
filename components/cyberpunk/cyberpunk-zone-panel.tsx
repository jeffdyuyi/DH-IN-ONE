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
    <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 text-slate-100 font-sans shadow-[0_4px_20px_rgba(11,3,32,0.6)] space-y-3.5">
      <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#00FFA3]" />
          <h2 className="text-sm font-bold text-white tracking-wide">
            身体 4 大区改造插槽 (当前位阶 {currentTier} · 各区容量 {maxSlotsPerZone} 格)
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CYBERPUNK_BODY_ZONES.map((zone) => {
          const zoneKey = zone.id as CyberpunkBodyZoneKey
          const zoneState = cyberpunkData.zones?.[zoneKey] || { augmentations: [] }
          const installedAugs = zoneState.augmentations || []
          const usedSlots = installedAugs.reduce((sum, a) => sum + (Number(a.slots || a.slotCost) || 1), 0)
          const availableSlots = Math.max(0, maxSlotsPerZone - usedSlots)

          return (
            <div
              key={zone.id}
              className="p-3.5 rounded-xl border border-[#6C00FF]/30 bg-[#0B0320] flex flex-col justify-between hover:border-[#6C00FF]/60 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#6C00FF]/20 mb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white">{zone.name}</span>
                    <span className="text-[10px] text-[#F5F500] font-mono">
                      {(zone as any).english || zone.suggestedTraits}
                    </span>
                  </div>
                  <div className="text-xs font-mono">
                    <span className={usedSlots > maxSlotsPerZone ? 'text-[#FF007F] font-bold' : 'text-[#00FFA3] font-bold'}>
                      {usedSlots}
                    </span>
                    <span className="text-slate-400"> / {maxSlotsPerZone} 槽</span>
                  </div>
                </div>

                {installedAugs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">暂未安装任何义体或元件</p>
                ) : (
                  <div className="space-y-2 mb-2.5">
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

              <div className="pt-2 border-t border-[#6C00FF]/20 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 font-mono">剩余 {availableSlots} 槽可用</span>
                <button
                  type="button"
                  onClick={() => handleOpenInstall(zoneKey)}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#00FFA3] bg-[#00FFA3]/10 hover:bg-[#00FFA3]/20 px-2 py-1 rounded border border-[#00FFA3]/30 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>安装义体</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {isInstallModalOpen && selectedZone && (
        <InstallAugmentationModal
          isOpen={isInstallModalOpen}
          zone={selectedZone}
          zoneName={selectedZoneMeta?.name || '未知部位'}
          availableSlots={Math.max(
            0,
            maxSlotsPerZone -
              ((cyberpunkData.zones?.[selectedZone]?.augmentations || []).reduce(
                (sum, a) => sum + (Number(a.slots || a.slotCost) || 1),
                0
              ))
          )}
          onClose={() => setIsInstallModalOpen(false)}
          onInstall={(aug) => handleInstall(selectedZone, aug)}
          onOpenCustomModal={() => {
            setIsInstallModalOpen(false)
            setIsCustomModalOpen(true)
          }}
        />
      )}

      {isCustomModalOpen && selectedZone && (
        <CustomAugmentationModal
          isOpen={isCustomModalOpen}
          defaultZone={selectedZone}
          onClose={() => setIsCustomModalOpen(false)}
          onSave={(aug) => handleInstall(selectedZone, aug)}
        />
      )}
    </div>
  )
}
