"use client"

import React from 'react'
import type { SheetData } from '@/lib/sheet-data'
import type {
  CyberpunkSheetExtension,
  CyberpunkAugmentation,
  CyberpunkExternalGear,
  CyberpunkBodyZoneKey,
} from '@/types/cyberpunk'
import type { WeaponSelectionInput, ArmorSelectionInput } from '@/lib/sheet-store'
import { GenericCardSelectionModal } from '@/components/modals/generic-card-selection-modal'
import { CardSelectionModal } from '@/components/modals/card-selection-modal'
import { CharacterManagementModal } from '@/components/modals/character-management-modal'
import { CardType } from '@/card/card-types'
import { InstallAugmentationModal } from './install-augmentation-modal'
import { InstallExternalGearModal } from './install-external-gear-modal'
import { CyberpunkWeaponSelectionModal } from './cyberpunk-weapon-selection-modal'
import { CyberpunkArmorSelectionModal } from './cyberpunk-armor-selection-modal'
import { CyberpunkPrintModal } from './cyberpunk-print-modal'
import type { CyberpunkPrintOptions } from '../print/cyberpunk-print-renderer'
import { getZoneSlotLimit, getUsedZoneSlots } from '@/lib/cyberpunk/cyberpunk-data-normalizer'

export interface CyberpunkSheetModalsState {
  // 1. 通用卡牌库模态框
  genericModal: {
    isOpen: boolean
    type: 'profession' | 'ancestry' | 'community' | 'subclass'
    field?: string
    levelFilter?: number
  }
  // 2. 领域卡牌库模态框
  domainModal: {
    isOpen: boolean
    slotIndex: number
    isVault: boolean
  }
  // 3. 武器/防具模态框
  weaponModalOpen: boolean
  activeWeaponSlot: 'primary' | 'secondary'
  armorModalOpen: boolean
  // 4. 义体/外置装备安装模态框
  installAugModalOpen: boolean
  activeZoneKey: CyberpunkBodyZoneKey
  installExternalGearModalOpen: boolean
  // 5. 存档管理模态框
  characterManagementModalOpen: boolean
  // 6. A4 实体打印配置模态框
  printModalOpen: boolean
}

export interface CyberpunkSheetModalsHostProps {
  modalsState: CyberpunkSheetModalsState
  setModalsState: React.Dispatch<React.SetStateAction<CyberpunkSheetModalsState>>
  sheetData: SheetData
  cyberpunkData: CyberpunkSheetExtension
  onUpdateCyberpunk: (updated: CyberpunkSheetExtension) => void
  // 回调
  onGenericCardSelect: (cardId: string, field?: string) => void
  onDomainCardSelect: (cardId: string, slotIndex: number, isVault: boolean) => void
  onWeaponSelect: (weapon: WeaponSelectionInput, slotKey: 'primary' | 'secondary') => void
  onArmorSelect: (armor: ArmorSelectionInput) => void
  onTriggerPrint: (opts: CyberpunkPrintOptions) => void
  // 存档管理相关
  characterList: any[]
  currentCharacterId: string | null
  onSwitchCharacter: (id: string) => void | Promise<boolean>
  onCreateCharacter: (saveName: string) => boolean | Promise<boolean>
  onCreateImportedCharacter: (saveName: string, data: SheetData) => boolean | Promise<boolean>
  onDeleteCharacter: (id: string) => boolean | Promise<boolean>
  onDuplicateCharacter: (id: string, newSaveName: string) => boolean | Promise<boolean>
  onRenameCharacter: (id: string, newName: string) => boolean
}

