import { CardData, CardType, ClassData, SubclassData, AncestryData, CommunityData, DomainData } from './types';

// Chinese label mapping for variant type
export const CHINESE_TYPE_LABELS: Record<CardType, string> = {
  [CardType.WEAPON]: '武器',
  [CardType.SUB_WEAPON]: '副武器',
  [CardType.ARMOR]: '护甲',
  [CardType.LOOT]: '战利品',
  [CardType.CONSUMABLE]: '消耗品',
  [CardType.DOMAIN]: '领域',
  [CardType.STORY]: '专属',
  [CardType.CLASS]: '职业',
  [CardType.SUBCLASS]: '子职',
  [CardType.ANCESTRY]: '种族',
  [CardType.COMMUNITY]: '社群',
  [CardType.NPC]: 'NPC',
  [CardType.CALAMITY]: '灾厄',
  [CardType.INGREDIENT]: '食材',
  [CardType.MEAL]: '料理',
  [CardType.TRANSFORMATION]: '转变',
  [CardType.MATERIAL]: '材料',
  [CardType.VEHICLE]: '载具',
  [CardType.MADNESS]: '异化',
  [CardType.CLUE]: '线索',
  [CardType.PROPHECY]: '预言',
  [CardType.QUESTION]: '问题',
  [CardType.QUEST]: '任务',
  [CardType.WHEELCHAIR]: '战斗轮椅',
  [CardType.ANOMALY]: '异常',
  [CardType.STRONGHOLD]: '据点',
  [CardType.ENVIRONMENT]: '环境',
  [CardType.LANDMARK]: '地标',
  [CardType.RUMOR]: '传闻',
  [CardType.PRICELIST]: '价目表',
  [CardType.CYBERWARE]: '赛博义体'
};

export interface CCPackMeta {
  name: string;
  version: string;
  author: string;
  description: string;
}

export interface CCCustomFieldDefinitions {
  professions: string[];
  ancestries: string[];
  communities: string[];
  domains: string[];
  variants: string[];
  variantTypes: Record<string, any>;
}

export interface CCProfession {
  id: string;
  名称: string;
  简介: string;
  领域1: string;
  领域2: string;
  起始生命: number;
  起始闪避: number;
  起始物品: string;
  希望特性: string;
  职业特性: string;
}

export interface CCAncestry {
  id: string;
  名称: string;
  种族: string;
  简介: string;
  效果: string;
  类别: number;
}

export interface CCCommunity {
  id: string;
  名称: string;
  特性: string;
  简介: string;
  描述: string;
}

export interface CCSubclass {
  id: string;
  名称: string;
  描述: string;
  主职: string;
  子职业: string;
  等级: string;
  施法: string;
}

export interface CCDomain {
  id: string;
  名称: string;
  领域: string;
  描述: string;
  等级: number;
  属性: string;
  回想: number;
}

export interface CCVariant {
  id: string;
  名称: string;
  类型: string;
  子类别?: string;
  等级?: number;
  效果: string;
  简略信息?: Record<string, string>;
}

export interface CCCardPack {
  name: string;
  version: string;
  author: string;
  description: string;
  customFieldDefinitions: CCCustomFieldDefinitions;
  profession?: CCProfession[];
  ancestry?: CCAncestry[];
  community?: CCCommunity[];
  subclass?: CCSubclass[];
  domain?: CCDomain[];
  variant?: CCVariant[];
}

/**
 * Generate unique card ID based on naming rules: 包名-作者-类型缩写-卡牌名称
 */
const generateId = (packName: string, author: string, typeAbbr: string, name: string): string => {
  const safePackName = packName || '未命名卡包';
  const safeAuthor = author || '工坊作者';
  return `${safePackName}-${safeAuthor}-${typeAbbr}-${name}`;
};

/**
 * Maps common spelling of attributes to DaggerHeart official Chinese attributes:
 * 力量, 敏捷, 灵巧, 风度, 本能, 知识, 不可施法
 */
