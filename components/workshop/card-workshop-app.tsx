"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Layers, 
  ArrowLeft, 
  Dices, 
  Save, 
  FileCode,
  Check
} from 'lucide-react'
import { CardType, BaseCardData, workshopCardToVaultCard } from './types'
import { D60InspirationDrawer } from './d60-inspiration-drawer'
import { vaultStorage } from '../../lib/vault/vault-storage'
import { buildOfficialCardPack, downloadCardPackAsJson } from '../../lib/vault/cardpack-builder'
import { VaultCard } from '../../lib/vault/vault-types'

const CARD_CATEGORIES = [
  { type: CardType.WEAPON, label: '武器', icon: '⚔️' },
  { type: CardType.ARMOR, label: '护甲', icon: '🛡️' },
  { type: CardType.LOOT, label: '战利品', icon: '💎' },
  { type: CardType.CONSUMABLE, label: '消耗品', icon: '🧪' },
  { type: CardType.CYBERWARE, label: '赛博装备', icon: '🦾' },
  { type: CardType.ENEMY, label: '战斗敌人', icon: '👾' },
  { type: CardType.ENVIRONMENT, label: '环境险境', icon: '🌋' },
  { type: CardType.DOMAIN, label: '领域法术', icon: '✨' },
  { type: CardType.CLASS, label: '职业', icon: '🧙' },
  { type: CardType.SUBCLASS, label: '子职业', icon: '📜' },
  { type: CardType.ANCESTRY, label: '种族', icon: '🧬' },
  { type: CardType.COMMUNITY, label: '社群', icon: '🏘️' },
  { type: CardType.NPC, label: 'NPC', icon: '👤' },
  { type: CardType.INGREDIENT, label: '食材', icon: '🍄' },
  { type: CardType.MEAL, label: '料理', icon: '🍲' },
  { type: CardType.LANDMARK, label: '地标', icon: '🗺️' },
  { type: CardType.RUMOR, label: '谣言', icon: '👂' },
  { type: CardType.QUEST, label: '任务', icon: '🚩' },
  { type: CardType.STRONGHOLD, label: '据点', icon: '🏰' },
  { type: CardType.ANOMALY, label: '异常', icon: '👁️' },
  { type: CardType.WHEELCHAIR, label: '战术轮椅', icon: '🦽' },
  { type: CardType.PRICELIST, label: '价目表', icon: '🏷️' }
]

