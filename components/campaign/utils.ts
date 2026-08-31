/**
 * Shared utility helpers for Daggerheart Campaign Studio
 */

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const generateBlockId = (prefix: string = 'b_'): string => {
  return prefix + Math.random().toString(36).substring(2, 9);
};

export const cleanImageUrl = (url?: string, fallbackDesc: string = '图片'): string => {
  if (!url) return '';
  return url.trim();
};
