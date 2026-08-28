/**
 * DH-IN-ONE CrossFlavorEquipper (跨画风装备与义体编译器)
 */

import { VaultCard, VaultWeaponData, VaultArmorData, VaultCyberwareData, VaultLootData } from './vault-types';

export interface CompiledCyberwareItem {
  id: string;
  name: string;
  tier: string;
  zone: string;
  slots: number;
  effect: string;
  tag?: string;
  compCost?: string;
  surgCost?: string;
  isOriginalLoot?: boolean;
  sourceCardId: string;
}

export interface CompiledWeaponItem {
  id: string;
  name: string;
  tier: string;
  trait: string;
  damageType: string;
  range: string;
  burden: string;
  damage: string;
  featureName?: string;
  description?: string;
  sourceCardId: string;
  modifierContributions: Array<{
    id: string;
    definition: { target: string; kind: 'modifier' };
    editable: { label: string; value: number };
  }>;
}

export interface CompiledArmorItem {
  id: string;
  name: string;
  tier: string;
  baseThresholds: {
    minor: number;
    major: number;
  };
  baseArmorMax: number;
  featureName: string;
  description: string;
  sourceCardId: string;
  modifierContributions: Array<{
    id: string;
    definition: { target: string; kind: 'modifier' };
    editable: { label: string; value: number };
  }>;
}

export function extractModifierContributions(card: VaultCard): Array<{
  id: string;
  definition: { target: string; kind: 'modifier' };
  editable: { label: string; value: number };
}> {
  const contributions: Array<{
    id: string;
    definition: { target: string; kind: 'modifier' };
    editable: { label: string; value: number };
  }> = [];

  const lootData = card.data as VaultLootData;
  if (lootData && lootData.statBonus) {
    contributions.push({
      id: `${card.id}_${lootData.statBonus.target}`,
      definition: { target: lootData.statBonus.target, kind: 'modifier' },
      editable: { label: card.name, value: lootData.statBonus.value }
    });
    return contributions;
  }

  const anyData = (card.data || {}) as Record<string, any>;
  const textToScan = `${card.description || ''} ${anyData.effect || ''} ${anyData.feature || ''}`;
  
  const rules = [
    { regex: /敏捷\s*\+(\d+)/i, target: 'agility' },
    { regex: /力量\s*\+(\d+)/i, target: 'strength' },
    { regex: /灵巧\s*\+(\d+)/i, target: 'finesse' },
    { regex: /本能\s*\+(\d+)/i, target: 'instinct' },
    { regex: /风度\s*\+(\d+)/i, target: 'presence' },
    { regex: /知识\s*\+(\d+)/i, target: 'knowledge' },
    { regex: /闪避[值]?\s*\+(\d+)/i, target: 'evasion' },
    { regex: /闪避[值]?\s*-(\d+)/i, target: 'evasion', negative: true },
    { regex: /护甲[值]?\s*\+(\d+)/i, target: 'armorMax' },
  ];

  for (const rule of rules) {
    const match = textToScan.match(rule.regex);
    if (match) {
      const num = parseInt(match[1], 10);
      const val = rule.negative ? -num : num;
      contributions.push({
        id: `${card.id}_${rule.target}`,
        definition: { target: rule.target, kind: 'modifier' },
        editable: { label: card.name, value: val }
      });
    }
  }

  return contributions;
}

export function compileLootToCyberware(
  card: VaultCard,
  targetZone: string = 'arms',
  customSlots: number = 1,
  customAlias?: string
): CompiledCyberwareItem {
  const isCyber = card.category === 'cyberware';
  const cyberData = isCyber ? (card.data as VaultCyberwareData) : null;
  const anyData = (card.data || {}) as Record<string, any>;
  const effectText = isCyber
    ? cyberData?.effect || card.description || ''
    : anyData.effect || card.description || '';

  return {
    id: `cyber_inst_${card.id}_${Date.now()}`,
    name: customAlias && customAlias.trim() !== '' ? customAlias.trim() : card.name,
    tier: cyberData?.tier || 'T1',
    zone: isCyber && cyberData?.zone ? cyberData.zone : targetZone,
    slots: isCyber && cyberData?.slots ? Number(cyberData.slots) : customSlots,
    effect: effectText,
    tag: cyberData?.tag || undefined,
    compCost: cyberData?.compCost,
    surgCost: cyberData?.surgCost,
    isOriginalLoot: false,
    sourceCardId: card.id
  };
}

