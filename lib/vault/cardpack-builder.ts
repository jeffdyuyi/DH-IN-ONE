/**
 * DH-IN-ONE CardPackBuilder (官方标准卡包 JSON 序列化器)
 * 严格遵循:
 * 1. 《AI-卡包创作指南.md》
 * 2. 《建卡编辑器用户指南.md》
 */

import { VaultCard } from './vault-types';

export interface CardPackOutput {
  name: string;
  version: string;
  author: string;
  description: string;
  customFieldDefinitions: {
    professions: string[];
    ancestries: string[];
    communities: string[];
    domains: string[];
    variants: string[];
  };
  profession?: any[];
  ancestry?: any[];
  community?: any[];
  subclass?: any[];
  domain?: any[];
  variant?: any[];
}

export interface BuildCardPackOptions {
  packName?: string;
  version?: string;
  author?: string;
  description?: string;
}

export function buildOfficialCardPack(
  cards: VaultCard[],
  options: BuildCardPackOptions = {}
): CardPackOutput {
  const packName = options.packName || 'DH-IN-ONE 自定义卡包';
  const version = options.version || '1.0.0';
  const author = options.author || 'DH-IN-ONE';
  const description = options.description || '由 DH-IN-ONE 公共卡牌库导出';

  const professionsSet = new Set<string>();
  const ancestriesSet = new Set<string>();
  const communitiesSet = new Set<string>();
  const domainsSet = new Set<string>();
  const variantsSet = new Set<string>();

  const professions: any[] = [];
  const ancestries: any[] = [];
  const communities: any[] = [];
  const subclasses: any[] = [];
  const domains: any[] = [];
  const variants: any[] = [];

  for (const card of cards) {
    const data = (card.data || {}) as Record<string, any>;

    switch (card.category) {
      case 'class': {
        professionsSet.add(card.name);
        professions.push({
          id: card.id,
          名称: card.name,
          领域1: data.domain1 || '',
          领域2: data.domain2 || '',
          起始生命: Number(data.hp) || 5,
          起始闪避: Number(data.evasion) || 10,
          起始物品: data.startingItems || '',
          职业特性: data.classFeature || '',
          希望特性: data.hopeFeature || '',
          简介: card.description || ''
        });
        if (data.domain1) domainsSet.add(data.domain1);
        if (data.domain2) domainsSet.add(data.domain2);
        break;
      }

      case 'ancestry': {
        ancestriesSet.add(card.name);
        // 种族必须拆分为两张卡 (类别 1 和 2)
        ancestries.push({
          id: `${card.id}-1`,
          名称: data.feature1Name || `${card.name}特性一`,
          种族: card.name,
          简介: card.description || '',
          效果: data.feature1Desc || '',
          类别: 1
        });
        ancestries.push({
          id: `${card.id}-2`,
          名称: data.feature2Name || `${card.name}特性二`,
          种族: card.name,
          简介: card.description || '',
          效果: data.feature2Desc || '',
          类别: 2
        });
        break;
      }

      case 'community': {
        communitiesSet.add(card.name);
        communities.push({
          id: card.id,
          名称: card.name,
          社群: card.name,
          描述: data.featureDesc || card.description || '',
          特性名称: data.featureName || '',
          风向: data.demeanor || ''
        });
        break;
      }

      case 'subclass': {
        const baseClass = data.baseClass || '通用';
        professionsSet.add(baseClass);
        // 子职业拆为基石/专精/大师 3 张卡
        if (data.foundationFeature) {
          subclasses.push({
            id: `${card.id}-foundation`,
            名称: `${card.name}基石`,
            描述: data.foundationFeature,
            主职: baseClass,
            子职业: card.name,
            等级: '基石',
            施法: data.spellcastingAttribute || '本能'
          });
        }
        if (data.specializationFeature || data.masteryFeature) {
          subclasses.push({
            id: `${card.id}-specialization`,
            名称: `${card.name}专精`,
            描述: data.specializationFeature || data.masteryFeature || '',
            主职: baseClass,
            子职业: card.name,
            等级: '专精',
            施法: data.spellcastingAttribute || '本能'
          });
        }
        if (data.masteryFeature || data.advancedFeature) {
          subclasses.push({
            id: `${card.id}-mastery`,
            名称: `${card.name}大师`,
            描述: data.masteryFeature || data.advancedFeature || '',
            主职: baseClass,
            子职业: card.name,
            等级: '大师',
            施法: data.spellcastingAttribute || '本能'
          });
        }
        break;
      }

      case 'domain': {
        const domainName = data.domainName || '通用';
        domainsSet.add(domainName);
        domains.push({
          id: card.id,
          名称: card.name,
          领域: domainName,
          描述: data.ability || card.description || '',
          等级: Number(data.level) || 1,
          属性: data.category || '法术',
          回想: Number(data.recallCost) || 1
        });
        break;
      }

      // 其余所有物品、战利品、敌人、环境、赛博装备等均作为 variant 扩展卡输出
      default: {
        const categoryLabelMap: Record<string, string> = {
          weapon: '武器',
          armor: '护甲',
          loot: '战利品',
          consumable: '消耗品',
          cyberware: '赛博装备',
          enemy: '敌人',
          environment: '环境',
          npc: 'NPC',
          vehicle: '载具',
          ingredient: '食材',
          meal: '料理',
          material: '材料',
          landmark: '地标',
          rumor: '谣言',
          quest: '任务',
          clue: '线索',
          story: '独特',
          transformation: '变形',
          stronghold: '据点',
          anomaly: '异常',
          wheelchair: '战术轮椅',
          pricelist: '价目表'
        };

        const variantCategory = categoryLabelMap[card.category] || card.category;
        variantsSet.add(variantCategory);

        const effectDesc =
          data.effect || data.feature || data.tactics || data.description || card.description || '';

        variants.push({
          id: card.id,
          名称: card.name,
          类别: variantCategory,
          描述: effectDesc,
          子类别: data.tier || data.cyberType || data.envType || data.enemyType || undefined,
          简略信息: data.damage || (data.score ? `护甲+${data.score}` : undefined),
          rawPayload: data
        });
        break;
      }
    }
  }

  const result: CardPackOutput = {
    name: packName,
    version,
    author,
    description,
    customFieldDefinitions: {
      professions: Array.from(professionsSet),
      ancestries: Array.from(ancestriesSet),
      communities: Array.from(communitiesSet),
      domains: Array.from(domainsSet),
      variants: Array.from(variantsSet)
    }
  };

  if (professions.length > 0) result.profession = professions;
  if (ancestries.length > 0) result.ancestry = ancestries;
  if (communities.length > 0) result.community = communities;
  if (subclasses.length > 0) result.subclass = subclasses;
  if (domains.length > 0) result.domain = domains;
  if (variants.length > 0) result.variant = variants;

  return result;
}

/**
 * 导出卡包为可下载 JSON 文件
 */
export function downloadCardPackAsJson(cardPack: CardPackOutput, fileName?: string): void {
  const jsonStr = JSON.stringify(cardPack, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName || cardPack.name || 'card-pack'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
