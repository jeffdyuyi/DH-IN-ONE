/**
 * DH-IN-ONE VaultImageStore (统一二进制图片池)
 * 基于 IndexedDB 存储，彻底解除 localStorage 5MB 限制
 */

const DB_NAME = 'dh_vault_image_db';
const DB_VERSION = 1;
const STORE_NAME = 'vault_images';

export interface VaultImageRecord {
  id: string;
  blob: Blob;
  mimeType: string;
  createdAt: number;
}

class VaultImageStoreManager {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private urlCache: Map<string, string> = new Map();

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
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
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

  // 生成唯一图片ID
  public generateImageId(prefix: string = 'img_'): string {
    return `${prefix}${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  }

  // 保存 Blob 二进制图片
  public async saveImage(blob: Blob, customId?: string, mimeType?: string): Promise<string> {
    const id = customId || this.generateImageId();
    const resolvedMime = mimeType || blob.type || 'image/png';
    const db = await this.getDB();

    const record: VaultImageRecord = {
      id,
      blob,
      mimeType: resolvedMime,
      createdAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(record);

      request.onsuccess = () => {
        this.revokeUrlCache(id);
        resolve(id);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // 保存 Base64/DataURL 图片
  public async saveBase64Image(dataUrl: string, customId?: string): Promise<string> {
    const parts = dataUrl.split(',');
    if (parts.length < 2) {
      throw new Error('Invalid Data URL format');
    }

    const mimeMatch = parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    const binary = atob(parts[1]);
    const array = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([array], { type: mimeType });
    return this.saveImage(blob, customId, mimeType);
  }

  // 获取 Blob
  public async getImageBlob(id: string): Promise<Blob | null> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const record = request.result as VaultImageRecord | undefined;
        resolve(record ? record.blob : null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // 获取 Object URL (带内存缓存管理)
  public async getImageUrl(id: string): Promise<string | null> {
    if (this.urlCache.has(id)) {
      return this.urlCache.get(id)!;
    }

    const blob = await this.getImageBlob(id);
    if (!blob) return null;

    const url = URL.createObjectURL(blob);
    this.urlCache.set(id, url);
    return url;
  }

  // 释放 URL 缓存
  public revokeUrlCache(id: string): void {
    if (this.urlCache.has(id)) {
      const url = this.urlCache.get(id)!;
      URL.revokeObjectURL(url);
      this.urlCache.delete(id);
    }
  }

  // 删除单张图片
  public async deleteImage(id: string): Promise<boolean> {
    this.revokeUrlCache(id);
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // 清除全部缓存
  public clearUrlCache(): void {
    this.urlCache.forEach((url) => URL.revokeObjectURL(url));
    this.urlCache.clear();
  }
}

export const vaultImageStore = new VaultImageStoreManager();
