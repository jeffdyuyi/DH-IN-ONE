/**
 * DH-IN-ONE 卡牌工坊 V3 核心类型定义
 */

import { VaultCard, VaultCardCategory } from '../../lib/vault/vault-types';

export enum CardType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  LOOT = 'loot',
  CONSUMABLE = 'consumable',
  DOMAIN = 'domain',
  STORY = 'story',
  CLASS = 'class',
  SUBCLASS = 'subclass',
  ANCESTRY = 'ancestry',
  COMMUNITY = 'community',
  ENEMY = 'enemy',           // 新增：独立战斗敌人卡
  ENVIRONMENT = 'environment', // 环境险境卡
  NPC = 'npc',
  CALAMITY = 'calamity',
  INGREDIENT = 'ingredient',
  MEAL = 'meal',
  TRANSFORMATION = 'transformation',
  MATERIAL = 'material',
  VEHICLE = 'vehicle',
  MADNESS = 'madness',
  CLUE = 'clue',
  PROPHECY = 'prophecy',
  QUESTION = 'question',
  QUEST = 'quest',
  SUB_WEAPON = 'subweapon',
  WHEELCHAIR = 'wheelchair',
  ANOMALY = 'anomaly',
  STRONGHOLD = 'stronghold',
  LANDMARK = 'landmark',
  RUMOR = 'rumor',
  PRICELIST = 'pricelist',
  CYBERWARE = 'cyberware'
}

export interface BaseCardData {
  id: string;
  type: CardType;
  name: string;
  description: string;
  creator: string;
  owner: string;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: any;
}

export interface EnemyCardData extends BaseCardData {
  tier: number;
  enemyType: string;
  tactics: string;
  difficulty: number;
  thresholdMinor: number;
  thresholdMajor: number;
  hp: number;
  stress: number;
  attackName: string;
  attackModifier: string;
  attackDamage: string;
  attackRange: string;
  traits: Array<{
    id: string;
    name: string;
    type: 'passive' | 'action' | 'reaction' | 'spotlight';
    description: string;
  }>;
}

export interface EnvironmentCardData extends BaseCardData {
  tier: number;
  envType: string;
  trend: string;
  difficulty: number;
  countdown: number;
  countdownDescription?: string;
  features: Array<{
    id: string;
    name: string;
    type: 'passive' | 'action' | 'reaction' | 'spotlight';
    description: string;
  }>;
}

export function workshopCardToVaultCard(card: BaseCardData): VaultCard {
  const categoryMap: Record<string, VaultCardCategory> = {
    [CardType.WEAPON]: 'weapon',
    [CardType.ARMOR]: 'armor',
    [CardType.LOOT]: 'loot',
    [CardType.CONSUMABLE]: 'consumable',
    [CardType.CYBERWARE]: 'cyberware',
    [CardType.ENEMY]: 'enemy',
    [CardType.ENVIRONMENT]: 'environment',
    [CardType.NPC]: 'npc',
    [CardType.DOMAIN]: 'domain',
    [CardType.CLASS]: 'class',
    [CardType.SUBCLASS]: 'subclass',
    [CardType.ANCESTRY]: 'ancestry',
    [CardType.COMMUNITY]: 'community',
    [CardType.VEHICLE]: 'vehicle',
    [CardType.INGREDIENT]: 'ingredient',
    [CardType.MEAL]: 'meal',
    [CardType.MATERIAL]: 'material',
    [CardType.LANDMARK]: 'landmark',
    [CardType.RUMOR]: 'rumor',
    [CardType.QUEST]: 'quest',
    [CardType.CLUE]: 'clue',
    [CardType.STORY]: 'story',
    [CardType.TRANSFORMATION]: 'transformation',
    [CardType.STRONGHOLD]: 'stronghold',
    [CardType.ANOMALY]: 'anomaly',
    [CardType.WHEELCHAIR]: 'wheelchair',
    [CardType.PRICELIST]: 'pricelist'
  };

  const category = categoryMap[card.type] || 'custom';

  return {
    id: card.id,
    name: card.name,
    category,
    description: card.description,
    sourceApp: 'workshop',
    sourceId: card.id,
    author: card.creator || '自制作者',
    schemaVersion: 1,
    createdAt: card.createdAt || Date.now(),
    updatedAt: card.updatedAt || Date.now(),
    data: { ...card }
  };
}
