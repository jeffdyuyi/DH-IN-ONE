"use client"

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { 
  BookOpen, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Upload, 
  Printer, 
  Database, 
  FileText, 
  MessageSquare, 
  AlertCircle, 
  Check, 
  ChevronRight, 
  Sparkles,
  Table as TableIcon,
  Heading,
  Minus
} from 'lucide-react'
import { 
  ProjectData, 
  Section, 
  CampaignBlock, 
  TextBlock, 
  SubsectionBlock,
  TableBlock,
  ReadAloudBlock, 
  CalloutBlock, 
  OutcomeBlock, 
  EnemyBlock, 
  EnvironmentBlock, 
  LootBlock, 
  CyberwareBlock,
  exportProjectToMarkdown
} from './types'
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeSection = project.sections[activeSectionIndex] || project.sections[0]

  // 保存到 localStorage
  const handleSave = () => {
    localStorage.setItem('dh_v1_campaign_draft', JSON.stringify(project))
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2000)
  }

  // 导入战役 JSON 文件
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result as string
        const parsed = JSON.parse(raw)
        if (parsed.sections && Array.isArray(parsed.sections)) {
          setProject(parsed)
          setActiveSectionIndex(0)
          alert(`成功导入战役模组【${parsed.title || file.name}】，包含 ${parsed.sections.length} 个章节！`)
        } else {
          alert('导入失败：该 JSON 文件不符合战役模组格式（缺少 sections 列表）。')
        }
      } catch (err) {
        alert('解析 JSON 失败，请检查文件格式。')
      }
    }
    reader.readAsText(file)
  }

  // 导出战役 JSON 文件
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(project, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.title || 'campaign'}.json`
    a.click()
    URL.revokeObjectURL(url)
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

  // 添加常规内容块
  const handleAddBlock = (type: 'text' | 'subsection' | 'table' | 'read_aloud' | 'callout' | 'outcome' | 'divider') => {
    let newBlock: CampaignBlock

    if (type === 'subsection') {
      newBlock = {
        id: `b_sub_${Date.now()}`,
        type: 'subsection',
        title: '小节标题'
      }
    } else if (type === 'table') {
      newBlock = {
        id: `b_tbl_${Date.now()}`,
        type: 'table',
        headers: ['装备/武器名称', '属性', '攻击距离', '基础伤害', '特性效果'],
        rows: [
          ['脉冲刃', '灵巧', '近战', 'd8 物理', '**双持：**近战时主武器伤害 +2。'],
          ['手腕脉冲枪', '敏捷', '远距离', 'd6 能量', '快速装填']
        ]
      }
    } else if (type === 'read_aloud') {
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
    } else if (type === 'divider') {
      newBlock = {
        id: `b_div_${Date.now()}`,
        type: 'divider'
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

  // 导出为带完整表格的 Markdown (.md)
  const handleExportMarkdown = () => {
    const md = exportProjectToMarkdown(project)
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
      {/* 隐藏的文件上传 input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportJson} 
        accept=".json" 
        className="hidden" 
      />

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

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition"
              title="导入战役 JSON 文件"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>导入 JSON</span>
            </button>

            <button
              onClick={handleExportJson}
              className="flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition"
              title="备份战役 JSON"
            >
              <Save className="w-3.5 h-3.5" />
              <span>导出 JSON</span>
            </button>

            <button
              onClick={() => setIsPickerOpen(true)}
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-[#FF007F]/40 text-[#FF007F] bg-[#FF007F]/10 hover:bg-[#FF007F]/20 transition shadow-[0_0_12px_rgba(255,0,127,0.15)]"
            >
              <Database className="w-4 h-4" />
              <span>从公共库插入卡牌</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#00FFA3] text-black hover:opacity-90 transition shadow-[0_0_12px_rgba(0,255,163,0.2)]"
            >
              {saveToast ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{saveToast ? '已保存！' : '保存'}</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#FF007F] to-[#6C00FF] text-white hover:opacity-90 transition shadow-[0_0_15px_rgba(255,0,127,0.3)]"
              title="导出为包含完整 Markdown 表格的 .md 文件"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出 MD (含表格)</span>
            </button>
          </div>
        </div>
      </header>

      {/* 主体工作区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 左侧：章节大纲导航 */}
        <div className="lg:col-span-3 bg-white/[0.02] border border-white/10 rounded-2xl p-4 max-h-[calc(100vh-140px)] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <span className="text-xs font-bold text-slate-400">战役大纲目录 ({project.sections.length})</span>
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
                value={activeSection?.title || ''}
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
                  onClick={() => handleAddBlock('text')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center space-x-1"
                >
                  <FileText className="w-3.5 h-3.5 text-[#00FFA3]" />
                  <span>+ 正文</span>
                </button>
                <button
                  onClick={() => handleAddBlock('subsection')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center space-x-1"
                >
                  <Heading className="w-3.5 h-3.5 text-amber-300" />
                  <span>+ 小节</span>
                </button>
                <button
                  onClick={() => handleAddBlock('table')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition flex items-center space-x-1"
                >
                  <TableIcon className="w-3.5 h-3.5 text-amber-300" />
                  <span>+ 数据表</span>
                </button>
                <button
                  onClick={() => handleAddBlock('read_aloud')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center space-x-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#F5F500]" />
                  <span>+ 朗读框</span>
                </button>
                <button
                  onClick={() => handleAddBlock('callout')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center space-x-1"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>+ 提示框</span>
                </button>
                <button
                  onClick={() => handleAddBlock('outcome')}
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
              {activeSection?.blocks.map((block, bIdx) => {
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
                        value={(block as TextBlock).content || ''}
                        onChange={(e) => {
                          const updated = [...project.sections]
                          ;(updated[activeSectionIndex].blocks[bIdx] as TextBlock).content = e.target.value
                          setProject({ ...project, sections: updated })
                        }}
                        className="w-full bg-black/40 border border-white/5 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-[#00FFA3]"
                      />
                    )}

                    {/* 小节标题编辑 */}
                    {block.type === 'subsection' && (
                      <input
                        type="text"
                        value={(block as SubsectionBlock).title || ''}
                        onChange={(e) => {
                          const updated = [...project.sections]
                          ;(updated[activeSectionIndex].blocks[bIdx] as SubsectionBlock).title = e.target.value
                          setProject({ ...project, sections: updated })
                        }}
                        className="w-full bg-black/40 border-b-2 border-amber-400/40 p-2 text-sm font-bold text-amber-300 outline-none focus:border-amber-400"
                        placeholder="小节标题..."
                      />
                    )}

                    {/* 数据表格编辑与渲染 */}
                    {block.type === 'table' && (
                      <div className="space-y-2 overflow-x-auto">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300 flex items-center space-x-1">
                            <TableIcon className="w-3.5 h-3.5" />
                            <span>数据表格 (共 {((block as TableBlock).rows || []).length} 行)</span>
                          </span>
                          <button
                            onClick={() => {
                              const updated = [...project.sections]
                              const tb = updated[activeSectionIndex].blocks[bIdx] as TableBlock
                              const newRow = (tb.headers || []).map(() => '—')
                              tb.rows = [...(tb.rows || []), newRow]
                              setProject({ ...project, sections: updated })
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 hover:bg-amber-400/20 transition"
                          >
                            + 添加数据行
                          </button>
                        </div>
                        <table className="w-full border-collapse text-xs text-left">
                          <thead>
                            <tr className="border-b border-amber-500/30 bg-amber-500/10">
                              {((block as TableBlock).headers || []).map((h, hIdx) => (
                                <th key={hIdx} className="p-2 font-bold text-amber-200">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {((block as TableBlock).rows || []).map((row, rIdx) => (
                              <tr key={rIdx} className="border-b border-white/5 hover:bg-white/[0.02]">
                                {((block as TableBlock).headers || []).map((_, cIdx) => (
                                  <td key={cIdx} className="p-1.5">
                                    <input
                                      type="text"
                                      value={row[cIdx] !== undefined ? row[cIdx] : ''}
                                      onChange={(e) => {
                                        const updated = [...project.sections]
                                        const tb = updated[activeSectionIndex].blocks[bIdx] as TableBlock
                                        if (!tb.rows[rIdx]) tb.rows[rIdx] = []
                                        tb.rows[rIdx][cIdx] = e.target.value
                                        setProject({ ...project, sections: updated })
                                      }}
                                      className="w-full bg-black/40 border border-white/10 rounded px-1.5 py-1 text-slate-200 outline-none focus:border-amber-400 text-xs"
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* 朗读框编辑 */}
                    {block.type === 'read_aloud' && (
                      <div className="border-l-4 border-[#F5F500] pl-3 py-1 bg-[#F5F500]/5 rounded-r-lg">
                        <textarea
                          rows={2}
                          value={(block as ReadAloudBlock).content || ''}
                          onChange={(e) => {
                            const updated = [...project.sections]
                            ;(updated[activeSectionIndex].blocks[bIdx] as ReadAloudBlock).content = e.target.value
                            setProject({ ...project, sections: updated })
                          }}
                          className="w-full bg-transparent border-none text-xs italic text-amber-200 outline-none resize-none"
                        />
                      </div>
                    )}

                    {/* GM提示框 */}
                    {block.type === 'callout' && (
                      <div className="border-l-4 border-cyan-400 pl-3 py-2 bg-cyan-950/20 rounded-r-lg space-y-1">
                        <input
                          type="text"
                          value={(block as CalloutBlock).title || ''}
                          onChange={(e) => {
                            const updated = [...project.sections]
                            ;(updated[activeSectionIndex].blocks[bIdx] as CalloutBlock).title = e.target.value
                            setProject({ ...project, sections: updated })
                          }}
                          className="w-full bg-transparent font-bold text-xs text-cyan-300 outline-none"
                          placeholder="提示标题..."
                        />
                        <textarea
                          rows={2}
                          value={(block as CalloutBlock).content || ''}
                          onChange={(e) => {
                            const updated = [...project.sections]
                            ;(updated[activeSectionIndex].blocks[bIdx] as CalloutBlock).content = e.target.value
                            setProject({ ...project, sections: updated })
                          }}
                          className="w-full bg-transparent text-xs text-slate-300 outline-none resize-none"
                        />
                      </div>
                    )}

                    {/* 分割线 */}
                    {block.type === 'divider' && (
                      <div className="py-2 flex items-center justify-center">
                        <div className="w-full border-t border-dashed border-white/20" />
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
                        {((block as LootBlock).items || []).map((it) => (
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
                        {((block as CyberwareBlock).items || []).map((it) => (
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
