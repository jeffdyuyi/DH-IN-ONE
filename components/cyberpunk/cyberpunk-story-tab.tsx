"use client"

import React from 'react'
import type { CyberpunkSheetExtension } from '@/types/cyberpunk'
import { BookOpen, User, Sparkles, AlertTriangle, Users, MessageSquareQuote, ShieldAlert, HeartHandshake, ScrollText } from 'lucide-react'

interface CyberpunkStoryTabProps {
  cyberpunkData: CyberpunkSheetExtension
  onChangeCyberpunk: (updated: CyberpunkSheetExtension) => void
  onSyncRootFormData?: (patch: Record<string, any>) => void
}

export function CyberpunkStoryTab({
  cyberpunkData,
  onChangeCyberpunk,
  onSyncRootFormData,
}: CyberpunkStoryTabProps) {
  const story = cyberpunkData.story || {}

  const handleFieldChange = (field: keyof NonNullable<CyberpunkSheetExtension['story']>, value: string) => {
    const updatedStory = {
      ...story,
      [field]: value,
    }

    onChangeCyberpunk({
      ...cyberpunkData,
      story: updatedStory,
    })

    // 同步到根 SheetData 字段，保证标准卡牌与导出兼容
    if (onSyncRootFormData) {
      if (field === 'backstory') onSyncRootFormData({ characterBackground: value })
      if (field === 'appearance') onSyncRootFormData({ characterAppearance: value })
      if (field === 'ideals') onSyncRootFormData({ characterMotivation: value })
    }
  }

  return (
    <div className="space-y-4">
      {/* 顶部标题横幅 */}
      <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-3.5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#00FFA3]" />
          <h2 className="text-sm font-bold text-white tracking-wide">
            角色故事与人物画像 (Character Story & Dossier)
          </h2>
        </div>
        <span className="text-[11px] text-slate-400">
          记录渊边行者的出身背景、性格动机、缺陷隐患与街头人际网
        </span>
      </div>

      {/* 第一行：基础属性档案 (性别、年龄、口头禅) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 性别 */}
        <div className="rounded-xl border border-[#6C00FF]/30 bg-[#0B0320] p-3 shadow-sm">
          <label className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 mb-1.5">
            <User className="w-3.5 h-3.5 text-[#00FFA3]" />
            <span>生理/认同性别 (Gender)</span>
          </label>
          <input
            type="text"
            value={story.gender || ''}
            onChange={(e) => handleFieldChange('gender', e.target.value)}
            placeholder="例如: 女性 / 男性 / 赛博无性体..."
            className="w-full rounded-lg border border-[#6C00FF]/40 bg-[#12072B] px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-[#00FFA3] focus:outline-none"
          />
        </div>

        {/* 年龄 */}
        <div className="rounded-xl border border-[#6C00FF]/30 bg-[#0B0320] p-3 shadow-sm">
          <label className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F5F500]" />
            <span>生理/义体年龄 (Age)</span>
          </label>
          <input
            type="text"
            value={story.age || ''}
            onChange={(e) => handleFieldChange('age', e.target.value)}
            placeholder="例如: 24岁 (仿生核心运作5年)..."
            className="w-full rounded-lg border border-[#6C00FF]/40 bg-[#12072B] px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-[#00FFA3] focus:outline-none font-mono"
          />
        </div>

        {/* 口头禅 */}
        <div className="rounded-xl border border-[#6C00FF]/30 bg-[#0B0320] p-3 shadow-sm">
          <label className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 mb-1.5">
            <MessageSquareQuote className="w-3.5 h-3.5 text-[#FF007F]" />
            <span>标志性口头禅 (Catchphrase)</span>
          </label>
          <input
            type="text"
            value={story.catchphrase || ''}
            onChange={(e) => handleFieldChange('catchphrase', e.target.value)}
            placeholder='例如: "只要价钱到位，夜城没有秘密。"'
            className="w-full rounded-lg border border-[#6C00FF]/40 bg-[#12072B] px-2.5 py-1.5 text-xs text-[#F5F500] placeholder-slate-500 focus:border-[#00FFA3] focus:outline-none"
          />
        </div>
      </div>

      {/* 第二行：性格与外貌特征 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 性格特质 */}
        <div className="rounded-xl border border-[#6C00FF]/30 bg-[#0B0320] p-3.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#6C00FF]/20">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00FFA3]" />
              <span>性格特质 (Personality)</span>
            </span>
            <span className="text-[10px] text-slate-400">行为模式、待人处事方式</span>
          </div>
          <textarea
            rows={3}
            value={story.personality || ''}
            onChange={(e) => handleFieldChange('personality', e.target.value)}
            placeholder="描述角色的性格、行事风格、情绪表达模式..."
            className="w-full rounded-lg border border-[#6C00FF]/40 bg-[#12072B] p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-[#00FFA3] focus:outline-none leading-relaxed resize-y"
          />
        </div>

        {/* 外貌与义体特征 */}
        <div className="rounded-xl border border-[#6C00FF]/30 bg-[#0B0320] p-3.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#6C00FF]/20">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#F5F500]" />
              <span>外貌与装束特征 (Appearance)</span>
            </span>
            <span className="text-[10px] text-slate-400">体貌、纹身、发光义眼、义体改装外观</span>
          </div>
          <textarea
            rows={3}
            value={story.appearance || ''}
            onChange={(e) => handleFieldChange('appearance', e.target.value)}
            placeholder="描述身材体格、服饰打扮、机械接合部、标志性义眼/纹身等视觉细节..."
            className="w-full rounded-lg border border-[#6C00FF]/40 bg-[#12072B] p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-[#00FFA3] focus:outline-none leading-relaxed resize-y"
          />
        </div>
      </div>

      {/* 第三行：理想信念与缺陷隐患 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 理想与动机 */}
        <div className="rounded-xl border border-[#00FFA3]/30 bg-[#0B0320] p-3.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#00FFA3]/20">
            <span className="text-xs font-bold text-[#00FFA3] flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>理想与终极渴望 (Ideals & Motivation)</span>
            </span>
            <span className="text-[10px] text-slate-400">推动角色前行的核心驱动力</span>
          </div>
          <textarea
            rows={3}
            value={story.ideals || ''}
            onChange={(e) => handleFieldChange('ideals', e.target.value)}
            placeholder="是什么驱使角色在深渊边缘冒险？赎罪、财富、向巨企复仇、或是寻找失踪的亲人？"
            className="w-full rounded-lg border border-[#6C00FF]/40 bg-[#12072B] p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-[#00FFA3] focus:outline-none leading-relaxed resize-y"
          />
        </div>

        {/* 缺陷与隐患 */}
        <div className="rounded-xl border border-[#FF007F]/30 bg-[#0B0320] p-3.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#FF007F]/20">
            <span className="text-xs font-bold text-[#FF007F] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>缺陷与精神隐患 (Flaws & Vulnerabilities)</span>
            </span>
            <span className="text-[10px] text-slate-400">致命弱点、执念、赛博精神压力倾向</span>
          </div>
          <textarea
            rows={3}
            value={story.flaws || ''}
            onChange={(e) => handleFieldChange('flaws', e.target.value)}
            placeholder="角色的弱点是什么？容易暴怒、药物成瘾、巨额高利贷、或对某种义体故障的创伤恐惧？"
            className="w-full rounded-lg border border-[#6C00FF]/40 bg-[#12072B] p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-[#FF007F] focus:outline-none leading-relaxed resize-y"
          />
        </div>
      </div>

      {/* 第四行：人际关系与街头联系人 */}
      <div className="rounded-xl border border-[#6C00FF]/30 bg-[#0B0320] p-3.5 shadow-sm space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-[#6C00FF]/20">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#F5F500]" />
            <span className="text-xs font-bold text-white">
              人际关系与街头联系人 (Relationships & Contacts)
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            队友羁绊、黑市中间人、义体医生、帮派盟友或仇敌
          </span>
        </div>
        <textarea
          rows={3}
          value={story.relationships || ''}
          onChange={(e) => handleFieldChange('relationships', e.target.value)}
          placeholder="记录你的关键人际网络：如【中间人·老杰克 - 可靠的情报来源】、【义体医生·卡特 - 欠下巨额改造费】、【小队先锋·雷 - 可以交托后背的生死之交】..."
          className="w-full rounded-lg border border-[#6C00FF]/40 bg-[#12072B] p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-[#00FFA3] focus:outline-none leading-relaxed resize-y font-sans"
        />
      </div>

      {/* 第五行：背景故事与传记全文 */}
      <div className="rounded-xl border border-[#6C00FF]/30 bg-[#0B0320] p-3.5 shadow-sm space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-[#6C00FF]/20">
          <div className="flex items-center gap-1.5">
            <ScrollText className="w-3.5 h-3.5 text-[#00FFA3]" />
            <span className="text-xs font-bold text-white">
              背景故事与传记 (Backstory & Biography)
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            成长历程、关键人生转折、如何成为渊边行者
          </span>
        </div>
        <textarea
          rows={7}
          value={story.backstory || ''}
          onChange={(e) => handleFieldChange('backstory', e.target.value)}
          placeholder="在此书写角色的完整生平、经历过的重大事件、为何踏入这片渊边之地..."
          className="w-full rounded-lg border border-[#6C00FF]/40 bg-[#12072B] p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-[#00FFA3] focus:outline-none leading-relaxed resize-y font-sans"
        />
      </div>
    </div>
  )
}
