"use client"

import React, { useState, useEffect } from 'react'
import { useSheetStore, type WeaponSelectionInput, type ArmorSelectionInput } from '@/lib/sheet-store'
import type { CyberpunkSheetExtension } from '@/types/cyberpunk'
import {
  DEFAULT_CYBERPUNK_EXTENSION,
  CYBERPUNK_TIER_SLOTS,
  CYBERPUNK_TIER_EQUIP_SLOTS,
} from '@/lib/cyberpunk/tier-constants'
import { CardType, type StandardCard } from '@/card/card-types'
import { useCardStore } from '@/card/stores/unified-card-store'

// 爽博朋克专有组件
import { CyberpunkTopBar } from './cyberpunk-top-bar'
import { CyberpunkThresholdDisplay } from './cyberpunk-threshold-display'
import { CyberpunkAttributesHopePanel } from './cyberpunk-attributes-hope-panel'
import { CyberpunkFeaturesDetailPanel } from './cyberpunk-features-detail-panel'
import { CyberpunkConsumablesBar } from './cyberpunk-consumables-bar'
import { CyberpunkIllegalModPanel } from './cyberpunk-illegal-mod-panel'
import { CyberpunkDomainDeck } from './cyberpunk-domain-deck'
import { CyberpunkEquipmentHud } from './cyberpunk-equipment-hud'
import { CyberpunkExternalGearPanel } from './cyberpunk-external-gear-panel'
import { CyberpunkStoryTab } from './cyberpunk-story-tab'
import { CyberpunkNotebookTab } from './cyberpunk-notebook-tab'
import { CyberpunkCompanionTab } from './cyberpunk-companion-tab'
import { CyberpunkSheetModalsHost, type CyberpunkSheetModalsState } from './modals/cyberpunk-sheet-modals-host'
import { CyberpunkPrintRenderer, type CyberpunkPrintOptions } from './print/cyberpunk-print-renderer'
import type { CyberpunkExternalGear, CyberpunkAugmentation, CyberpunkBodyZoneKey } from '@/types/cyberpunk'
import './cyberpunk-light-minimal.css'

// 核心车卡器全局辅助组件
import { CharacterCreationGuide } from '@/components/guide/character-creation-guide'
import { FloatingNotebook } from '@/components/notebook'
import { SealDiceExportModal } from '@/components/modals/seal-dice-export-modal'
import { AnnouncementsModal } from '@/components/modals/announcements-modal'
import { BottomDock } from '@/components/layout/bottom-dock'
import { useCharacterManagement } from '@/hooks/use-character-management'
import { useExportHandlers } from '@/hooks/use-export-handlers'
import { announcements, isLatestAnnouncementRead, markLatestAnnouncementRead } from '@/lib/announcements'
import { saveCharacterSheet } from '@/character/storage/character-save-storage'
import { User, CheckCircle2, Shield, UserCheck, Cpu, BookOpen, Bot, ScrollText } from 'lucide-react'