export function CardWorkshopApp() {
  const [selectedType, setSelectedType] = useState<CardType>(CardType.WEAPON)
  const [isD60Open, setIsD60Open] = useState<boolean>(false)
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false)

  const [draft, setDraft] = useState<BaseCardData>({
    id: `ws_card_${Date.now()}`,
    type: CardType.WEAPON,
    name: '星火短剑',
    description: '刃身流淌着淡淡温热光芒的精钢短剑。',
    creator: '工坊造物师',
    owner: '',
    trait: '敏捷',
    range: '近战',
    damage: 'd8',
    damageType: '物理',
    burden: '单手',
    feature: '攻击命中时点燃目标，造成灼烧效果。',
    tier: 'T1'
  })

  const handleSelectType = (type: CardType) => {
    setSelectedType(type)
    setDraft({
      id: `ws_card_${Date.now()}`,
      type,
      name: `新${CARD_CATEGORIES.find(c => c.type === type)?.label || '卡牌'}`,
      description: '卡牌风味描述或背景设定。',
      creator: '工坊造物师',
      owner: '',
      tier: 'T1',
      trait: '敏捷',
      range: '近战',
      damage: 'd8',
      damageType: '物理',
      burden: '单手',
      feature: '特性机制说明。',
      score: 3,
      majorThreshold: 6,
      severeThreshold: 13,
      effect: '使用后产生的具体效果。',
      zone: 'arms',
      slots: 1,
      difficulty: 12,
      hp: 6,
      stress: 3,
      countdown: 4
    })
  }

  const handleApplyD60 = (card: VaultCard) => {
    const isLoot = card.category === 'loot'
    setSelectedType(isLoot ? CardType.LOOT : CardType.CONSUMABLE)
    setDraft({
      id: `ws_card_${Date.now()}`,
      type: isLoot ? CardType.LOOT : CardType.CONSUMABLE,
      name: card.name,
      description: card.description || '',
      creator: 'Daggerheart 官方',
      owner: '',
      feature: (card.data as any)?.effect || card.description || '',
      effect: (card.data as any)?.effect || card.description || '',
      tier: 'T1'
    })
  }

  const handleSaveToVault = async () => {
    try {
      const vaultCard = workshopCardToVaultCard(draft)
      await vaultStorage.saveCard(vaultCard)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2500)
    } catch (err) {
      console.error('Failed to save card to vault:', err)
      alert('保存至公共卡牌库失败，请查看控制台日志。')
    }
  }

  const handleExportSinglePack = () => {
    const vaultCard = workshopCardToVaultCard(draft)
    const pack = buildOfficialCardPack([vaultCard], {
      packName: draft.name || '工坊单卡',
      author: draft.creator || 'DH-IN-ONE'
    })
    downloadCardPackAsJson(pack, `${draft.name || 'card'}-pack`)
  }

  return (
    <div className="min-h-screen bg-[#0B0320] text-slate-100 font-sans selection:bg-[#F5F500] selection:text-black">
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
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#F5F500] to-[#00FFA3] flex items-center justify-center font-bold text-xs text-black">
                WS
              </div>
              <h1 className="font-extrabold text-base tracking-wider">匕首心卡牌工坊 V3</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsD60Open(true)}
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-[#F5F500]/40 text-[#F5F500] bg-[#F5F500]/10 hover:bg-[#F5F500]/20 transition shadow-[0_0_12px_rgba(245,245,0,0.15)]"
            >
              <Dices className="w-4 h-4" />
              <span>🎲 d60 掉落灵感</span>
            </button>

            <button
              onClick={handleSaveToVault}
              className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-[#00FFA3] text-black hover:opacity-90 transition shadow-[0_0_12px_rgba(0,255,163,0.2)]"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? '已同步入库！' : '同步至公共库'}</span>
            </button>

            <button
              onClick={handleExportSinglePack}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition"
              title="导出为标准卡包 JSON"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>导出卡包</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 bg-white/[0.02] border border-white/10 rounded-2xl p-4 max-h-[calc(100vh-140px)] overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 mb-3 px-2 flex items-center justify-between">
            <span>选择卡牌类型</span>
            <span className="text-[10px] text-slate-500">{CARD_CATEGORIES.length} 类</span>
          </div>
          <div className="space-y-1">
            {CARD_CATEGORIES.map((cat) => {
              const isSelected = selectedType === cat.type
              return (
                <button
                  key={cat.type}
                  onClick={() => handleSelectType(cat.type)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#F5F500]/20 to-[#00FFA3]/20 border border-[#F5F500]/40 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase">{cat.type}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#F5F500]" />
              <span>卡牌属性配置</span>
            </h2>
            <span className="text-xs text-slate-400">ID: {draft.id.substring(0, 12)}...</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">卡牌名称</label>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00FFA3] outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">创作者</label>
              <input
                type="text"
                value={draft.creator}
                onChange={(e) => setDraft({ ...draft, creator: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00FFA3] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">风味描述 / 背景设定</label>
            <textarea
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00FFA3] outline-none"
            />
          </div>

          {selectedType === CardType.WEAPON && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">关联属性</label>
                  <select
                    value={draft.trait}
                    onChange={(e) => setDraft({ ...draft, trait: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-xs text-white outline-none"
                  >
                    <option value="敏捷">敏捷 (Agility)</option>
                    <option value="力量">力量 (Strength)</option>
                    <option value="灵巧">灵巧 (Finesse)</option>
                    <option value="本能">本能 (Instinct)</option>
                    <option value="风度">风度 (Presence)</option>
                    <option value="知识">知识 (Knowledge)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">射程</label>
                  <select
                    value={draft.range}
                    onChange={(e) => setDraft({ ...draft, range: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-xs text-white outline-none"
                  >
                    <option value="近战">近战 (Melee)</option>
                    <option value="邻近">邻近 (Very Close)</option>
                    <option value="近距">近距 (Close)</option>
                    <option value="远距">远距 (Far)</option>
                    <option value="极远距">极远距 (Very Far)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">伤害骰</label>
                  <input
                    type="text"
                    value={draft.damage}
                    onChange={(e) => setDraft({ ...draft, damage: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                    placeholder="如 d8, d10+2"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">武器特性机制</label>
                <textarea
                  rows={2}
                  value={draft.feature}
                  onChange={(e) => setDraft({ ...draft, feature: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  placeholder="武器机制特性文案..."
                />
              </div>
            </div>
          )}

          {selectedType === CardType.ENEMY && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">难度 (DC)</label>
                  <input
                    type="number"
                    value={draft.difficulty}
                    onChange={(e) => setDraft({ ...draft, difficulty: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">生命 (HP)</label>
                  <input
                    type="number"
                    value={draft.hp}
                    onChange={(e) => setDraft({ ...draft, hp: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">压力 (Stress)</label>
                  <input
                    type="number"
                    value={draft.stress}
                    onChange={(e) => setDraft({ ...draft, stress: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">阈值 (中/重)</label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      value={draft.majorThreshold}
                      onChange={(e) => setDraft({ ...draft, majorThreshold: Number(e.target.value) })}
                      className="w-1/2 bg-black/40 border border-white/10 rounded-lg px-1 py-2 text-xs text-white text-center outline-none"
                    />
                    <span className="text-slate-600">/</span>
                    <input
                      type="number"
                      value={draft.severeThreshold}
                      onChange={(e) => setDraft({ ...draft, severeThreshold: Number(e.target.value) })}
                      className="w-1/2 bg-black/40 border border-white/10 rounded-lg px-1 py-2 text-xs text-white text-center outline-none"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">战术指令与特性</label>
                <textarea
                  rows={3}
                  value={draft.feature}
                  onChange={(e) => setDraft({ ...draft, feature: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  placeholder="战术与行动特性文案..."
                />
              </div>
            </div>
          )}

          {selectedType !== CardType.WEAPON && selectedType !== CardType.ENEMY && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">效果文案 / 特性说明</label>
                <textarea
                  rows={4}
                  value={draft.effect || draft.feature || ''}
                  onChange={(e) => setDraft({ ...draft, effect: e.target.value, feature: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  placeholder="效果文案..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col items-center">
          <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-gradient-to-b from-slate-900 to-black p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {CARD_CATEGORIES.find(c => c.type === selectedType)?.icon}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300">
                  {CARD_CATEGORIES.find(c => c.type === selectedType)?.label}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">{draft.tier || 'T1'}</span>
            </div>

            <h3 className="text-2xl font-black tracking-tight text-white mb-2">
              {draft.name || '未命名卡牌'}
            </h3>

            {selectedType === CardType.WEAPON && (
              <div className="grid grid-cols-3 gap-1 bg-white/5 rounded-lg p-2 text-center text-xs text-slate-300 mb-3 border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-500 block">属性</span>
                  <span className="font-bold text-[#00FFA3]">{draft.trait}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">射程</span>
                  <span className="font-bold">{draft.range}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">伤害</span>
                  <span className="font-bold text-[#F5F500]">{draft.damage}</span>
                </div>
              </div>
            )}

            {selectedType === CardType.ENEMY && (
              <div className="grid grid-cols-3 gap-1 bg-white/5 rounded-lg p-2 text-center text-xs text-slate-300 mb-3 border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-500 block">难度</span>
                  <span className="font-bold text-amber-400">{draft.difficulty}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">生命</span>
                  <span className="font-bold text-[#00FFA3]">{draft.hp}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">压力</span>
                  <span className="font-bold text-[#FF007F]">{draft.stress}</span>
                </div>
              </div>
            )}

            <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 text-xs text-slate-200 leading-relaxed mb-4 min-h-[90px]">
              {draft.feature || draft.effect || '暂无机制文本'}
            </div>

            {draft.description && (
              <p className="text-[11px] text-slate-400 italic mb-4">
                "{draft.description}"
              </p>
            )}

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500">
              <span>{draft.creator || '自制作者'}</span>
              <span>DH-IN-ONE · DPCGL</span>
            </div>
          </div>
        </div>
      </div>

      <D60InspirationDrawer
        isOpen={isD60Open}
        onClose={() => setIsD60Open(false)}
        onApplyToDraft={handleApplyD60}
      />
    </div>
  )
}
