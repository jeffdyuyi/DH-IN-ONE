"use client"

import React, { useState, useEffect } from 'react'
import type { CyberpunkAugmentation, CyberpunkBodyZoneKey } from '../../../types/cyberpunk'
import { convertWorkshopV3ToAugmentation, type WorkshopV3CyberwareRaw } from '../../../lib/cyberpunk/workshop-v3-adapter'
import { vaultStorage } from '../../../lib/vault/vault-storage'
import { VaultCard } from '../../../lib/vault/vault-types'
import { compileLootToCyberware } from '../../../lib/vault/cross-flavor-equipper'
import { Database, Search, Sparkles, X, Plus, Check, FileJson } from 'lucide-react'

interface InstallAugmentationModalProps {
  isOpen: boolean
  zone: CyberpunkBodyZoneKey
  zoneName: string
  availableSlots: number
  onClose: () => void
  onInstall: (aug: CyberpunkAugmentation) => void
  onOpenCustomModal: () => void
}

export function InstallAugmentationModal({
  isOpen,
  zone,
  zoneName,
  availableSlots,
  onClose,
  onInstall,
  onOpenCustomModal,
}: InstallAugmentationModalProps) {
  const [activeTab, setActiveTab] = useState<'vault' | 'json'>('vault')
  const [vaultCards, setVaultCards] = useState<VaultCard[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [filterType, setFilterType] = useState<'all' | 'cyberware' | 'loot'>('all')
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  
  const [jsonInput, setJsonInput] = useState('')
  const [parseError, setParseError] = useState('')

  useEffect(() => {
    if (isOpen && activeTab === 'vault') {
      const loadVault = async () => {
        try {
          setLoading(true)
          await vaultStorage.initialize()
          const categories = filterType === 'all' 
            ? ['cyberware', 'loot', 'weapon', 'armor'] as any
            : [filterType] as any
          const result = await vaultStorage.queryCards({
            category: categories,
            keyword: searchKeyword
          })
          setVaultCards(result)
        } catch (e) {
          console.error('Failed to load vault items:', e)
        } finally {
          setLoading(false)
        }
      }
      loadVault()
    }
  }, [isOpen, activeTab, filterType, searchKeyword])

  if (!isOpen) return null

  // 从公共库挑选并安装 (跨画风编译器)
  const handleSelectFromVault = (card: VaultCard) => {
    const compiled = compileLootToCyberware(card, zone, 1)
    
    const newAug: CyberpunkAugmentation = {
      id: compiled.id,
      name: compiled.name,
      tier: (compiled.tier as any) || 'T1',
      cyberType: (card.category === 'cyberware' ? (card.data as any)?.cyberType : '战利品') || '植入体',
      zone: zone,
      slots: compiled.slots || 1,
      restriction: (card.data as any)?.restriction || '',
      effect: compiled.effect,
      tag: compiled.tag,
      compCost: compiled.compCost || '',
      surgCost: compiled.surgCost || '',
    }

    onInstall(newAug)
    onClose()
  }

  // 解析并安装粘贴的卡牌工坊 JSON
  const handleImportJson = () => {
    setParseError('')
    if (!jsonInput.trim()) {
      setParseError('请输入或粘贴卡牌工坊导出的卡牌 JSON')
      return
    }

    try {
      const parsed = JSON.parse(jsonInput.trim())
      let cardData: any = parsed
      if (parsed.data) {
        cardData = parsed.data
      } else if (Array.isArray(parsed) && parsed.length > 0) {
        cardData = parsed[0].data || parsed[0]
      } else if (parsed.cards && Array.isArray(parsed.cards) && parsed.cards.length > 0) {
        cardData = parsed.cards[0].data || parsed.cards[0]
      }

      const converted = convertWorkshopV3ToAugmentation(cardData as WorkshopV3CyberwareRaw)
      converted.zone = zone
      onInstall(converted)
      setJsonInput('')
      onClose()
    } catch (e: any) {
      setParseError('JSON 解析失败：请确保格式为卡牌工坊导出的有效卡牌数据。')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl border border-white/10 bg-[#0B0320] text-slate-100 p-6 shadow-2xl flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#6C00FF]/20 text-[#6C00FF] border border-[#6C00FF]/40">
                {zoneName}
              </span>
              <h3 className="font-bold text-base text-white">安装义体 / 战利品</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              当前部位可用槽位：<span className="text-[#00FFA3] font-bold">{availableSlots}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab 切换 */}
        <div className="grid grid-cols-2 gap-2 my-4 p-1 rounded-xl bg-white/[0.03] border border-white/5 flex-shrink-0">
          <button
            onClick={() => setActiveTab('vault')}
            className={`py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'vault'
                ? 'bg-[#00FFA3] text-black font-bold shadow-lg shadow-[#00FFA3]/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>从公共卡牌库挑选（官方战利品 / 赛博装备）</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'json'
                ? 'bg-[#FF007F] text-white font-bold shadow-lg shadow-[#FF007F]/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>粘贴工坊 JSON 导入</span>
          </button>
        </div>

        {/* Tab 1: 从公共库挑选 */}
        {activeTab === 'vault' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* 搜索与过滤 */}
            <div className="flex items-center space-x-2 mb-3 flex-shrink-0">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="搜索官方 120 物品、壁虎手套、植入体..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-[#00FFA3] outline-none"
                />
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1.5 text-xs rounded-lg ${
                    filterType === 'all' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  全部
                </button>
                <button
                  onClick={() => setFilterType('loot')}
                  className={`px-2.5 py-1.5 text-xs rounded-lg ${
                    filterType === 'loot' ? 'bg-[#F5F500]/20 text-[#F5F500] border border-[#F5F500]/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  战利品
                </button>
                <button
                  onClick={() => setFilterType('cyberware')}
                  className={`px-2.5 py-1.5 text-xs rounded-lg ${
                    filterType === 'cyberware' ? 'bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00FFA3]/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  赛博装备
                </button>
              </div>
            </div>

            {/* 卡牌列表 */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {loading ? (
                <div className="text-center py-10 text-xs text-slate-500">正在检索本地卡牌库...</div>
              ) : vaultCards.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">未找到相关物品</div>
              ) : (
                vaultCards.map((card) => {
                  const isLoot = card.category === 'loot'
                  const effectText = (card.data as any)?.effect || (card.data as any)?.feature || card.description || ''
                  return (
                    <div
                      key={card.id}
                      onClick={() => handleSelectFromVault(card)}
                      className="p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#00FFA3]/50 transition cursor-pointer flex items-center justify-between group"
                    >
                      <div className="pr-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isLoot ? 'bg-[#F5F500]/10 text-[#F5F500]' : 'bg-[#00FFA3]/10 text-[#00FFA3]'
                          }`}>
                            {isLoot ? '奇幻战利品' : '赛博装备'}
                          </span>
                          <h4 className="font-bold text-xs text-white group-hover:text-[#00FFA3] transition">
                            {card.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">
                          {effectText}
                        </p>
                      </div>
                      <button
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#00FFA3]/10 text-[#00FFA3] group-hover:bg-[#00FFA3] group-hover:text-black transition flex-shrink-0"
                      >
                        + 安装
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: 粘贴 JSON */}
        {activeTab === 'json' && (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">卡牌工坊 JSON 数据</label>
              <textarea
                rows={7}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="在此粘贴从工坊复制的 JSON 文本..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-[#FF007F] font-mono"
              />
              {parseError && (
                <p className="text-xs text-rose-400 mt-2">{parseError}</p>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
              <button
                onClick={onOpenCustomModal}
                className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
              >
                或手动自定义创建
              </button>
              <button
                onClick={handleImportJson}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF007F] text-white hover:opacity-90 transition"
              >
                解析并安装
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

