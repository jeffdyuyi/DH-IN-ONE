"use client"

import React from 'react'
import { useSheetStore } from '@/lib/sheet-store'
import { useCardStore } from '@/card/stores/unified-card-store'
import type { StandardCard } from '@/card/card-types'
import { Heart, Activity, Sparkles, Shield, Zap, Plus, Minus, Compass } from 'lucide-react'
import { CardMarkdown } from '@/components/ui/card-markdown'
import rehypeRaw from 'rehype-raw'
import { CyberpunkThresholdDisplay } from './cyberpunk-threshold-display'

type AttributeKey = 'agility' | 'strength' | 'finesse' | 'instinct' | 'presence' | 'knowledge'

const ATTRIBUTES: { key: AttributeKey; label: string; abbr: string }[] = [
  { key: 'agility', label: '敏捷', abbr: 'AGI' },
  { key: 'strength', label: '力量', abbr: 'STR' },
  { key: 'finesse', label: '灵巧', abbr: 'FIN' },
  { key: 'instinct', label: '本能', abbr: 'INS' },
  { key: 'presence', label: '风度', abbr: 'PRE' },
  { key: 'knowledge', label: '知识', abbr: 'KNO' },
]

import type { CyberpunkSheetExtension } from '@/types/cyberpunk'

interface CyberpunkAttributesHopePanelProps {
  cyberpunkData?: CyberpunkSheetExtension
}

