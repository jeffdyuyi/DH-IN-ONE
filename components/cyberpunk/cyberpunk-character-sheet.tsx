"use client"

import React, { useState, useEffect } from 'react'
import { useSheetStore, type WeaponSelectionInput, type ArmorSelectionInput } from '@/lib/sheet-store'
import type { CyberpunkSheetExtension } from '@/types/cyberpunk'
import { DEFAULT_CYBERPUNK_EXTENSION } from '@/lib/cyberpunk/tier-constants'
import { CardType, type StandardCard } from '@/card/card-types'
import { useCardStore } from '@/card/stores/unified-card-store'

// 爽博朋克专有组件
import { CyberpunkTopBar } from './cyberpunk-top-bar'
import { CyberpunkThresholdDisplay } from './cyberpunk-threshold-display'
import { CyberpunkAttributesHopePanel } from './cyberpunk-attributes-hope-panel'
import { CyberpunkFeaturesDetailPanel } from './cyberpunk-features-detail-panel'
import { CyberpunkConsumablesBar } from './cyberpunk-consumables-bar'
import { CyberpunkZonePanel } from './cyberpunk-zone-panel'
import { CyberpunkIllegalModPanel } from './cyberpunk-illegal-mod-panel'
import { CyberpunkEquipActivation } from './cyberpunk-equip-activation'
import { CyberpunkExternalGearPanel } from './cyberpunk-external-gear-panel'
import { CyberpunkDomainDeck } from './cyberpunk-domain-deck'
import type { CyberpunkExternalGear } from '@/types/cyberpunk'
import './cyberpunk-light-minimal.css'

