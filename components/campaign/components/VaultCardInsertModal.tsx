"use client"

import React, { useState, useEffect } from 'react';
import { vaultStorage } from '../../../lib/vault/vault-storage';
import { VaultCard } from '../../../lib/vault/vault-types';
import { ContentBlock, DynamicSection, CyberwareBlock, EnemyBlock, EnvironmentBlock } from '../types';
import { Search, Sparkles, X, Database, Plus, Check } from 'lucide-react';

interface VaultCardInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: DynamicSection[];
  onInsertBlock: (sectionIndex: number, block: ContentBlock) => void;
}

const CATEGORY_TABS = [
  { key: 'all', label: '全部' },
  { key: 'enemy', label: '敌人' },
  { key: 'environment', label: '环境险境' },
  { key: 'cyberware', label: '赛博义体' },
  { key: 'loot', label: '战利品' },
  { key: 'consumable', label: '消耗品' },
  { key: 'weapon', label: '武器' },
  { key: 'armor', label: '护甲' },
  { key: 'npc', label: 'NPC' },
];

export const VaultCardInsertModal: React.FC<VaultCardInsertModalProps> = ({
  isOpen,
  onClose,
  sections,
  onInsertBlock,
}) => {
  const [cards, setCards] = useState<VaultCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [targetSectionIdx, setTargetSectionIdx] = useState<number>(0);
  const [insertedId, setInsertedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadVaultCards();
    }
  }, [isOpen, category, search]);

  const loadVaultCards = async () => {
    try {
      setLoading(true);
      await vaultStorage.initialize();
      const filter: any = {};
      if (category !== 'all') {
        filter.category = [category];
      }
      if (search) {
        filter.keyword = search;
      }
      const result = await vaultStorage.queryCards(filter);
      setCards(result);
    } catch (e) {
      console.error('Failed to query vault cards', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCard = (card: VaultCard) => {
    const rawData: any = card.data || {};
    const generateId = () => Math.random().toString(36).substr(2, 9);
    let newBlock: ContentBlock;

    if (card.category === 'enemy' || rawData.type === 'enemy') {
      const enemy: EnemyBlock = {
        id: generateId(),
        type: 'enemy',
        name: card.name,
        englishName: rawData.englishName || '',
        tier: rawData.tier || 1,
        enemyType: rawData.enemyType || '标准敌人',
        flavor: rawData.flavor || rawData.description || '',
        tactics: rawData.tactics || '',
        experiences: rawData.experiences || '',
        stats: rawData.stats || {
          difficulty: 12,
          thresholdMinor: 0,
          thresholdMajor: 0,
          hp: 6,
          stress: 3
        },
        attack: rawData.attack || {
          name: '普通攻击',
          range: '近战',
          modifier: 0,
          damage: '1d6+2',
          type: 'physical'
        },
        traits: rawData.traits || []
      };
      newBlock = enemy;
    } else if (card.category === 'environment' || rawData.type === 'environment') {
      const env: EnvironmentBlock = {
        id: generateId(),
        type: 'environment',
        name: card.name,
        englishName: rawData.englishName || '',
        tier: rawData.tier || 1,
        envType: rawData.envType || '险境',
        description: rawData.description || card.description || '',
        trend: rawData.trend || '',
        difficulty: rawData.difficulty || 12,
        potentialEnemies: rawData.potentialEnemies || '',
        features: rawData.features || []
      };
      newBlock = env;
    } else if (card.category === 'cyberware' || rawData.type === 'cyberware') {
      const cyber: CyberwareBlock = {
        id: generateId(),
        type: 'cyberware',
        name: card.name,
        tier: rawData.tier || 'T1',
        cyberType: rawData.cyberType || '植入体 (Implant)',
        zone: rawData.zone || '',
        slots: rawData.slots || '1',
        restriction: rawData.restriction || '',
        effect: rawData.effect || card.description || '',
        tag: rawData.tag || '',
        compCost: rawData.compCost || '',
        surgCost: rawData.surgCost || '',
        description: rawData.description || '',
        creator: rawData.creator || '工坊造物师',
        owner: rawData.owner || '-'
      };
      newBlock = cyber;
    } else {
      // 战利品/武器/防具/消耗品/其他 转换为提示框或正文说明块
      newBlock = {
        id: generateId(),
        type: 'callout',
        title: `【${card.name}】(${card.category || '物品'})`,
        content: card.description || '无详细描述',
        variant: card.category === 'loot' ? 'tip' : card.category === 'consumable' ? 'info' : 'warning'
      };
    }

    onInsertBlock(targetSectionIdx, newBlock);
    setInsertedId(card.id);
    setTimeout(() => setInsertedId(null), 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden text-stone-100 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                从公共卡牌库插入 (Shared Vault)
                <span className="text-xs bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {cards.length} 项可用
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                可将官方 120 物品与卡牌工坊制作的敌人、环境、赛博义体直接插入战役章节
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar & Target Section */}
        <div className="px-6 py-3 border-b border-stone-800 bg-stone-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索卡牌名称或效果..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-stone-800/80 border border-stone-700 rounded-lg text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400 shrink-0">插入到章节:</span>
            <select
              value={targetSectionIdx}
              onChange={(e) => setTargetSectionIdx(Number(e.target.value))}
              className="bg-stone-800 border border-stone-700 text-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 text-xs max-w-[200px]"
            >
              {sections.map((s, idx) => (
                <option key={s.id || idx} value={idx}>
                  #{idx + 1} {s.title || '未命名章节'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-2 border-b border-stone-800/60 flex gap-1.5 overflow-x-auto no-scrollbar bg-stone-950/40">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCategory(tab.key)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                category === tab.key
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Card Grid List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-16 text-center text-stone-500 text-sm">正在检索公共卡牌库...</div>
          ) : cards.length === 0 ? (
            <div className="py-16 text-center text-stone-500 text-sm">
              未找到符合条件的卡牌，可在卡牌工坊中制作并保存！
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cards.map((card) => {
                const isJustInserted = insertedId === card.id;
                return (
                  <div
                    key={card.id}
                    className="p-3.5 bg-stone-800/50 border border-stone-700/60 rounded-xl hover:border-amber-500/60 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="px-2 py-0.5 bg-amber-500/15 text-amber-300 text-[10px] font-bold rounded border border-amber-500/30">
                          {card.category || '卡牌'} {card.sourceApp === 'builtin' ? '· 官方' : card.sourceApp === 'workshop' ? '· 工坊' : '· 自制'}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          ID: {card.id.slice(0, 8)}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-stone-100 mb-1">{card.name}</h4>
                      <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                        {card.description || '无描述'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-700/40 flex justify-end">
                      <button
                        onClick={() => handleSelectCard(card)}
                        className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg transition-all ${
                          isJustInserted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm'
                        }`}
                      >
                        {isJustInserted ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>已插入章节</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>插入到战役</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-800 bg-stone-950 flex justify-between items-center text-xs text-stone-500">
          <span>提示：插入后会自动转化为战役标准编辑块，可继续自由二次修改。</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-lg transition-colors"
          >
            完成并关闭
          </button>
        </div>
      </div>
    </div>
  );
};
