"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BookOpen, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Printer, 
  Database, 
  Layers, 
  FileText, 
  MessageSquare, 
  AlertCircle, 
  Check, 
  ChevronRight, 
  Sparkles,
  ShieldCheck
} from 'lucide-react'
import { ProjectData, Section, CampaignBlock, TextBlock, ReadAloudBlock, CalloutBlock, OutcomeBlock, EnemyBlock, EnvironmentBlock, LootBlock, CyberwareBlock } from './types'
import { VaultCardPickerModal } from './vault-card-picker-modal'

const DEFAULT_PROJECT: ProjectData = {
  id: 'proj_default',
  title: '鸦巢残响：序幕',
  author: '战役讲述者',
  description: '发生在渊边行者边陲地带的探索战役模组。',
  version: '1.0.0',
  systemVersion: 'Daggerheart 1.0',
  dpcglConsent: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  sections: [
    {
      id: 'sec_1',
      title: '第一幕：破碎的集市',
      blocks: [
        {
          id: 'b_1',
          type: 'text',
          content: '黄昏的微光斜射在锈蚀的钢铁穹顶上，空气中弥漫着机油与廉价合成香料的气味。玩家们正站在边缘集市的入口。'
        },
        {
          id: 'b_2',
          type: 'read_aloud',
          content: '“今晚的空气格外沉重，”集市角落里的盲眼老者低语道，“渊底的风暴就要来了，行者们。”'
        },
        {
          id: 'b_3',
          type: 'callout',
          title: '主持人指引',
          content: '此时让所有玩家进行一次【本能 (DC12)】掷骰，注意察觉阴影中潜伏的暗哨。',
          variant: 'info'
        }
      ]
    }
  ]
}