export function CyberpunkSheetModalsHost({
  modalsState,
  setModalsState,
  sheetData,
  cyberpunkData,
  onUpdateCyberpunk,
  onGenericCardSelect,
  onDomainCardSelect,
  onWeaponSelect,
  onArmorSelect,
  onTriggerPrint,
  characterList,
  currentCharacterId,
  onSwitchCharacter,
  onCreateCharacter,
  onCreateImportedCharacter,
  onDeleteCharacter,
  onDuplicateCharacter,
  onRenameCharacter,
}: CyberpunkSheetModalsHostProps) {
  const {
    genericModal,
    domainModal,
    weaponModalOpen,
    activeWeaponSlot,
    armorModalOpen,
    installAugModalOpen,
    activeZoneKey,
    installExternalGearModalOpen,
    characterManagementModalOpen,
    printModalOpen,
  } = modalsState

  // 关闭指定模态框辅助器
  const closeGeneric = () =>
    setModalsState((prev) => ({ ...prev, genericModal: { ...prev.genericModal, isOpen: false } }))
  const closeDomain = () =>
    setModalsState((prev) => ({ ...prev, domainModal: { ...prev.domainModal, isOpen: false } }))
  const closeWeapon = () =>
    setModalsState((prev) => ({ ...prev, weaponModalOpen: false }))
  const closeArmor = () =>
    setModalsState((prev) => ({ ...prev, armorModalOpen: false }))
  const closeInstallAug = () =>
    setModalsState((prev) => ({ ...prev, installAugModalOpen: false }))
  const closeInstallExternal = () =>
    setModalsState((prev) => ({ ...prev, installExternalGearModalOpen: false }))
  const closeCharacterManagement = () =>
    setModalsState((prev) => ({ ...prev, characterManagementModalOpen: false }))
  const closePrintModal = () =>
    setModalsState((prev) => ({ ...prev, printModalOpen: false }))

  // 计算当前部位可用槽位
  const activeZoneLimit = getZoneSlotLimit(cyberpunkData, activeZoneKey)
  const activeZoneUsed = getUsedZoneSlots(cyberpunkData, activeZoneKey)
  const activeZoneAvailable = Math.max(0, activeZoneLimit - activeZoneUsed)

  // 计算外置装备可用槽位
  const externalLimit = getZoneSlotLimit(cyberpunkData, 'external')
  const externalUsed = (cyberpunkData.externalGear || []).length
  const externalAvailable = Math.max(0, externalLimit - externalUsed)

  return (
    <>
      {/* 1. 通用卡牌选择模态框 */}
      {genericModal.isOpen && (
        <GenericCardSelectionModal
          isOpen={genericModal.isOpen}
          onClose={closeGeneric}
          onSelect={onGenericCardSelect}
          title={
            genericModal.type === 'profession'
              ? '选择职业'
              : genericModal.type === 'ancestry'
              ? (genericModal.levelFilter === 1 ? '选择种族特性一 (原生特性一)' : '选择种族特性二 (原生特性二)')
              : genericModal.type === 'community'
              ? '选择社群'
              : '选择子职业'
          }
          cardType={
            genericModal.type === 'profession'
              ? CardType.Profession
              : genericModal.type === 'ancestry'
              ? CardType.Ancestry
              : genericModal.type === 'community'
              ? CardType.Community
              : CardType.Subclass
          }
          field={genericModal.field}
          levelFilter={genericModal.levelFilter}
        />
      )}

      {/* 2. 领域卡牌选择模态框 */}
      {domainModal.isOpen && (
        <CardSelectionModal
          isOpen={domainModal.isOpen}
          onClose={closeDomain}
          onSelect={(card) => onDomainCardSelect(card.id, domainModal.slotIndex, domainModal.isVault)}
          selectedCardIndex={domainModal.slotIndex}
          initialTab="domain"
        />
      )}

      {/* 3. 武器选择模态框 */}
      <CyberpunkWeaponSelectionModal
        isOpen={weaponModalOpen}
        onClose={closeWeapon}
        onSelect={(weapon) => {
          onWeaponSelect(weapon, activeWeaponSlot)
          closeWeapon()
        }}
        weaponSlotType={activeWeaponSlot}
        title={`选择${activeWeaponSlot === 'primary' ? '主武器' : '副武器'}`}
      />

      {/* 4. 战术护甲选择模态框 */}
      <CyberpunkArmorSelectionModal
        isOpen={armorModalOpen}
        onClose={closeArmor}
        onSelect={(armor) => {
          onArmorSelect(armor)
          closeArmor()
        }}
        title="选择战术护甲"
      />

      {/* 5. 义体安装模态框 */}
      {installAugModalOpen && (
        <InstallAugmentationModal
          isOpen={installAugModalOpen}
          zone={activeZoneKey}
          zoneName={
            activeZoneKey === 'head'
              ? '头部'
              : activeZoneKey === 'torso'
              ? '躯干'
              : activeZoneKey === 'upper_limb'
              ? '上肢'
              : '下肢'
          }
          availableSlots={activeZoneAvailable}
          onClose={closeInstallAug}
          onInstall={(aug: CyberpunkAugmentation) => {
            const zoneGroup = cyberpunkData.zones?.[activeZoneKey] || { augmentations: [] }
            onUpdateCyberpunk({
              ...cyberpunkData,
              zones: {
                ...cyberpunkData.zones,
                [activeZoneKey]: {
                  augmentations: [...zoneGroup.augmentations, aug],
                },
              },
            })
            closeInstallAug()
          }}
          onOpenCustomModal={() => {}}
        />
      )}

      {/* 6. 外置战备装备安装模态框 */}
      {installExternalGearModalOpen && (
        <InstallExternalGearModal
          isOpen={installExternalGearModalOpen}
          availableSlots={externalAvailable}
          maxSlots={externalLimit}
          onClose={closeInstallExternal}
          onInstall={(gear: CyberpunkExternalGear) => {
            onUpdateCyberpunk({
              ...cyberpunkData,
              externalGear: [...(cyberpunkData.externalGear || []), gear],
            })
            closeInstallExternal()
          }}
        />
      )}

      {/* 7. 多存档管理模态框 */}
      <CharacterManagementModal
        isOpen={characterManagementModalOpen}
        onClose={closeCharacterManagement}
        characterList={characterList}
        currentCharacterId={currentCharacterId}
        onSwitchCharacter={onSwitchCharacter}
        onCreateCharacter={onCreateCharacter}
        onCreateImportedCharacter={onCreateImportedCharacter}
        onDeleteCharacter={onDeleteCharacter}
        onDuplicateCharacter={onDuplicateCharacter}
        onRenameCharacter={onRenameCharacter}
      />

      {/* 8. A4 实体打印与卡牌导出配置模态框 */}
      <CyberpunkPrintModal
        isOpen={printModalOpen}
        onClose={closePrintModal}
        onTriggerPrint={onTriggerPrint}
        hasCompanion={Boolean(sheetData.companionName)}
      />
    </>
  )
}
