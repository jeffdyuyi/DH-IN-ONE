"use client"

import React from 'react'
import type { SheetData } from '@/lib/sheet-data'
import { CardMarkdown } from '@/components/ui/card-markdown'
import { isEmptyCard } from '@/card/card-types'

export function CyberpunkPrintDomainCardsPage({
  sheetData,
}: {
  sheetData: SheetData
}) {
  // 提取领域卡 (slot 5~9 为已激活聚焦领域卡)
  const allCards = (sheetData.cards || []).filter((c) => c && !isEmptyCard(c))
  const domainCards = allCards.slice(5) // 5张领域卡
  const classCards = allCards.slice(0, 5) // 职业、子职业、种族、社群

  // 合并为一组 9 张卡片（先放 5 张聚焦领域卡，再放职业与子职业卡）
  const printableList = [...domainCards, ...classCards].slice(0, 9)

  if (printableList.length === 0) return null

  return (
    <div className="a4-print-page flex flex-col justify-between select-none">
      {/* 页眉指示 */}
      <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500 border-b border-neutral-300 pb-1 mb-2">
        <span>
          ［ 渊边行者 实体卡牌裁剪页 · 激活领域技能与职业特权 ］（标准卡套尺寸: 63.5mm × 88.9mm）
        </span>
        <span>
          DOMAIN DECK · PAGE 3
        </span>
      </div>

      {/* 3×3 九宫格卡牌容器 */}
      <div className="print-card-grid-3x3 flex-1">
        {printableList.map((card, idx) => (
          <div key={card.id || `domain-${idx}`} className="print-cut-card text-[9px] leading-tight">
            {/* 卡片 Header (领域深色顶栏) */}
            <div className="bg-neutral-900 text-white p-1 rounded-t flex items-center justify-between border border-black shrink-0">
              <div className="flex items-center gap-1 min-w-0">
                <div className="w-5 h-5 bg-yellow-400 text-black font-bold flex items-center justify-center text-[8px] rounded-sm shrink-0 overflow-hidden">
                  {card.cardSelectDisplay?.item1?.slice(0, 2) || (card.name || '领域').slice(0, 2)}
                </div>
                <div className="font-black text-[10px] truncate text-yellow-300">{card.name}</div>
              </div>
              <span className="font-mono text-[8px] font-bold bg-neutral-800 text-neutral-300 px-1 py-0.5 rounded-sm shrink-0 ml-1">
                {card.cardSelectDisplay?.item2 || '技能'}
              </span>
            </div>

            {/* 卡片 Meta 条 (消耗与属性要求) */}
            <div className="bg-neutral-100 border-x border-b border-neutral-300 text-neutral-800 px-1 py-0.5 text-[8px] flex justify-between items-center shrink-0 font-mono">
              <span>{card.cardSelectDisplay?.item1 || '通用领域'}</span>
              {card.cardSelectDisplay?.item3 && (
                <span className="font-bold text-neutral-900">{card.cardSelectDisplay.item3}</span>
              )}
            </div>

            {/* 卡片 Effect 规则全文 */}
            <div className="flex-1 overflow-hidden text-[8.5px] leading-snug py-1 text-neutral-800">
              {card.description ? (
                <CardMarkdown>{card.description}</CardMarkdown>
              ) : (
                <div className="text-neutral-400 italic">战术领域动作，无特殊额外说明。</div>
              )}
            </div>

            {/* 卡片 Footer 类别 */}
            <div className="text-[7.5px] font-mono text-neutral-400 border-t border-neutral-200 pt-0.5 flex justify-between items-center shrink-0">
              <span>Daggerheart · 领域卡</span>
              <span>{card.type}</span>
            </div>
          </div>
        ))}

        {/* 补齐九宫格空位 */}
        {Array.from({ length: Math.max(0, 9 - printableList.length) }).map((_, i) => (
          <div
            key={`empty-domain-${i}`}
            className="print-cut-card border border-dashed border-neutral-300 bg-neutral-50/40 flex items-center justify-center text-[9px] text-neutral-300 font-mono"
          >
            ［ 空领域卡槽 ］
          </div>
        ))}
      </div>

      {/* 页脚裁剪说明 */}
      <div className="text-[8px] text-neutral-400 text-center border-t border-neutral-200 pt-1 mt-1 font-mono">
        ✂ 沿虚线裁切后可直接插入 63.5mm × 88.9mm (2.5×3.5英寸) 标准透明卡套作为桌面实体道具使用
      </div>
    </div>
  )
}