export function CampaignEditorApp() {
  const [project, setProject] = useState<ProjectData>(DEFAULT_PROJECT)
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0)
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false)
  const [saveToast, setSaveToast] = useState<boolean>(false)

  const activeSection = project.sections[activeSectionIndex] || project.sections[0]

  // 保存到 localStorage
  const handleSave = () => {
    localStorage.setItem('dh_v1_campaign_draft', JSON.stringify(project))
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2000)
  }

  // 新建章节
  const handleAddSection = () => {
    const newSec: Section = {
      id: `sec_${Date.now()}`,
      title: `第 ${project.sections.length + 1} 幕：未命名章节`,
      blocks: [
        {
          id: `b_${Date.now()}`,
          type: 'text',
          content: '章节起始描述...'
        }
      ]
    }
    setProject({
      ...project,
      sections: [...project.sections, newSec],
      updatedAt: Date.now()
    })
    setActiveSectionIndex(project.sections.length)
  }

  // 添加普通文本块
  const handleAddTextBlock = (type: 'text' | 'read_aloud' | 'callout' | 'outcome') => {
    let newBlock: CampaignBlock

    if (type === 'read_aloud') {
      newBlock = {
        id: `b_ra_${Date.now()}`,
        type: 'read_aloud',
        content: '大声朗读给玩家听的风味描述...'
      }
    } else if (type === 'callout') {
      newBlock = {
        id: `b_co_${Date.now()}`,
        type: 'callout',
        title: '关键战术提示',
        content: '给主持人的环境机制与裁决提醒。',
        variant: 'info'
      }
    } else if (type === 'outcome') {
      newBlock = {
        id: `b_oc_${Date.now()}`,
        type: 'outcome',
        entries: [
          { id: 'e1', tags: ['hope', 'success'], content: '关键成功且获得希望：立即发现密门并恢复 1 点压力。' },
          { id: 'e2', tags: ['fear', 'failure'], content: '伴随恐惧失败：触发警报，两名巡逻哨兵立刻入场。' }
        ]
      }
    } else {
      newBlock = {
        id: `b_tx_${Date.now()}`,
        type: 'text',
        content: '正文 Markdown 叙述内容...'
      }
    }

    const updatedSections = [...project.sections]
    updatedSections[activeSectionIndex].blocks.push(newBlock)
    setProject({ ...project, sections: updatedSections, updatedAt: Date.now() })
  }

  // 从公共库插入卡牌区块
  const handleInsertFromVault = (block: CampaignBlock) => {
    const updatedSections = [...project.sections]
    updatedSections[activeSectionIndex].blocks.push(block)
    setProject({ ...project, sections: updatedSections, updatedAt: Date.now() })
  }

  // 删除区块
  const handleDeleteBlock = (blockId: string) => {
    const updatedSections = [...project.sections]
    updatedSections[activeSectionIndex].blocks = updatedSections[activeSectionIndex].blocks.filter(b => b.id !== blockId)
    setProject({ ...project, sections: updatedSections, updatedAt: Date.now() })
  }

  // 导出 Markdown
  const handleExportMarkdown = () => {
    let md = `# ${project.title}\n\n**作者**: ${project.author} | **系统**: ${project.systemVersion}\n\n${project.description}\n\n---\n\n`
    for (const sec of project.sections) {
      md += `## ${sec.title}\n\n`
      for (const b of sec.blocks) {
        if (b.type === 'text') md += `${(b as TextBlock).content}\n\n`
        if (b.type === 'read_aloud') md += `> 📜 **朗读框**\n> ${(b as ReadAloudBlock).content}\n\n`
        if (b.type === 'callout') md += `> 💡 **${(b as CalloutBlock).title}**: ${(b as CalloutBlock).content}\n\n`
        if (b.type === 'enemy') {
          const eb = b as EnemyBlock
          md += `### 👾 敌人: ${eb.name} (LV.${eb.tier} ${eb.enemyType})\n- 难度: DC${eb.stats.difficulty} | HP: ${eb.stats.hp} | 压力: ${eb.stats.stress}\n- 攻击: ${eb.attack.name} (${eb.attack.damage}, ${eb.attack.range})\n- 战术: ${eb.tactics}\n\n`
        }
        if (b.type === 'environment') {
          const env = b as EnvironmentBlock
          md += `### 🌋 环境险境: ${env.name} (DC${env.difficulty}, 倒计时 ${env.countdown})\n- 趋向: ${env.trend}\n\n`
        }
        if (b.type === 'loot') {
          const lb = b as LootBlock
          md += `### 💎 ${lb.title}\n`
          for (const item of lb.items) {
            md += `- **${item.name}**: ${item.description}\n`
          }
          md += `\n`
        }
      }
      md += `---\n\n`
    }
    md += `*遵循 Darrington Press 社区许可 (DPCGL)*\n`

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.title || 'campaign'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#0B0320] text-slate-100 font-sans selection:bg-[#FF007F] selection:text-white">
      {/* 顶部主导航 */}
      <header className="border-b border-white/10 backdrop-blur-md bg-black/40 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>主站</span>
            </Link>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF007F] to-[#6C00FF] flex items-center justify-center font-bold text-xs text-white">
                CP
              </div>
              <h1 className="font-extrabold text-base tracking-wider">匕首心战役文档编辑器</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPickerOpen(true)}
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-[#FF007F]/40 text-[#FF007F] bg-[#FF007F]/10 hover:bg-[#FF007F]/20 transition shadow-[0_0_12px_rgba(255,0,127,0.15)]"
            >
              <Database className="w-4 h-4" />
              <span>从公共库插入卡牌</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-[#00FFA3] text-black hover:opacity-90 transition shadow-[0_0_12px_rgba(0,255,163,0.2)]"
            >
              {saveToast ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{saveToast ? '已保存！' : '保存模组'}</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition"
              title="导出为 Markdown 文件"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出 MD</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition"
              title="A4 打印 / 导出 PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>打印</span>
            </button>
          </div>
        </div>
      </header>

      {/* 主体工作区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 左侧：章节大纲导航 */}
        <div className="lg:col-span-3 bg-white/[0.02] border border-white/10 rounded-2xl p-4 max-h-[calc(100vh-140px)] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <span className="text-xs font-bold text-slate-400">战役大纲目录</span>
            <button
              onClick={handleAddSection}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
              title="新建章节"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {project.sections.map((sec, idx) => {
              const isActive = idx === activeSectionIndex
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF007F]/20 to-[#6C00FF]/20 border border-[#FF007F]/40 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{sec.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 ml-2" />
                </button>
              )
            })}
          </div>

          {/* 模组全局信息编辑 */}
          <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">战役标题</label>
              <input
                type="text"
                value={project.title}
                onChange={(e) => setProject({ ...project, title: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#FF007F]"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">作者</label>
              <input
                type="text"
                value={project.author}
                onChange={(e) => setProject({ ...project, author: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* 中间与右侧：当前章节内容块编辑与排版预览 */}
        <div className="lg:col-span-9 space-y-6">
          {/* 章节标题编辑与工具栏 */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <input
                type="text"
                value={activeSection.title}
                onChange={(e) => {
                  const updatedSections = [...project.sections]
                  updatedSections[activeSectionIndex].title = e.target.value
                  setProject({ ...project, sections: updatedSections })
                }}
                className="text-xl font-bold bg-transparent border-b border-white/10 hover:border-white/30 focus:border-[#FF007F] text-white outline-none pb-1 w-full max-w-md"
              />

              {/* 区块插入快捷按钮组 */}
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                <button
                  onClick={() => handleAddTextBlock('text')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center space-x-1"
                >
                  <FileText className="w-3.5 h-3.5 text-[#00FFA3]" />
                  <span>+ 正文</span>
                </button>
                <button
                  onClick={() => handleAddTextBlock('read_aloud')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center space-x-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#F5F500]" />
                  <span>+ 朗读框</span>
                </button>
                <button
                  onClick={() => handleAddTextBlock('callout')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center space-x-1"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>+ 提示框</span>
                </button>
                <button
                  onClick={() => handleAddTextBlock('outcome')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FF007F]" />
                  <span>+ 判定表</span>
                </button>
                <button
                  onClick={() => setIsPickerOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FF007F]/20 hover:bg-[#FF007F]/30 border border-[#FF007F]/40 text-[#FF007F] transition flex items-center space-x-1"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>+ 插入卡牌库</span>
                </button>
              </div>
            </div>

            {/* 区块列表渲染 */}
            <div className="space-y-4">
              {activeSection.blocks.map((block, bIdx) => {
                return (
                  <div
                    key={block.id}
                    className="p-4 rounded-xl border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition relative group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-slate-400 uppercase">
                        {block.type}
                      </span>
                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition"
                        title="删除此区块"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* 正文编辑 */}
                    {block.type === 'text' && (
                      <textarea
                        rows={3}
                        value={(block as TextBlock).content}
                        onChange={(e) => {
                          const updated = [...project.sections]
                          ;(updated[activeSectionIndex].blocks[bIdx] as TextBlock).content = e.target.value
                          setProject({ ...project, sections: updated })
                        }}
                        className="w-full bg-black/40 border border-white/5 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-[#00FFA3]"
                      />
                    )}

                    {/* 朗读框编辑 */}
                    {block.type === 'read_aloud' && (
                      <div className="border-l-4 border-[#F5F500] pl-3 py-1 bg-[#F5F500]/5 rounded-r-lg">
                        <textarea
                          rows={2}
                          value={(block as ReadAloudBlock).content}
                          onChange={(e) => {
                            const updated = [...project.sections]
                            ;(updated[activeSectionIndex].blocks[bIdx] as ReadAloudBlock).content = e.target.value
                            setProject({ ...project, sections: updated })
                          }}
                          className="w-full bg-transparent border-none text-xs italic text-amber-200 outline-none resize-none"
                        />
                      </div>
                    )}

                    {/* 敌人卡块展示与编辑 */}
                    {block.type === 'enemy' && (
                      <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-950/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-purple-300">👾 敌人: {(block as EnemyBlock).name}</h4>
                          <span className="text-[10px] text-slate-400">LV.{(block as EnemyBlock).tier} {(block as EnemyBlock).enemyType}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{(block as EnemyBlock).tactics}</p>
                      </div>
                    )}

                    {/* 环境卡块展示 */}
                    {block.type === 'environment' && (
                      <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-950/20 space-y-1">
                        <h4 className="font-bold text-sm text-rose-300">🌋 环境险境: {(block as EnvironmentBlock).name}</h4>
                        <div className="text-xs text-slate-300">
                          难度: DC{(block as EnvironmentBlock).difficulty} | 倒计时: {(block as EnvironmentBlock).countdown}
                        </div>
                      </div>
                    )}

                    {/* 掉落与物品清单块 */}
                    {block.type === 'loot' && (
                      <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 space-y-1">
                        <h4 className="font-bold text-sm text-emerald-300">💎 {(block as LootBlock).title}</h4>
                        {(block as LootBlock).items.map((it) => (
                          <div key={it.id} className="text-xs text-slate-300">
                            • <span className="font-semibold text-white">{it.name}</span>: {it.description}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 赛博装备清单块 */}
                    {block.type === 'cyberware' && (
                      <div className="p-3 rounded-lg border border-cyan-500/30 bg-cyan-950/20 space-y-1">
                        <h4 className="font-bold text-sm text-cyan-300">🦾 {(block as CyberwareBlock).title}</h4>
                        {(block as CyberwareBlock).items.map((it) => (
                          <div key={it.id} className="text-xs text-slate-300">
                            • <span className="font-semibold text-white">{it.name}</span> ({it.zone}, {it.slots}槽位): {it.effect}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 从公共库插入卡牌的 Modal */}
      <VaultCardPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onInsertBlock={handleInsertFromVault}
      />
    </div>
  )
}