export function compileVaultToWeapon(card: VaultCard): CompiledWeaponItem {
  const isCyber = card.category === 'cyberware';
  const anyData = (card.data || {}) as Record<string, any>;
  const textToScan = `${card.description || ''} ${anyData.effect || ''} ${anyData.feature || ''}`;

  const traitMap: Record<string, string> = {
    '敏捷': 'agility',
    '力量': 'strength',
    '灵巧': 'finesse',
    '本能': 'instinct',
    '风度': 'presence',
    '知识': 'knowledge'
  };

  // 1. 尝试从结构化字段读取
  let trait = anyData.trait;
  let damage = anyData.damage;
  let range = anyData.range;
  let burden = anyData.burden;
  let damageType = anyData.damageType;

  // 2. 如果是赛博卡片且字段不全，从文本智能解析
  if (isCyber || !damage) {
    if (!trait) {
      const traitMatch = textToScan.match(/(敏捷|力量|灵巧|本能|风度|知识)/);
      if (traitMatch) trait = traitMatch[1];
    }
    if (!damage) {
      const damageMatch = textToScan.match(/(d\d+(?:\s*[+-]\s*\d+)?)/i);
      if (damageMatch) damage = damageMatch[1].replace(/\s+/g, '');
    }
    if (!range) {
      const rangeMatch = textToScan.match(/(近战|邻近|近距离|远距离|极远)/);
      if (rangeMatch) range = rangeMatch[1];
    }
    if (!burden) {
      if (textToScan.includes('双手') || textToScan.includes('twoHanded')) burden = 'twoHanded';
      else burden = 'oneHanded';
    }
  }

  const resolvedTrait = traitMap[trait] || trait || 'agility';
  const resolvedBurden = (burden === '双手' || burden === 'twoHanded') ? 'twoHanded' : 'oneHanded';

  return {
    id: card.id,
    name: card.name,
    tier: anyData.tier || 'T1',
    trait: resolvedTrait,
    damageType: damageType === '魔法' || damageType === 'magical' ? 'magical' : 'physical',
    range: range || 'melee',
    burden: resolvedBurden,
    damage: damage || 'd8',
    featureName: card.name,
    description: anyData.feature || anyData.effect || card.description || '',
    sourceCardId: card.id,
    modifierContributions: extractModifierContributions(card)
  };
}

export function compileVaultToArmor(card: VaultCard): CompiledArmorItem {
  const isCyber = card.category === 'cyberware';
  const anyData = (card.data || {}) as Record<string, any>;
  const textToScan = `${card.description || ''} ${anyData.effect || ''} ${anyData.feature || ''}`;

  let score = Number(anyData.score || anyData.armorScore) || 0;
  let minor = Number(anyData.majorThreshold || anyData.minorThreshold) || 0;
  let major = Number(anyData.severeThreshold || anyData.majorThreshold) || 0;

  if (isCyber && (score === 0 || (minor === 0 && major === 0))) {
    const scoreMatch = textToScan.match(/护甲[值]?\s*[+＋:：]?\s*(\d+)/);
    if (scoreMatch) score = parseInt(scoreMatch[1], 10);

    const threshMatch = textToScan.match(/[+＋]?\s*(\d+)\s*[/／]\s*[+＋]?\s*(\d+)\s*(?:全)?(?:伤害)?阈值/);
    if (threshMatch) {
      minor = parseInt(threshMatch[1], 10);
      major = parseInt(threshMatch[2], 10);
    }
  }

  return {
    id: card.id,
    name: card.name,
    tier: (anyData.tier as any) || 'T1',
    baseThresholds: {
      minor: minor || 6,
      major: major || 13
    },
    baseArmorMax: score || 3,
    featureName: card.name,
    description: anyData.feature || anyData.effect || card.description || '',
    sourceCardId: card.id,
    modifierContributions: extractModifierContributions(card)
  };
}

