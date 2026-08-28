/**
 * DH-IN-ONE VaultMigrationGuard (数据版本迁移守卫)
 * 确保读取任意时期本地数据时 100% 容错平滑升级
 */

import { VaultCard, VAULT_SCHEMA_VERSION } from './vault-types';

export function migrateVaultCard(rawCard: any): VaultCard {
  if (!rawCard || typeof rawCard !== 'object') {
    throw new Error('Invalid raw card object');
  }

  const currentVersion = rawCard.schemaVersion || 0;
  let card: VaultCard = { ...rawCard };

  // v0 -> v1 迁移：补齐必填元数据与规范分类
  if (currentVersion < 1) {
    card.id = card.id || `vault_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    card.name = card.name || '未命名卡牌';
    card.category = card.category || 'custom';
    card.sourceApp = card.sourceApp || 'workshop';
    card.schemaVersion = VAULT_SCHEMA_VERSION;
    card.createdAt = card.createdAt || Date.now();
    card.updatedAt = card.updatedAt || Date.now();
    card.data = card.data || {};
  }

  return card;
}

export function migrateVaultCardsBatch(rawCards: any[]): VaultCard[] {
  if (!Array.isArray(rawCards)) return [];
  return rawCards.map((rc) => {
    try {
      return migrateVaultCard(rc);
    } catch {
      return null;
    }
  }).filter((c): c is VaultCard => c !== null);
}
