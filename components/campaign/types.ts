/**
 * DH-IN-ONE 匕首心战役编辑器 核心类型契约
 */

import { VaultCard } from '../../lib/vault/vault-types';

export type BlockType = 
  | 'text' 
  | 'subsection' 
  | 'read_aloud' 
  | 'callout' 
  | 'outcome' 
  | 'enemy' 
  | 'environment' 
  | 'cyberware' 
  | 'loot'
  | 'table' 
  | 'divider' 
  | 'image';

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
}

export interface SubsectionBlock extends BaseBlock {
  type: 'subsection';
  title: string;
}

export interface ReadAloudBlock extends BaseBlock {
  type: 'read_aloud';
  content: string;
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  title: string;
  content: string;
  variant: 'info' | 'warning' | 'tip';
}

export interface OutcomeEntry {
  id: string;
  tags: Array<'hope' | 'fear' | 'success' | 'failure' | 'critical'>;
  content: string;
}

export interface OutcomeBlock extends BaseBlock {
  type: 'outcome';
  entries: OutcomeEntry[];
}

export interface Trait {
  id: string;
  name: string;
  type: 'passive' | 'action' | 'reaction' | 'spotlight';
  description: string;
}

export interface EnemyBlock extends BaseBlock {
  type: 'enemy';
  name: string;
  tier: number;
  enemyType: string;
  tactics: string;
  stats: {
    difficulty: number;
    thresholdMinor: number;
    thresholdMajor: number;
    hp: number;
    stress: number;
  };
  attack: {
    name: string;
    damage: string;
    range: string;
  };
  traits: Trait[];
  sourceVaultId?: string;
}

export interface EnvFeature {
  id: string;
  name: string;
  type: 'passive' | 'action' | 'reaction' | 'spotlight';
  description: string;
}

export interface EnvironmentBlock extends BaseBlock {
  type: 'environment';
  name: string;
  tier: number;
  envType: string;
  trend: string;
  difficulty: number;
  countdown: number;
  countdownDescription?: string;
  features: EnvFeature[];
  sourceVaultId?: string;
}

export interface LootItemEntry {
  id: string;
  name: string;
  type: string;
  description: string;
  rollIndex?: number;
}

export interface LootBlock extends BaseBlock {
  type: 'loot';
  title: string;
  items: LootItemEntry[];
}

export interface CyberwareItemEntry {
  id: string;
  name: string;
  tier: string;
  zone: string;
  slots: number;
  effect: string;
}

export interface CyberwareBlock extends BaseBlock {
  type: 'cyberware';
  title: string;
  items: CyberwareItemEntry[];
}

export type CampaignBlock =
  | TextBlock
  | SubsectionBlock
  | ReadAloudBlock
  | CalloutBlock
  | OutcomeBlock
  | EnemyBlock
  | EnvironmentBlock
  | LootBlock
  | CyberwareBlock
  | BaseBlock;

export interface Section {
  id: string;
  title: string;
  blocks: CampaignBlock[];
}

export interface ProjectData {
  id: string;
  title: string;
  author: string;
  description: string;
  version: string;
  systemVersion: string;
  sections: Section[];
  dpcglConsent: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * 将公共库 VaultCard 转换为战役编辑器区块
 */
export function vaultCardToCampaignBlock(card: VaultCard): CampaignBlock {
  const data = (card.data || {}) as Record<string, any>;

  if (card.category === 'enemy') {
    return {
      id: `block_enemy_${Date.now()}`,
      type: 'enemy',
      name: card.name,
      tier: Number(data.tier) || 1,
      enemyType: data.enemyType || '标准敌人',
      tactics: data.tactics || card.description || '',
      stats: {
        difficulty: Number(data.difficulty || data.stats?.difficulty) || 12,
        thresholdMinor: Number(data.thresholdMinor || data.stats?.thresholdMinor) || 6,
        thresholdMajor: Number(data.thresholdMajor || data.stats?.thresholdMajor) || 13,
        hp: Number(data.hp || data.stats?.hp) || 6,
        stress: Number(data.stress || data.stats?.stress) || 3
      },
      attack: {
        name: data.attackName || data.attack?.name || '普通攻击',
        damage: data.attackDamage || data.attack?.damage || 'd8',
        range: data.attackRange || data.attack?.range || '近战'
      },
      traits: Array.isArray(data.traits) ? data.traits : [],
      sourceVaultId: card.id
    } as EnemyBlock;
  }

  if (card.category === 'environment') {
    return {
      id: `block_env_${Date.now()}`,
      type: 'environment',
      name: card.name,
      tier: Number(data.tier) || 1,
      envType: data.envType || '险境',
      trend: data.trend || '险恶',
      difficulty: Number(data.difficulty) || 12,
      countdown: Number(data.countdown) || 4,
      countdownDescription: data.countdownDescription || '',
      features: Array.isArray(data.features) ? data.features : [],
      sourceVaultId: card.id
    } as EnvironmentBlock;
  }

  if (card.category === 'cyberware') {
    return {
      id: `block_cyber_${Date.now()}`,
      type: 'cyberware',
      title: `赛博装备清单: ${card.name}`,
      items: [
        {
          id: card.id,
          name: card.name,
          tier: data.tier || 'T1',
          zone: data.zone || 'arms',
          slots: Number(data.slots) || 1,
          effect: data.effect || card.description || ''
        }
      ]
    } as CyberwareBlock;
  }

  // 战利品、消耗品、武器、护甲等转为掉落清单块
  return {
    id: `block_loot_${Date.now()}`,
    type: 'loot',
    title: `掉落与物品: ${card.name}`,
    items: [
      {
        id: card.id,
        name: card.name,
        type: card.category,
        description: data.effect || data.feature || card.description || '',
        rollIndex: data.rollIndex
      }
    ]
  } as LootBlock;
}
