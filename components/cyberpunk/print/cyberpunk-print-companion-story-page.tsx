"use client"

import React from 'react'
import type { SheetData } from '@/lib/sheet-data'
import type { CyberpunkSheetExtension } from '@/types/cyberpunk'
import { CardMarkdown } from '@/components/ui/card-markdown'

export function CyberpunkPrintCompanionStoryPage({
  sheetData,
  cyberpunkData,
}: {
  sheetData: SheetData
  cyberpunkData: CyberpunkSheetExtension
}) {
  const hasCompanion = Boolean(sheetData.companionName && sheetData.companionName.trim() !== '')
  const background = sheetData.characterBackground || cyberpunkData.story?.backstory || sheetData.adventureNotes?.backstory || ''
  const notes = sheetData.adventureNotes?.milestones || (cyberpunkData as any).notes || ''

  return (
    <div className="a4-print-page flex flex-col justify-between select-none text-[10.5px] leading-tight">
      {/* 页眉 */}
      <div className="flex justify-between items-center text-[9px] font-mono text-neutral-500 border-b-2 border-black pb-1 mb-2">
        <span className="font-black text-black text-xs uppercase">
          ［ 渊边行者 战术附页 · 战斗伙伴与档案记录 ］
        </span>
        <span>PAGE 4 (COMPANION & STORY)</span>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {/* 1. 战斗伙伴面板 (生化异兽/仿生搭档/机械战术随从) */}
        {hasCompanion && (
          <div className="border-2 border-black rounded p-2.5 bg-neutral-50">
            <div className="flex justify-between items-center border-b border-black pb-1 mb-2">
              <div className="flex items-center gap-2">
                <span className="bg-black text-white px-1.5 py-0.5 font-bold text-xs uppercase">
                  战术伙伴
                </span>
                <strong className="text-sm font-black">{sheetData.companionName}</strong>
                <span className="text-neutral-500 text-[10px]">({sheetData.companionWeapon || '战术随从/随行单位'})</span>
              </div>
              <div className="font-mono text-xs font-bold">
                压力上限: {sheetData.companionStressMax || 3}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-2 text-center text-[10px]">
              <div className="border border-neutral-300 rounded p-1 bg-white">
                <div className="text-neutral-500 text-[9px] font-bold">攻击动作/武器</div>
                <div className="font-bold font-mono">{sheetData.companionWeapon || '利爪/近战'}</div>
              </div>
              <div className="border border-neutral-300 rounded p-1 bg-white">
                <div className="text-neutral-500 text-[9px] font-bold">闪避 (Evasion)</div>
                <div className="font-bold font-mono">{sheetData.companionEvasion || '10'}</div>
              </div>
              <div className="border border-neutral-300 rounded p-1 bg-white">
                <div className="text-neutral-500 text-[9px] font-bold">射程范围</div>
                <div className="font-bold font-mono">{sheetData.companionRange || '近战/近距'}</div>
              </div>
            </div>

            {/* 伙伴压力轨 */}
            <div className="flex items-center gap-2 border-t border-neutral-200 pt-1 text-[9.5px]">
              <span className="font-bold">伙伴压力轨:</span>
              <div className="flex gap-1">
                {Array.from({ length: Number(sheetData.companionStressMax) || 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3.5 h-3.5 border border-black rounded-sm ${
                      Array.isArray(sheetData.companionStress) && sheetData.companionStress[i]
                        ? 'bg-black'
                        : 'bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>

            {sheetData.companionDescription && (
              <div className="mt-1.5 text-[9px] text-neutral-700 border-t border-neutral-200 pt-1">
                <CardMarkdown>{sheetData.companionDescription}</CardMarkdown>
              </div>
            )}
          </div>
        )}

        {/* 2. 角色背景故事与问卷调查 */}
        <div className="border border-black rounded p-2.5 bg-white flex-1 flex flex-col justify-between">
          <div className="font-bold text-xs border-b border-neutral-300 pb-1 mb-1.5 uppercase tracking-wider">
            渊边身世与战役手记 (Background & Mission Notes)
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1 text-[9.5px] leading-relaxed">
            <div className="border-r border-neutral-200 pr-2 flex flex-col">
              <strong className="text-neutral-900 block mb-1">【身世背景与黑市关系网】</strong>
              <div className="flex-1 overflow-hidden text-neutral-700">
                {background ? (
                  <CardMarkdown>{background}</CardMarkdown>
                ) : (
                  <div className="text-neutral-400 italic">尚未录入详细身世故事。</div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <strong className="text-neutral-900 block mb-1">【行动手记与关键情报】</strong>
              <div className="flex-1 overflow-hidden text-neutral-700">
                {notes ? (
                  <CardMarkdown>{notes}</CardMarkdown>
                ) : (
                  <div className="text-neutral-400 italic">尚无行动手记，可在实战跑团中手写记录。</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <div className="text-[8px] text-neutral-400 text-center border-t border-neutral-200 pt-1 mt-2 font-mono">
        Daggerheart RPG · 爽博朋克：渊边行者 · 战役官方角色卡
      </div>
    </div>
  )
}
