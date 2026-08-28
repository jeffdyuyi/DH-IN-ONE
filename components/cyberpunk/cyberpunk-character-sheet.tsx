"use client"

import React, { useState, useEffect } from 'react'
import type { SheetData } from '../../lib/sheet-data'
import type { CyberpunkSheetExtension } from '../../types/cyberpunk'
import { defaultSheetData } from '../../lib/default-sheet-data'
import { loadCharacterSheet, saveCharacterSheet } from '../../character/storage/character-save-storage'
import { loadCharacterList } from '../../lib/multi-character-storage'
import { CyberpunkTopBar } from './cyberpunk-top-bar'
import { CyberpunkAttributesHopePanel } from './cyberpunk-attributes-hope-panel'
import { CyberpunkZonePanel } from './cyberpunk-zone-panel'
import { CyberpunkThresholdDisplay } from './cyberpunk-threshold-display'
import { CyberpunkConsumablesBar } from './cyberpunk-consumables-bar'
import { CyberpunkIllegalModPanel } from './cyberpunk-illegal-mod-panel'
import { CyberpunkFeaturesDetailPanel } from './cyberpunk-features-detail-panel'
import { CyberpunkDomainDeck } from './cyberpunk-domain-deck'
import { CyberpunkEquipActivation } from './cyberpunk-equip-activation'

export function CyberpunkCharacterSheet() {
  const [formData, setFormData] = useState<SheetData>(defaultSheetData)
  const [isLightPreview, setIsLightPreview] = useState<boolean>(false)
  const [saveName, setSaveName] = useState<string>('默认角色')
  const [currentCharacterId, setCurrentCharacterId] = useState<string | null>(null)
  const [saveToast, setSaveToast] = useState<boolean>(false)

  // 初始化加载当前活动角色
  useEffect(() => {
    const list = loadCharacterList()
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const queryId = urlParams?.get('id')
    const targetId = queryId || list.activeCharacterId || list.characters[0]?.id

    if (targetId) {
      setCurrentCharacterId(targetId)
      const meta = list.characters.find(c => c.id === targetId)
      if (meta) setSaveName(meta.saveName)

      loadCharacterSheet(targetId).then((sheet) => {
        if (sheet) {
          setFormData(sheet)
        }
      })
    }
  }, [])

  // 保存当前角色卡
  const handleSave = async () => {
    if (!currentCharacterId) return
    try {
      await saveCharacterSheet(currentCharacterId, formData)
      setSaveToast(true)
      setTimeout(() => setSaveToast(false), 2000)
    } catch (e) {
      console.error('Failed to save cyberpunk character sheet:', e)
    }
  }

  // 爽博朋克特化数据更新
  const cyberpunkData: CyberpunkSheetExtension = formData?.cyberpunkData || {
    tier: 'T1',
    credits: 0,
    zones: {},
    illegalMods: [],
    consumables: [],
  }

  const handleCyberpunkChange = (updated: CyberpunkSheetExtension) => {
    setFormData((prev) => ({
      ...prev,
      cyberpunkData: updated,
    }))
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      isLightPreview
        ? 'bg-slate-100 text-slate-900 selection:bg-amber-400 selection:text-black'
        : 'bg-[#0B0320] text-slate-100 selection:bg-[#FF007F] selection:text-white'
    }`}>
      {/* 顶部主导航栏 */}
      <CyberpunkTopBar
        characterName={formData.name}
        saveName={saveName}
        level={formData.level || '1'}
        isLightPreview={isLightPreview}
        onToggleLightPreview={() => setIsLightPreview(!isLightPreview)}
        onSave={handleSave}
      />

      {/* 主体页面内容 (第 1 页: 核心战斗机体) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 1. 角色基本身份行 */}
        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">角色姓名</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#00FFA3]"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">职业 / 职能定位</label>
            <input
              type="text"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#00FFA3]"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">社群 / 派系背景</label>
            <input
              type="text"
              value={formData.community}
              onChange={(e) => setFormData({ ...formData, community: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">等级 (Level)</label>
            <input
              type="text"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
            />
          </div>
        </div>

        {/* 2. 六维属性与状态资源 (HP/压力/希望点/闪避) */}
        <CyberpunkAttributesHopePanel
          formData={formData}
          setFormData={setFormData}
          calculatedEvasion={Number(formData.evasion) || 10}
        />

        {/* 3. 战术护甲与伤害阈值 */}
        <CyberpunkThresholdDisplay
          armorScore={Number(formData.armorMax) || 3}
          minorThreshold={Number(formData.minorThreshold) || 1}
          majorThreshold={Number(formData.majorThreshold) || 6}
          severeThreshold={13}
        />

        {/* 4. 身体 5 大区改造插槽 (支持跨画风挑选战利品) */}
        <CyberpunkZonePanel
          cyberpunkData={cyberpunkData}
          onChange={handleCyberpunkChange}
        />

        {/* 分页标记：用于 A4 打印两页式契约 */}
        <div className="cyberpunk-page-break" />

        {/* 5. 随身 4 格消耗品快捷栏 */}
        <CyberpunkConsumablesBar
          consumables={cyberpunkData.consumables as any}
          onChange={(items) => handleCyberpunkChange({ ...cyberpunkData, consumables: items as any })}
        />

        {/* 6. 黑市非法改造与神经代价 */}
        <CyberpunkIllegalModPanel
          mods={cyberpunkData.illegalMods as any}
          onChange={(items) => handleCyberpunkChange({ ...cyberpunkData, illegalMods: items as any })}
        />

        {/* 7. 领域法术与网络协议手牌 */}
        <CyberpunkDomainDeck
          cards={formData.cards || []}
        />

        {/* 8. 角色核心特性详细文案 */}
        <CyberpunkFeaturesDetailPanel
          cards={formData.cards}
        />
      </main>
    </div>
  )
}
