/**
 * DH-IN-ONE 匕首心战役编辑器 核心类型契约
 */

import { VaultCard } from '../../lib/vault/vault-types';

export type BlockType = 
  | 'text' 
  | 'subsection' 
  | 'table' 
  | 'divider' 
  | 'read_aloud' 
  | 'callout' 
  | 'outcome' 
  | 'enemy' 
  | 'environment' 
  | 'cyberware' 
  | 'loot'
  | 'image';

export interface BaseBlock {
  id: string;
  type: BlockType;
  [key: string]: any;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
}

export interface SubsectionBlock extends BaseBlock {
  type: 'subsection';
  title: string;
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  url: string;
  caption?: string;
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
  tags: Array<'hope' | 'fear' | 'success' | 'failure' | 'critical' | string>;
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
  | TableBlock
  | DividerBlock
  | ImageBlock
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
 * 将战役项目转为标准 Markdown，100% 支持所有区块包括数据表格
 */
export function exportProjectToMarkdown(project: ProjectData): string {
  let md = `# ${project.title || '未命名战役'}\n\n`;
  md += `**作者**: ${project.author || '匿名'} | **系统**: ${project.systemVersion || 'Daggerheart 1.0'}\n\n`;
  if (project.description) {
    md += `${project.description}\n\n`;
  }
  md += `---\n\n`;

  for (const sec of project.sections) {
    md += `## ${sec.title}\n\n`;
    for (const b of sec.blocks) {
      if (b.type === 'text') {
        md += `${(b as TextBlock).content || ''}\n\n`;
      } else if (b.type === 'subsection') {
        md += `### ${(b as SubsectionBlock).title || '小节'}\n\n`;
      } else if (b.type === 'table') {
        const tb = b as TableBlock;
        if (Array.isArray(tb.headers) && tb.headers.length > 0) {
          md += `| ${tb.headers.join(' | ')} |\n`;
          md += `| ${tb.headers.map(() => ':---').join(' | ')} |\n`;
          if (Array.isArray(tb.rows)) {
            for (const row of tb.rows) {
              const cleanRow = tb.headers.map((_, i) => (row[i] !== undefined ? String(row[i]).replace(/\n/g, '<br/>') : ''));
              md += `| ${cleanRow.join(' | ')} |\n`;
            }
          }
          md += `\n`;
        }
      } else if (b.type === 'read_aloud') {
        md += `> 📜 **朗读框**\n> ${(b as ReadAloudBlock).content || ''}\n\n`;
      } else if (b.type === 'callout') {
        const cb = b as CalloutBlock;
        md += `> 💡 **${cb.title || '提示'}**: ${cb.content || ''}\n\n`;
      } else if (b.type === 'divider') {
        md += `---\n\n`;
      } else if (b.type === 'image') {
        const ib = b as ImageBlock;
        md += `![${ib.caption || '战役插图'}](${ib.url})\n\n`;
      } else if (b.type === 'outcome') {
        const ob = b as OutcomeBlock;
        md += `> 🎲 **检定判定表**\n`;
        if (Array.isArray(ob.entries)) {
          for (const e of ob.entries) {
            const tagsStr = Array.isArray(e.tags) ? e.tags.join(' / ') : '判定';
            md += `> - **[${tagsStr}]**: ${e.content}\n`;
          }
        }
        md += `\n`;
      } else if (b.type === 'enemy') {
        const eb = b as EnemyBlock;
        md += `### 👾 敌人: ${eb.name} (位阶 ${eb.tier || 1} ${eb.enemyType || '敌人'})\n`;
        if (eb.stats) {
          md += `- **难度 (DC)**: ${eb.stats.difficulty || 12} | **HP**: ${eb.stats.hp || 6} | **压力**: ${eb.stats.stress || 3} | **轻度/重度阈值**: ${eb.stats.thresholdMinor || 6}/${eb.stats.thresholdMajor || 13}\n`;
        }
        if (eb.attack) {
          md += `- **主要攻击**: ${eb.attack.name || '普通攻击'} (${eb.attack.damage || 'd8'} 伤害, ${eb.attack.range || '近战'})\n`;
        }
        if (eb.tactics) {
          md += `- **战术指南**: ${eb.tactics}\n`;
        }
        if (Array.isArray(eb.traits) && eb.traits.length > 0) {
          md += `- **特性与能力**:\n`;
          for (const t of eb.traits) {
            md += `  - **${t.name}** [${t.type}]: ${t.description}\n`;
          }
        }
        md += `\n`;
      } else if (b.type === 'environment') {
        const env = b as EnvironmentBlock;
        md += `### 🌋 环境险境: ${env.name} (DC${env.difficulty || 12}, 倒计时 ${env.countdown || 4})\n`;
        if (env.trend) md += `- **趋向与动向**: ${env.trend}\n`;
        if (Array.isArray(env.features) && env.features.length > 0) {
          md += `- **环境机制**:\n`;
          for (const f of env.features) {
            md += `  - **${f.name}**: ${f.description}\n`;
          }
        }
        md += `\n`;
      } else if (b.type === 'cyberware') {
        const cb = b as CyberwareBlock;
        md += `### 🦾 ${cb.title || '赛博装备清单'}\n`;
        if (Array.isArray(cb.items)) {
          for (const it of cb.items) {
            md += `- **${it.name}** (位阶: ${it.tier || 'T1'}, 插槽: ${it.zone || '手臂'}, 占用: ${it.slots || 1}): ${it.effect}\n`;
          }
        }
        md += `\n`;
      } else if (b.type === 'loot') {
        const lb = b as LootBlock;
        md += `### 💎 ${lb.title || '战利品清单'}\n`;
        if (Array.isArray(lb.items)) {
          for (const it of lb.items) {
            md += `- **${it.name}** (${it.type || '物品'}): ${it.description}\n`;
          }
        }
        md += `\n`;
      }
    }
    md += `---\n\n`;
  }

  md += `*遵循 Darrington Press 社区许可 (DPCGL)*\n`;
  return md;
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
