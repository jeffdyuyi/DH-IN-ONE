'use client';

/**
 * DH-IN-ONE useVault (公共卡牌库核心 React Hook)
 * 提供响应式状态绑定、极速查询与事件监听
 */

import { useState, useEffect, useCallback } from 'react';
import { VaultCard, VaultQueryFilter } from './vault-types';
import { vaultStorage } from './vault-storage';
import { buildOfficialCardPack, downloadCardPackAsJson, BuildCardPackOptions } from './cardpack-builder';

export function useVault(initialFilter?: VaultQueryFilter) {
  const [cards, setCards] = useState<VaultCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<VaultQueryFilter | undefined>(initialFilter);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      await vaultStorage.initialize();
      const result = await vaultStorage.queryCards(filter);
      setCards(result);
    } catch (err) {
      console.error('[useVault] Failed to load cards:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
    const unsubscribe = vaultStorage.subscribe(() => {
      loadData();
    });
    return () => {
      unsubscribe();
    };
  }, [loadData]);

  // 保存卡牌
  const saveCard = useCallback(async (card: VaultCard) => {
    await vaultStorage.saveCard(card);
  }, []);

  // 删除卡牌
  const deleteCard = useCallback(async (id: string) => {
    return await vaultStorage.deleteCard(id);
  }, []);

  // 按 ID 获取
  const getCardById = useCallback(async (id: string) => {
    return await vaultStorage.getCardById(id);
  }, []);

  // 自定义即时查询
  const queryCards = useCallback(async (customFilter: VaultQueryFilter) => {
    return await vaultStorage.queryCards(customFilter);
  }, []);

  // 导出选定卡牌为官方卡包
  const exportCardsToPack = useCallback((selectedCards?: VaultCard[], options?: BuildCardPackOptions) => {
    const cardsToExport = selectedCards && selectedCards.length > 0 ? selectedCards : cards;
    const pack = buildOfficialCardPack(cardsToExport, options);
    downloadCardPackAsJson(pack, options?.packName);
  }, [cards]);

  // 重置回官方种子
  const resetToBuiltin = useCallback(async () => {
    await vaultStorage.resetToBuiltin();
  }, []);

  // 清除自制卡牌
  const clearCustomCards = useCallback(async () => {
    await vaultStorage.clearCustomCards();
  }, []);

  return {
    cards,
    loading,
    filter,
    setFilter,
    saveCard,
    deleteCard,
    getCardById,
    queryCards,
    exportCardsToPack,
    resetToBuiltin,
    clearCustomCards,
    refresh: loadData
  };
}
