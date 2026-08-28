/**
 * DH-IN-ONE VaultStorage (公共卡牌库本地存储引擎)
 * 基于 IndexedDB 存储，表名: dh_v1_vault_cards
 */

import { VaultCard, VaultQueryFilter, VAULT_SCHEMA_VERSION } from './vault-types';
import { ALL_BUILTIN_SEEDS } from './seeds';

const DB_NAME = 'dh_vault_cards_db';
const DB_VERSION = 1;
const STORE_NAME = 'vault_cards';

export type VaultChangeListener = () => void;

class VaultStorageManager {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private listeners: Set<VaultChangeListener> = new Set();
  private initialized: boolean = false;

  private getDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('IndexedDB is not available on server'));
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('category', 'category', { unique: false });
            store.createIndex('sourceApp', 'sourceApp', { unique: false });
            store.createIndex('updatedAt', 'updatedAt', { unique: false });
          }
        };

        request.onsuccess = (event) => {
          resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event) => {
          reject((event.target as IDBOpenDBRequest).error);
        };
      });
    }

    return this.dbPromise;
  }

  public subscribe(listener: VaultChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyChange(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('[VaultStorage] Listener error:', err);
      }
    });
  }

  public async initialize(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return;

    try {
      const count = await this.getCardCount();
      if (count === 0) {
        console.log('[VaultStorage] First time initialization, loading builtin seeds...');
        await this.batchPut(ALL_BUILTIN_SEEDS);
      }
      this.initialized = true;
    } catch (err) {
      console.error('[VaultStorage] Initialization failed:', err);
    }
  }

  public async getCardCount(): Promise<number> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  public async saveCard(card: VaultCard): Promise<void> {
    const db = await this.getDB();
    const preparedCard: VaultCard = {
      ...card,
      schemaVersion: card.schemaVersion || VAULT_SCHEMA_VERSION,
      updatedAt: Date.now(),
      createdAt: card.createdAt || Date.now()
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(preparedCard);

      req.onsuccess = () => {
        resolve();
        this.notifyChange();
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async getCardById(id: string): Promise<VaultCard | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve((req.result as VaultCard) || null);
      req.onerror = () => reject(req.error);
    });
  }

  public async deleteCard(id: string): Promise<boolean> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => {
        resolve(true);
        this.notifyChange();
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async batchPut(cards: VaultCard[]): Promise<void> {
    if (cards.length === 0) return;
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      tx.oncomplete = () => {
        resolve();
        this.notifyChange();
      };
      tx.onerror = () => reject(tx.error);

      for (const card of cards) {
        const prepared: VaultCard = {
          ...card,
          schemaVersion: card.schemaVersion || VAULT_SCHEMA_VERSION,
          updatedAt: card.updatedAt || Date.now(),
          createdAt: card.createdAt || Date.now()
        };
        store.put(prepared);
      }
    });
  }

  public async listAllCards(): Promise<VaultCard[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as VaultCard[]) || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async queryCards(filter: VaultQueryFilter = {}): Promise<VaultCard[]> {
    let all = await this.listAllCards();

    if (filter.category) {
      const categories = Array.isArray(filter.category) ? filter.category : [filter.category];
      all = all.filter((c) => categories.includes(c.category));
    }

    if (filter.sourceApp) {
      all = all.filter((c) => c.sourceApp === filter.sourceApp);
    }

    if (filter.isBuiltin !== undefined) {
      all = all.filter((c) => Boolean(c.isBuiltin) === filter.isBuiltin);
    }

    if (filter.keyword && filter.keyword.trim() !== '') {
      const kw = filter.keyword.trim().toLowerCase();
      all = all.filter((c) => {
        const nameMatch = c.name.toLowerCase().includes(kw);
        const descMatch = c.description ? c.description.toLowerCase().includes(kw) : false;
        const anyData = (c.data || {}) as Record<string, any>;
        const effectMatch = typeof anyData.effect === 'string' ? anyData.effect.toLowerCase().includes(kw) : false;
        return nameMatch || descMatch || effectMatch;
      });
    }

    all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    const offset = filter.offset || 0;
    const limit = filter.limit !== undefined ? filter.limit : all.length;

    return all.slice(offset, offset + limit);
  }

  public async clearCustomCards(): Promise<void> {
    const all = await this.listAllCards();
    const customIds = all.filter((c) => !c.isBuiltin).map((c) => c.id);
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      tx.oncomplete = () => {
        resolve();
        this.notifyChange();
      };
      tx.onerror = () => reject(tx.error);

      for (const id of customIds) {
        store.delete(id);
      }
    });
  }

  public async resetToBuiltin(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = async () => {
        await this.batchPut(ALL_BUILTIN_SEEDS);
        resolve();
        this.notifyChange();
      };
      req.onerror = () => reject(req.error);
    });
  }
}

export const vaultStorage = new VaultStorageManager();
