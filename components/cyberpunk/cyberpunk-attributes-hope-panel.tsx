"use client"

import React from 'react'
import { Heart, Activity, Sparkles, Shield, Zap, Plus, Minus } from 'lucide-react'
import type { SheetData, AttributeValue } from '../../lib/sheet-data'

interface CyberpunkAttributesHopePanelProps {
  formData: SheetData
  setFormData: React.Dispatch<React.SetStateAction<SheetData>>
  calculatedEvasion?: number
}

type AttributeKey = 'agility' | 'strength' | 'finesse' | 'instinct' | 'presence' | 'knowledge'

const ATTRIBUTES: Array<{ key: AttributeKey; label: string; english: string }> = [
  { key: 'agility', label: '敏捷', english: 'AGILITY' },
  { key: 'strength', label: '力量', english: 'STRENGTH' },
  { key: 'finesse', label: '灵巧', english: 'FINESSE' },
  { key: 'instinct', label: '本能', english: 'INSTINCT' },
  { key: 'presence', label: '风度', english: 'PRESENCE' },
  { key: 'knowledge', label: '知识', english: 'KNOWLEDGE' },
]

export function CyberpunkAttributesHopePanel({
  formData,
  setFormData,
  calculatedEvasion = 10,
}: CyberpunkAttributesHopePanelProps) {
  // 六维属性调整
  const handleAttrChange = (key: AttributeKey, delta: number) => {
    setFormData((prev) => {
      const current = prev[key]
      const currentVal = typeof current === 'object' && current !== null ? Number(current.value || 0) : 0
      const newVal = Math.max(-2, Math.min(5, currentVal + delta))
      return {
        ...prev,
        [key]: {
          value: String(newVal >= 0 ? `+${newVal}` : newVal),
          checked: typeof current === 'object' && current !== null ? Boolean(current.checked) : false,
        },
      }
    })
  }

  // 希望点 Hope
  const currentHope = typeof formData.hope === 'number' ? formData.hope : 2
  const maxHope = typeof formData.hopeMax === 'number' ? formData.hopeMax : 6

  const handleHopeChange = (val: number) => {
    setFormData((prev) => ({
      ...prev,
      hope: Math.max(0, Math.min(maxHope, val)),
    }))
  }

  // 生命点 HP
  const hpMax = Number(formData.hpMax) || 6
  const hpList = Array.isArray(formData.hp) ? formData.hp : Array(hpMax).fill(false)

  const handleToggleHp = (idx: number) => {
    const updated = [...hpList]
    updated[idx] = !updated[idx]
    setFormData((prev) => ({ ...prev, hp: updated }))
  }

  // 压力点 Stress
  const stressMax = Number(formData.stressMax) || 5
  const stressList = Array.isArray(formData.stress) ? formData.stress : Array(stressMax).fill(false)

  const handleToggleStress = (idx: number) => {
    const updated = [...stressList]
    updated[idx] = !updated[idx]
    setFormData((prev) => ({ ...prev, stress: updated }))
  }

  return (
    <div className="space-y-4">
      {/* 顶部：六维核心属性矩阵 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {ATTRIBUTES.map(({ key, label, english }) => {
          const attr = formData[key] as AttributeValue | undefined
          const valStr = attr?.value || '+0'

          return (
            <div
              key={key}
              className="p-3 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex flex-col items-center justify-between group hover:border-[#00FFA3]/50 transition"
            >
              <span className="text-[10px] text-slate-400 font-semibold">{label}</span>
              <span className="text-[9px] text-slate-500 tracking-tighter uppercase">{english}</span>

              <div className="text-2xl font-black text-white my-1 group-hover:text-[#00FFA3] transition">
                {valStr}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleAttrChange(key, -1)}
                  className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center text-xs"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAttrChange(key, 1)}
                  className="w-5 h-5 rounded bg-[#00FFA3]/10 hover:bg-[#00FFA3] hover:text-black text-[#00FFA3] flex items-center justify-center text-xs"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* 状态与资源仪表盘：HP / 压力 / 希望点 / 闪避 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* 生命值槽 */}
        <div className="p-4 rounded-2xl border border-[#00FFA3]/30 bg-[#00FFA3]/[0.02] backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#00FFA3]">
              <Heart className="w-4 h-4" />
              <span>生命值 (HP)</span>
            </div>
            <span className="text-xs text-slate-400">
              {hpList.filter(Boolean).length} / {hpMax}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5">
            {Array.from({ length: hpMax }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleToggleHp(idx)}
                className={`w-6 h-6 rounded-lg border transition ${
                  hpList[idx]
                    ? 'bg-[#00FFA3] border-[#00FFA3] shadow-md shadow-[#00FFA3]/30'
                    : 'border-white/20 hover:border-[#00FFA3]/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 压力值槽 */}
        <div className="p-4 rounded-2xl border border-[#FF007F]/30 bg-[#FF007F]/[0.02] backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#FF007F]">
              <Activity className="w-4 h-4" />
              <span>压力 (Stress)</span>
            </div>
            <span className="text-xs text-slate-400">
              {stressList.filter(Boolean).length} / {stressMax}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5">
            {Array.from({ length: stressMax }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleToggleStress(idx)}
                className={`w-6 h-6 rounded-lg border transition ${
                  stressList[idx]
                    ? 'bg-[#FF007F] border-[#FF007F] shadow-md shadow-[#FF007F]/30'
                    : 'border-white/20 hover:border-[#FF007F]/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 希望点 Hope */}
        <div className="p-4 rounded-2xl border border-[#F5F500]/30 bg-[#F5F500]/[0.02] backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#F5F500]">
              <Sparkles className="w-4 h-4" />
              <span>希望点 (Hope)</span>
            </div>
            <span className="text-xs text-[#F5F500] font-bold">
              {currentHope} / {maxHope}
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            {Array.from({ length: maxHope }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleHopeChange(idx + 1 === currentHope ? idx : idx + 1)}
                className={`w-6 h-6 rounded-full border transition ${
                  idx < currentHope
                    ? 'bg-[#F5F500] border-[#F5F500] shadow-md shadow-[#F5F500]/30'
                    : 'border-white/20 hover:border-[#F5F500]/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 闪避值 */}
        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-semibold">基础闪避值</span>
            <span className="text-[10px] text-slate-500">EVASION</span>
          </div>
          <div className="text-2xl font-black text-white">{calculatedEvasion}</div>
        </div>
      </div>
    </div>
  )
}
