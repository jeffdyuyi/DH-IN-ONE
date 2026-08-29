"use client"

import React from 'react'
import type { SheetData } from '@/lib/sheet-data'
import type { CyberpunkSheetExtension } from '@/types/cyberpunk'
import { CyberpunkPrintDossierPage } from './cyberpunk-print-dossier-page'
import { CyberpunkPrintGearCardsPage } from './cyberpunk-print-gear-cards-page'
import { CyberpunkPrintDomainCardsPage } from './cyberpunk-print-domain-cards-page'
import { CyberpunkPrintCompanionStoryPage } from './cyberpunk-print-companion-story-page'
import './cyberpunk-print.css'

export interface CyberpunkPrintOptions {
  includeDossier?: boolean
  includeGearCards?: boolean
  includeDomainCards?: boolean
  includeCompanionStory?: boolean
}

export function CyberpunkPrintRenderer({
  sheetData,
  cyberpunkData,
  options = {
    includeDossier: true,
    includeGearCards: true,
    includeDomainCards: true,
    includeCompanionStory: true,
  },
}: {
  sheetData: SheetData
  cyberpunkData: CyberpunkSheetExtension
  options?: CyberpunkPrintOptions
}) {
  return (
    <div className="cyberpunk-print-root">
      {/* 第 1 页：战术总档案单页 (100% 锁定 A4 单页) */}
      {options.includeDossier !== false && (
        <CyberpunkPrintDossierPage sheetData={sheetData} cyberpunkData={cyberpunkData} />
      )}

      {/* 第 2 页：已装配赛博军备与义体 3×3 九宫格实体卡牌页 */}
      {options.includeGearCards !== false && (
        <CyberpunkPrintGearCardsPage sheetData={sheetData} cyberpunkData={cyberpunkData} />
      )}

      {/* 第 3 页：已激活领域技能 3×3 九宫格实体卡牌页 */}
      {options.includeDomainCards !== false && (
        <CyberpunkPrintDomainCardsPage sheetData={sheetData} />
      )}

      {/* 第 4 页：战斗伙伴与故事笔记档案页 */}
      {options.includeCompanionStory !== false && (
        <CyberpunkPrintCompanionStoryPage sheetData={sheetData} cyberpunkData={cyberpunkData} />
      )}
    </div>
  )
}
