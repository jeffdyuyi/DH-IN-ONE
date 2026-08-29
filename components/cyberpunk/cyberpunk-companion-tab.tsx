"use client"

import React from 'react'
import { useSheetStore, useSafeSheetData } from '@/lib/sheet-store'
import { defaultSheetData } from '@/lib/default-sheet-data'
import { ImageUploadCrop } from '@/components/ui/image-upload-crop'
import {
  applyCharacterImageAssetAction,
} from '@/character/storage/character-image-actions'
import { getActiveCharacterId } from '@/lib/multi-character-storage'
import { Bot, Shield, Zap, Sparkles, HeartPulse, Swords, CheckSquare, Square } from 'lucide-react'

const MAX_STRESS = (formData: any) => Number(formData.companionStressMax) || 3
const TOTAL_STRESS = 6

interface CyberpunkCompanionTabProps {
  currentCharacterId?: string | null
}

export function CyberpunkCompanionTab({ currentCharacterId }: CyberpunkCompanionTabProps) {
  const { sheetData: formData, setSheetData: onFormDataChange, replaceSheetData } = useSheetStore()
  const safeFormData = useSafeSheetData()

  const handleCompanionImageChange = async (imageBase64: string) => {
    if (!currentCharacterId) {
      onFormDataChange({ ...useSheetStore.getState().sheetData, companionImage: imageBase64 })
      return
    }

    try {
      const currentSheet = useSheetStore.getState().sheetData
      await applyCharacterImageAssetAction({
        characterId: currentCharacterId,
        role: 'companion',
        imageDataUrl: imageBase64,
        sheetData: currentSheet,
        getCurrentCharacterId: getActiveCharacterId,
        getCurrentSheetData: () => useSheetStore.getState().sheetData,
        replaceSheetData,
      })
    } catch (error) {
      console.error(`[CharacterImage] Failed to update companion image for ${currentCharacterId}:`, error)
      alert('伙伴图像保存失败')
    }
  }

  // 训练选项复选框渲染
  const renderTrainingOption = (
    mainText: string,
    namePrefix: keyof NonNullable<typeof safeFormData.trainingOptions>,
    checkboxCount: number
  ) => {
    const parts = mainText.split(/：|:/)
    const title = parts[0]
    const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : ''
    const arr = safeFormData.trainingOptions?.[namePrefix] || []

    return (
      <div className="flex items-start gap-2.5 p-2 rounded-lg border border-[#6C00FF]/25 bg-[#0B0320] text-xs">
        {/* 复选框组 */}
        <div className="flex items-center gap-1 shrink-0 pt-0.5">
          {Array(checkboxCount)
            .fill(0)
            .map((_, i) => {
              const checked = arr[i] || false
              return (
                <button
                  key={`${namePrefix}-${i}`}
                  type="button"
                  onClick={() => {
                    const newArr = [...arr]
                    newArr[i] = !newArr[i]
                    onFormDataChange({
                      ...formData,
                      trainingOptions: {
                        ...defaultSheetData.trainingOptions,
                        ...safeFormData.trainingOptions,
                        [namePrefix]: newArr,
                      } as any,
                    })
                  }}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    checked
                      ? 'bg-[#00FFA3] border-[#00FFA3] text-black shadow-[0_0_8px_rgba(0,255,163,0.4)]'
                      : 'border-[#6C00FF]/40 bg-[#12072B] hover:border-[#00FFA3]/60 text-transparent'
                  }`}
                >
                  <span className="text-[10px] font-bold">✓</span>
                </button>
              )
            })}
        </div>

        {/* 标题与描述 */}
        <div className="flex-1 leading-relaxed">
          <span className="font-bold text-white mr-1.5">{title}</span>
          {desc && <span className="text-slate-300 text-[11px]">{desc}</span>}
        </div>
      </div>
    )
  }

  // 压力格渲染
  const renderStressBoxes = () => {
    const max = MAX_STRESS(formData)
    const stressArr = Array.isArray(safeFormData.companionStress)
      ? safeFormData.companionStress.slice(0, TOTAL_STRESS)
      : Array(TOTAL_STRESS).fill(false)

    return (
      <div className="flex gap-1.5 flex-wrap items-center">
        {Array(TOTAL_STRESS)
          .fill(0)
          .map((_, i) => {
            const isUnlocked = i < max
            const isChecked = stressArr[i] || false
            return (
              <button
                key={`comp-stress-${i}`}
                type="button"
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    const newArr = [...stressArr]
                    newArr[i] = !newArr[i]
                    onFormDataChange({ ...formData, companionStress: newArr })
                  }
                }}
                className={`w-5 h-5 rounded border flex items-center justify-center font-mono text-xs font-bold transition-all ${
                  !isUnlocked
                    ? 'border-slate-700 bg-slate-800/40 text-slate-600 border-dashed cursor-not-allowed'
                    : isChecked
                    ? 'border-[#FF007F] bg-[#FF007F] text-black shadow-[0_0_10px_rgba(255,0,127,0.5)]'
                    : 'border-[#6C00FF]/50 bg-[#0B0320] hover:border-[#FF007F]/60 text-slate-400'
                }`}
              >
                {isChecked ? '✕' : i + 1}
              </button>
            )
          })}
      </div>
    )
  }

  return (
    <div className="space-y-4 font-sans text-slate-100">
      {/* 1. 顶部基础身份栏与闪避 */}
      <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[220px]">
            <div className="p-2 rounded-lg bg-[#00FFA3]/10 border border-[#00FFA3]/30 text-[#00FFA3]">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-400 font-bold block">伙伴名称 / 战术代号</label>
              <input
                type="text"
                value={safeFormData.companionName || ''}
                onChange={(e) => onFormDataChange({ ...formData, companionName: e.target.value })}
                placeholder="输入伙伴名称..."
                className="mt-0.5 w-full rounded border border-[#6C00FF]/40 bg-[#0B0320] px-2.5 py-1 text-xs font-bold text-[#F5F500] focus:border-[#00FFA3] focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* 闪避 (Evasion) 徽章 */}
          <div className="flex items-center gap-2 rounded-xl border border-[#00FFA3]/40 bg-[#0B0320] px-3.5 py-1.5 shadow-sm">
            <Shield className="w-4 h-4 text-[#00FFA3]" />
            <span className="text-xs font-bold text-slate-300">闪避 (Evasion):</span>
            <input
              type="text"
              value={safeFormData.companionEvasion || ''}
              onChange={(e) => onFormDataChange({ ...formData, companionEvasion: e.target.value })}
              placeholder="10"
              className="w-12 text-center bg-transparent border-b border-[#00FFA3]/50 focus:border-[#00FFA3] text-sm font-bold font-mono text-[#00FFA3] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. 伙伴立绘与经历画像 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* 伙伴立绘与描述 (4/12) */}
        <div className="lg:col-span-4 rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-[#00FFA3]" />
              <span>伙伴形象与描述</span>
            </span>
          </div>

          <div className="flex flex-col items-center">
            <ImageUploadCrop
              currentImage={safeFormData.companionImage}
              onImageChange={(imageBase64) => void handleCompanionImageChange(imageBase64)}
              onImageDelete={() => void handleCompanionImageChange('')}
              width="10rem"
              height="10rem"
              placeholder={{ title: '伙伴立绘', subtitle: '点击上传' }}
              inputId="companion-image-upload"
              className="mb-3 rounded-lg border border-[#6C00FF]/40 overflow-hidden shadow-inner"
            />

            <textarea
              rows={4}
              value={safeFormData.companionDescription || ''}
              onChange={(e) => onFormDataChange({ ...formData, companionDescription: e.target.value })}
              placeholder="伙伴性格、外貌特征、机械构装细节..."
              className="w-full text-xs border border-[#6C00FF]/40 rounded-lg p-2.5 bg-[#0B0320] text-slate-200 focus:border-[#00FFA3] focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* 伙伴经历 (8/12) */}
        <div className="lg:col-span-8 rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 shadow-md space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F5F500]" />
              <span>伙伴经历 (Experiences)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">描述与加值加成</span>
          </div>

          <div className="space-y-2">
            {(safeFormData.companionExperience || ['', '', '', '', '']).map((exp, i) => (
              <div key={`comp-exp-${i}`} className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500 w-5 text-right">{i + 1}.</span>
                <input
                  type="text"
                  value={exp || ''}
                  onChange={(e) => {
                    const newArr = [...(safeFormData.companionExperience || ['', '', '', '', ''])]
                    newArr[i] = e.target.value
                    onFormDataChange({ ...formData, companionExperience: newArr })
                  }}
                  className="flex-1 border border-[#6C00FF]/30 rounded-lg bg-[#0B0320] px-2.5 py-1 text-xs text-white focus:border-[#00FFA3] focus:outline-none"
                  placeholder={`伙伴经历描述 ${i + 1}...`}
                />
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono">+</span>
                  <input
                    type="text"
                    value={(safeFormData.companionExperienceValue || ['', '', '', '', ''])[i] || ''}
                    onChange={(e) => {
                      const newArr = [...(safeFormData.companionExperienceValue || ['', '', '', '', ''])]
                      newArr[i] = e.target.value
                      onFormDataChange({ ...formData, companionExperienceValue: newArr })
                    }}
                    className="w-12 border border-[#6C00FF]/30 rounded-lg bg-[#0B0320] px-1 py-1 text-xs text-center font-bold text-[#F5F500] font-mono focus:border-[#00FFA3] focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 pt-1 leading-relaxed border-t border-[#6C00FF]/20 mt-2">
            💡 进行<strong>施法掷骰</strong>与伙伴建立联系并指挥行动。花费 <strong>1 希望点</strong>可将适用的伙伴经历加入掷骰中。
          </p>
        </div>
      </div>

      {/* 3. 战斗属性（攻击、伤害骰、压力）与训练升级 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* 左栏 (5/12)：攻击与伤害 + 压力槽 */}
        <div className="lg:col-span-5 space-y-4">
          {/* 攻击与伤害 */}
          <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-[#00FFA3]" />
                <span>攻击与伤害</span>
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">攻击方式与范围</label>
                <input
                  type="text"
                  value={safeFormData.companionWeapon || ''}
                  onChange={(e) => onFormDataChange({ ...formData, companionWeapon: e.target.value })}
                  placeholder="例如: 电能爪击 / 近战"
                  className="w-full rounded-lg border border-[#6C00FF]/40 bg-[#0B0320] px-2.5 py-1 text-xs text-white focus:border-[#00FFA3] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">伤害骰</label>
                <div className="flex gap-2">
                  {['D6', 'D8', 'D10', 'D12'].map((r) => {
                    const isSelected = safeFormData.companionRange === r
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => onFormDataChange({ ...formData, companionRange: r })}
                        className={`flex-1 py-1 rounded-lg border text-xs font-bold font-mono transition-all ${
                          isSelected
                            ? 'bg-[#00FFA3] text-black border-[#00FFA3] shadow-[0_0_10px_rgba(0,255,163,0.5)]'
                            : 'border-[#6C00FF]/40 bg-[#0B0320] text-slate-300 hover:text-white hover:border-[#6C00FF]'
                        }`}
                      >
                        {r}
                      </button>
                    )
                  })}
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                伙伴攻击时适用你的增益效果（如专注）。成功时使用你的熟练度和其伤害骰。
              </p>
            </div>
          </div>

          {/* 压力槽 (Companion Stress) */}
          <div className="rounded-xl border border-[#FF007F]/30 bg-[#12072B] p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-[#FF007F]/20 pb-2">
              <span className="text-xs font-bold text-[#FF007F] flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5" />
                <span>伙伴压力槽 (Stress)</span>
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold">上限:</span>
                <input
                  type="number"
                  min={1}
                  max={TOTAL_STRESS}
                  value={safeFormData.companionStressMax || 3}
                  onChange={(e) => onFormDataChange({ ...formData, companionStressMax: Number(e.target.value) })}
                  className="w-10 text-center border border-[#FF007F]/40 rounded bg-[#0B0320] text-xs font-bold font-mono text-[#FF007F] focus:outline-none"
                />
              </div>
            </div>

            <div className="py-1">{renderStressBoxes()}</div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              伙伴受到伤害时标记 1 点压力。槽满时脱离场景，长休时返回并清除 1 点压力。对自己使用“清除压力”时伙伴同步清除。
            </p>
          </div>
        </div>

        {/* 右栏 (7/12)：训练与升级选项 */}
        <div className="lg:col-span-7 rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 shadow-md space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#F5F500]" />
              <span>伙伴训练与专精 (Training)</span>
            </span>
            <span className="text-[10px] text-slate-400">角色升级时勾选</span>
          </div>

          <div className="space-y-1.5">
            {renderTrainingOption('聪慧：一项经历获得 +1。', 'intelligent', 3)}
            {renderTrainingOption('黑暗中的光芒：你的角色获得额外一个希望槽。', 'radiantInDarkness', 1)}
            {renderTrainingOption(
              '生物慰藉：短休一次，给予伙伴关注时双方可清除一点压力或获得一点希望。',
              'creatureComfort',
              1
            )}
            {renderTrainingOption('装甲：当伙伴受伤害时，可标记一格自身护甲槽代替伙伴标记压力。', 'armored', 1)}
            {renderTrainingOption('凶猛：增加伙伴的伤害骰（如d6到d8）或攻击范围一个等级。', 'vicious', 3)}
            {renderTrainingOption('坚韧：增加一个额外的压力槽。', 'resilient', 3)}
            {renderTrainingOption(
              '羁绊：标记最后生命槽时，伙伴冲向身边安慰你。掷可用压力数量d6，若有6则清除最后生命槽并振作重返场景。',
              'bonded',
              1
            )}
            {renderTrainingOption('警觉：伙伴的闪避 +2。', 'aware', 3)}
          </div>
        </div>
      </div>
    </div>
  )
}
