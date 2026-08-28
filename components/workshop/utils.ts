
import html2canvas from 'html2canvas';
import { CardData, LibraryItem } from './types';

// Steganography: Append JSON data to the end of the image file
const SEPARATOR = "||TRPG_DATA||";

const isDarkMode = () => {
  if (typeof window === 'undefined') return true;
  return document.documentElement.classList.contains('dark');
};

/**
 * Robust canvas generation helper.
 * Clones the target element and applies real polygon/rounded clipping path
 * to guarantee exported PNG matches live preview (including cyberpunk cut-corners and bottom text).
 */
const generateCanvas = async (elementId: string): Promise<HTMLCanvasElement | null> => {
  const originalElement = document.getElementById(elementId);
  if (!originalElement) {
    console.error(`Element with id ${elementId} not found`);
    return null;
  }

  // 1. Clone the node
  const clone = originalElement.cloneNode(true) as HTMLElement;

  // 2. Set styles to ensure it renders correctly off-screen with full natural height
  const rect = originalElement.getBoundingClientRect();
  const naturalWidth = rect.width || 380;
  
  clone.style.position = 'fixed';
  clone.style.top = '-10000px';
  clone.style.left = '-10000px';
  clone.style.zIndex = '-1000';
  clone.style.width = `${naturalWidth}px`;
  clone.style.height = 'auto'; // allow natural expansion
  clone.style.transform = 'none';
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';

  // 3. Append to body so it can compute full layout
  document.body.appendChild(clone);
  
  const fullHeight = Math.max(clone.offsetHeight, rect.height);
  const scaleFactor = 3; // Ultra-crisp export

  try {
    // 4. Capture raw canvas with transparent background
    const rawCanvas = await html2canvas(clone, {
      scale: scaleFactor,
      backgroundColor: null, // Transparent background for cut corners
      useCORS: true,
      logging: false,
      allowTaint: true,
      width: naturalWidth,
      height: fullHeight,
      windowWidth: document.documentElement.offsetWidth,
      windowHeight: document.documentElement.offsetHeight,
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          clonedEl.style.display = 'block';
          clonedEl.style.height = 'auto';
          clonedEl.style.overflow = 'visible';
        }
      }
    });

    // 5. Post-process: Check if card has clip-path (e.g. Cyberware cut corners) or border radius
    const computedStyle = window.getComputedStyle(originalElement);
    const clipPathVal = originalElement.style.clipPath || computedStyle.clipPath || '';

    // Check children as well (cyberware container inside preview)
    const hasCyberCut = clipPathVal.includes('polygon') || 
      originalElement.innerHTML.includes('calc(100% - 20px)') ||
      originalElement.getAttribute('data-card-type') === 'cyberware';

    // Create final cropped canvas
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = rawCanvas.width;
    finalCanvas.height = rawCanvas.height;
    const ctx = finalCanvas.getContext('2d');

    if (!ctx) return rawCanvas;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (hasCyberCut) {
      // Apply exact Cyberpunk polygon cut: Top-right 20px cut, Bottom-left 20px cut
      const w = finalCanvas.width;
      const h = finalCanvas.height;
      const cut = 20 * scaleFactor;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w - cut, 0);
      ctx.lineTo(w, cut);
      ctx.lineTo(w, h);
      ctx.lineTo(cut, h);
      ctx.lineTo(0, h - cut);
      ctx.closePath();
      ctx.clip();
    } else {
      // Standard rounded card clipping if applicable
      const borderRadius = parseFloat(computedStyle.borderRadius) || 0;
      if (borderRadius > 0) {
        const r = borderRadius * scaleFactor;
        const w = finalCanvas.width;
        const h = finalCanvas.height;
        ctx.beginPath();
        ctx.roundRect(0, 0, w, h, r);
        ctx.closePath();
        ctx.clip();
      }
    }

    // Draw the rendered card content into the clipped canvas
    ctx.drawImage(rawCanvas, 0, 0);

    return finalCanvas;
  } catch (error) {
    console.error("html2canvas error:", error);
    return null;
  } finally {
    // 6. Cleanup
    if (document.body.contains(clone)) {
      document.body.removeChild(clone);
    }
  }
};

