"use client"

import React from 'react'
import { useSheetStore } from '@/lib/sheet-store'
import { useCardStore } from '@/card/stores/unified-card-store'
import type { StandardCard } from '@/card/card-types'
import { Heart, Activity, Sparkles, Shield, Zap, Plus, Minus, Compass } from 'lucide-react'
import { CardMarkdown } from '@/components/ui/card-markdown'
import rehypeRaw from 'rehype-raw'

type AttributeKey = 'agility' | 'strength' | 'finesse' | 'instinct' | 'presence' | 'knowledge'

const ATTRIBUTES: { key: AttributeKey; label: string; abbr: string }[] = [
  { key: 'agility', label: '敏捷', abbr: 'AGI' },
  { key: 'strength', label: '力量', abbr: 'STR' },
  { key: 'finesse', label: '灵巧', abbr: 'FIN' },
  { key: 'instinct', label: '本能', abbr: 'INS' },
  { key: 'presence', label: '风度', abbr: 'PRE' },
  { key: 'knowledge', label: '知识', abbr: 'KNO' },
]

export function CyberpunkAttributesHopePanel() {
  const { sheetData: formData, setSheetData, updateHope } = useSheetStore()
  const cardStore = useCardStore()

  // 获取职业卡
  let professionCard: StandardCard | undefined = undefined
  if (formData.professionRef?.id) {
    professionCard = cardStore.getCardById(formData.professionRef.id) ||
      (Array.isArray(formData.cards) ? formData.cards.find(c => c && c.id === formData.professionRef?.id) : undefined)
  }

  // 属性值
  const getAttrValue = (key: AttributeKey): number => {
    const attr = formData[key]
    if (typeof attr === 'object' && attr !== null && 'value' in attr) {
      return Number(attr.value) || 0
    }
    return typeof attr === 'number' ? attr : 0
  }

  const handleAttrChange = (key: AttributeKey, val: number) => {
    setSheetData((prev) => {
      const current = prev[key]
      if (typeof current === 'object' && current !== null) {
        return {
          ...prev,
          [key]: {
            ...current,
            value: String(val),
          },
        }
      }
      return {
        ...prev,
        [key]: {
          checked: false,
          value: String(val),
        },
      }
    })
  }

  // 生命值 HP (以标准 Daggerheart 为准：默认满血 6/6)
  const maxHp = Number(formData.hpMax) || 6
  const damageHpCount = Array.isArray(formData.hp) ? formData.hp.filter(Boolean).length : 0
  const currentHp = Math.max(0, maxHp - damageHpCount)

  const handleHpChange = (newCurrentHp: number) => {
    const clamped = Math.max(0, Math.min(maxHp, newCurrentHp))
    const damageNeeded = maxHp - clamped
    const newHpArray = Array.from({ length: maxHp }, (_, i) => i < damageNeeded)
    setSheetData((prev) => ({ ...prev, hp: newHpArray }))
  }

  const handleMaxHpChange = (delta: number) => {
    const newMax = Math.max(1, maxHp + delta)
    setSheetData((prev) => {
      const oldDamage = Array.isArray(prev.hp) ? prev.hp.filter(Boolean).length : 0
      const newHpArray = Array.from({ length: newMax }, (_, i) => i < Math.min(oldDamage, newMax))
      return {
        ...prev,
        hpMax: newMax,
        hp: newHpArray,
      }
    })
  }

  // 压力值 Stress (0/5)
  const maxStress = Number(formData.stressMax) || 5
  const currentStress = Array.isArray(formData.stress) ? formData.stress.filter(Boolean).length : 0

  const handleStressChange = (newStress: number) => {
    const clamped = Math.max(0, Math.min(maxStress, newStress))
    const newStressArray = Array.from({ length: maxStress }, (_, i) => i < clamped)
    setSheetData((prev) => ({ ...prev, stress: newStressArray }))
  }

  const handleMaxStressChange = (delta: number) => {
    const newMax = Math.max(1, maxStress + delta)
    setSheetData((prev) => {
      const oldStress = Array.isArray(prev.stress) ? prev.stress.filter(Boolean).length : 0
      const newStressArray = Array.from({ length: newMax }, (_, i) => i < Math.min(oldStress, newMax))
      return {
        ...prev,
        stressMax: newMax,
        stress: newStressArray,
      }
    })
  }

  // 闪避值自动计算 (职业起始闪避 + 装备调整)
  const defaultEvasion = professionCard?.professionSpecial?.['起始闪避'] ?? 10
  const evasionValue = formData.evasion !== undefined && formData.evasion !== ''
    ? String(formData.evasion)
    : String(defaultEvasion)

  // 熟练度（计算 true 标记个数或数值，默认 1）
  let proficiencyCount = 1
  if (Array.isArray(formData.proficiency)) {
    proficiencyCount = formData.proficiency.filter(Boolean).length || 1
  } else if (typeof formData.proficiency === 'number' && formData.proficiency > 0) {
    proficiencyCount = formData.proficiency
  } else if (typeof formData.proficiency === 'string') {
    const parsed = parseInt(formData.proficiency, 10)
    proficiencyCount = !isNaN(parsed) && parsed > 0 ? parsed : 1
  }

  const handleProficiencyChange = (newVal: number | string) => {
    const num = typeof newVal === 'number' ? newVal : parseInt(String(newVal), 10) || 1
    const clamped = Math.max(1, Math.min(6, num))
    const boolArray = Array.from({ length: 6 }, (_, i) => i < clamped)
    setSheetData((prev) => ({
      ...prev,
      proficiency: boolArray,
    }))
  }

  // 希望点 Hope
  const currentHope = typeof formData.hope === 'number' ? formData.hope : 0
  const hopeMax = typeof formData.hopeMax === 'number' && formData.hopeMax > 0 ? formData.hopeMax : 6

  const handleHopeSlotClick = (index: number) => {
    updateHope(index)
  }

  const handleMaxHopeChange = (delta: number) => {
    const newMax = Math.max(1, Math.min(8, hopeMax + delta))
    setSheetData((prev) => ({
      ...prev,
      hopeMax: newMax,
      hope: Math.min(typeof prev.hope === 'number' ? prev.hope : 0, newMax),
    }))
  }

  // 经历 (Experiences) 状态与编辑 (空白默认，无冗余占位符)
  const experienceTexts: string[] = formData.experience || ['', '', '', '', '']
  const experienceValues: string[] = formData.experienceValues || ['', '', '', '', '']

  const handleExperienceTextChange = (index: number, text: string) => {
    const nextTexts = [...experienceTexts]
    nextTexts[index] = text
    setSheetData((prev) => ({ ...prev, experience: nextTexts }))
  }

  const handleExperienceValueChange = (index: number, val: string) => {
    const nextValues = [...experienceValues]
    nextValues[index] = val
    setSheetData((prev) => ({ ...prev, experienceValues: nextValues }))
  }

  // 获取职业给出的希望特性描述
  let hopeTraitText = '花费 1 点希望使用经历或协助队友。'
  if (professionCard?.professionSpecial && professionCard.professionSpecial['希望特性']) {
    hopeTraitText = String(professionCard.professionSpecial['希望特性'])
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0d0d1a] p-4 text-slate-100 font-sans shadow-md space-y-4">
      {/* 1. 顶部：六维基础属性 */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#00F0FF]" />
            <h3 className="text-sm font-bold text-white">六维属性</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ATTRIBUTES.map(({ key, label, abbr }) => {
            const val = getAttrValue(key)

            return (
              <div
                key={key}
                className="flex flex-col justify-between rounded-lg border border-slate-800 bg-[#0f0f22] p-2.5 hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{label}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({abbr})</span>
                </div>

                <div className="mt-2 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => handleAttrChange(key, val - 1)}
                    className="flex h-6 w-6 items-center justify-center rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    <Minus className="h-3 w-3" />
                  </button>

                  <input
                    type="number"
                    value={val}
                    onChange={(e) => handleAttrChange(key, parseInt(e.target.value, 10) || 0)}
                    className="w-12 text-center text-lg font-bold text-cyan-300 font-mono bg-transparent border-b border-slate-700 focus:border-cyan-400 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => handleAttrChange(key, val + 1)}
                    className="flex h-6 w-6 items-center justify-center rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. 中部：生命值 (HP)、压力 (Stress)、闪避 (Evasion)、熟练度 (Proficiency) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-slate-800 pt-3">
        {/* 生命值 HP */}
        <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" />
              <span>生命值 (HP)</span>
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <span>上限: {maxHp}</span>
              <button
                type="button"
                onClick={() => handleMaxHpChange(1)}
                className="h-4 w-4 rounded bg-slate-800 text-xs leading-none hover:bg-slate-700 text-white"
                title="增加生命上限"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => handleMaxHpChange(-1)}
                className="h-4 w-4 rounded bg-slate-800 text-xs leading-none hover:bg-slate-700 text-white"
                title="减少生命上限"
              >
                -
              </button>
            </div>
          </div>

          <div className="my-2 flex flex-wrap items-center gap-1.5">
            {Array.from({ length: maxHp }).map((_, idx) => {
              const isHealthy = idx < currentHp
              return (
                <button
                  key={`hp_${idx}`}
                  type="button"
                  onClick={() => handleHpChange(isHealthy && idx === currentHp - 1 ? idx : idx + 1)}
                  className={`h-5 w-5 rounded-full border transition-all ${
                    isHealthy
                      ? 'bg-red-500 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                      : 'bg-black/50 border-red-900/60 hover:border-red-500'
                  }`}
                  title={`生命点 ${idx + 1}/${maxHp}`}
                />
              )
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-red-300 font-mono">
            <span>当前: {currentHp} / {maxHp}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleHpChange(currentHp - 1)}
                className="rounded bg-red-900/40 px-2 py-0.5 text-[10px] hover:bg-red-900/70"
              >
                -1 伤
              </button>
              <button
                type="button"
                onClick={() => handleHpChange(currentHp + 1)}
                className="rounded bg-red-900/40 px-2 py-0.5 text-[10px] hover:bg-red-900/70"
              >
                +1 愈
              </button>
            </div>
          </div>
        </div>

        {/* 压力值 Stress */}
        <div className="rounded-lg border border-purple-500/30 bg-purple-950/20 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              <span>压力值 (Stress)</span>
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <span>上限: {maxStress}</span>
              <button
                type="button"
                onClick={() => handleMaxStressChange(1)}
                className="h-4 w-4 rounded bg-slate-800 text-xs leading-none hover:bg-slate-700 text-white"
                title="增加压力上限"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => handleMaxStressChange(-1)}
                className="h-4 w-4 rounded bg-slate-800 text-xs leading-none hover:bg-slate-700 text-white"
                title="减少压力上限"
              >
                -
              </button>
            </div>
          </div>

          <div className="my-2 flex flex-wrap items-center gap-1.5">
            {Array.from({ length: maxStress }).map((_, idx) => {
              const isFilled = idx < currentStress
              return (
                <button
                  key={`stress_${idx}`}
                  type="button"
                  onClick={() => handleStressChange(isFilled && idx === currentStress - 1 ? idx : idx + 1)}
                  className={`h-5 w-5 rounded border transition-all ${
                    isFilled
                      ? 'bg-purple-500 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                      : 'bg-black/50 border-purple-900/60 hover:border-purple-500'
                  }`}
                  title={`压力 ${idx + 1}/${maxStress}`}
                />
              )
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-purple-300 font-mono">
            <span>当前: {currentStress} / {maxStress}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleStressChange(currentStress - 1)}
                className="rounded bg-purple-900/40 px-2 py-0.5 text-[10px] hover:bg-purple-900/70"
              >
                -1 压
              </button>
              <button
                type="button"
                onClick={() => handleStressChange(currentStress + 1)}
                className="rounded bg-purple-900/40 px-2 py-0.5 text-[10px] hover:bg-purple-900/70"
              >
                +1 压
              </button>
            </div>
          </div>
        </div>

        {/* 闪避值 Evasion */}
        <div className="rounded-lg border border-slate-800 bg-[#0f0f22] p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-cyan-400" />
              <span>闪避值 (Evasion)</span>
            </span>
          </div>
          <div className="my-1 text-center">
            <input
              type="text"
              value={evasionValue}
              onChange={(e) => setSheetData((prev) => ({ ...prev, evasion: e.target.value }))}
              className="w-16 text-center text-2xl font-black text-cyan-300 font-mono bg-transparent border-b border-slate-700 focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <div className="text-[10px] text-slate-500 text-center font-mono">职业起始: {defaultEvasion} (自动计算)</div>
        </div>

        {/* 熟练度 Proficiency */}
        <div className="rounded-lg border border-slate-800 bg-[#0f0f22] p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#FCEE0A]" />
              <span>熟练度 (Proficiency)</span>
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <button
                type="button"
                onClick={() => handleProficiencyChange(proficiencyCount + 1)}
                className="h-4 w-4 rounded bg-slate-800 text-xs leading-none hover:bg-slate-700 text-white"
                title="增加熟练度"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => handleProficiencyChange(proficiencyCount - 1)}
                className="h-4 w-4 rounded bg-slate-800 text-xs leading-none hover:bg-slate-700 text-white"
                title="减少熟练度"
              >
                -
              </button>
            </div>
          </div>

          <div className="my-2 flex justify-center items-center gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => {
              const isFilled = i < proficiencyCount
              return (
                <button
                  key={`prof_dot_${i}`}
                  type="button"
                  onClick={() => handleProficiencyChange(isFilled && i === proficiencyCount - 1 ? i : i + 1)}
                  className={`h-4 w-4 rounded-full border transition-all ${
                    isFilled
                      ? 'bg-[#FCEE0A] border-[#FCEE0A] shadow-[0_0_6px_#FCEE0A]'
                      : 'bg-black/50 border-slate-700 hover:border-yellow-400'
                  }`}
                  title={`熟练度 ${i + 1}/6`}
                />
              )
            })}
          </div>

          <div className="text-center font-mono">
            <span className="text-xs text-[#FCEE0A] font-bold">当前熟练度: {proficiencyCount}</span>
          </div>
        </div>
      </div>

      {/* 3. 底部：经历 (Experiences) 与 希望点 (Hope Points) 协同矩阵 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 border-t border-slate-800 pt-3">
        {/* 经历面板 (Experiences) - 占 6/12 */}
        <div className="lg:col-span-6 rounded-lg border border-slate-800 bg-[#0f0f22] p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
              <div className="flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-[#00F0FF]" />
                <h4 className="text-xs font-bold text-white">经历 (Experiences)</h4>
              </div>
              <span className="text-[10px] text-slate-400">花费 1 希望加入掷骰加值</span>
            </div>

            <div className="space-y-1.5">
              {experienceTexts.map((text, idx) => (
                <div key={`exp_row_${idx}`} className="flex items-center gap-2 text-xs">
                  <span className="text-[10px] text-slate-500 font-mono w-4 shrink-0">#{idx + 1}</span>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => handleExperienceTextChange(idx, e.target.value)}
                    placeholder=""
                    className="flex-1 rounded border border-slate-800 bg-black/60 px-2 py-1 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={experienceValues[idx] || ''}
                    onChange={(e) => handleExperienceValueChange(idx, e.target.value)}
                    placeholder=""
                    className="w-12 rounded border border-slate-800 bg-black/60 px-1 py-1 text-center text-xs font-bold text-[#00F0FF] font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 希望点面板 (Hope Points) - 占 6/12 */}
        <div className="lg:col-span-6 rounded-lg border border-[#FCEE0A]/30 bg-black/40 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#FCEE0A]" />
                <h4 className="text-xs font-bold text-white">希望点 (Hope Points)</h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  ({currentHope} / {hopeMax})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* 棱形点阵 */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: Math.max(hopeMax, 6) }).map((_, idx) => {
                    const isWithinMax = idx < hopeMax
                    const isLit = idx < currentHope
                    const isDashed = !isWithinMax && idx < 6

                    return (
                      <button
                        key={`hope_pip_${idx}`}
                        type="button"
                        onClick={() => isWithinMax && handleHopeSlotClick(idx)}
                        disabled={!isWithinMax}
                        className={`relative flex h-4 w-4 items-center justify-center rotate-45 border transition-all ${
                          isDashed
                            ? 'border-dashed border-slate-700 opacity-40 cursor-default'
                            : isLit
                            ? 'border-[#FCEE0A] bg-[#FCEE0A] shadow-[0_0_6px_#FCEE0A]'
                            : 'border-slate-600 bg-black/80 hover:border-[#FCEE0A] cursor-pointer'
                        }`}
                        title={isWithinMax ? `希望点 ${idx + 1}/${hopeMax}` : '超出上限'}
                      >
                        {isLit && <div className="h-1.5 w-1.5 bg-black" />}
                      </button>
                    )
                  })}
                </div>

                {/* 上限微调 */}
                <div className="flex items-center gap-0.5 text-xs text-slate-400 font-mono ml-1">
                  <button
                    type="button"
                    onClick={() => handleMaxHopeChange(1)}
                    className="h-4 w-4 rounded bg-slate-800 hover:bg-slate-700 text-white leading-none"
                    title="增加上限"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMaxHopeChange(-1)}
                    className="h-4 w-4 rounded bg-slate-800 hover:bg-slate-700 text-white leading-none"
                    title="减少上限"
                  >
                    -
                  </button>
                </div>
              </div>
            </div>

            {/* 希望特性描述 */}
            <div className="text-xs text-slate-300 bg-[#0f0f22] p-2 rounded border border-slate-800 mt-2">
              <span className="text-[#FCEE0A] font-bold block mb-1">希望特性 / 机制:</span>
              <div className="text-slate-200 leading-relaxed text-[11px]">
                <CardMarkdown rehypePlugins={[rehypeRaw]}>
                  {hopeTraitText}
                </CardMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
