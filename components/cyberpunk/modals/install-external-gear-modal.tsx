"use client"

import React, { useState, useEffect } from 'react'
import type { CyberpunkExternalGear } from '../../../types/cyberpunk'
import { vaultStorage } from '../../../lib/vault/vault-storage'
import { VaultCard } from '../../../lib/vault/vault-types'
import { compileVaultToExternalGear } from '../../../lib/vault/cross-flavor-equipper'
import { Database, Search, Sparkles, X, Plus, Check, FileJson, Shield, Sword, Package } from 'lucide-react'

interface InstallExternalGearModalProps {
  isOpen: boolean
  availableSlots: number
  maxSlots: number
  onClose: () => void
  onInstall: (gear: CyberpunkExternalGear) => void
}

export function InstallExternalGearModal({
  isOpen,
  availableSlots,
  maxSlots,
  onClose,
  onInstall,
}: InstallExternalGearModalProps) {
  const [activeTab, setActiveTab] = useState<'vault' | 'json' | 'custom'>('vault')
  const [vaultCards, setVaultCards] = useState<VaultCard[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [filterType, setFilterType] = useState<'all' | 'cyberware' | 'weapon' | 'armor' | 'loot'>('cyberware')
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  
  const [jsonInput, setJsonInput] = useState('')
  const [parseError, setParseError] = useState('')

  // 自定义装备表单
  const [customName, setCustomName] = useState('')
  const [customType, setCustomType] = useState('外置设备')
  const [customZone, setCustomZone] = useState('主武器')
  const [customSlots, setCustomSlots] = useState('1')
  const [customEffect, setCustomEffect] = useState('')
  const [customRestriction, setCustomRestriction] = useState('')
  const [customTrait, setCustomTrait] = useState('')
  const [customDamage, setCustomDamage] = useState('')
  const [customRange, setCustomRange] = useState('')
  const [customBurden, setCustomBurden] = useState('')
  const [customArmor, setCustomArmor] = useState('')
  const [customMinor, setCustomMinor] = useState('')
  const [customMajor, setCustomMajor] = useState('')

  useEffect(() => {
    if (isOpen && activeTab === 'vault') {
      const loadVault = async () => {
        try {
          setLoading(true)
          await vaultStorage.initialize()
          const categories = filterType === 'all' 
            ? ['cyberware', 'weapon', 'armor'] as any
            : [filterType] as any
          const result = await vaultStorage.queryCards({
            category: categories,
            keyword: searchKeyword
          })
          // 仅展示外置装备（主武器、副武器、护甲、外置设备），排除身体部位纯义体（植入体、仿生件、时尚件）
          const filtered = result.filter((card) => {
            if (card.category === 'weapon' || card.category === 'armor') return true
            const data = (card.data || {}) as Record<string, any>
            const type = (data.cyberType || '').toLowerCase()
            const cardZone = (data.zone || '').toLowerCase()
            // 如果明确是身体4大区义体（植入体/仿生件/时尚件且无武器/护甲属性），排除
            if ((type.includes('植入') || type.includes('仿生') || type.includes('时尚')) && 
                !cardZone.includes('武器') && !cardZone.includes('护甲') && !data.damage && !data.armorScore) {
              return false
            }
            return true
          })
          setVaultCards(filtered)
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

  // 从公共卡库安装
  const handleSelectFromVault = (card: VaultCard) => {
    const compiled = compileVaultToExternalGear(card)
    onInstall({
      ...compiled,
      active: true,
    })
    onClose()
  }

  // 解析并导入 JSON
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

      const tempCard: VaultCard = {
        id: cardData.id || `cyber_ext_${Date.now()}`,
        name: cardData.name || '未命名外置装备',
        category: 'cyberware',
        description: cardData.description || '',
        data: cardData,
        sourceApp: 'workshop',
        schemaVersion: 1,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      const compiled = compileVaultToExternalGear(tempCard)
      onInstall(compiled)
      setJsonInput('')
      onClose()
    } catch (e: any) {
      setParseError('JSON 解析失败：请确保格式为卡牌工坊导出的有效卡牌数据。')
    }
  }

  // 自定义创建
  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customName.trim()) return

    const slotCount = parseInt(customSlots, 10) || 1
    const textToScan = `${customName} ${customEffect}`
    const isExplicitWeapon = customZone === '主武器' || customZone === '副武器' || Boolean(customDamage || customTrait)
    const isExplicitArmor = customZone === '护甲' || Boolean(customArmor || customMinor || customMajor)

    let resolvedBurden = customBurden
    if (!resolvedBurden) {
      if (textToScan.includes('双手') || textToScan.includes('双持')) resolvedBurden = '双手'
      else if (textToScan.includes('副手')) resolvedBurden = '副手'
      else resolvedBurden = '单手'
    }

    const resolvedTrait = customTrait || textToScan.match(/(敏捷|力量|灵巧|本能|风度|知识)/)?.[1] || '敏捷'
    const resolvedDamage = customDamage || textToScan.match(/(d\d+(?:\s*[+-]\s*\d+)?)/i)?.[1]?.replace(/\s+/g, '') || 'd8'
    const resolvedRange = customRange || textToScan.match(/(近战|邻近|近距离|远距离|极远)/)?.[1] || '近战'

    const newGear: CyberpunkExternalGear = {
      id: `custom_ext_${Date.now()}`,
      name: customName.trim(),
      tier: 'T1',
      cyberType: customType,
      zone: customZone,
      slots: slotCount,
      active: true,
      effect: customEffect,
      restriction: customRestriction,
      weaponStats: isExplicitWeapon ? {
        trait: resolvedTrait,
        damage: resolvedDamage,
        range: resolvedRange,
        burden: resolvedBurden,
        damageType: textToScan.includes('魔法') ? '魔法' : '物理'
      } : undefined,
      armorStats: isExplicitArmor ? {
        armorScore: parseInt(customArmor, 10) || 0,
        majorThreshold: parseInt(customMinor, 10) || 0,
        severeThreshold: parseInt(customMajor, 10) || 0,
      } : undefined,
    }

    onInstall(newGear)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[88vh] rounded-2xl border border-[#00FFA3]/30 bg-[#0B0320] text-slate-100 p-6 shadow-2xl flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00FFA3]/40">
                外置装备挂载
              </span>
              <h3 className="font-bold text-base text-white">装配外置战术装备 / 无人机 / 作战武具</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              激活槽位状态：剩余 <span className="text-[#00FFA3] font-bold font-mono">{availableSlots}</span> 槽可用（上限 {maxSlots} 槽）
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
        <div className="grid grid-cols-3 gap-2 my-4 p-1 rounded-xl bg-white/[0.03] border border-white/5 flex-shrink-0">
          <button
            onClick={() => setActiveTab('vault')}
            className={`py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'vault'
                ? 'bg-[#00FFA3] text-black font-bold shadow-lg shadow-[#00FFA3]/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>从公共卡库挑选</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'json'
                ? 'bg-[#F5F500] text-black font-bold shadow-lg shadow-[#F5F500]/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>卡牌工坊 JSON</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'custom'
                ? 'bg-[#6C00FF] text-white font-bold shadow-lg shadow-[#6C00FF]/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>快捷自制外置装备</span>
          </button>
        </div>

        {/* Tab 1: 公共库 */}
        {activeTab === 'vault' && (
          <div className="flex-1 overflow-hidden flex flex-col space-y-3">
            {/* 搜索与过滤 */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索外置设备、武器、无人机、挂载..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#12072B] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00FFA3]"
                />
              </div>
              <div className="flex space-x-1 bg-white/[0.03] p-1 rounded-xl border border-white/5 text-xs">
                {(['cyberware', 'weapon', 'armor', 'all'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      filterType === t ? 'bg-[#00FFA3]/20 text-[#00FFA3] font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t === 'cyberware' ? '赛博外置' : t === 'weapon' ? '武器' : t === 'armor' ? '护甲' : '全部'}
                  </button>
                ))}
              </div>
            </div>

            {/* 卡片列表 */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">正在检索公共卡牌库...</div>
              ) : vaultCards.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">未找到匹配的外置装备或卡片</div>
              ) : (
                vaultCards.map((card) => {
                  const anyData = (card.data || {}) as Record<string, any>
                  const isWeapon = card.category === 'weapon' || anyData.damage || anyData.zone === '主武器'
                  const isArmor = card.category === 'armor' || anyData.score || anyData.armorScore || anyData.zone === '战术护甲'

                  return (
                    <div
                      key={card.id}
                      className="p-3 rounded-xl border border-white/10 bg-[#12072B] hover:border-[#00FFA3]/50 transition flex items-center justify-between gap-3 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-white">{card.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                            {anyData.tier || 'T1'}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00FFA3]/10 text-[#00FFA3]">
                            {anyData.cyberType || anyData.zone || (isWeapon ? '外置武器' : isArmor ? '战术护甲' : '外置设备')}
                          </span>
                          {isWeapon && anyData.damage && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FF003C]/20 text-[#FF003C] font-mono font-bold">
                              {anyData.damage}
                            </span>
                          )}
                          {isArmor && (anyData.armorScore || anyData.score) && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F5F500]/20 text-[#F5F500] font-mono font-bold">
                              +{anyData.armorScore || anyData.score} 护甲
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                          {anyData.effect || anyData.feature || card.description || '无详细机制说明'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleSelectFromVault(card)}
                        className="px-3 py-1.5 text-xs font-bold text-[#00FFA3] bg-[#00FFA3]/15 hover:bg-[#00FFA3]/30 rounded-lg border border-[#00FFA3]/30 transition shrink-0 flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>装配</span>
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: 卡牌工坊 JSON 导入 */}
        {activeTab === 'json' && (
          <div className="flex-1 flex flex-col space-y-3">
            <p className="text-xs text-slate-400">
              在卡牌工坊中设计好“外置设备”卡片后，点击导出 JSON 并粘贴在下方：
            </p>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="在此粘贴卡牌工坊卡片 JSON..."
              rows={8}
              className="w-full flex-1 p-3 bg-[#12072B] border border-white/10 rounded-xl text-xs font-mono text-[#00FFA3] focus:outline-none focus:border-[#00FFA3]"
            />
            {parseError && (
              <p className="text-xs text-[#FF007F] font-bold">{parseError}</p>
            )}
            <button
              onClick={handleImportJson}
              className="w-full py-2.5 bg-[#00FFA3] text-black font-bold text-xs rounded-xl shadow-lg hover:bg-[#00FFA3]/90 transition"
            >
              解析并挂载外置设备
            </button>
          </div>
        )}

        {/* Tab 3: 快捷自制 */}
        {activeTab === 'custom' && (
          <form onSubmit={handleSaveCustom} className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">装备名称 *</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="例如: 红丸武士刀 / 便携战术目镜"
                  className="w-full p-2 bg-[#12072B] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#00FFA3]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">部位 / 分类</label>
                <select
                  value={customZone}
                  onChange={(e) => setCustomZone(e.target.value)}
                  className="w-full p-2 bg-[#12072B] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#00FFA3]"
                >
                  <option value="主武器">主武器</option>
                  <option value="副武器">副武器</option>
                  <option value="护甲">护甲</option>
                  <option value="外置设备">外置设备</option>
                  <option value="头部">头部</option>
                  <option value="躯干">躯干</option>
                  <option value="上肢">上肢</option>
                  <option value="下肢">下肢</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">占用激活槽</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={customSlots}
                  onChange={(e) => setCustomSlots(e.target.value)}
                  className="w-full p-2 bg-[#12072B] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#00FFA3]"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-bold text-slate-300 block mb-1">前置限制条件 (可留空)</label>
                <input
                  type="text"
                  value={customRestriction}
                  onChange={(e) => setCustomRestriction(e.target.value)}
                  placeholder="例如: 力量 +1 以上"
                  className="w-full p-2 bg-[#12072B] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#00FFA3]"
                />
              </div>
            </div>

            {/* 作战参数 (可选) */}
            <div className="p-3 rounded-lg border border-[#00FFA3]/30 bg-[#12072B]/60 space-y-2">
              <span className="text-xs font-bold text-slate-200 block">作战属性 (主武器 / 副武器 / 护甲 - 可选)</span>
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="text"
                  value={customTrait}
                  onChange={(e) => setCustomTrait(e.target.value)}
                  placeholder="主属性: 敏捷"
                  className="p-1.5 bg-[#0B0320] border border-white/10 rounded text-xs text-white"
                />
                <input
                  type="text"
                  value={customDamage}
                  onChange={(e) => setCustomDamage(e.target.value)}
                  placeholder="伤害: d10+6"
                  className="p-1.5 bg-[#0B0320] border border-white/10 rounded text-xs text-white font-mono"
                />
                <input
                  type="text"
                  value={customRange}
                  onChange={(e) => setCustomRange(e.target.value)}
                  placeholder="射程: 近战"
                  className="p-1.5 bg-[#0B0320] border border-white/10 rounded text-xs text-white"
                />
                <select
                  value={customBurden}
                  onChange={(e) => setCustomBurden(e.target.value)}
                  className="p-1.5 bg-[#0B0320] border border-white/10 rounded text-xs text-white"
                >
                  <option value="">自动识别</option>
                  <option value="单手">单手</option>
                  <option value="双手">双手</option>
                  <option value="副手">副手</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10">
                <input
                  type="number"
                  value={customArmor}
                  onChange={(e) => setCustomArmor(e.target.value)}
                  placeholder="护甲值: 3"
                  className="p-1.5 bg-[#0B0320] border border-white/10 rounded text-xs text-white font-mono"
                />
                <input
                  type="number"
                  value={customMinor}
                  onChange={(e) => setCustomMinor(e.target.value)}
                  placeholder="轻伤阈值加成"
                  className="p-1.5 bg-[#0B0320] border border-white/10 rounded text-xs text-white font-mono"
                />
                <input
                  type="number"
                  value={customMajor}
                  onChange={(e) => setCustomMajor(e.target.value)}
                  placeholder="重伤阈值加成"
                  className="p-1.5 bg-[#0B0320] border border-white/10 rounded text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">机制效果说明</label>
              <textarea
                value={customEffect}
                onChange={(e) => setCustomEffect(e.target.value)}
                placeholder="效果机制与战术能力说明..."
                rows={3}
                className="w-full p-2 bg-[#12072B] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#00FFA3]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#00FFA3] text-black font-bold text-xs rounded-xl shadow-lg hover:bg-[#00FFA3]/90 transition"
            >
              保存并挂载到外置装备槽
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
