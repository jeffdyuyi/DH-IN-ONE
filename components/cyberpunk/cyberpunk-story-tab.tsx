"use client"

import React, { useState } from 'react'
import { useSheetStore } from '@/lib/sheet-store'
import type { CyberpunkSheetExtension } from '@/types/cyberpunk'
import type { AdventureNotesCharacterProfile, AdventureNotesPlayerInfo, AdventureLogEntry } from '@/lib/sheet-data'
import { User, BookOpen, Plus, Trash2, ShieldAlert, HeartHandshake, Sparkles, ScrollText, Users, Package, Sliders } from 'lucide-react'

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
  const formData = useSheetStore((state) => state.sheetData)
  const setFormData = useSheetStore((state) => state.setSheetData)

  const story = cyberpunkData.story || {}
  const profile: AdventureNotesCharacterProfile = formData.adventureNotes?.characterProfile || {}
  const playerInfo: AdventureNotesPlayerInfo = formData.adventureNotes?.playerInfo || {}
  const adventureLog: AdventureLogEntry[] = formData.adventureNotes?.adventureLog || []

  // 更新角色档案字段（同步至 adventureNotes.characterProfile 与 cyberpunkData.story）
  const handleProfileChange = (field: keyof AdventureNotesCharacterProfile, value: string) => {
    const updatedProfile = { ...profile, [field]: value }
    setFormData((prev) => ({
      ...prev,
      adventureNotes: {
        ...prev.adventureNotes,
        characterProfile: updatedProfile,
      },
      ...(field === 'gender' ? { gender: value } : {}),
      ...(field === 'age' ? { age: value } : {}),
    }))

    onChangeCyberpunk({
      ...cyberpunkData,
      story: {
        ...story,
        [field]: value,
      },
    })
  }

  // 更新性格动机与缺陷
  const handleStoryFieldChange = (field: keyof NonNullable<CyberpunkSheetExtension['story']>, value: any) => {
    onChangeCyberpunk({
      ...cyberpunkData,
      story: {
        ...story,
        [field]: value,
      },
    })

    if (field === 'backstory') {
      setFormData((prev) => ({
        ...prev,
        characterBackground: value,
        adventureNotes: {
          ...prev.adventureNotes,
          backstory: value,
        },
      }))
    } else if (field === 'appearance') {
      setFormData((prev) => ({ ...prev, characterAppearance: value }))
    } else if (field === 'ideals') {
      setFormData((prev) => ({ ...prev, characterMotivation: value }))
    }
  }

  // 联络人/人际关系行管理
  const contacts = story.contacts || [
    { id: '1', name: '', role: '', attitude: '友好', notes: '' },
  ]

  const handleAddContact = () => {
    const newContact = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: '',
      role: '',
      attitude: '中立',
      notes: '',
    }
    handleStoryFieldChange('contacts', [...contacts, newContact])
  }

  const handleUpdateContact = (index: number, key: string, value: string) => {
    const updated = contacts.map((c, i) => (i === index ? { ...c, [key]: value } : c))
    handleStoryFieldChange('contacts', updated)
  }

  const handleRemoveContact = (index: number) => {
    const updated = contacts.filter((_, i) => i !== index)
    handleStoryFieldChange('contacts', updated)
  }

  // 冒险历程行管理
  const handleAddLog = () => {
    const newLog: AdventureLogEntry = { name: '', levelRange: '', trauma: '', date: '' }
    setFormData((prev) => ({
      ...prev,
      adventureNotes: {
        ...prev.adventureNotes,
        adventureLog: [...(prev.adventureNotes?.adventureLog || []), newLog],
      },
    }))
  }

  const handleUpdateLog = (index: number, key: keyof AdventureLogEntry, value: string) => {
    const updated = (formData.adventureNotes?.adventureLog || []).map((log, i) =>
      i === index ? { ...log, [key]: value } : log
    )
    setFormData((prev) => ({
      ...prev,
      adventureNotes: {
        ...prev.adventureNotes,
        adventureLog: updated,
      },
    }))
  }

  const handleRemoveLog = (index: number) => {
    const updated = (formData.adventureNotes?.adventureLog || []).filter((_, i) => i !== index)
    setFormData((prev) => ({
      ...prev,
      adventureNotes: {
        ...prev.adventureNotes,
        adventureLog: updated,
      },
    }))
  }

  return (
    <div className="space-y-4 font-sans text-slate-100">
      {/* 1. 角色体貌与生理画像 */}
      <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#00FFA3]" />
            <h3 className="text-sm font-bold text-white tracking-wide">生理与体貌画像</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">基础属性与外观细节</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs">
          {/* 性别 */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">性别</label>
            <input
              type="text"
              value={profile.gender || story.gender || ''}
              onChange={(e) => handleProfileChange('gender', e.target.value)}
              placeholder="性别..."
              className="w-full rounded border border-[#6C00FF]/40 bg-[#0B0320] px-2 py-1 text-xs text-white focus:border-[#00FFA3] focus:outline-none"
            />
          </div>

          {/* 年龄 */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">年龄</label>
            <input
              type="text"
              value={profile.age || story.age || ''}
              onChange={(e) => handleProfileChange('age', e.target.value)}
              placeholder="年龄..."
              className="w-full rounded border border-[#6C00FF]/40 bg-[#0B0320] px-2 py-1 text-xs text-white focus:border-[#00FFA3] focus:outline-none font-mono"
            />
          </div>

          {/* 身高 */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">身高</label>
            <input
              type="text"
              value={profile.height || ''}
              onChange={(e) => handleProfileChange('height', e.target.value)}
              placeholder="例如: 178cm"
              className="w-full rounded border border-[#6C00FF]/40 bg-[#0B0320] px-2 py-1 text-xs text-white focus:border-[#00FFA3] focus:outline-none"
            />
          </div>

          {/* 体重 */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">体重</label>
            <input
              type="text"
              value={profile.weight || ''}
              onChange={(e) => handleProfileChange('weight', e.target.value)}
              placeholder="例如: 72kg"
              className="w-full rounded border border-[#6C00FF]/40 bg-[#0B0320] px-2 py-1 text-xs text-white focus:border-[#00FFA3] focus:outline-none"
            />
          </div>

          {/* 肤色 */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">肤色</label>
            <input
              type="text"
              value={profile.skinColor || ''}
              onChange={(e) => handleProfileChange('skinColor', e.target.value)}
              placeholder="肤色..."
              className="w-full rounded border border-[#6C00FF]/40 bg-[#0B0320] px-2 py-1 text-xs text-white focus:border-[#00FFA3] focus:outline-none"
            />
          </div>

          {/* 发色 */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">发色</label>
            <input
              type="text"
              value={profile.hairColor || ''}
              onChange={(e) => handleProfileChange('hairColor', e.target.value)}
              placeholder="发色..."
              className="w-full rounded border border-[#6C00FF]/40 bg-[#0B0320] px-2 py-1 text-xs text-white focus:border-[#00FFA3] focus:outline-none"
            />
          </div>

          {/* 瞳色 */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">瞳色</label>
            <input
              type="text"
              value={profile.eyeColor || ''}
              onChange={(e) => handleProfileChange('eyeColor', e.target.value)}
              placeholder="瞳色 / 义眼色"
              className="w-full rounded border border-[#6C00FF]/40 bg-[#0B0320] px-2 py-1 text-xs text-white focus:border-[#00FFA3] focus:outline-none"
            />
          </div>

          {/* 出生地 */}
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">出生地 / 辖区</label>
            <input
              type="text"
              value={profile.birthplace || ''}
              onChange={(e) => handleProfileChange('birthplace', e.target.value)}
              placeholder="出生地..."
              className="w-full rounded border border-[#6C00FF]/40 bg-[#0B0320] px-2 py-1 text-xs text-white focus:border-[#00FFA3] focus:outline-none"
            />
          </div>
        </div>

        {/* 外貌装束与口头禅 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">
              外貌装束与改装特征
            </label>
            <textarea
              rows={2}
              value={story.appearance || formData.characterAppearance || ''}
              onChange={(e) => handleStoryFieldChange('appearance', e.target.value)}
              placeholder="体格体貌、服饰风格、机械改装接合部细节..."
              className="w-full rounded border border-[#6C00FF]/40 bg-[#0B0320] p-2 text-xs text-white focus:border-[#00FFA3] focus:outline-none resize-y"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">
              信仰理念与口头禅
            </label>
            <textarea
              rows={2}
              value={story.catchphrase || profile.faith || ''}
              onChange={(e) => {
                handleStoryFieldChange('catchphrase', e.target.value)
                handleProfileChange('faith', e.target.value)
              }}
              placeholder="核心信条或标志性口头禅..."
              className="w-full rounded border border-[#6C00FF]/40 bg-[#0B0320] p-2 text-xs text-[#F5F500] focus:border-[#00FFA3] focus:outline-none resize-y"
            />
          </div>
        </div>
      </div>

      {/* 2. 性格、理想与缺陷 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 性格特质 */}
        <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-3.5 shadow-md space-y-1.5">
          <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-1.5">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00FFA3]" />
              <span>性格特质</span>
            </span>
          </div>
          <textarea
            rows={3}
            value={story.personality || ''}
            onChange={(e) => handleStoryFieldChange('personality', e.target.value)}
            placeholder="行事风格、情绪表达模式..."
            className="w-full rounded border border-[#6C00FF]/40 bg-[#0B0320] p-2 text-xs text-white focus:border-[#00FFA3] focus:outline-none leading-relaxed resize-y"
          />
        </div>

        {/* 理想与动机 */}
        <div className="rounded-xl border border-[#00FFA3]/30 bg-[#12072B] p-3.5 shadow-md space-y-1.5">
          <div className="flex items-center justify-between border-b border-[#00FFA3]/20 pb-1.5">
            <span className="text-xs font-bold text-[#00FFA3] flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>理想与动机</span>
            </span>
          </div>
          <textarea
            rows={3}
            value={story.ideals || formData.characterMotivation || ''}
            onChange={(e) => handleStoryFieldChange('ideals', e.target.value)}
            placeholder="推动角色前行的终极渴望与动机..."
            className="w-full rounded border border-[#6C00FF]/40 bg-[#0B0320] p-2 text-xs text-white focus:border-[#00FFA3] focus:outline-none leading-relaxed resize-y"
          />
        </div>

        {/* 缺陷与隐患 */}
        <div className="rounded-xl border border-[#FF007F]/30 bg-[#12072B] p-3.5 shadow-md space-y-1.5">
          <div className="flex items-center justify-between border-b border-[#FF007F]/20 pb-1.5">
            <span className="text-xs font-bold text-[#FF007F] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>缺陷与隐患</span>
            </span>
          </div>
          <textarea
            rows={3}
            value={story.flaws || ''}
            onChange={(e) => handleStoryFieldChange('flaws', e.target.value)}
            placeholder="致命弱点、执念或赛博精神压力倾向..."
            className="w-full rounded border border-[#6C00FF]/40 bg-[#0B0320] p-2 text-xs text-white focus:border-[#FF007F] focus:outline-none leading-relaxed resize-y"
          />
        </div>
      </div>

      {/* 3. 人际网络与联络人名录 (结构化表格) */}
      <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 shadow-md space-y-2.5">
        <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#F5F500]" />
            <h3 className="text-sm font-bold text-white tracking-wide">人际网络与联络人名录</h3>
          </div>
          <button
            type="button"
            onClick={handleAddContact}
            className="flex items-center gap-1 text-[11px] font-bold text-[#00FFA3] bg-[#00FFA3]/10 hover:bg-[#00FFA3]/20 px-2 py-1 rounded border border-[#00FFA3]/30 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>添加联络人</span>
          </button>
        </div>

        <div className="space-y-1.5">
          {contacts.map((contact, idx) => (
            <div
              key={contact.id || idx}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2 rounded-lg border border-[#6C00FF]/25 bg-[#0B0320] items-center text-xs"
            >
              <div className="sm:col-span-3">
                <input
                  type="text"
                  value={contact.name || ''}
                  onChange={(e) => handleUpdateContact(idx, 'name', e.target.value)}
                  placeholder="姓名 / 绰号"
                  className="w-full rounded border border-[#6C00FF]/40 bg-[#12072B] px-2 py-1 text-xs text-white focus:border-[#00FFA3] focus:outline-none font-bold"
                />
              </div>

              <div className="sm:col-span-3">
                <input
                  type="text"
                  value={contact.role || ''}
                  onChange={(e) => handleUpdateContact(idx, 'role', e.target.value)}
                  placeholder="身份 (如: 中间人 / 医生)"
                  className="w-full rounded border border-[#6C00FF]/40 bg-[#12072B] px-2 py-1 text-xs text-slate-300 focus:border-[#00FFA3] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={contact.attitude || ''}
                  onChange={(e) => handleUpdateContact(idx, 'attitude', e.target.value)}
                  placeholder="关系 (友好/敌对)"
                  className="w-full rounded border border-[#6C00FF]/40 bg-[#12072B] px-2 py-1 text-xs text-[#F5F500] focus:border-[#00FFA3] focus:outline-none text-center"
                />
              </div>

              <div className="sm:col-span-3">
                <input
                  type="text"
                  value={contact.notes || ''}
                  onChange={(e) => handleUpdateContact(idx, 'notes', e.target.value)}
                  placeholder="交集与备注..."
                  className="w-full rounded border border-[#6C00FF]/40 bg-[#12072B] px-2 py-1 text-xs text-slate-400 focus:border-[#00FFA3] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveContact(idx)}
                  className="p-1 text-slate-500 hover:text-[#FF007F] rounded transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 完整生平传记与背景故事 */}
      <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 shadow-md space-y-2">
        <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-2">
          <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-[#00FFA3]" />
            <h3 className="text-sm font-bold text-white tracking-wide">背景故事与生平传记</h3>
          </div>
          <span className="text-[10px] text-slate-400">完整长篇传记，支持多段落</span>
        </div>
        <textarea
          rows={6}
          value={story.backstory || formData.characterBackground || formData.adventureNotes?.backstory || ''}
          onChange={(e) => handleStoryFieldChange('backstory', e.target.value)}
          placeholder="在此书写角色的完整生平经历、重大历史事件、如何成为渊边行者..."
          className="w-full rounded-lg border border-[#6C00FF]/40 bg-[#0B0320] p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-[#00FFA3] focus:outline-none leading-relaxed resize-y font-sans"
        />
      </div>

      {/* 5. 冒险履历与历程事件 */}
      <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 shadow-md space-y-2.5">
        <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-2">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#F5F500]" />
            <h3 className="text-sm font-bold text-white tracking-wide">历程记录 (Adventure Log)</h3>
          </div>
          <button
            type="button"
            onClick={handleAddLog}
            className="flex items-center gap-1 text-[11px] font-bold text-[#F5F500] bg-[#F5F500]/10 hover:bg-[#F5F500]/20 px-2 py-1 rounded border border-[#F5F500]/30 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>添加历程条目</span>
          </button>
        </div>

        <div className="space-y-1.5">
          {adventureLog.map((log, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2 rounded-lg border border-[#6C00FF]/25 bg-[#0B0320] items-center text-xs"
            >
              <div className="sm:col-span-4">
                <input
                  type="text"
                  value={log.name || ''}
                  onChange={(e) => handleUpdateLog(idx, 'name', e.target.value)}
                  placeholder="任务 / 事件名称"
                  className="w-full rounded border border-[#6C00FF]/40 bg-[#12072B] px-2 py-1 text-xs text-white focus:border-[#00FFA3] focus:outline-none font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={log.levelRange || ''}
                  onChange={(e) => handleUpdateLog(idx, 'levelRange', e.target.value)}
                  placeholder="等级跨度"
                  className="w-full rounded border border-[#6C00FF]/40 bg-[#12072B] px-2 py-1 text-xs text-slate-300 focus:border-[#00FFA3] focus:outline-none text-center"
                />
              </div>

              <div className="sm:col-span-3">
                <input
                  type="text"
                  value={log.trauma || ''}
                  onChange={(e) => handleUpdateLog(idx, 'trauma', e.target.value)}
                  placeholder="代价 / 创伤标记"
                  className="w-full rounded border border-[#6C00FF]/40 bg-[#12072B] px-2 py-1 text-xs text-[#FF007F] focus:border-[#00FFA3] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={log.date || ''}
                  onChange={(e) => handleUpdateLog(idx, 'date', e.target.value)}
                  placeholder="记录时间"
                  className="w-full rounded border border-[#6C00FF]/40 bg-[#12072B] px-2 py-1 text-xs text-slate-400 focus:border-[#00FFA3] focus:outline-none font-mono text-center"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveLog(idx)}
                  className="p-1 text-slate-500 hover:text-[#FF007F] rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {adventureLog.length === 0 && (
            <div className="text-center py-2 text-xs text-slate-500 italic">
              暂无历程记录，点击右上角添加
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