export function CyberpunkCharacterSheet() {
  // Store 状态与动作
  const formData = useSheetStore((state) => state.sheetData)
  const setFormData = useSheetStore((state) => state.setSheetData)
  const selectCardForSlot = useSheetStore((state) => state.selectCardForSlot)
  const deleteCard = useSheetStore((state) => state.deleteCard)
  const selectCharacterChoiceCard = useSheetStore((state) => state.selectCharacterChoiceCard)
  const handleProfessionChange = useSheetStore((state) => state.handleProfessionChange)
  const selectWeapon = useSheetStore((state) => state.selectWeapon)
  const selectArmorSlot = useSheetStore((state) => state.selectArmorSlot)

  // 多分页控制：'profile' (档案与特性) | 'loadout' (装配与义体) | 'story' (角色故事) | 'companion' (战斗伙伴) | 'notes' (笔记)
  const [activeTab, setActiveTab] = useState<'profile' | 'loadout' | 'story' | 'companion' | 'notes'>('profile')

  // 身份特性面板选择固定开关 (锁定后隐藏更换按钮，防止误触)
  const [isFeaturesLocked, setIsFeaturesLocked] = useState(false)

  // 卡牌数据库 store
  const cardStore = useCardStore()

  // 默认使用极简浅色/黑白灰主题 (按用户要求默认开启)
  const [isLightPreview, setIsLightPreview] = useState(true)
  const [saveToast, setSaveToast] = useState(false)

  // 义体与外置装备模态框状态
  const [installAugModalOpen, setInstallAugModalOpen] = useState(false)
  const [activeZoneKey, setActiveZoneKey] = useState<CyberpunkBodyZoneKey>('upper_limb')
  const [installExternalGearModalOpen, setInstallExternalGearModalOpen] = useState(false)

  // 移动端检测
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window)
    }
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // 1. 多角色存档管理
  const [characterManagementModalOpen, setCharacterManagementModalOpen] = useState(false)
  const openCharacterManagementModal = () => setCharacterManagementModalOpen(true)
  const closeCharacterManagementModal = () => setCharacterManagementModalOpen(false)

  const {
    characterList,
    currentCharacterId,
    switchToCharacter,
    createNewCharacterHandler,
    createImportedCharacterHandler,
    deleteCharacterHandler,
    duplicateCharacterHandler,
    renameCharacterHandler,
    handleQuickCreateArchive,
    isLoading,
  } = useCharacterManagement({
    isClient: true,
    setCurrentTabValue: () => {},
  })

  // 2. 导出功能 Hook
  const {
    handlePrintAll,
    handleExportHTML,
    handleExportJSON,
    handleQuickExportPDF,
    handleQuickExportHTML,
    handleQuickExportJSON,
  } = useExportHandlers({
    formData,
    setIsPrintingAll: () => {},
  })

  // 3. 通用功能浮窗状态（建卡指引、骰子导出、更新公告）
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [sealDiceExportModalOpen, setSealDiceExportModalOpen] = useState(false)
  const [announcementsModalOpen, setAnnouncementsModalOpen] = useState(false)
  const [hasUnreadAnnouncements, setHasUnreadAnnouncements] = useState(false)

  useEffect(() => {
    setHasUnreadAnnouncements(!isLatestAnnouncementRead())
  }, [])

  const openAnnouncementsModal = () => {
    markLatestAnnouncementRead()
    setHasUnreadAnnouncements(false)
    setAnnouncementsModalOpen(true)
  }

  // 爽博朋克特化数据
  const cyberpunkData: CyberpunkSheetExtension = formData?.cyberpunkData || DEFAULT_CYBERPUNK_EXTENSION

  const handleCyberpunkChange = (updated: CyberpunkSheetExtension) => {
    setFormData((prev) => ({
      ...prev,
      campaignMode: 'cyberpunk',
      cyberpunkData: updated,
    }))
  }

  // 主动点击快速保存：真正写入持久化存档 (localStorage & IndexedDB)
  const handleQuickSave = async () => {
    if (currentCharacterId && formData) {
      try {
        await saveCharacterSheet(currentCharacterId, {
          ...formData,
          campaignMode: 'cyberpunk',
          cyberpunkData: formData.cyberpunkData || cyberpunkData,
        })
      } catch (err) {
        console.error('[CyberpunkSave] Failed to save character:', err)
      }
    }
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2000)
  }

  // 自动防抖保存：角色编辑变动时在后台静默保存
  useEffect(() => {
    if (!currentCharacterId || !formData || isLoading) return

    const timer = setTimeout(async () => {
      try {
        await saveCharacterSheet(currentCharacterId, {
          ...formData,
          campaignMode: 'cyberpunk',
          cyberpunkData: formData.cyberpunkData || cyberpunkData,
        })
      } catch (err) {
        console.error('[CyberpunkAutoSave] Failed to autosave character:', err)
      }
    }, 1200)

    return () => clearTimeout(timer)
  }, [currentCharacterId, formData, cyberpunkData, isLoading])

  // 4. 模态框集中状态管理
  const [modalsState, setModalsState] = useState<CyberpunkSheetModalsState>({
    genericModal: { isOpen: false, type: 'profession' },
    domainModal: { isOpen: false, slotIndex: 5, isVault: false },
    weaponModalOpen: false,
    activeWeaponSlot: 'primary',
    armorModalOpen: false,
    installAugModalOpen: false,
    activeZoneKey: 'head',
    installExternalGearModalOpen: false,
    characterManagementModalOpen: false,
    printModalOpen: false,
  })

  // 5. A4 实体印刷与战术卡牌导出状态
  const [printOptions, setPrintOptions] = useState<CyberpunkPrintOptions>({
    includeDossier: true,
    includeGearCards: true,
    includeDomainCards: true,
    includeCompanionStory: Boolean(formData?.companionName),
  })

  const handleTriggerPrint = (opts: CyberpunkPrintOptions) => {
    setPrintOptions(opts)
    setTimeout(() => {
      window.print()
    }, 60)
  }

  // 处理通用卡牌库选择（种族/职业/社群/子职业）
  const handleGenericCardSelect = (cardId: string, field?: string) => {
    const card = cardStore.getCardById(cardId)
    if (!card) return

    if (modalsState.genericModal.type === 'profession') {
      let fullName = card.name
      if (card.cardSelectDisplay?.item1 && card.cardSelectDisplay?.item2) {
        fullName = `${card.name} - ${card.cardSelectDisplay.item1}&${card.cardSelectDisplay.item2}`
      }
      handleProfessionChange({ id: card.id, name: fullName }, card)
      setFormData((prev) => ({
        ...prev,
        profession: card.name,
      }))
    } else if (modalsState.genericModal.type === 'ancestry' && field) {
      const kind = field === 'ancestry1' ? 'ancestry1' : 'ancestry2'
      selectCharacterChoiceCard(kind, { id: card.id, name: card.name }, card)
      setFormData((prev) => ({
        ...prev,
        [field]: card.name,
      }))
    } else if (modalsState.genericModal.type === 'community') {
      selectCharacterChoiceCard('community', { id: card.id, name: card.name }, card)
      setFormData((prev) => ({
        ...prev,
        community: card.name,
      }))
    } else if (modalsState.genericModal.type === 'subclass') {
      selectCharacterChoiceCard('subclass', { id: card.id, name: card.name }, card)
      setFormData((prev) => ({
        ...prev,
        subclass: card.name,
      }))
    }

    setModalsState((prev) => ({
      ...prev,
      genericModal: { ...prev.genericModal, isOpen: false },
    }))
  }

  // 处理领域卡选择与删除
  const handleDomainCardSelect = (cardId: string, slotIndex: number, isVault: boolean) => {
    const card = cardStore.getCardById(cardId)
    if (!card) return
    selectCardForSlot({
      zone: isVault ? 'vault' : 'loadout',
      index: slotIndex,
      template: card,
    })
    setModalsState((prev) => ({
      ...prev,
      domainModal: { ...prev.domainModal, isOpen: false },
    }))
  }

  const handleDomainCardRemove = (index: number, isVault = false) => {
    deleteCard(index, isVault)
  }

  // 处理武器与护甲选择
  const handleWeaponSelect = (input: WeaponSelectionInput, slotKey: 'primary' | 'secondary') => {
    selectWeapon({ slotType: slotKey }, input)
    setModalsState((prev) => ({ ...prev, weaponModalOpen: false }))
  }

  const handleArmorSelect = (input: ArmorSelectionInput) => {
    selectArmorSlot(input)
    setModalsState((prev) => ({ ...prev, armorModalOpen: false }))
  }

  // 将外置装备快速挂载到作战主手/副手武器插槽
  const handleEquipExternalToCombatWeapon = (slot: 'primary' | 'secondary', gear: CyberpunkExternalGear) => {
    const traitMap: Record<string, string> = {
      '敏捷': 'agility',
      '力量': 'strength',
      '灵巧': 'finesse',
      '本能': 'instinct',
      '风度': 'presence',
      '知识': 'knowledge',
    }

    const isTrans = Boolean(gear.active && gear.activeTransposition?.weaponStats)
    const effectiveDamage = (isTrans && gear.activeTransposition?.weaponStats?.damage)
      ? gear.activeTransposition.weaponStats.damage
      : (gear.weaponStats?.damage || 'd8')
    const effectiveRange = (isTrans && gear.activeTransposition?.weaponStats?.range)
      ? gear.activeTransposition.weaponStats.range
      : (gear.weaponStats?.range || '近战')
    const effectiveTraitStr = (isTrans && gear.activeTransposition?.weaponStats?.trait)
      ? gear.activeTransposition.weaponStats.trait
      : (gear.weaponStats?.trait || '')
    const resolvedTrait = traitMap[effectiveTraitStr] || effectiveTraitStr || 'agility'

    const featuresList: string[] = []
    if (gear.feature) featuresList.push(`[普通特性] ${gear.feature}`)
    if (gear.active && gear.activeFeature) featuresList.push(`[激活特性] ${gear.activeFeature}`)
    else if (!gear.active && gear.activeFeature) featuresList.push(`[激活特性(未激活)] ${gear.activeFeature}`)
    if (gear.effect && !gear.feature && !gear.activeFeature) featuresList.push(gear.effect)
    if (gear.description) featuresList.push(gear.description)

    selectWeapon(
      { slotType: slot },
      {
        type: 'custom',
        draft: {
          name: gear.name,
          tier: (gear.tier as any) || 'T1',
          weaponType: slot,
          trait: resolvedTrait as any,
          damageType: (gear.weaponStats?.damageType === '魔法' ? 'magic' : 'physical') as any,
          range: (effectiveRange === '近战' ? 'melee' : effectiveRange || 'melee') as any,
          burden: (gear.weaponStats?.burden === '双手' ? 'twoHanded' : gear.weaponStats?.burden === '副手' ? 'offHand' : 'oneHanded') as any,
          damage: effectiveDamage,
          featureName: gear.name,
          description: featuresList.join('\n\n'),
          modifierContributions: [],
        },
      }
    )
    handleQuickSave()
  }

  // 将外置装备快速挂载到战术护甲插槽
  const handleEquipExternalToCombatArmor = (gear: CyberpunkExternalGear) => {
    const isTrans = Boolean(gear.active && gear.activeTransposition?.armorStats)
    const effectiveArmor = (isTrans && gear.activeTransposition?.armorStats?.armorScore !== undefined)
      ? gear.activeTransposition.armorStats.armorScore
      : (gear.armorStats?.armorScore ?? 3)
    const effectiveMinor = (isTrans && gear.activeTransposition?.armorStats?.majorThreshold !== undefined)
      ? gear.activeTransposition.armorStats.majorThreshold
      : (gear.armorStats?.majorThreshold ?? 6)
    const effectiveMajor = (isTrans && gear.activeTransposition?.armorStats?.severeThreshold !== undefined)
      ? gear.activeTransposition.armorStats.severeThreshold
      : (gear.armorStats?.severeThreshold ?? 13)

    const featuresList: string[] = []
    if (gear.feature) featuresList.push(`[普通特性] ${gear.feature}`)
    if (gear.active && gear.activeFeature) featuresList.push(`[激活特性] ${gear.activeFeature}`)
    else if (!gear.active && gear.activeFeature) featuresList.push(`[激活特性(未激活)] ${gear.activeFeature}`)
    if (gear.effect && !gear.feature && !gear.activeFeature) featuresList.push(gear.effect)
    if (gear.description) featuresList.push(gear.description)

    selectArmorSlot({
      type: 'custom',
      draft: {
        name: gear.name,
        tier: (gear.tier as any) || 'T1',
        baseArmorMax: effectiveArmor,
        baseThresholds: {
          minor: effectiveMinor,
          major: effectiveMajor,
        },
        featureName: gear.name,
        description: featuresList.join('\n\n'),
        modifierContributions: [],
      },
    })
    handleQuickSave()
  }

  // 快速导入 HTML
  const handleQuickImportFromHTML = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.html,.htm'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const { importCharacterFromHTMLFile } = await import('@/lib/html-importer')
          const result = await importCharacterFromHTMLFile(file)

          if (result.success && result.data) {
            const characterName = result.data.name || '未命名角色'
            const defaultSaveName = `${characterName} (导入)`
            const saveName = prompt('请输入新存档的名称:', defaultSaveName)
            if (saveName && saveName.trim()) {
              const success = await createImportedCharacterHandler(saveName.trim(), result.data)
              if (success) {
                alert(`HTML导入成功并创建新存档 "${saveName}"`)
              }
            }
          } else {
            alert(`HTML导入失败：${result.error}`)
          }
        } catch (error) {
          console.error('HTML导入失败:', error)
          alert('HTML导入失败: ' + (error instanceof Error ? error.message : '未知错误'))
        }
      }
    }
    input.click()
  }

  // 当前激活存档名称
  const currentArchiveMeta = characterList.find((c) => c.id === currentCharacterId)
  const currentSaveName = currentArchiveMeta?.saveName || formData?.name || '默认存档'

  return (
    <>
      {/* 1. 屏幕端交互 UI (打印时自动隐藏) */}
      <div
        className={`cyberpunk-screen-ui min-h-screen transition-colors duration-200 ${
          isLightPreview
            ? 'cyberpunk-light-mode bg-white text-slate-900'
            : 'bg-[#0B0320] text-slate-100'
        } p-3 sm:p-5 font-sans pb-36`}
      >
        <div className="mx-auto max-w-7xl space-y-4">
          {/* 顶部控制 HUD (角色身份、位阶、经济、浅色预览与 A4 打印) */}
          <CyberpunkTopBar
            cyberpunkData={cyberpunkData}
            characterName={formData?.name || '未命名角色'}
            saveName={currentSaveName}
            level={formData?.level || '1'}
            onChange={handleCyberpunkChange}
            onOpenCharacterManagement={openCharacterManagementModal}
            isLightPreview={isLightPreview}
            onToggleLightPreview={() => setIsLightPreview(!isLightPreview)}
            onSave={handleQuickSave}
            onOpenPrintModal={() => setModalsState((prev) => ({ ...prev, printModalOpen: true }))}
          />

        {/* 保存成功提示 */}
        {saveToast && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-lg bg-[#00FFA3] px-4 py-2 text-xs font-bold text-black shadow-[0_0_20px_rgba(0,255,163,0.5)] animate-fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span>角色卡数据已即时保存！</span>
          </div>
        )}

        {/* 顶部多分页标签栏 (档案与特性 | 装配与义体 | 角色故事 | 战斗伙伴 | 笔记) */}
        <div className="flex items-center gap-1.5 border-b border-[#6C00FF]/30 pb-1 overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg font-bold text-xs whitespace-nowrap transition-all ${
              activeTab === 'profile'
                ? 'bg-[#12072B] text-[#00FFA3] border-t-2 border-x border-[#6C00FF]/50 border-t-[#00FFA3] shadow-[0_-4px_12px_rgba(0,255,163,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-[#12072B]/50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 shrink-0" />
            <span>档案与特性</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('loadout')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg font-bold text-xs whitespace-nowrap transition-all ${
              activeTab === 'loadout'
                ? 'bg-[#12072B] text-[#00FFA3] border-t-2 border-x border-[#6C00FF]/50 border-t-[#00FFA3] shadow-[0_-4px_12px_rgba(0,255,163,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-[#12072B]/50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span>装配与义体 (HUD)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('story')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg font-bold text-xs whitespace-nowrap transition-all ${
              activeTab === 'story'
                ? 'bg-[#12072B] text-[#00FFA3] border-t-2 border-x border-[#6C00FF]/50 border-t-[#00FFA3] shadow-[0_-4px_12px_rgba(0,255,163,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-[#12072B]/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>角色故事</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('companion')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg font-bold text-xs whitespace-nowrap transition-all ${
              activeTab === 'companion'
                ? 'bg-[#12072B] text-[#00FFA3] border-t-2 border-x border-[#6C00FF]/50 border-t-[#00FFA3] shadow-[0_-4px_12px_rgba(0,255,163,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-[#12072B]/50'
            }`}
          >
            <Bot className="w-3.5 h-3.5 shrink-0" />
            <span>战斗伙伴</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg font-bold text-xs whitespace-nowrap transition-all ${
              activeTab === 'notes'
                ? 'bg-[#12072B] text-[#00FFA3] border-t-2 border-x border-[#6C00FF]/50 border-t-[#00FFA3] shadow-[0_-4px_12px_rgba(0,255,163,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-[#12072B]/50'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5 shrink-0" />
            <span>笔记</span>
          </button>
        </div>

        {/* ===================== 第一页：角色档案与行动特性 ===================== */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* 2. 角色基础身份与核心指标 (姓名、位阶切换T1~T4、信用点与声望 - 参考图1和2) */}
            <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 shadow-[0_4px_20px_rgba(11,3,32,0.6)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* 角色姓名 / 代号 */}
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <User className="h-4 w-4 text-[#F5F500] shrink-0" />
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-400 font-bold block">角色姓名 / 代号</label>
                    <input
                      type="text"
                      value={formData?.name || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="输入姓名 / 代号..."
                      className="mt-0.5 w-full rounded border border-[#6C00FF]/40 bg-[#0B0320] px-2.5 py-1 text-xs font-bold text-[#F5F500] focus:border-[#00FFA3] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* 核心指标组 (位阶选择器 + 信用点 + 声望) */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* 位阶选择器 (参考图2: T1~T4 高亮胶囊) */}
                  <div className="flex items-center gap-1.5 rounded-full border border-[#6C00FF]/40 bg-[#0B0320] px-2 py-1 shadow-sm">
                    <span className="text-[10px] text-slate-400 font-bold font-mono pl-1">位阶:</span>
                    {(['T1', 'T2', 'T3', 'T4'] as const).map((tierKey) => {
                      const isActive = (cyberpunkData.tier || 'T1') === tierKey
                      return (
                        <button
                          key={tierKey}
                          type="button"
                          onClick={() => handleCyberpunkChange({ ...cyberpunkData, tier: tierKey })}
                          className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono transition-all ${
                            isActive
                              ? 'bg-[#F5F500] text-black shadow-[0_0_12px_rgba(245,245,0,0.7)] scale-105'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {tierKey}
                        </button>
                      )
                    })}
                  </div>

                  {/* 信用点 (参考图1: 黄色胶囊徽章) */}
                  <div className="flex items-center gap-1.5 rounded-full border border-[#F5F500]/50 bg-[#0B0320] px-3 py-1 shadow-[0_0_10px_rgba(245,245,0,0.15)]">
                    <span className="text-xs text-[#F5F500] font-bold">🪙 信用点:</span>
                    <input
                      type="number"
                      value={cyberpunkData.credits ?? 0}
                      onChange={(e) =>
                        handleCyberpunkChange({
                          ...cyberpunkData,
                          credits: Number(e.target.value) || 0,
                        })
                      }
                      className="w-16 bg-transparent text-xs font-bold font-mono text-[#F5F500] focus:outline-none text-right"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">点</span>
                  </div>

                  {/* 街头声望 (参考图1: 青绿色胶囊徽章) */}
                  <div className="flex items-center gap-1.5 rounded-full border border-[#00FFA3]/50 bg-[#0B0320] px-3 py-1 shadow-[0_0_10px_rgba(0,255,163,0.15)]">
                    <span className="text-xs text-[#00FFA3] font-bold">🎖️ 声望:</span>
                    <input
                      type="number"
                      value={cyberpunkData.streetCred ?? cyberpunkData.streetFame ?? 0}
                      onChange={(e) =>
                        handleCyberpunkChange({
                          ...cyberpunkData,
                          streetCred: Number(e.target.value) || 0,
                          streetFame: Number(e.target.value) || 0,
                        })
                      }
                      className="w-14 bg-transparent text-xs font-bold font-mono text-[#00FFA3] focus:outline-none text-right"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. 身份特性与能力详情融合展示面板 (一行5列所选即所得 + 锁定开关 - 融合参考图3和4) */}
            <CyberpunkFeaturesDetailPanel
              isLocked={isFeaturesLocked}
              onToggleLock={() => setIsFeaturesLocked(!isFeaturesLocked)}
              onOpenSelectModal={(type, field, levelFilter) => {
                setModalsState((prev) => ({
                  ...prev,
                  genericModal: {
                    isOpen: true,
                    type,
                    field,
                    levelFilter,
                  },
                }))
              }}
            />

            {/* 4. 角色六维属性、生命 HP、压力 Stress、伤害阈值、经历与希望点 Hope Panel */}
            <CyberpunkAttributesHopePanel cyberpunkData={cyberpunkData} />

            {/* 5. 非法改造与消耗品 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* 左栏 (7/12)：可选非法改造 */}
              <div className="lg:col-span-7 space-y-4">
                <CyberpunkIllegalModPanel
                  illegalModData={cyberpunkData.illegalModifications || DEFAULT_CYBERPUNK_EXTENSION.illegalModifications}
                  onChange={(updated) =>
                    handleCyberpunkChange({
                      ...cyberpunkData,
                      illegalModifications: updated,
                    })
                  }
                />
              </div>

              {/* 右栏 (5/12)：消耗品 */}
              <div className="lg:col-span-5 space-y-4">
                <CyberpunkConsumablesBar
                  consumables={cyberpunkData.consumables}
                  onChange={(updated) =>
                    handleCyberpunkChange({
                      ...cyberpunkData,
                      consumables: updated,
                    })
                  }
                />
              </div>
            </div>

            {/* 6. 底部：领域卡 (Domain Cards & Vault) */}
            <CyberpunkDomainDeck
              cards={formData?.cards || []}
              vaultCards={formData?.inventory_cards || []}
              onSelectSlot={(slotIndex, isVault) => {
                setModalsState((prev) => ({
                  ...prev,
                  domainModal: {
                    isOpen: true,
                    slotIndex,
                    isVault: isVault || false,
                  },
                }))
              }}
              onRemoveCard={handleDomainCardRemove}
            />
          </div>
        )}

        {/* ===================== 第二页：装配与义体 (HUD 布局与外置装备) ===================== */}
        {activeTab === 'loadout' && (
          <div className="space-y-6">
            <CyberpunkEquipmentHud
              cyberpunkData={cyberpunkData}
              onChangeCyberpunk={handleCyberpunkChange}
              onOpenSelectModal={(type, zoneKey, slotIndex) => {
                if (type === 'weapon') {
                  setModalsState((prev) => ({
                    ...prev,
                    weaponModalOpen: true,
                    activeWeaponSlot: (slotIndex ?? 0) === 1 ? 'secondary' : 'primary',
                  }))
                } else if (type === 'armor') {
                  setModalsState((prev) => ({ ...prev, armorModalOpen: true }))
                } else if (type === 'augmentation') {
                  setModalsState((prev) => ({
                    ...prev,
                    installAugModalOpen: true,
                    activeZoneKey: (zoneKey as CyberpunkBodyZoneKey) || 'upper_limb',
                  }))
                } else if (type === 'external') {
                  setModalsState((prev) => ({ ...prev, installExternalGearModalOpen: true }))
                }
              }}
            />

            {/* 外置装备独立面板 (背包收纳/激活管理与双态数值联动) */}
            <CyberpunkExternalGearPanel
              cyberpunkData={cyberpunkData}
              onChange={handleCyberpunkChange}
              onEquipToCombatWeapon={handleEquipExternalToCombatWeapon}
              onEquipToCombatArmor={handleEquipExternalToCombatArmor}
            />
          </div>
        )}

        {/* ===================== 第三页：角色故事 (人物精细档案与传记) ===================== */}
        {activeTab === 'story' && (
          <CyberpunkStoryTab
            cyberpunkData={cyberpunkData}
            onChangeCyberpunk={handleCyberpunkChange}
            onSyncRootFormData={(patch) => setFormData((prev) => ({ ...prev, ...patch }))}
          />
        )}

        {/* ===================== 第四页：战斗伙伴 (Companion) ===================== */}
        {activeTab === 'companion' && (
          <CyberpunkCompanionTab currentCharacterId={currentCharacterId} />
        )}

        {/* ===================== 第五页：速记收纳 (Quick Notebook & Drawers) ===================== */}
        {activeTab === 'notes' && <CyberpunkNotebookTab />}
      </div>

      {/* 底部浮动通用工具栏 (Bottom Dock - 可收缩展开) */}
      <BottomDock
        mode="main"
        isMobile={isMobile}
        isCardDrawerOpen={false}
        characterCount={characterList.length}
        onToggleCardDrawer={() => {}}
        onToggleGuide={() => setIsGuideOpen(!isGuideOpen)}
        onToggleNotebook={() => {
          setFormData((prev) => ({
            ...prev,
            notebook: {
              ...(prev.notebook || { pages: [{ id: 'page-1', lines: [] }], currentPageIndex: 0, isOpen: false }),
              isOpen: !(prev.notebook?.isOpen ?? false),
            },
          }))
        }}
        onPrintAll={handlePrintAll}
        onOpenSealDiceExport={() => setSealDiceExportModalOpen(true)}
        onQuickExportJSON={handleQuickExportJSON}
        onQuickExportPDF={handleQuickExportPDF}
        onQuickExportHTML={handleQuickExportHTML}
        onOpenCharacterManagement={openCharacterManagementModal}
        onQuickCreateArchive={handleQuickCreateArchive}
        onQuickImportFromHTML={handleQuickImportFromHTML}
        hasUnreadAnnouncements={hasUnreadAnnouncements}
        onOpenAnnouncements={openAnnouncementsModal}
      />

      {/* 全局浮动笔记本组件 */}
      <FloatingNotebook />

      {/* 新手建卡指引 */}
      <CharacterCreationGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* 骰子导出模态框 */}
      <SealDiceExportModal
        isOpen={sealDiceExportModalOpen}
        onClose={() => setSealDiceExportModalOpen(false)}
        sheetData={formData}
      />

      {/* 更新公告模态框 */}
      <AnnouncementsModal
        isOpen={announcementsModalOpen}
        onClose={() => setAnnouncementsModalOpen(false)}
        announcements={announcements}
      />

      </div>

      {/* 2. 集中模态框宿主组件 (解耦独立管理全部 8 大模态框) */}
      <CyberpunkSheetModalsHost
        modalsState={modalsState}
        setModalsState={setModalsState}
        sheetData={formData}
        cyberpunkData={cyberpunkData}
        onUpdateCyberpunk={handleCyberpunkChange}
        onGenericCardSelect={handleGenericCardSelect}
        onDomainCardSelect={handleDomainCardSelect}
        onWeaponSelect={handleWeaponSelect}
        onArmorSelect={handleArmorSelect}
        onTriggerPrint={handleTriggerPrint}
        characterList={characterList}
        currentCharacterId={currentCharacterId}
        onSwitchCharacter={switchToCharacter}
        onCreateCharacter={createNewCharacterHandler}
        onCreateImportedCharacter={createImportedCharacterHandler}
        onDeleteCharacter={deleteCharacterHandler}
        onDuplicateCharacter={duplicateCharacterHandler}
        onRenameCharacter={renameCharacterHandler}
      />

      {/* 3. 专用 A4 实体打印与战术卡牌导出渲染器 (仅在 @media print 触发时渲染) */}
      <CyberpunkPrintRenderer
        sheetData={formData}
        cyberpunkData={cyberpunkData}
        options={printOptions}
      />
    </>
  )
}
