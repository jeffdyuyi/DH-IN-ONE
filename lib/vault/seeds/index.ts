import coreLootData from './core-loot.json';
import coreConsumablesData from './core-consumables.json';
import { VaultCard } from '../vault-types';

export const BUILTIN_LOOT_SEEDS: VaultCard[] = coreLootData as unknown as VaultCard[];
export const BUILTIN_CONSUMABLE_SEEDS: VaultCard[] = coreConsumablesData as unknown as VaultCard[];

export const ALL_BUILTIN_SEEDS: VaultCard[] = [
  ...BUILTIN_LOOT_SEEDS,
  ...BUILTIN_CONSUMABLE_SEEDS
];
