"use client"

import React, { useState, useEffect } from 'react'
import { useSheetStore } from '@/lib/sheet-store'
import type { NotebookData, NotebookLine, NotebookPage as NotebookPageType } from '@/lib/sheet-data'
import { TextLine } from '@/components/notebook/lines/text-line'
import { CounterLine } from '@/components/notebook/lines/counter-line'
import { DiceLine } from '@/components/notebook/lines/dice-line'
import { Plus, Trash2, Edit2, Check, FileText, Hash, Dices, FolderPlus, BookOpen, Clock } from 'lucide-react'

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`

const defaultNotebookData: NotebookData = {
  pages: [{ id: 'page-1', title: `${new Date().toISOString().split('T')[0]} 战术速记`, lines: [] }],
  currentPageIndex: 0,
  isOpen: false,
}

export function CyberpunkNotebookTab() {
  const { sheetData, setSheetData } = useSheetStore()
  const notebook: NotebookData = sheetData.notebook || defaultNotebookData
  const pages = notebook.pages || []
  const currentPageIndex = Math.min(Math.max(0, notebook.currentPageIndex || 0), Math.max(0, pages.length - 1))
  const currentPage = pages[currentPageIndex] || { id: 'page-1', lines: [] }

  const [editingDrawerIndex, setEditingDrawerIndex] = useState<number | null>(null)
  const [drawerTitleInput, setDrawerTitleInput] = useState('')

  // 更新整个 Notebook
  const updateNotebook = (updates: Partial<NotebookData>) => {
    setSheetData((prev) => ({
      ...prev,
      notebook: { ...(prev.notebook || defaultNotebookData), ...updates },
    }))
  }

  // 新建信息抽屉 (以当前日期命名)
  const handleCreateDrawer = () => {
    const todayStr = new Date().toISOString().split('T')[0]
    const drawerCount = pages.length + 1
    const newPage: NotebookPageType = {
      id: generateId(),
      title: `${todayStr} 抽屉 ${drawerCount}`,
      createdAt: todayStr,
      lines: [],
    }

    const newPages = [...pages, newPage]
    updateNotebook({
      pages: newPages,
      currentPageIndex: newPages.length - 1,
    })
  }

  // 删除抽屉
  const handleDeleteDrawer = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (pages.length <= 1) {
      // 至少保留一个抽屉，清空内容
      updateNotebook({
        pages: [{ id: generateId(), title: `${new Date().toISOString().split('T')[0]} 战术速记`, lines: [] }],
        currentPageIndex: 0,
      })
      return
    }

    const newPages = pages.filter((_, i) => i !== index)
    const newIndex = index <= currentPageIndex ? Math.max(0, currentPageIndex - 1) : currentPageIndex
    updateNotebook({
      pages: newPages,
      currentPageIndex: newIndex,
    })
  }

  // 重命名抽屉
  const handleStartRename = (index: number, currentTitle?: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditingDrawerIndex(index)
    setDrawerTitleInput(currentTitle || `抽屉 ${index + 1}`)
  }

  const handleSaveRename = (index: number) => {
    const newPages = [...pages]
    newPages[index] = {
      ...newPages[index],
      title: drawerTitleInput.trim() || `抽屉 ${index + 1}`,
    }
    updateNotebook({ pages: newPages })
    setEditingDrawerIndex(null)
  }

  // 当前页操作：添加文本行
  const handleAddTextLine = () => {
    const newLine: NotebookLine = {
      type: 'text',
      id: generateId(),
      label: '速记',
      content: '',
    }
    const newPages = [...pages]
    newPages[currentPageIndex] = {
      ...currentPage,
      lines: [...(currentPage.lines || []), newLine],
    }
    updateNotebook({ pages: newPages })
  }

  // 当前页操作：添加计数器行
  const handleAddCounterLine = () => {
    const newLine: NotebookLine = {
      type: 'counter',
      id: generateId(),
      label: '计数器',
      current: 0,
      max: 6,
    }
    const newPages = [...pages]
    newPages[currentPageIndex] = {
      ...currentPage,
      lines: [...(currentPage.lines || []), newLine],
    }
    updateNotebook({ pages: newPages })
  }

  // 当前页操作：添加骰子行
  const handleAddDiceLine = () => {
    const newLine: NotebookLine = {
      type: 'dice',
      id: generateId(),
      label: '检定骰',
      dice: [{ sides: 12, value: 1 }],
    }
    const newPages = [...pages]
    newPages[currentPageIndex] = {
      ...currentPage,
      lines: [...(currentPage.lines || []), newLine],
    }
    updateNotebook({ pages: newPages })
  }

  // 更新当前页的指定行
  const handleUpdateLine = (lineIndex: number, updates: Partial<NotebookLine>) => {
    const newLines = [...(currentPage.lines || [])]
    newLines[lineIndex] = { ...newLines[lineIndex], ...updates } as NotebookLine

    const newPages = [...pages]
    newPages[currentPageIndex] = {
      ...currentPage,
      lines: newLines,
    }
    updateNotebook({ pages: newPages })
  }

  // 删除当前页的指定行
  const handleDeleteLine = (lineIndex: number) => {
    const newLines = (currentPage.lines || []).filter((_, i) => i !== lineIndex)
    const newPages = [...pages]
    newPages[currentPageIndex] = {
      ...currentPage,
      lines: newLines,
    }
    updateNotebook({ pages: newPages })
  }

  return (
    <div className="space-y-3 font-sans">
      {/* 头部标题与速记操作说明 */}
      <div className="rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-3.5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#00FFA3]" />
          <h2 className="text-sm font-bold text-white tracking-wide">
            速记收纳与信息抽屉 (Quick Notebook & Drawers)
          </h2>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          按创建日期归档 · 支持文本、计数器与骰子行快速收纳
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* 左栏 (3/12)：信息抽屉名录 */}
        <div className="lg:col-span-3 rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-3 shadow-md space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#6C00FF]/20 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
              <span>信息抽屉</span>
              <span className="text-[10px] text-[#00FFA3] font-mono font-normal">({pages.length})</span>
            </span>

            <button
              type="button"
              onClick={handleCreateDrawer}
              className="flex items-center gap-1 text-[10px] font-bold text-[#00FFA3] bg-[#00FFA3]/10 hover:bg-[#00FFA3]/20 px-2 py-0.5 rounded border border-[#00FFA3]/30 transition-colors"
            >
              <FolderPlus className="w-3 h-3" />
              <span>新建</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-0.5 custom-scrollbar">
            {pages.map((page, idx) => {
              const isSelected = idx === currentPageIndex
              const isEditing = editingDrawerIndex === idx
              const lineCount = (page.lines || []).length

              return (
                <div
                  key={page.id || idx}
                  onClick={() => updateNotebook({ currentPageIndex: idx })}
                  className={`p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between gap-1 group ${
                    isSelected
                      ? 'border-[#00FFA3] bg-[#00FFA3]/10 text-white shadow-[0_0_10px_rgba(0,255,163,0.15)]'
                      : 'border-[#6C00FF]/20 bg-[#0B0320] text-slate-400 hover:border-[#6C00FF]/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-1">
                    {isEditing ? (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={drawerTitleInput}
                          onChange={(e) => setDrawerTitleInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(idx)}
                          className="w-full bg-[#12072B] border border-[#00FFA3] rounded px-1 py-0.5 text-xs text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(idx)}
                          className="text-[#00FFA3] p-0.5"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold truncate" title={page.title || `抽屉 ${idx + 1}`}>
                          {page.title || `抽屉 ${idx + 1}`}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono mt-0.5">
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {page.createdAt || '历史'}
                          </span>
                          <span>{lineCount} 行记录</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => handleStartRename(idx, page.title, e)}
                        className="p-1 text-slate-400 hover:text-[#F5F500] rounded"
                        title="重命名抽屉"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteDrawer(idx, e)}
                        className="p-1 text-slate-400 hover:text-[#FF007F] rounded"
                        title="删除抽屉"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 右栏 (9/12)：笔记本速记区 */}
        <div className="lg:col-span-9 rounded-xl border border-[#6C00FF]/30 bg-[#12072B] p-4 shadow-md space-y-3 min-h-[560px] flex flex-col justify-between">
          <div>
            {/* 抽屉顶部标题栏与快捷工具栏 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-[#6C00FF]/20 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#00FFA3] font-mono">
                  [{currentPageIndex + 1}/{pages.length}]
                </span>
                <h3 className="font-bold text-sm text-white truncate max-w-sm">
                  {currentPage.title || `抽屉 ${currentPageIndex + 1}`}
                </h3>
              </div>

              {/* 参考图速记三按钮：文本、计数器、骰子 */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleAddTextLine}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#00FFA3]/40 bg-[#00FFA3]/10 hover:bg-[#00FFA3]/20 text-[#00FFA3] text-xs font-bold transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>文本</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddCounterLine}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#F5F500]/40 bg-[#F5F500]/10 hover:bg-[#F5F500]/20 text-[#F5F500] text-xs font-bold transition-all"
                >
                  <Hash className="w-3.5 h-3.5" />
                  <span>计数器</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddDiceLine}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#6C00FF]/50 bg-[#6C00FF]/20 hover:bg-[#6C00FF]/35 text-[#F5F500] text-xs font-bold transition-all"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>骰子</span>
                </button>
              </div>
            </div>

            {/* 速记纸正文区 (带有浅色/横格速记纸衬底，完美呈现参考图体验) */}
            <div className="mt-3 rounded-lg border border-slate-700/60 bg-[#fbf6e9] text-slate-800 p-4 shadow-inner min-h-[420px] space-y-2.5">
              {(currentPage.lines || []).map((line, lineIdx) => {
                if (line.type === 'text') {
                  return (
                    <TextLine
                      key={line.id || lineIdx}
                      line={line}
                      lineHeight={24}
                      onUpdate={(upd) => handleUpdateLine(lineIdx, upd)}
                      onDelete={() => handleDeleteLine(lineIdx)}
                    />
                  )
                }
                if (line.type === 'counter') {
                  return (
                    <CounterLine
                      key={line.id || lineIdx}
                      line={line}
                      lineHeight={24}
                      onUpdate={(upd) => handleUpdateLine(lineIdx, upd)}
                      onDelete={() => handleDeleteLine(lineIdx)}
                    />
                  )
                }
                if (line.type === 'dice') {
                  return (
                    <DiceLine
                      key={line.id || lineIdx}
                      line={line}
                      lineHeight={24}
                      onUpdate={(upd) => handleUpdateLine(lineIdx, upd)}
                      onDelete={() => handleDeleteLine(lineIdx)}
                    />
                  )
                }
                return null
              })}

              {(!currentPage.lines || currentPage.lines.length === 0) && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2 select-none">
                  <BookOpen className="w-8 h-8 text-slate-300" />
                  <p className="text-xs">点击上方按钮，快速在此抽屉添加文本、计数器或骰子行...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