const mapSpellcastingAttribute = (attr: string): string => {
  if (!attr) return '不可施法';
  const cleaned = attr.trim();
  if (cleaned === '力量') return '力量';
  if (cleaned === '敏捷') return '敏捷';
  if (cleaned === '灵巧' || cleaned === '技巧') return '灵巧';
  if (cleaned === '风度' || cleaned === '魅力') return '风度';
  if (cleaned === '本能' || cleaned === '感知') return '本能';
  if (cleaned === '知识' || cleaned === '智力') return '知识';
  return '不可施法';
};

/**
 * Convert a list of CardData into the DaggerHeart Character Creator JSON pack format.
 */
export const convertToCCPack = (
  cards: CardData[],
  meta: CCPackMeta
): CCCardPack => {
  const packName = meta.name;
  const author = meta.author;

  const pack: CCCardPack = {
    name: meta.name,
    version: meta.version || '1.0.0',
    description: meta.description || '',
    author: meta.author || '',
    customFieldDefinitions: {
      professions: [],
      ancestries: [],
      communities: [],
      domains: [],
      variants: [],
      variantTypes: {}
    }
  };

  // Helper sets to build customFieldDefinitions (先定义后使用)
  const professionsSet = new Set<string>();
  const ancestriesSet = new Set<string>();
  const communitiesSet = new Set<string>();
  const domainsSet = new Set<string>();
  const variantsSet = new Set<string>();

  cards.forEach(card => {
    switch (card.type) {
      case CardType.CLASS: {
        const d = card as ClassData;
        if (!pack.profession) pack.profession = [];
        professionsSet.add(d.name);
        if (d.domain1) domainsSet.add(d.domain1);
        if (d.domain2) domainsSet.add(d.domain2);

        pack.profession.push({
          id: generateId(packName, author, 'prof', d.name),
          名称: d.name,
          简介: d.description || '',
          领域1: d.domain1 || '',
          领域2: d.domain2 || '',
          起始生命: parseInt(d.hp) || 6,
          起始闪避: parseInt(d.evasion) || 10,
          起始物品: d.startingItems || '',
          希望特性: d.hopeFeature || '',
          职业特性: d.classFeature || ''
        });
        break;
      }
      case CardType.SUBCLASS: {
        const d = card as SubclassData;
        if (!pack.subclass) pack.subclass = [];
        professionsSet.add(d.baseClass);

        // Split consolidated subclass card into up to three separate level cards
        const levels = [
          { name: '基石', feature: d.foundationFeature },
          { name: '专精', feature: d.advancedFeature },
          { name: '大师', feature: d.masteryFeature }
        ];

        levels.forEach(lvl => {
          if (lvl.feature && lvl.feature.trim() !== '') {
            pack.subclass!.push({
              id: generateId(packName, author, 'subc', `${d.name}${lvl.name}`),
              名称: `${d.name}${lvl.name}`,
              描述: lvl.feature,
              主职: d.baseClass,
              子职业: d.name,
              等级: lvl.name,
              施法: mapSpellcastingAttribute(d.spellcastingAttribute)
            });
          }
        });
        break;
      }
      case CardType.ANCESTRY: {
        const d = card as AncestryData;
        if (!pack.ancestry) pack.ancestry = [];
        ancestriesSet.add(d.name);

        // Splitting ancestry traits into Category 1 and 2
        pack.ancestry.push({
          id: generateId(packName, author, 'ance', `${d.name}-${d.feature1Name || '能力1'}`),
          名称: d.feature1Name || `${d.name}能力1`,
          种族: d.name,
          简介: d.description || '',
          效果: d.feature1Desc || '',
          类别: 1
        });

        pack.ancestry.push({
          id: generateId(packName, author, 'ance', `${d.name}-${d.feature2Name || '能力2'}`),
          名称: d.feature2Name || `${d.name}能力2`,
          种族: d.name,
          简介: d.description || '',
          效果: d.feature2Desc || '',
          类别: 2
        });
        break;
      }
      case CardType.COMMUNITY: {
        const d = card as CommunityData;
        if (!pack.community) pack.community = [];
        communitiesSet.add(d.name);

        pack.community.push({
          id: generateId(packName, author, 'comm', d.name),
          名称: d.name,
          特性: d.featureName || '',
          简介: d.demeanor || '',
          描述: `${d.featureDesc || ''}\n\n${d.description || ''}`.trim()
        });
        break;
      }
      case CardType.DOMAIN: {
        const d = card as DomainData;
        if (!pack.domain) pack.domain = [];
        if (d.domainName) domainsSet.add(d.domainName);

        pack.domain.push({
          id: generateId(packName, author, 'doma', d.name),
          名称: d.name,
          领域: d.domainName || '',
          描述: d.ability || '',
          等级: parseInt(d.level) || 1,
          属性: d.category || '法术',
          回想: parseInt(d.recallCost) || 0
        });
        break;
      }
      default: {
        // Fallback for all other card types, mapped to Variant
        if (!pack.variant) pack.variant = [];
        const variantTypeLabel = CHINESE_TYPE_LABELS[card.type] || '扩展';
        variantsSet.add(variantTypeLabel);

        // Build customized effects display block for variants
        let effectsMarkdown = '';
        let briefInfo: Record<string, string> = {};

        // Custom fields parsing based on card type
        const raw: any = card;
        switch (card.type) {
          case CardType.WEAPON:
          case CardType.SUB_WEAPON:
            effectsMarkdown = `***属性***: ${raw.trait || ''}\n***距离***: ${raw.range || ''}\n***伤害***: ${raw.damage || ''} ${raw.damageType || ''}\n***负荷***: ${raw.burden || ''}\n\n${raw.feature || ''}\n\n${raw.description || ''}`;
            briefInfo = {
              item1: raw.trait || '',
              item2: raw.range || '',
              item3: raw.damage || ''
            };
            break;
          case CardType.ARMOR:
            effectsMarkdown = `***护甲值***: ${raw.score || ''}\n***重度阈值***: ${raw.majorThreshold || ''}\n***严重阈值***: ${raw.severeThreshold || ''}\n\n${raw.feature || ''}\n\n${raw.description || ''}`;
            briefInfo = {
              item1: `护甲值 ${raw.score || ''}`,
              item2: `重度 ${raw.majorThreshold || ''}`,
              item3: `严重 ${raw.severeThreshold || ''}`
            };
            break;
          case CardType.LOOT:
            effectsMarkdown = `${raw.feature || ''}\n\n${raw.description || ''}`;
            break;
          case CardType.CONSUMABLE:
            effectsMarkdown = `***使用效果***:\n${raw.effect || ''}\n\n${raw.description || ''}`;
            break;
          case CardType.STORY:
            effectsMarkdown = `***触发条件***: ${raw.trigger || ''}\n***效果***: ${raw.effect || ''}\n\n${raw.description || ''}`;
            break;
          case CardType.NPC:
            effectsMarkdown = `***难度***: ${raw.difficulty || ''}\n***动机***: ${raw.motive || ''}\n\n`;
            if (raw.features && Array.isArray(raw.features)) {
              raw.features.forEach((f: any, idx: number) => {
                effectsMarkdown += `***特性 ${idx + 1}: ${f.name}***\n`;
                if (f.choice) effectsMarkdown += `- 选择: ${f.choice}\n`;
                effectsMarkdown += `- 触发: ${f.trigger}\n`;
                effectsMarkdown += `- 效果: ${f.effect}\n\n`;
              });
            }
            effectsMarkdown += `${raw.description || ''}`;
            briefInfo = {
              item1: `难度 ${raw.difficulty || ''}`,
              item2: raw.motive || ''
            };
            break;
          case CardType.CALAMITY:
            effectsMarkdown = `***灾厄效果***:\n${raw.effect || ''}\n\n${raw.description || ''}`;
            break;
          case CardType.INGREDIENT:
            effectsMarkdown = `***食材特性***:\n${raw.feature || ''}\n\n`;
            if (raw.flavors && Array.isArray(raw.flavors)) {
              effectsMarkdown += `***味型***: `;
              effectsMarkdown += raw.flavors.map((f: any) => `${f.name} (${f.die})`).join(', ');
              effectsMarkdown += `\n\n`;
            }
            effectsMarkdown += `${raw.description || ''}`;
            break;
          case CardType.MEAL:
            effectsMarkdown = `***对应骰***: ${raw.die || ''}\n***料理效果***:\n${raw.effect || ''}\n\n`;
            if (raw.components && Array.isArray(raw.components)) {
              effectsMarkdown += `***原料***: `;
              effectsMarkdown += raw.components.map((c: any) => `${c.name}${c.flavor ? ` (${c.flavor})` : ''} (${c.die})`).join(', ');
              effectsMarkdown += `\n\n`;
            }
            effectsMarkdown += `${raw.description || ''}`;
            briefInfo = {
              item1: raw.die || ''
            };
            break;
          case CardType.TRANSFORMATION:
            effectsMarkdown = ``;
            if (raw.features && Array.isArray(raw.features)) {
              raw.features.forEach((f: any) => {
                effectsMarkdown += `***${f.name}***: ${f.description}\n\n`;
              });
            }
            effectsMarkdown += `${raw.description || ''}`;
            break;
          case CardType.MATERIAL:
            effectsMarkdown = `***出处***: ${raw.source || ''}\n***部位***: ${raw.part || ''}\n\n`;
            if (raw.features && Array.isArray(raw.features)) {
              raw.features.forEach((f: any) => {
                effectsMarkdown += `***${f.name}***: ${f.description}\n\n`;
              });
            }
            effectsMarkdown += `${raw.description || ''}`;
            break;
          case CardType.VEHICLE:
            effectsMarkdown = ``;
            if (raw.armaments && Array.isArray(raw.armaments)) {
              effectsMarkdown += `***武装配置***:\n`;
              raw.armaments.forEach((a: any) => {
                effectsMarkdown += `- ${a.name}: ${a.damage}\n`;
              });
              effectsMarkdown += `\n`;
            }
            if (raw.features && Array.isArray(raw.features)) {
              raw.features.forEach((f: any) => {
                effectsMarkdown += `***${f.name}***: ${f.description}\n\n`;
              });
            }
            effectsMarkdown += `${raw.description || ''}`;
            break;
          case CardType.MADNESS:
            effectsMarkdown = `***异化效果***:\n${raw.effect || ''}\n\n***失效条件***: ${raw.cureCondition || ''}\n\n${raw.description || ''}`;
            break;
          case CardType.CLUE:
            effectsMarkdown = `***线索内容***:\n${raw.content || ''}\n\n***备注***: ${raw.note || ''}`;
            break;
          case CardType.PROPHECY:
            effectsMarkdown = `***预言启示***:\n${raw.content || ''}\n\n***应验效果***: ${raw.successEffect || ''}\n***失败效果***: ${raw.failureEffect || ''}\n\n${raw.description || ''}`;
            break;
          case CardType.QUESTION:
            effectsMarkdown = `***引导问题 (${raw.questionType || '普通'})***:\n`;
            if (raw.options && Array.isArray(raw.options)) {
              raw.options.forEach((o: any, idx: number) => {
                effectsMarkdown += `${idx + 1}. ${o}\n`;
              });
            }
            break;
          case CardType.QUEST:
            effectsMarkdown = `***委托人***: ${raw.questGiver || ''}\n***时限***: ${raw.deadline || ''}\n***危险等级***: ${raw.dangerLevel || ''}\n\n***任务目标***:\n${raw.objectives || ''}\n\n***任务奖励***: ${raw.reward || ''}\n\n${raw.description || ''}`;
            briefInfo = {
              item1: raw.questGiver || '',
              item2: raw.deadline || '',
              item3: raw.dangerLevel || ''
            };
            break;
          case CardType.WHEELCHAIR:
            effectsMarkdown = `***型号***: ${raw.frameType || ''}\n***位阶***: ${raw.tier || ''}\n***属性***: ${raw.trait || ''}\n***射程***: ${raw.range || ''}\n***伤害***: ${raw.damage || ''}\n***负荷***: ${raw.burden || ''}\n***闪避修正***: ${raw.evasionMod || ''}\n\n***核心特性***:\n${raw.feature || ''}\n\n***移动与动作***:\n${raw.actions || ''}\n\n***判定后果***:\n${raw.consequences || ''}\n\n${raw.description || ''}`;
            briefInfo = {
              item1: raw.frameType || '',
              item2: raw.trait || '',
              item3: raw.damage || ''
            };
            break;
          case CardType.ANOMALY:
            effectsMarkdown = `***收容等级***: ${raw.containmentClass || ''}\n***发生源源***: ${raw.source || ''}\n***收容措施***:\n${raw.procedures || ''}\n\n`;
            if (raw.effects) effectsMarkdown += `***异常效应***:\n${raw.effects}\n\n`;
            if (raw.drawback) effectsMarkdown += `***代价与负面后果***:\n${raw.drawback}\n\n`;
            effectsMarkdown += `${raw.description || ''}`;
            briefInfo = {
              item1: raw.containmentClass || '',
              item2: raw.source || ''
            };
            break;
          case CardType.STRONGHOLD:
            effectsMarkdown = `***据点功能***:\n${raw.functions || ''}\n\n`;
            if (raw.restrictions) effectsMarkdown += `***特殊限制***:\n${raw.restrictions}\n\n`;
            effectsMarkdown += `${raw.description || ''}`;
            break;
          case CardType.ENVIRONMENT:
            effectsMarkdown = `***位阶***: ${raw.tier || ''}\n***类型***: ${raw.envType || ''}\n***趋向***: ${raw.tendency || ''}\n***难度***: ${raw.difficulty || ''}\n***潜在敌人***: ${raw.potentialEnemies || ''}\n\n`;
            if (raw.features && Array.isArray(raw.features)) {
              raw.features.forEach((f: any, idx: number) => {
                effectsMarkdown += `***特性 ${idx + 1}: ${f.name} (${f.type})***\n`;
                if (f.isFear) effectsMarkdown += `[恐惧特性 - 花费 ${f.fearCost || '1'} 恐惧点]\n`;
                effectsMarkdown += `${f.description || ''}\n`;
                if (f.guidingQuestion) effectsMarkdown += `*引导: ${f.guidingQuestion}*\n`;
                effectsMarkdown += `\n`;
              });
            }
            effectsMarkdown += `${raw.description || ''}`;
            briefInfo = {
              item1: `位阶 ${raw.tier || ''}`,
              item2: raw.envType || '',
              item3: `难度 ${raw.difficulty || ''}`
            };
            break;
          case CardType.LANDMARK:
            effectsMarkdown = `***外观***:\n${raw.appearance || ''}\n\n***功能***:\n${raw.functions || ''}\n\n`;
            if (raw.notes) effectsMarkdown += `***特殊备注***:\n${raw.notes}\n\n`;
            effectsMarkdown += `${raw.description || ''}`;
            break;
          case CardType.RUMOR:
            effectsMarkdown = `***传闻内容***:\n${raw.content || ''}\n\n`;
            if (raw.source) effectsMarkdown += `***来源***: ${raw.source}\n\n`;
            if (raw.notes) effectsMarkdown += `***备注***:\n${raw.notes}\n\n`;
            effectsMarkdown += `${raw.description || ''}`;
            if (raw.source) {
              briefInfo = {
                item1: `来源: ${raw.source}`
              };
            }
            break;
          case CardType.PRICELIST:
            effectsMarkdown = `### 商品价目表\n\n`;
            if (raw.items && Array.isArray(raw.items)) {
              raw.items.forEach((item: any, idx: number) => {
                effectsMarkdown += `**${idx + 1}. ${item.name}** (${item.type || '商品'} / ${item.rarity || '普通'})\n`;
                effectsMarkdown += `*价格*: ${item.price || '面议'}\n`;
                if (item.description) {
                  effectsMarkdown += `*描述*: ${item.description}\n`;
                }
                effectsMarkdown += `\n`;
              });
            }
            effectsMarkdown += `${raw.description || ''}`;
            break;
          default:
            effectsMarkdown = raw.description || '';
            break;
        }

        pack.variant.push({
          id: generateId(packName, author, 'vari', card.name),
          名称: card.name,
          类型: variantTypeLabel,
          效果: effectsMarkdown.trim(),
          简略信息: Object.keys(briefInfo).length > 0 ? briefInfo : undefined
        });
        break;
      }
    }
  });

  // Populate customFieldDefinitions
  pack.customFieldDefinitions.professions = Array.from(professionsSet);
  pack.customFieldDefinitions.ancestries = Array.from(ancestriesSet);
  pack.customFieldDefinitions.communities = Array.from(communitiesSet);
  pack.customFieldDefinitions.domains = Array.from(domainsSet);
  pack.customFieldDefinitions.variants = Array.from(variantsSet);

  return pack;
};
