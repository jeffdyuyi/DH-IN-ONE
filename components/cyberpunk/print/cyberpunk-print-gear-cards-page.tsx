"use client"

import React from 'react'
import type { SheetData } from '@/lib/sheet-data'
import type { CyberpunkSheetExtension, CyberpunkAugmentation, CyberpunkExternalGear } from '@/types/cyberpunk'
import { getZoneAugmentations } from '@/lib/cyberpunk/cyberpunk-data-normalizer'
import { CardMarkdown } from '@/components/ui/card-markdown'

interface PrintableCardItem {
  id: string
  name: string
  icon?: string | null
  tier?: string
  type: string
  zone: string
  slots?: number | string
  stats?: {
    trait?: string
    range?: string
    damage?: string
    burden?: string
    damageType?: string
    armorScore?: number | string
    majorThreshold?: number | string
    severeThreshold?: number | string
  }
  effect?: string
  description?: string
}

export function CyberpunkPrintGearCardsPage({
  sheetData,
  cyberpunkData,
}: {
  sheetData: SheetData
  cyberpunkData: CyberpunkSheetExtension
}) {
  const cards: PrintableCardItem[] = []

  // 1. 主武器
  const pw = sheetData.equipment?.weaponSlots?.primary
  if (pw && pw.name && pw.name !== '（未装配）') {
    cards.push({
      id: 'gear-pw',
      name: pw.name,
      tier: (pw as any).tier || cyberpunkData.tier || 'T1',
      type: '主武器',
      zone: '主手',
      slots: '主手',
      stats: {
        trait: pw.trait,
        damage: pw.damage,
      },
      effect: pw.feature,
    })
  }

  // 2. 副武器
  const sw = sheetData.equipment?.weaponSlots?.secondary
  if (sw && sw.name && sw.name !== '（未装配）') {
    cards.push({
      id: 'gear-sw',
      name: sw.name,
      tier: (sw as any).tier || cyberpunkData.tier || 'T1',
      type: '副武器',
      zone: '副手',
      slots: '副手',
      stats: {
        trait: sw.trait,
        damage: sw.damage,
      },
      effect: sw.feature,
    })
  }

  // 3. 战术护甲
  const arm = sheetData.equipment?.armorSlot
  if (arm && arm.name && arm.name !== '（未装配）') {
    cards.push({
      id: 'gear-armor',
      name: arm.name,
      tier: (arm as any).tier || cyberpunkData.tier || 'T1',
      type: '战术护甲',
      zone: '躯干',
      slots: '护甲栏',
      stats: {
        armorScore: arm.baseArmorMax ?? undefined,
        majorThreshold: arm.baseThresholds?.minor ?? undefined,
        severeThreshold: arm.baseThresholds?.major ?? undefined,
      },
      effect: arm.feature,
    })
  }

  // 4. 各部位义体
  const pushAugs = (list: CyberpunkAugmentation[] | undefined, zoneName: string) => {
    if (!list) return
    list.forEach((aug, idx) => {
      cards.push({
        id: aug.id || `aug-${zoneName}-${idx}`,
        name: aug.name || '未命名义体',
        icon: aug.icon || aug.image,
        tier: aug.tier || cyberpunkData.tier || 'T1',
        type: '植入义体',
        zone: zoneName,
        slots: aug.slots ?? aug.slotCost,
        stats: {
          trait: (aug as any).trait || (aug as any).weaponStats?.trait,
          range: (aug as any).range || (aug as any).weaponStats?.range,
          damage: (aug as any).damage || (aug as any).weaponStats?.damage,
          burden: (aug as any).burden || (aug as any).weaponStats?.burden,
          armorScore: (aug as any).armorScore || (aug as any).armorStats?.armorScore,
          majorThreshold: aug.thresholdBonus?.major || (aug as any).armorStats?.majorThreshold,
          severeThreshold: aug.thresholdBonus?.severe || (aug as any).armorStats?.severeThreshold,
        },
        effect: aug.effect || aug.rulesText,
        description: aug.description,
      })
    })
  }

  pushAugs(getZoneAugmentations(cyberpunkData, 'head'), '头部')
  pushAugs(getZoneAugmentations(cyberpunkData, 'torso'), '躯干')
  pushAugs(getZoneAugmentations(cyberpunkData, 'upper_limb'), '上肢')
  pushAugs(getZoneAugmentations(cyberpunkData, 'lower_limb'), '下肢')

  // 5. 外置挂载装备
  if (cyberpunkData.externalGear) {
    cyberpunkData.externalGear.forEach((gear, idx) => {
      cards.push({
        id: gear.id || `gear-ext-${idx}`,
        name: gear.name || '外置设备',
        icon: gear.icon || gear.image,
        tier: gear.tier || cyberpunkData.tier || 'T1',
        type: gear.cyberType || '外置挂载',
        zone: gear.zone || '挂载',
        slots: gear.slots ?? gear.slotCost,
        stats: {
          trait: (gear as any).trait || gear.weaponStats?.trait,
          range: (gear as any).range || gear.weaponStats?.range,
          damage: (gear as any).damage || gear.weaponStats?.damage,
          burden: (gear as any).burden || gear.weaponStats?.burden,
          armorScore: (gear as any).armorScore || gear.armorStats?.armorScore,
          majorThreshold: (gear as any).majorThreshold || gear.armorStats?.majorThreshold,
          severeThreshold: (gear as any).severeThreshold || gear.armorStats?.severeThreshold,
        },
        effect: gear.effect,
        description: gear.description,
      })
    })
  }

  // 按 9 张一组切片成多页 A4（通常 1 页正好容纳 8~9 张）
  const pages: PrintableCardItem[][] = []
  for (let i = 0; i < Math.max(1, cards.length); i += 9) {
    pages.push(cards.slice(i, i + 9))
  }

  return (
    <>
      {pages.map((pageCards, pageIdx) => (
        <div key={pageIdx} className="a4-print-page flex flex-col justify-between select-none">
          {/* 页眉指示 */}
          <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500 border-b border-neutral-300 pb-1 mb-2">
            <span>
              ［ 渊边行者 实体卡牌裁剪页 · 已装配赛博军备与义体 ］（标准卡套尺寸: 63.5mm × 88.9mm）
            </span>
            <span>
              PAGE {pageIdx + 2} / {pages.length + 1}
            </span>
          </div>

          {/* 3×3 九宫格卡牌容器 */}
          <div className="print-card-grid-3x3 flex-1">
            {pageCards.map((card) => (
              <div key={card.id} className="print-cut-card text-[9px] leading-tight">
                {/* 卡片 Header (黄色顶栏) */}
                <div className="bg-yellow-300 text-black p-1 rounded-t flex items-center justify-between border border-black shrink-0">
                  <div className="flex items-center gap-1 min-w-0">
                    <div className="w-5 h-5 bg-black text-yellow-300 font-bold flex items-center justify-center text-[8px] rounded-sm shrink-0 overflow-hidden">
                      {card.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={card.icon} alt="" className="w-full h-full object-cover" />
                      ) : (
                        card.name.slice(0, 2)
                      )}
                    </div>
                    <div className="font-black text-[10px] truncate">{card.name}</div>
                  </div>
                  <span className="font-mono text-[8px] font-bold bg-black text-yellow-300 px-1 py-0.5 rounded-sm shrink-0 ml-1">
                    {card.tier || 'T1'}
                  </span>
                </div>

                {/* 卡片 Meta 条 (类型 & 部位 & 槽位) */}
                <div className="bg-neutral-900 text-white px-1 py-0.5 text-[8px] flex justify-between items-center shrink-0 font-mono">
                  <span>{card.type} · {card.zone}</span>
                  {card.slots !== undefined && card.slots !== '' && card.slots !== 0 && (
                    <span className="bg-red-600 px-1 rounded-sm text-white font-bold">
                      {typeof card.slots === 'number' ? `${card.slots}槽` : String(card.slots)}
                    </span>
                  )}
                </div>

                {/* 卡片 Combat Stats 战术参数 */}
                {card.stats && Object.values(card.stats).some(Boolean) && (
                  <div className="bg-neutral-100 border border-neutral-300 p-0.5 my-0.5 rounded flex flex-wrap gap-1 text-[8px] shrink-0 font-mono">
                    {card.stats.trait && <span className="font-bold">{card.stats.trait}</span>}
                    {card.stats.range && <span>{card.stats.range}</span>}
                    {card.stats.damage && <span className="font-black text-red-700">{card.stats.damage}</span>}
                    {card.stats.burden && <span>{card.stats.burden}</span>}
                    {card.stats.armorScore !== undefined && card.stats.armorScore !== '' && (
                      <span className="font-bold">护甲+{card.stats.armorScore}</span>
                    )}
                    {(card.stats.majorThreshold || card.stats.severeThreshold) && (
                      <span>阈值:+{card.stats.majorThreshold || 0}/+{card.stats.severeThreshold || 0}</span>
                    )}
                  </div>
                )}

                {/* 卡片 Effect 规则文本 */}
                <div className="flex-1 overflow-hidden text-[8.5px] leading-snug py-0.5 text-neutral-800">
                  {card.effect ? (
                    <CardMarkdown>{card.effect}</CardMarkdown>
                  ) : (
                    <div className="text-neutral-400 italic">基础战术装备，无特殊特性。</div>
                  )}
                </div>

                {/* 卡片 Footer 风味描述 */}
                {card.description && (
                  <div className="text-[7.5px] italic text-neutral-500 border-t border-neutral-300 pt-0.5 shrink-0 truncate">
                    {card.description}
                  </div>
                )}
              </div>
            ))}

            {/* 补齐九宫格空位以保持裁剪网格整齐 */}
            {Array.from({ length: Math.max(0, 9 - pageCards.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="print-cut-card border border-dashed border-neutral-300 bg-neutral-50/40 flex items-center justify-center text-[9px] text-neutral-300 font-mono"
              >
                ［ 空装配槽 ］
              </div>
            ))}
          </div>

          {/* 页脚裁剪说明 */}
          <div className="text-[8px] text-neutral-400 text-center border-t border-neutral-200 pt-1 mt-1 font-mono">
            ✂ 沿虚线裁切后可直接插入 63.5mm × 88.9mm (2.5×3.5英寸) 标准透明卡套作为桌面实体道具使用
          </div>
        </div>
      ))}
    </>
  )
}