export function compileVaultToExternalGear(
  card: VaultCard,
  customAlias?: string
): {
  id: string;
  name: string;
  tier?: string;
  cyberType?: string;
  zone?: string;
  slots: number;
  active: boolean;
  restriction?: string;
  effect?: string;
  description?: string;
  tag?: string;
  compCost?: string;
  surgCost?: string;
  weaponStats?: {
    trait?: string;
    damage?: string;
    range?: string;
    burden?: string;
    damageType?: string;
  };
  armorStats?: {
    armorScore?: number;
    majorThreshold?: number;
    severeThreshold?: number;
  };
  sourceCardId: string;
} {
  const anyData = (card.data || {}) as Record<string, any>;
  const textToScan = `${card.description || ''} ${anyData.effect || ''} ${anyData.feature || ''}`;

  // 检查是否具备武器特征
  const isWeapon = card.category === 'weapon' ||
    anyData.damage ||
    anyData.zone === '主武器' ||
    anyData.zone === '副武器' ||
    textToScan.match(/(敏捷|力量|灵巧|本能|风度|知识).*(d\d+)/i);

  // 检查是否具备护甲特征
  const isArmor = card.category === 'armor' ||
    anyData.score ||
    anyData.armorScore ||
    anyData.zone === '战术护甲' ||
    anyData.zone === '护甲' ||
    textToScan.match(/护甲[值]?\s*[+＋:：]?\s*(\d+)/i);

  let weaponStats: any = undefined;
  if (isWeapon) {
    const compiledW = compileVaultToWeapon(card);
    weaponStats = {
      trait: anyData.trait || (textToScan.match(/(敏捷|力量|灵巧|本能|风度|知识)/)?.[1]) || '敏捷',
      damage: compiledW.damage,
      range: anyData.range || (textToScan.match(/(近战|邻近|近距离|远距离|极远)/)?.[1]) || '近战',
      burden: compiledW.burden === 'twoHanded' ? '双手' : '单手',
      damageType: compiledW.damageType === 'magical' ? '魔法' : '物理'
    };
  }

  let armorStats: any = undefined;
  if (isArmor) {
    const compiledA = compileVaultToArmor(card);
    armorStats = {
      armorScore: compiledA.baseArmorMax,
      majorThreshold: compiledA.baseThresholds.minor,
      severeThreshold: compiledA.baseThresholds.major
    };
  }

  const slotCount = Number(anyData.slots) || (anyData.slotCost ? Number(anyData.slotCost) : 1);

  return {
    id: `ext_gear_${card.id}_${Date.now()}`,
    name: customAlias && customAlias.trim() !== '' ? customAlias.trim() : card.name,
    tier: anyData.tier || 'T1',
    cyberType: anyData.cyberType || (card.category === 'cyberware' ? '外置设备' : '战术外挂'),
    zone: anyData.zone || (isWeapon ? '主武器' : isArmor ? '战术护甲' : '外置设备'),
    slots: isNaN(slotCount) || slotCount < 1 ? 1 : slotCount,
    active: true,
    restriction: anyData.restriction || '',
    effect: anyData.effect || anyData.feature || card.description || '',
    description: card.description || anyData.description || '',
    tag: anyData.tag || undefined,
    compCost: anyData.compCost,
    surgCost: anyData.surgCost,
    weaponStats,
    armorStats,
    sourceCardId: card.id
  };
}