// 核心车卡器模态框与通用组件
import { GenericCardSelectionModal } from '@/components/modals/generic-card-selection-modal'
import { CardSelectionModal } from '@/components/modals/card-selection-modal'
import { WeaponSelectionModal } from '@/components/modals/weapon-selection-modal'
import { ArmorSelectionModal } from '@/components/modals/armor-selection-modal'
import { CharacterManagementModal } from '@/components/modals/character-management-modal'
import { CharacterCreationGuide } from '@/components/guide/character-creation-guide'
import { FloatingNotebook } from '@/components/notebook'
import { SealDiceExportModal } from '@/components/modals/seal-dice-export-modal'
import { AnnouncementsModal } from '@/components/modals/announcements-modal'
import { BottomDock } from '@/components/layout/bottom-dock'
import { useCharacterManagement } from '@/hooks/use-character-management'
import { useExportHandlers } from '@/hooks/use-export-handlers'
import { announcements, isLatestAnnouncementRead, markLatestAnnouncementRead } from '@/lib/announcements'
import { User, CheckCircle2 } from 'lucide-react'

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

  // 卡牌数据库 store
  const cardStore = useCardStore()

  // 默认使用极简浅色/黑白灰主题 (按用户要求默认开启)
  const [isLightPreview, setIsLightPreview] = useState(true)
  const [saveToast, setSaveToast] = useState(false)

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

  // 快速保存提示
  const handleQuickSave = () => {
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2000)
  }

  // 4. 数据库选择模态框状态 (支持 levelFilter 区分种族特性一 / 二)
  const [genericModalState, setGenericModalState] = useState<{
    isOpen: boolean
    type: 'profession' | 'ancestry' | 'community' | 'subclass'
    field?: string
    levelFilter?: number
  }>({
    isOpen: false,
    type: 'profession',
  })

  const [domainModalState, setDomainModalState] = useState<{
    isOpen: boolean
    slotIndex: number
    isVault: boolean
  }>({
    isOpen: false,
    slotIndex: 5,
    isVault: false,
  })

  const [weaponModalOpen, setWeaponModalOpen] = useState(false)
  const [activeWeaponSlot, setActiveWeaponSlot] = useState<'primary' | 'secondary'>('primary')
  const [armorModalOpen, setArmorModalOpen] = useState(false)

  // 处理通用卡牌库选择（种族/职业/社群/子职业）
  const handleGenericCardSelect = (cardId: string, field?: string) => {
    const card = cardStore.getCardById(cardId)
    if (!card) return

    if (genericModalState.type === 'profession') {
      let fullName = card.name
      if (card.cardSelectDisplay?.item1 && card.cardSelectDisplay?.item2) {
        fullName = `${card.name} - ${card.cardSelectDisplay.item1}&${card.cardSelectDisplay.item2}`
      }
      handleProfessionChange({ id: card.id, name: fullName }, card)
      setFormData((prev) => ({
        ...prev,
        profession: card.name,
      }))
    } else if (genericModalState.type === 'ancestry' && field) {
      const kind = field === 'ancestry1' ? 'ancestry1' : 'ancestry2'
      selectCharacterChoiceCard(kind, { id: card.id, name: card.name }, card)
      setFormData((prev) => ({
        ...prev,
        [field]: card.name,
      }))
    } else if (genericModalState.type === 'community') {
      selectCharacterChoiceCard('community', { id: card.id, name: card.name }, card)
      setFormData((prev) => ({
        ...prev,
        community: card.name,
      }))
    } else if (genericModalState.type === 'subclass') {
      selectCharacterChoiceCard('subclass', { id: card.id, name: card.name }, card)
      setFormData((prev) => ({
        ...prev,
        subclass: card.name,
      }))
    }

    setGenericModalState((prev) => ({ ...prev, isOpen: false }))
  }

  // 处理领域卡选择与删除
  const handleDomainCardSelect = (selectedCard: StandardCard) => {
    selectCardForSlot({
      zone: domainModalState.isVault ? 'vault' : 'loadout',
      index: domainModalState.slotIndex,
      template: selectedCard,
    })
    setDomainModalState((prev) => ({ ...prev, isOpen: false }))
  }

  const handleDomainCardRemove = (index: number, isVault = false) => {
    deleteCard(index, isVault)
  }

  // 处理武器与护甲选择
  const handleWeaponSelect = (input: WeaponSelectionInput) => {
    selectWeapon({ slotType: activeWeaponSlot }, input)
    setWeaponModalOpen(false)
  }

  const handleArmorSelect = (input: ArmorSelectionInput) => {
    selectArmorSlot(input)
    setArmorModalOpen(false)
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
    const resolvedTrait = traitMap[gear.weaponStats?.trait || ''] || gear.weaponStats?.trait || 'agility'

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
          range: (gear.weaponStats?.range === '近战' ? 'melee' : gear.weaponStats?.range || 'melee') as any,
          burden: (gear.weaponStats?.burden === '双手' ? 'twoHanded' : gear.weaponStats?.burden === '副手' ? 'offHand' : 'oneHanded') as any,
          damage: gear.weaponStats?.damage || 'd8',
          featureName: gear.name,
          description: gear.effect || gear.description || '',
          modifierContributions: [],
        },
      }
    )
    handleQuickSave()
  }

  // 将外置装备快速挂载到战术护甲插槽
  const handleEquipExternalToCombatArmor = (gear: CyberpunkExternalGear) => {
    selectArmorSlot({
      type: 'custom',
      draft: {
        name: gear.name,
        tier: (gear.tier as any) || 'T1',
        baseArmorMax: gear.armorStats?.armorScore ?? 3,
        baseThresholds: {
          minor: gear.armorStats?.majorThreshold ?? 6,
          major: gear.armorStats?.severeThreshold ?? 13,
        },
        featureName: gear.name,
        description: gear.effect || gear.description || '',
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
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isLightPreview
          ? 'cyberpunk-light-mode bg-white text-slate-900'
          : 'bg-[#0B0320] text-slate-100'
      } p-3 sm:p-5 font-sans pb-36`}
    >
      <div className="mx-auto max-w-7xl space-y-4">
        {/* 1. 顶部控制 HUD (角色身份、位阶、经济、浅色预览与 A4 打印) */}
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
        />

        {/* 保存成功提示 */}
        {saveToast && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-lg bg-[#00FFA3] px-4 py-2 text-xs font-bold text-black shadow-[0_0_20px_rgba(0,255,163,0.5)] animate-fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span>角色卡数据已即时保存！</span>
          </div>
        )}

        {/* 2. 角色基础身份信息矩阵 */}
        <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 shadow-[0_4px_20px_rgba(11,3,32,0.6)]">
          <div className="flex items-center gap-2 border-b border-[#6C00FF]/20 pb-2 mb-3">
            <User className="h-4 w-4 text-[#F5F500]" />
            <h2 className="text-sm font-bold text-white tracking-wide">基础信息 (Identity)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* 角色姓名 */}
            <div className="rounded-lg border border-[#6C00FF]/30 bg-[#0B0320] p-2.5">
              <label className="text-[11px] text-slate-400 font-bold block">角色姓名 / 代号</label>
              <input
                type="text"
                value={formData?.name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="输入姓名..."
                className="mt-1 w-full rounded border border-[#6C00FF]/40 bg-[#12072B] px-2 py-1 text-xs font-bold text-[#F5F500] focus:border-[#00FFA3] focus:outline-none font-mono"
              />
            </div>

            {/* 种族特性一 (限定特性一 levelFilter: 1) */}
            <div className="rounded-lg border border-[#6C00FF]/30 bg-[#0B0320] p-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-slate-400 font-bold">种族特性一</label>
                  <button
                    type="button"
                    onClick={() =>
                      setGenericModalState({
                        isOpen: true,
                        type: 'ancestry',
                        field: 'ancestry1',
                        levelFilter: 1,
                      })
                    }
                    className="text-[10px] font-bold text-[#00FFA3] bg-[#00FFA3]/15 hover:bg-[#00FFA3]/25 px-1.5 py-0.5 rounded border border-[#00FFA3]/30 transition-colors"
                  >
                    选择 ⇄
                  </button>
                </div>
                <div className="mt-1 font-bold text-xs text-white truncate">
                  {formData?.ancestry1 || '（未选择）'}
                </div>
              </div>
            </div>

            {/* 种族特性二 (限定特性二 levelFilter: 2) */}
            <div className="rounded-lg border border-[#6C00FF]/30 bg-[#0B0320] p-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-slate-400 font-bold">种族特性二</label>
                  <button
                    type="button"
                    onClick={() =>
                      setGenericModalState({
                        isOpen: true,
                        type: 'ancestry',
                        field: 'ancestry2',
                        levelFilter: 2,
                      })
                    }
                    className="text-[10px] font-bold text-[#00FFA3] bg-[#00FFA3]/15 hover:bg-[#00FFA3]/25 px-1.5 py-0.5 rounded border border-[#00FFA3]/30 transition-colors"
                  >
                    选择 ⇄
                  </button>
                </div>
                <div className="mt-1 font-bold text-xs text-white truncate">
                  {formData?.ancestry2 || '（未选择）'}
                </div>
              </div>
            </div>

            {/* 职业与子职业 */}
            <div className="rounded-lg border border-[#6C00FF]/30 bg-[#0B0320] p-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-slate-400 font-bold">职业 / 子职业</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setGenericModalState({
                          isOpen: true,
                          type: 'profession',
                        })
                      }
                      className="text-[10px] font-bold text-[#F5F500] bg-[#F5F500]/15 hover:bg-[#F5F500]/25 px-1.5 py-0.5 rounded border border-[#F5F500]/30 transition-colors"
                    >
                      职业 ⇄
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setGenericModalState({
                          isOpen: true,
                          type: 'subclass',
                          levelFilter: 1,
                        })
                      }
                      className="text-[10px] font-bold text-[#6C00FF] bg-[#6C00FF]/20 hover:bg-[#6C00FF]/35 px-1.5 py-0.5 rounded border border-[#6C00FF]/50 transition-colors"
                    >
                      子职 ⇄
                    </button>
                  </div>
                </div>
                <div className="mt-1 font-bold text-xs text-white truncate">
                  {formData?.profession || '（未选择）'}
                  {formData?.subclass ? ` · ${formData.subclass}` : ''}
                </div>
              </div>
            </div>

            {/* 社群 */}
            <div className="rounded-lg border border-[#6C00FF]/30 bg-[#0B0320] p-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-slate-400 font-bold">社群</label>
                  <button
                    type="button"
                    onClick={() =>
                      setGenericModalState({
                        isOpen: true,
                        type: 'community',
                      })
                    }
                    className="text-[10px] font-bold text-[#FF007F] bg-[#FF007F]/15 hover:bg-[#FF007F]/25 px-1.5 py-0.5 rounded border border-[#FF007F]/30 transition-colors"
                  >
                    选择 ⇄
                  </button>
                </div>
                <div className="mt-1 font-bold text-xs text-white truncate">
                  {formData?.community || '（未选择）'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 角色六维属性、生命 HP、压力 Stress、伤害阈值、经历与希望点 Hope Panel */}
        <CyberpunkAttributesHopePanel cyberpunkData={cyberpunkData} />

        {/* 5. 身份特性与能力详情展示面板（职业专精、子职、种族一/二、社群全文阅读） */}
        <CyberpunkFeaturesDetailPanel />

        {/* 6. 作战装备专区 (主手、副手、护甲) */}
        <CyberpunkEquipActivation
          equipment={formData?.equipment}
          onOpenWeaponModal={(slot) => {
            setActiveWeaponSlot(slot)
            setWeaponModalOpen(true)
          }}
          onOpenArmorModal={() => setArmorModalOpen(true)}
        />

        {/* 6.5 独立外置装备与战术挂载面板 (带位阶激活槽位限制) */}
        <CyberpunkExternalGearPanel
          cyberpunkData={cyberpunkData}
          onChange={handleCyberpunkChange}
          onEquipToCombatWeapon={handleEquipExternalToCombatWeapon}
          onEquipToCombatArmor={handleEquipExternalToCombatArmor}
        />

        {/* 7. 中部：义体改造四大区、可选非法改造与消耗品 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 左栏 (7/12)：四大区改造 & 可选非法改造 */}
          <div className="lg:col-span-7 space-y-4">
            <CyberpunkZonePanel
              cyberpunkData={cyberpunkData}
              onChange={handleCyberpunkChange}
            />

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

          {/* 右栏 (5/12)：消耗品 (上限 5 份) */}
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

        {/* 8. 底部：领域卡 (Domain Cards & Vault) */}
        <CyberpunkDomainDeck
          cards={formData?.cards || []}
          vaultCards={formData?.inventory_cards || []}
          onSelectSlot={(slotIndex, isVault) => {
            setDomainModalState({
              isOpen: true,
              slotIndex,
              isVault: isVault || false,
            })
          }}
          onRemoveCard={handleDomainCardRemove}
        />
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

      {/* 卡牌与特性选择模态框 */}
      {genericModalState.isOpen && (
        <GenericCardSelectionModal
          isOpen={genericModalState.isOpen}
          onClose={() => setGenericModalState((prev) => ({ ...prev, isOpen: false }))}
          onSelect={handleGenericCardSelect}
          title={
            genericModalState.type === 'profession'
              ? '选择职业'
              : genericModalState.type === 'ancestry'
              ? (genericModalState.levelFilter === 1 ? '选择种族特性一 (原生特性一)' : '选择种族特性二 (原生特性二)')
              : genericModalState.type === 'community'
              ? '选择社群'
              : '选择子职业'
          }
          cardType={
            genericModalState.type === 'profession'
              ? CardType.Profession
              : genericModalState.type === 'ancestry'
              ? CardType.Ancestry
              : genericModalState.type === 'community'
              ? CardType.Community
              : CardType.Subclass
          }
          field={genericModalState.field}
          levelFilter={genericModalState.levelFilter}
        />
      )}

      {/* 领域卡选择模态框 */}
      {domainModalState.isOpen && (
        <CardSelectionModal
          isOpen={domainModalState.isOpen}
          onClose={() => setDomainModalState((prev) => ({ ...prev, isOpen: false }))}
          onSelect={handleDomainCardSelect}
          selectedCardIndex={domainModalState.slotIndex}
          initialTab="domain"
        />
      )}

      {/* 武器选择模态框 */}
      <WeaponSelectionModal
        isOpen={weaponModalOpen}
        onClose={() => setWeaponModalOpen(false)}
        weaponSlotType={activeWeaponSlot}
        onSelect={handleWeaponSelect}
        title={activeWeaponSlot === 'primary' ? '选择主手武器' : '选择副手/备用武器'}
      />

      {/* 护甲选择模态框 */}
      <ArmorSelectionModal
        isOpen={armorModalOpen}
        onClose={() => setArmorModalOpen(false)}
        onSelect={handleArmorSelect}
        title="选择护甲"
      />

      {/* 多存档管理模态框 */}
      <CharacterManagementModal
        isOpen={characterManagementModalOpen}
        onClose={closeCharacterManagementModal}
        characterList={characterList}
        currentCharacterId={currentCharacterId}
        onSwitchCharacter={switchToCharacter}
        onCreateCharacter={createNewCharacterHandler}
        onCreateImportedCharacter={createImportedCharacterHandler}
        onDeleteCharacter={deleteCharacterHandler}
        onDuplicateCharacter={duplicateCharacterHandler}
        onRenameCharacter={renameCharacterHandler}
      />
    </div>
  )
}
