"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Database, 
  ArrowLeft, 
  Search, 
  Plus, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  Copy, 
  Eye, 
  X, 
  Sparkles, 
  Layers, 
  HardDrive, 
  Check, 
  AlertTriangle 
} from 'lucide-react'
import { vaultStorage } from '../../lib/vault/vault-storage'
import { vaultImageStore } from '../../lib/vault/vault-image-store'
import { VaultCard, VaultCardCategory } from '../../lib/vault/vault-types'
import { buildOfficialCardPack } from '../../lib/vault/cardpack-builder'

const CATEGORY_TABS: Array<{ category?: VaultCardCategory; label: string; icon: string }> = [
  { label: '全部卡牌', icon: '🌟' },
  { category: 'loot', label: '官方战利品 (60)', icon: '💎' },
  { category: 'consumable', label: '官方消耗品 (60)', icon: '🧪' },
  { category: 'cyberware', label: '赛博装备', icon: '🦾' },
  { category: 'enemy', label: '战斗敌人', icon: '👾' },
  { category: 'environment', label: '环境险境', icon: '🌋' },
  { category: 'weapon', label: '武器', icon: '⚔️' },
  { category: 'armor', label: '护甲', icon: '🛡️' },
]

export function VaultHubApp() {
  const [cards, setCards] = useState<VaultCard[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedCat, setSelectedCat] = useState<VaultCardCategory | undefined>(undefined)
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [activeCard, setActiveCard] = useState<VaultCard | null>(null)
  const [toastMsg, setToastMsg] = useState<string>('')
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  // 加载卡牌列表
  const fetchCards = async () => {
    try {
      setLoading(true)
      await vaultStorage.initialize()
      const list = await vaultStorage.queryCards({
        category: selectedCat,
        keyword: searchKeyword
      })
      setCards(list)
    } catch (e) {
      console.error('Failed to query cards:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCards()
  }, [selectedCat, searchKeyword])

  // 统计数据
  const totalCount = cards.length
  const builtinCount = cards.filter(c => c.isBuiltin).length
  const customCount = cards.filter(c => !c.isBuiltin).length

  // 删除自制卡牌
  const handleDeleteCard = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await vaultStorage.deleteCard(id)
    showToast('已从公共库中删除该卡牌')
    fetchCards()
  }

  // 复制文案
  const handleCopyDescription = (text: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    showToast('卡牌效果文案已复制到剪贴板！')
  }

  // 导出全库卡包
  const handleExportAllCards = async () => {
    const all = await vaultStorage.queryCards()
    const pack = buildOfficialCardPack(all, {
      packName: '匕首心 & 渊边行者 本地公共库全量备份',
      author: 'DH-IN-ONE Vault User',
      description: `包含官方 ${all.filter((c: VaultCard) => c.isBuiltin).length} 种种子卡牌与 ${all.filter((c: VaultCard) => !c.isBuiltin).length} 张自制卡牌。`,
    })

    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `DH_Vault_Backup_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('全库卡包导出成功！')
  }

  // 导入卡包
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const raw = evt.target?.result as string
        const parsed = JSON.parse(raw)
        const packCards: VaultCard[] = parsed.cards || (Array.isArray(parsed) ? parsed : [parsed])
        
        let count = 0
        for (const c of packCards) {
          if (c && c.name) {
            await vaultStorage.saveCard({
              ...c,
              id: c.id || `card_imp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              isBuiltin: false,
              updatedAt: Date.now()
            })
            count++
          }
        }
        showToast(`成功导入 ${count} 张卡牌入公共库！`)
        fetchCards()
      } catch (err) {
        alert('导入失败：请确保为标准的卡包 JSON 文件。')
      }
    }
    reader.readAsText(file)
  }

  // 重新加载官方种子
  const handleResetSeeds = async () => {
    await vaultStorage.resetToBuiltin()
    setIsResetConfirmOpen(false)
    showToast('官方 120 种战利品/消耗品种子数据已重新初始化！')
    fetchCards()
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
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00FFA3] to-[#6C00FF] flex items-center justify-center font-bold text-xs text-black">
                <Database className="w-4 h-4" />
              </div>
              <h1 className="font-extrabold text-base tracking-wider">公共本地卡牌库中枢</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>导入卡包 JSON</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>

            <button
              onClick={handleExportAllCards}
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#00FFA3] text-black hover:opacity-90 transition shadow-[0_0_12px_rgba(0,255,163,0.2)]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出全库备份</span>
            </button>

            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-white/10 transition"
              title="重新加载官方 120 种种子数据"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 提示消息 Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2 rounded-xl bg-[#00FFA3] text-black font-bold text-xs shadow-2xl animate-in slide-in-from-top duration-200 flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 主体工作区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 顶部统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-semibold block">当前库内卡牌总数</span>
              <div className="text-2xl font-black text-white mt-1">{totalCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-400 font-semibold block">官方核心种子卡牌</span>
              <div className="text-2xl font-black text-amber-300 mt-1">{builtinCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex items-center justify-between">
            <div>
              <span className="text-xs text-[#00FFA3] font-semibold block">工坊自制 / 导入卡牌</span>
              <div className="text-2xl font-black text-[#00FFA3] mt-1">{customCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#00FFA3]/10 flex items-center justify-center text-[#00FFA3]">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 搜索与分类 Tab 过滤栏 */}
        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="在本地卡牌库中搜索名称、特性、描述或标签..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-[#00FFA3] outline-none"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const isSelected = selectedCat === tab.category
              return (
                <button
                  key={tab.label}
                  onClick={() => setSelectedCat(tab.category)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-[#00FFA3] text-black font-bold shadow-lg shadow-[#00FFA3]/20'
                      : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 卡牌列表瀑布流网格 */}
        {loading ? (
          <div className="text-center py-20 text-xs text-slate-500">正在检索公共库数据...</div>
        ) : cards.length === 0 ? (
          <div className="text-center py-20 text-xs text-slate-500">暂无符合条件的卡牌</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cards.map((card) => {
              const isBuiltin = Boolean(card.isBuiltin)
              const effectText = (card.data as any)?.effect || (card.data as any)?.feature || card.description || ''

              return (
                <div
                  key={card.id}
                  onClick={() => setActiveCard(card)}
                  className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#00FFA3]/50 transition cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300 uppercase">
                        {card.category}
                      </span>
                      {isBuiltin ? (
                        <span className="text-[10px] text-amber-400 font-semibold flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>官方种子</span>
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleDeleteCard(card.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition"
                          title="删除此自制卡牌"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-white group-hover:text-[#00FFA3] transition mb-1 line-clamp-1">
                      {card.name}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3">
                      {effectText}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                    <span>来源: {card.sourceApp || '工坊设计'}</span>
                    <button
                      onClick={(e) => handleCopyDescription(effectText, e)}
                      className="text-slate-400 hover:text-white transition flex items-center space-x-1"
                      title="复制效果文本"
                    >
                      <Copy className="w-3 h-3" />
                      <span>复制文案</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* 单卡完整属性详情弹窗 */}
      {activeCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0B0320] text-slate-100 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300 uppercase">
                  {activeCard.category}
                </span>
                <h3 className="font-bold text-lg text-white mt-1">
                  {activeCard.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveCard(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4">
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {(activeCard.data as any)?.effect || (activeCard.data as any)?.feature || activeCard.description || '暂无详细描述'}
              </div>

              {/* 敌人特化属性 */}
              {activeCard.category === 'enemy' && (
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-white/5">
                    <span className="text-[10px] text-slate-400 block">难度</span>
                    <span className="font-bold text-white">DC {(activeCard.data as any)?.difficulty || 12}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <span className="text-[10px] text-slate-400 block">生命 HP</span>
                    <span className="font-bold text-[#00FFA3]">{(activeCard.data as any)?.hp || 6}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <span className="text-[10px] text-slate-400 block">压力 Stress</span>
                    <span className="font-bold text-[#FF007F]">{(activeCard.data as any)?.stress || 3}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-xs text-slate-500 font-mono">ID: {activeCard.id}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(activeCard, null, 2))
                  showToast('单卡 JSON 数据已复制！')
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>复制单卡 JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 重新载入官方种子确认弹窗 */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl border border-amber-400/30 bg-[#0B0320] text-slate-100 p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base text-white">重载官方 120 种种子</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              此操作将刷新内置的 60 种战利品与 60 种消耗品至官方标准版本。您自制的卡牌不会受到影响。
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                取消
              </button>
              <button
                onClick={handleResetSeeds}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-black hover:opacity-90 transition"
              >
                确认重载
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
