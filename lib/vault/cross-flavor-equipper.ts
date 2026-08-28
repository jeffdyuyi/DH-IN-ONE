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
  const weaponData = (card.data || {}) as VaultWeaponData;

  const traitMap: Record<string, string> = {
    '敏捷': 'agility',
    '力量': 'strength',
    '灵巧': 'finesse',
    '本能': 'instinct',
    '风度': 'presence',
    '知识': 'knowledge'
  };

  const resolvedTrait = traitMap[weaponData?.trait] || weaponData?.trait || 'agility';

  return {
    id: card.id,
    name: card.name,
    tier: weaponData?.tier || 'T1',
    trait: resolvedTrait,
    damageType: weaponData?.damageType === '魔法' ? 'magical' : 'physical',
    range: weaponData?.range || 'melee',
    burden: weaponData?.burden === '双手' || weaponData?.burden === 'twoHanded' ? 'twoHanded' : 'oneHanded',
    damage: weaponData?.damage || 'd8',
    featureName: card.name,
    description: weaponData?.feature || card.description || '',
    sourceCardId: card.id,
    modifierContributions: extractModifierContributions(card)
  };
}

export function compileVaultToArmor(card: VaultCard): CompiledArmorItem {
  const armorData = (card.data || {}) as VaultArmorData;

  return {
    id: card.id,
    name: card.name,
    tier: (armorData?.tier as any) || 'T1',
    baseThresholds: {
      minor: Number(armorData?.majorThreshold) || 6,
      major: Number(armorData?.severeThreshold) || 13
    },
    baseArmorMax: Number(armorData?.score) || 3,
    featureName: card.name,
    description: armorData?.feature || card.description || '',
    sourceCardId: card.id,
    modifierContributions: extractModifierContributions(card)
  };
}