export const saveCardAsImage = async (elementId: string, data: CardData, filename: string) => {
  try {
    const canvas = await generateCanvas(elementId);
    if (!canvas) {
      alert("图片生成初始化失败，请重试。");
      return;
    }

    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert("图片数据生成失败。");
        return;
      }

      // Prepare data
      const jsonString = JSON.stringify(data);
      const textEncoder = new TextEncoder();
      const separatorBytes = textEncoder.encode(SEPARATOR);
      const jsonBytes = textEncoder.encode(jsonString);

      // Combine blob + separator + json
      const imageBuffer = await blob.arrayBuffer();
      const finalBuffer = new Uint8Array(imageBuffer.byteLength + separatorBytes.length + jsonBytes.length);
      
      finalBuffer.set(new Uint8Array(imageBuffer), 0);
      finalBuffer.set(separatorBytes, imageBuffer.byteLength);
      finalBuffer.set(jsonBytes, imageBuffer.byteLength + separatorBytes.length);

      // Create download link
      const finalBlob = new Blob([finalBuffer], { type: 'image/png' });
      const url = URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(filename || 'card').replace(/\s+/g, '_')}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  } catch (error) {
    console.error("Error generating image:", error);
    alert("图片生成失败，请检查浏览器是否支持或是否存在网络图片权限问题。");
  }
};

export const copyImageToClipboard = async (elementId: string) => {
  try {
    const canvas = await generateCanvas(elementId);
    if (!canvas) {
       alert("复制失败：无法生成画布。");
       return;
    }
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        const data = [new ClipboardItem({ [blob.type]: blob })];
        await navigator.clipboard.write(data);
        alert("图片已复制到剪贴板！");
      } catch (e) {
        console.error(e);
        alert("复制失败，可能是浏览器安全限制 (需HTTPS环境) 或不支持Clipboard API。");
      }
    });
  } catch (error) {
    console.error("Error copying image:", error);
    alert("复制过程中发生错误。");
  }
};

export const loadDataFromImage = async (file: File): Promise<CardData | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const textDecoder = new TextDecoder();
        const text = textDecoder.decode(buffer);
        
        const parts = text.split(SEPARATOR);
        if (parts.length < 2) {
          // Fallback: Try to parse as pure JSON if someone uploaded a .json renamed to .png (unlikely but possible)
          // or just fail gracefully
          throw new Error("No hidden data found");
        }
        
        // The data is in the last part
        const jsonString = parts[parts.length - 1];
        // Clean up any trailing null bytes
        const cleanJson = jsonString.substring(jsonString.indexOf('{'), jsonString.lastIndexOf('}') + 1);
        
        const data = JSON.parse(cleanJson);
        resolve(data);
      } catch (error) {
        console.error("Error reading image data:", error);
        reject("无法从图片中读取数据，请确保这是由本工具生成的图片。");
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

// Local Storage Library
const LIB_KEY = "trpg_card_library";

export const getLibrary = (): LibraryItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LIB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

import { vaultStorage } from '../../lib/vault/vault-storage';
import { VaultCard, VAULT_SCHEMA_VERSION } from '../../lib/vault/vault-types';

export const saveToLibrary = (card: CardData) => {
  if (typeof window === 'undefined') return;
  try {
    const lib = getLibrary();
    const existingIndex = lib.findIndex(item => item.id === card.id);
    const newItem: LibraryItem = { id: card.id, data: card, updatedAt: Date.now() };
    
    if (existingIndex >= 0) {
      lib[existingIndex] = newItem;
    } else {
      lib.push(newItem);
    }
    
    localStorage.setItem(LIB_KEY, JSON.stringify(lib));

    // 同步持久化写入公共卡牌库中枢 (VaultStorage)
    const vaultCard: VaultCard = {
      id: card.id,
      schemaVersion: VAULT_SCHEMA_VERSION,
      name: card.name || '未命名卡牌',
      category: card.type as any,
      sourceApp: 'workshop',
      description: card.description || '',
      data: card,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };
    vaultStorage.saveCard(vaultCard).catch(() => {});
  } catch (e) {
    // silent catch
  }
};

export const deleteFromLibrary = (id: string) => {
  if (typeof window === 'undefined') return;
  try {
    const lib = getLibrary().filter(item => item.id !== id);
    localStorage.setItem(LIB_KEY, JSON.stringify(lib));
    vaultStorage.deleteCard(id).catch(() => {});
  } catch (e) {
    // silent catch
  }
};
