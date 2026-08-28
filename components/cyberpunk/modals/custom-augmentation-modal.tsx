"use client"

import React, { useState } from 'react'
import type { CyberpunkAugmentation, CyberpunkBodyZoneKey, CyberpunkTier } from '../../../types/cyberpunk'
import { CYBERPUNK_BODY_ZONES } from '../../../lib/cyberpunk/tier-constants'
import { X, Save } from 'lucide-react'

interface CustomAugmentationModalProps {
  isOpen: boolean
  defaultZone: CyberpunkBodyZoneKey
  onClose: () => void
  onSave: (aug: CyberpunkAugmentation) => void
}

export function CustomAugmentationModal({
  isOpen,
  defaultZone,
  onClose,
  onSave,
}: CustomAugmentationModalProps) {
  const [name, setName] = useState('')
  const [tier, setTier] = useState<CyberpunkTier>('T1')
  const [cyberType, setCyberType] = useState('植入体')
  const [zone, setZone] = useState<CyberpunkBodyZoneKey>(defaultZone)
  const [slots, setSlots] = useState(1)
  const [restriction, setRestriction] = useState('')
  const [effect, setEffect] = useState('')
  const [tag, setTag] = useState('')
  const [compCost, setCompCost] = useState('')
  const [surgCost, setSurgCost] = useState('')

  if (!isOpen) return null

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const newAug: CyberpunkAugmentation = {
      id: `custom_aug_${Date.now()}`,
      name: name.trim(),
      tier,
      cyberType: cyberType.trim() || '植入体',
      zone,
      slots: Number(slots) || 1,
      restriction: restriction.trim() || undefined,
      effect: effect.trim() || '自定义效果说明',
      tag: tag.trim() || undefined,
      compCost: compCost.trim() || undefined,
      surgCost: surgCost.trim() || undefined,
    }

    onSave(newAug)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0B0320] text-slate-100 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <h3 className="font-bold text-base text-white">自定义设计全新赛博义体</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">义体名称 *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如: 螳螂刀、钛金骨骼"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#00FFA3]"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">安装部位</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value as CyberpunkBodyZoneKey)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
              >
                {CYBERPUNK_BODY_ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">位阶</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as CyberpunkTier)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
              >
                <option value="T1">T1 (位阶 1)</option>
                <option value="T2">T2 (位阶 2)</option>
                <option value="T3">T3 (位阶 3)</option>
                <option value="T4">T4 (位阶 4)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">占用槽位</label>
              <input
                type="number"
                min={1}
                max={4}
                value={slots}
                onChange={(e) => setSlots(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">类型</label>
              <input
                type="text"
                value={cyberType}
                onChange={(e) => setCyberType(e.target.value)}
                placeholder="植入体/仿生件"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 mb-1 block">机制效果描述 *</label>
            <textarea
              rows={3}
              required
              value={effect}
              onChange={(e) => setEffect(e.target.value)}
              placeholder="详细机制与数值规则文案..."
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-[#00FFA3]"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-[#00FFA3] text-black hover:opacity-90 transition shadow-lg shadow-[#00FFA3]/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>确认创建并安装</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
