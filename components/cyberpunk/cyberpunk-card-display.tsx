"use client"

import React from 'react'
import { CardMarkdown } from '@/components/ui/card-markdown'
import { Trash2, ArrowLeftRight, X, Pin } from 'lucide-react'

export interface CyberpunkCardDisplayData {
  id?: string
  name: string
  icon?: string | null
  image?: string | null
  tier?: string
  cyberType?: string
  zone?: string
  slots?: string | number
  restriction?: string
  trait?: string
  range?: string
  damage?: string
  burden?: string
  damageType?: string
  armorScore?: number | string
  majorThreshold?: number | string
  severeThreshold?: number | string
  effect?: string
  description?: string
  compCost?: string
  surgCost?: string
  author?: string
  isPinned?: boolean
  onClosePin?: () => void
  onReplace?: () => void
  onRemove?: () => void
}

export function CyberpunkCardDisplay({
  data,
  className = '',
}: {
  data: CyberpunkCardDisplayData
  className?: string
}) {
  const tierVal = (data.tier || '').trim()
  const cleanType = (data.cyberType || '外置装备')
    .replace(/\s*\([a-zA-Z\s]+\)/gi, '')
    .trim()
  const zoneVal = (data.zone || '').trim()
  const rawSlots = data.slots
  let slotsText = ''
  if (rawSlots !== undefined && rawSlots !== null && rawSlots !== '' && rawSlots !== 0 && rawSlots !== '0' && rawSlots !== '-' && rawSlots !== '——') {
    slotsText = typeof rawSlots === 'number' ? `占用 ${rawSlots} 槽` : (String(rawSlots).includes('槽') ? String(rawSlots) : `占用 ${rawSlots} 槽`)
  }

  const hasCombatStats = Boolean(
    data.trait ||
      data.range ||
      data.damage ||
      data.burden ||
      (data.armorScore !== undefined && data.armorScore !== '' && data.armorScore !== 0) ||
      data.majorThreshold ||
      data.severeThreshold
  )

  return (
    <div
      className={`relative w-[320px] sm:w-[340px] bg-[#0D0D0D] text-white border-2 border-[#1F2229] flex flex-col justify-between overflow-hidden shadow-[0_0_35px_rgba(0,255,163,0.3)] transition-all font-sans select-none ${className}`}
      style={{
        clipPath:
          'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))',
      }}
    >
      {/* 1. Header (黄色顶栏 + Icon 徽章 + 名称与类型) */}
      <div className="bg-[#FCEE0A] text-[#0D0D0D] p-3 px-4 relative shrink-0 flex items-center gap-3">
        {/* 左侧正方形 Icon 徽章 */}
        <div className="w-11 h-11 rounded-lg border-2 border-[#0D0D0D] bg-[#0D0D0D] flex items-center justify-center shrink-0 overflow-hidden shadow-inner font-mono select-none">
          {data.icon || data.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={(data.icon || data.image)!}
              alt={data.name || ''}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[11px] font-black text-[#FCEE0A] text-center leading-none tracking-tight">
              {(data.name || '元件').slice(0, 4)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5">
            <div className="text-[17px] font-black leading-tight tracking-wide text-[#0D0D0D] truncate">
              {data.name || '未命名装备'}
            </div>
          </div>
          <div className="text-[11px] font-bold text-[#4A4600] uppercase tracking-wider mt-0.5 truncate">
            {cleanType}
          </div>
        </div>

        {/* 右上角位阶角标与钉住关闭操作 */}
        <div className="absolute top-2.5 right-3 flex items-center gap-1">
          {tierVal ? (
            <span className="bg-[#0D0D0D] text-[#FCEE0A] text-[10px] font-black px-1.5 py-0.5 tracking-wider rounded-sm font-mono">
              {tierVal}
            </span>
          ) : null}
          {data.isPinned && data.onClosePin && (
            <button
              type="button"
              onClick={data.onClosePin}
              className="p-1 rounded bg-[#0D0D0D] text-[#FCEE0A] hover:bg-black hover:text-white transition-colors ml-1"
              title="关闭固定显示"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Meta Bar (部位 & 槽位) */}
      {(zoneVal || slotsText) && (
        <div className="bg-[#15181E] border-t border-b border-[#2B313D] px-4 py-1.5 flex justify-between items-center shrink-0 text-xs">
          <div className="text-[11px] font-bold text-[#00F0FF] flex items-center gap-1">
            {zoneVal && (
              <>
                部位: <span className="text-white font-normal">{zoneVal}</span>
              </>
            )}
          </div>
          {slotsText ? (
            <div className="bg-[#FF003C] text-white text-[10px] font-black px-1.5 py-0.5 tracking-wide rounded-sm">
              {slotsText}
            </div>
          ) : null}
        </div>
      )}

      {/* 3. 卡片主体内容 */}
      <div className="p-3.5 flex flex-col gap-2.5 flex-1 bg-[#0D0D0D] text-left">
        {data.restriction && (
          <div className="text-[11px] text-[#8F98A3] border-l-2 border-[#00F0FF] pl-2 leading-tight">
            {data.restriction.startsWith('限制') ? data.restriction : `限制: ${data.restriction}`}
          </div>
        )}

        {/* 作战参数栏 (属性、射程、伤害、负荷、护甲) */}
        {hasCombatStats && (
          <div className="bg-[#13161F] border border-[#2B313D] p-2 rounded flex flex-wrap items-center gap-1.5 text-xs">
            {data.trait && (
              <span className="bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 px-1.5 py-0.5 rounded font-bold text-[11px]">
                {data.trait}
              </span>
            )}
            {data.range && (
              <span className="bg-[#1F2430] text-zinc-300 px-1.5 py-0.5 rounded text-[11px]">
                {data.range}
              </span>
            )}
            {data.damage && (
              <span className="bg-[#FF003C]/20 text-[#FF003C] border border-[#FF003C]/50 px-1.5 py-0.5 rounded font-black font-mono text-[12px]">
                {data.damage}
              </span>
            )}
            {data.burden && (
              <span className="text-zinc-400 font-bold text-[11px] px-0.5">
                {data.burden}
              </span>
            )}
            {data.damageType && (
              <span className="text-zinc-400 text-[11px]">
                {data.damageType}
              </span>
            )}
            {data.armorScore !== undefined && data.armorScore !== '' && (
              <span className="bg-[#FCEE0A]/15 text-[#FCEE0A] border border-[#FCEE0A]/40 px-1.5 py-0.5 rounded font-bold text-[11px]">
                护甲: +{data.armorScore}
              </span>
            )}
            {(data.majorThreshold || data.severeThreshold) && (
              <span className="text-[#00F0FF] font-mono text-[11px] bg-[#00F0FF]/10 px-1.5 py-0.5 rounded">
                阈值: +{data.majorThreshold || 0}/+{data.severeThreshold || 0}
              </span>
            )}
          </div>
        )}

        {/* 核心特性与规则文本 (全量 Markdown 粗体加粗与样式支持) */}
        {data.effect && (
          <div className="text-[12px] leading-relaxed text-[#E1E4EA] max-h-48 overflow-y-auto custom-scrollbar pr-1">
            <CardMarkdown>{data.effect}</CardMarkdown>
          </div>
        )}

        {/* 背景风味描述 */}
        {data.description && (
          <div className="text-[11px] italic text-[#8F98A3] pt-1.5 border-t border-[#1F2229] leading-relaxed">
            <CardMarkdown>{data.description}</CardMarkdown>
          </div>
        )}
      </div>

      {/* 4. 底部栏 (价格/创作者信息 + 钉住时的更换/卸下操作) */}
      <div className="bg-[#0A0A0A] border-t border-[#1F2229] p-3 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <div>
          {data.author ? (
            <span>作者: <strong className="text-[#00F0FF]">{data.author}</strong></span>
          ) : (
            <span>赛博元件档案</span>
          )}
        </div>

        {/* 钉住或悬停时的操作按钮 */}
        <div className="flex items-center gap-2">
          {data.onRemove && (
            <button
              type="button"
              onClick={data.onRemove}
              className="flex items-center gap-1 text-[11px] text-red-400 bg-red-950/50 hover:bg-red-900/80 px-2.5 py-1 rounded border border-red-500/40 font-bold font-sans transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>卸下</span>
            </button>
          )}
          {data.onReplace && (
            <button
              type="button"
              onClick={data.onReplace}
              className="flex items-center gap-1 text-[11px] text-[#00FFA3] bg-[#00FFA3]/15 hover:bg-[#00FFA3]/30 px-2.5 py-1 rounded border border-[#00FFA3]/40 font-bold font-sans transition-colors"
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span>更换</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
