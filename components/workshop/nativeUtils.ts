
import html2canvas from 'html2canvas';
import { CardData, LibraryItem } from './types';

// Steganography: Append JSON data to the end of the image file
const SEPARATOR = "||TRPG_DATA||";

const isDarkMode = () => document.documentElement.classList.contains('dark');

/**
 * Robust canvas generation helper.
 * Clones the target element and appends it to body to bypass CSS layout issues
 * (like position: sticky, overflow, or flexbox alignment) that confuse html2canvas.
 */
const generateCanvas = async (elementId: string): Promise<HTMLCanvasElement | null> => {
  const originalElement = document.getElementById(elementId);
  if (!originalElement) {
    console.error(`Element with id ${elementId} not found`);
    return null;
  }

  // 1. Clone the node
  const clone = originalElement.cloneNode(true) as HTMLElement;

  // 2. Set styles to ensure it renders correctly off-screen
  // We explicitly set width/height to match the original to prevent reflow issues
  const rect = originalElement.getBoundingClientRect();
  clone.style.position = 'fixed';
  clone.style.top = '-10000px';
  clone.style.left = '-10000px';
  clone.style.zIndex = '-1000';
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.transform = 'none'; // Remove any transforms
  clone.style.margin = '0';
  
  // Remove shadows during capture if they cause artifacts (optional, keeping for now)
  // clone.style.boxShadow = 'none';

  // 3. Append to body so it can be rendered
  document.body.appendChild(clone);

  // 4. Match background color
  const bgColor = isDarkMode() ? '#09090b' : '#ffffff';

  try {
    // 5. Capture
    const canvas = await html2canvas(clone, {
      scale: 3, // High quality
      backgroundColor: bgColor,
      useCORS: true,
      logging: false,
      allowTaint: true, // Allow unsafe images if necessary (though we prefer CORS)
      width: rect.width,
      height: rect.height,
      windowWidth: document.documentElement.offsetWidth,
      windowHeight: document.documentElement.offsetHeight,
      onclone: (clonedDoc) => {
         // Fix for potential SVG/Font loading issues in clone
         const clonedEl = clonedDoc.getElementById(elementId);
         if (clonedEl) {
             clonedEl.style.display = 'block';
         }
      }
    });

    return canvas;
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
  const raw = localStorage.getItem(LIB_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const saveToLibrary = (card: CardData) => {
  const lib = getLibrary();
  const existingIndex = lib.findIndex(item => item.id === card.id);
  const newItem: LibraryItem = { id: card.id, data: card, updatedAt: Date.now() };
  
  if (existingIndex >= 0) {
    lib[existingIndex] = newItem;
  } else {
    lib.push(newItem);
  }
  
  localStorage.setItem(LIB_KEY, JSON.stringify(lib));
};

export const deleteFromLibrary = (id: string) => {
  const lib = getLibrary().filter(item => item.id !== id);
  localStorage.setItem(LIB_KEY, JSON.stringify(lib));
};