export function CyberpunkAttributesHopePanel({ cyberpunkData: propCyberpunkData }: CyberpunkAttributesHopePanelProps = {}) {
  const { sheetData: formData, setSheetData, updateHope } = useSheetStore()
  const cardStore = useCardStore()
  const effectiveCyberpunkData = propCyberpunkData || formData.cyberpunk

  // 获取职业卡
  let professionCard: StandardCard | undefined = undefined
  if (formData.professionRef?.id) {
    professionCard =
      cardStore.getCardById(formData.professionRef.id) ||
      (Array.isArray(formData.cards)
        ? formData.cards.find((c) => c && c.id === formData.professionRef?.id)
        : undefined)
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
  const evasionValue =
    formData.evasion !== undefined && formData.evasion !== ''
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

  const armorSlot = formData.equipment?.armorSlot
  const equippedArmorName = armorSlot?.name

  return (
    <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 text-slate-100 font-sans shadow-[0_4px_20px_rgba(11,3,32,0.6)] space-y-4">
      {/* 1. 顶部：六维基础属性 */}
      <div>
        <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#F5F500]" />
            <h3 className="text-sm font-bold text-white tracking-wide">六维属性 (Attributes)</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {ATTRIBUTES.map(({ key, label, abbr }) => {
            const val = getAttrValue(key)

            return (
              <div
                key={key}
                className="flex flex-col justify-between rounded-lg border border-[#6C00FF]/30 bg-[#0B0320] p-2.5 hover:border-[#00FFA3]/50 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{label}</span>
                  <span className="text-[10px] text-[#F5F500] font-mono font-bold">({abbr})</span>
                </div>

                <div className="mt-2 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => handleAttrChange(key, val - 1)}
                    className="flex h-6 w-6 items-center justify-center rounded bg-[#12072B] border border-[#6C00FF]/30 text-slate-300 hover:border-[#FF007F] hover:text-[#FF007F] transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>

                  <input
                    type="number"
                    value={val}
                    onChange={(e) => handleAttrChange(key, parseInt(e.target.value, 10) || 0)}
                    className="w-12 text-center text-lg font-bold text-[#00FFA3] font-mono bg-transparent border-b border-[#6C00FF]/40 focus:border-[#00FFA3] focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => handleAttrChange(key, val + 1)}
                    className="flex h-6 w-6 items-center justify-center rounded bg-[#12072B] border border-[#6C00FF]/30 text-slate-300 hover:border-[#00FFA3] hover:text-[#00FFA3] transition-colors"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-[#6C00FF]/20 pt-3">
        {/* 生命值 HP */}
        <div className="rounded-lg border border-[#00FFA3]/40 bg-[#0B0320] p-3 flex flex-col justify-between shadow-[0_0_12px_rgba(0,255,163,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#00FFA3] flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 fill-[#00FFA3]/20" />
              <span>生命值 (HP)</span>
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <span>上限: {maxHp}</span>
              <button
                type="button"
                onClick={() => handleMaxHpChange(1)}
                className="h-4 w-4 rounded bg-[#12072B] border border-[#6C00FF]/40 text-xs leading-none hover:bg-[#00FFA3] hover:text-black text-white transition-colors"
                title="增加生命上限"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => handleMaxHpChange(-1)}
                className="h-4 w-4 rounded bg-[#12072B] border border-[#6C00FF]/40 text-xs leading-none hover:bg-[#FF007F] hover:text-white text-white transition-colors"
                title="减少生命上限"
              >
                -
              </button>
            </div>
          </div>

          <div className="my-2.5 flex flex-wrap items-center gap-1.5">
            {Array.from({ length: maxHp }).map((_, idx) => {
              const isHealthy = idx < currentHp
              return (
                <button
                  key={`hp_${idx}`}
                  type="button"
                  onClick={() => handleHpChange(isHealthy && idx === currentHp - 1 ? idx : idx + 1)}
                  className={`h-5 w-5 rounded-full border transition-all ${
                    isHealthy
                      ? 'bg-[#00FFA3] border-[#00FFA3] shadow-[0_0_8px_rgba(0,255,163,0.7)]'
                      : 'bg-black/60 border-slate-700 hover:border-[#00FFA3]'
                  }`}
                  title={`生命点 ${idx + 1}/${maxHp}`}
                />
              )
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
            <span>当前: <strong className="text-[#00FFA3]">{currentHp}</strong> / {maxHp}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleHpChange(currentHp - 1)}
                className="rounded bg-[#FF007F]/20 text-[#FF007F] border border-[#FF007F]/40 px-2 py-0.5 text-[10px] hover:bg-[#FF007F] hover:text-white transition-colors"
              >
                -1 伤
              </button>
              <button
                type="button"
                onClick={() => handleHpChange(currentHp + 1)}
                className="rounded bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00FFA3]/40 px-2 py-0.5 text-[10px] hover:bg-[#00FFA3] hover:text-black transition-colors"
              >
                +1 愈
              </button>
            </div>
          </div>
        </div>

        {/* 压力值 Stress */}
        <div className="rounded-lg border border-[#FF007F]/40 bg-[#0B0320] p-3 flex flex-col justify-between shadow-[0_0_12px_rgba(255,0,127,0.06)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#FF007F] flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              <span>压力值 (Stress)</span>
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <span>上限: {maxStress}</span>
              <button
                type="button"
                onClick={() => handleMaxStressChange(1)}
                className="h-4 w-4 rounded bg-[#12072B] border border-[#6C00FF]/40 text-xs leading-none hover:bg-[#FF007F] hover:text-white text-white transition-colors"
                title="增加压力上限"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => handleMaxStressChange(-1)}
                className="h-4 w-4 rounded bg-[#12072B] border border-[#6C00FF]/40 text-xs leading-none hover:bg-slate-700 text-white transition-colors"
                title="减少压力上限"
              >
                -
              </button>
            </div>
          </div>

          <div className="my-2.5 flex flex-wrap items-center gap-1.5">
            {Array.from({ length: maxStress }).map((_, idx) => {
              const isFilled = idx < currentStress
              return (
                <button
                  key={`stress_${idx}`}
                  type="button"
                  onClick={() => handleStressChange(isFilled && idx === currentStress - 1 ? idx : idx + 1)}
                  className={`h-5 w-5 rounded border transition-all ${
                    isFilled
                      ? 'bg-[#FF007F] border-[#FF007F] shadow-[0_0_8px_rgba(255,0,127,0.7)]'
                      : 'bg-black/60 border-slate-700 hover:border-[#FF007F]'
                  }`}
                  title={`压力 ${idx + 1}/${maxStress}`}
                />
              )
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
            <span>当前: <strong className="text-[#FF007F]">{currentStress}</strong> / {maxStress}</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleStressChange(currentStress - 1)}
                className="rounded bg-slate-800 text-slate-300 px-2 py-0.5 text-[10px] hover:bg-slate-700"
              >
                -1 压
              </button>
              <button
                type="button"
                onClick={() => handleStressChange(currentStress + 1)}
                className="rounded bg-[#FF007F]/20 text-[#FF007F] border border-[#FF007F]/40 px-2 py-0.5 text-[10px] hover:bg-[#FF007F] hover:text-white"
              >
                +1 压
              </button>
            </div>
          </div>
        </div>

        {/* 闪避值 Evasion */}
        <div className="rounded-lg border border-[#6C00FF]/30 bg-[#0B0320] p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-[#00FFA3]" />
              <span>闪避值 (Evasion)</span>
            </span>
          </div>
          <div className="my-1 text-center">
            <input
              type="text"
              value={evasionValue}
              onChange={(e) => setSheetData((prev) => ({ ...prev, evasion: e.target.value }))}
              className="w-16 text-center text-2xl font-black text-[#00FFA3] font-mono bg-transparent border-b border-[#6C00FF]/40 focus:border-[#00FFA3] focus:outline-none"
            />
          </div>
          <div className="text-[10px] text-slate-400 text-center font-mono">
            职业起始: {defaultEvasion} (自动计算)
          </div>
        </div>

        {/* 熟练度 Proficiency */}
        <div className="rounded-lg border border-[#6C00FF]/30 bg-[#0B0320] p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#F5F500]" />
              <span>熟练度 (Proficiency)</span>
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <button
                type="button"
                onClick={() => handleProficiencyChange(proficiencyCount + 1)}
                className="h-4 w-4 rounded bg-[#12072B] border border-[#6C00FF]/40 text-xs leading-none hover:bg-[#F5F500] hover:text-black text-white transition-colors"
                title="增加熟练度"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => handleProficiencyChange(proficiencyCount - 1)}
                className="h-4 w-4 rounded bg-[#12072B] border border-[#6C00FF]/40 text-xs leading-none hover:bg-slate-700 text-white transition-colors"
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
                      ? 'bg-[#F5F500] border-[#F5F500] shadow-[0_0_8px_#F5F500]'
                      : 'bg-black/60 border-slate-700 hover:border-[#F5F500]'
                  }`}
                  title={`熟练度 ${i + 1}/6`}
                />
              )
            })}
          </div>

          <div className="text-center font-mono">
            <span className="text-xs text-[#F5F500] font-bold">当前熟练度: {proficiencyCount}</span>
          </div>
        </div>
      </div>

      {/* 3. 核心布局调整：伤害阈值展示（放在生命值之下，希望和经历栏之上） */}
      <div className="border-t border-[#6C00FF]/20 pt-3">
        <CyberpunkThresholdDisplay
          cyberpunkData={effectiveCyberpunkData}
          armorMinor={armorSlot?.baseThresholds?.minor || 0}
          armorMajor={armorSlot?.baseThresholds?.major || 0}
          equippedArmorName={equippedArmorName}
        />
      </div>

      {/* 4. 底部：希望点 (Hope Points) 与 经历 (Experiences) 协同矩阵 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 border-t border-[#6C00FF]/20 pt-3">
        {/* 希望点面板 (Hope Points) - 占 6/12 */}
        <div className="lg:col-span-6 rounded-lg border border-[#6C00FF]/30 bg-[#0B0320] p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-1.5 mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#00FFA3]" />
                <h4 className="text-xs font-bold text-white tracking-wide">希望点 (Hope)</h4>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <span>上限: {hopeMax}</span>
                <button
                  type="button"
                  onClick={() => handleMaxHopeChange(1)}
                  className="h-4 w-4 rounded bg-[#12072B] border border-[#6C00FF]/40 text-xs leading-none hover:bg-[#00FFA3] hover:text-black text-white transition-colors"
                  title="增加希望上限"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => handleMaxHopeChange(-1)}
                  className="h-4 w-4 rounded bg-[#12072B] border border-[#6C00FF]/40 text-xs leading-none hover:bg-slate-700 text-white transition-colors"
                  title="减少希望上限"
                >
                  -
                </button>
              </div>
            </div>

            {/* 菱形交互槽位 */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 py-2">
              {Array.from({ length: hopeMax }).map((_, index) => {
                const isFilled = index < currentHope
                return (
                  <button
                    key={`hope_${index}`}
                    type="button"
                    onClick={() => handleHopeSlotClick(index)}
                    className={`h-5 w-5 transform rotate-45 border transition-all duration-200 ${
                      isFilled
                        ? 'bg-[#00FFA3] border-[#00FFA3] shadow-[0_0_10px_#00FFA3]'
                        : 'bg-black/60 border-slate-700 hover:border-[#00FFA3]'
                    }`}
                    title={`希望点 ${index + 1}/${hopeMax}`}
                  />
                )
              })}
            </div>

            {/* 希望特性文案 (Markdown 渲染) */}
            <div className="mt-2 rounded bg-[#12072B] p-2 border border-[#6C00FF]/25 text-xs text-slate-300">
              <div className="font-bold text-[#00FFA3] text-[11px] mb-1 flex items-center gap-1">
                <span>✦ 职业希望特性:</span>
              </div>
              <div className="text-[11px] leading-relaxed max-h-24 overflow-y-auto pr-1">
                <CardMarkdown>{hopeTraitText}</CardMarkdown>
              </div>
            </div>
          </div>

          <div className="mt-2 text-right text-[10px] text-slate-400 font-mono">
            当前希望: <strong className="text-[#00FFA3] font-bold">{currentHope}</strong> / {hopeMax}
          </div>
        </div>

        {/* 经历面板 (Experiences) - 占 6/12 */}
        <div className="lg:col-span-6 rounded-lg border border-[#6C00FF]/30 bg-[#0B0320] p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-1.5 mb-2">
              <div className="flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-[#F5F500]" />
                <h4 className="text-xs font-bold text-white tracking-wide">经历 (Experiences)</h4>
              </div>
              <span className="text-[10px] text-slate-400">最多 5 项经历</span>
            </div>

            {/* 经历列表：默认空白，无占位符 */}
            <div className="space-y-1.5">
              {Array.from({ length: 5 }).map((_, index) => {
                const text = experienceTexts[index] || ''
                const val = experienceValues[index] || ''

                return (
                  <div
                    key={`exp_${index}`}
                    className="flex items-center gap-2 rounded bg-[#12072B] px-2 py-1 border border-[#6C00FF]/20 hover:border-[#F5F500]/50 transition-colors"
                  >
                    <span className="text-[10px] font-mono text-[#F5F500] font-bold w-3.5">
                      #{index + 1}
                    </span>

                    <input
                      type="text"
                      value={text}
                      onChange={(e) => handleExperienceTextChange(index, e.target.value)}
                      placeholder=""
                      className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none"
                    />

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-mono">+</span>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleExperienceValueChange(index, e.target.value)}
                        placeholder="0"
                        className="w-8 text-center text-xs font-bold font-mono text-[#F5F500] bg-transparent border-b border-[#6C00FF]/40 focus:border-[#F5F500] focus:outline-none"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-2 text-right text-[10px] text-slate-400">
            掷骰时可消耗 1 点希望调用经历加值
          </div>
        </div>
      </div>
    </div>
  )
}
