import {
  getStandardCardsByTypeAsync,
  CardType,
} from "@/card";
import { prepareSheetForExport } from "@/character/storage/sheet-image-projection";
import type { SheetData } from "./sheet-data";

// 导出角色数据包接口（解耦角色与自定义卡牌）
export interface CharacterExportBundle {
  exportFormat: 'DH-CHARACTER-BUNDLE';
  schemaVersion: 2;
  exportedAt: string;
  character: SheetData;
  customCards: any[];
}

const getCardClass = async (cardId: string | undefined, cardType: CardType): Promise<string> => {
  if (!cardId) return '()';
  try {
    const cardsOfType = await getStandardCardsByTypeAsync(cardType);
    const card = cardsOfType.find((c) => c.id === cardId);
    return card && card.class ? String(card.class) : '()';
  } catch (error) {
    console.error('Error getting card class:', error);
    return '()';
  }
};

/**
 * 提取角色所携带的所有自定义/定制卡牌与义体
 */
function extractCustomCardsFromSheet(sheet: SheetData): any[] {
  const customCards: any[] = [];
  const seenIds = new Set<string>();

  // 1. 提取普通卡牌列表中的自制/自定义卡
  if (Array.isArray(sheet.cards)) {
    for (const card of sheet.cards) {
      if (card && card.id && !seenIds.has(card.id)) {
        seenIds.add(card.id);
        customCards.push(card);
      }
    }
  }

  // 2. 提取赛博朋克 4 大区已装配的义体与战利品
  const cyberpunk = (sheet as any).cyberpunk;
  if (cyberpunk && cyberpunk.zones) {
    for (const zoneKey of Object.keys(cyberpunk.zones)) {
      const zone = cyberpunk.zones[zoneKey];
      if (zone && Array.isArray(zone.augmentations)) {
        for (const aug of zone.augmentations) {
          if (aug && aug.id && !seenIds.has(aug.id)) {
            seenIds.add(aug.id);
            customCards.push({
              id: aug.id,
              type: 'cyberware',
              name: aug.name,
              category: 'cyberware',
              tier: aug.tier || 'T1',
              cyberType: aug.cyberType || '植入体',
              zone: aug.zone || zoneKey,
              slots: aug.slots || 1,
              effect: aug.effect || '',
              description: aug.description || '',
              compCost: aug.compCost || '',
              surgCost: aug.surgCost || '',
              createdAt: Date.now()
            });
          }
        }
      }
    }
  }

  return customCards;
}

// 导出角色数据为标准解耦 JSON 文件
export async function exportCharacterData(formData: SheetData): Promise<void> {
  try {
    if (!formData) {
      alert("没有可导出的角色数据");
      return;
    }

    const name = formData.name || '()';
    const ancestry1Class = await getCardClass(formData.ancestry1Ref?.id, CardType.Ancestry);
    const professionClass = await getCardClass(formData.professionRef?.id, CardType.Profession);
    const ancestry2Class = await getCardClass(formData.ancestry2Ref?.id, CardType.Ancestry);
    const communityClass = await getCardClass(formData.communityRef?.id, CardType.Community);
    const level = formData.level ? String(formData.level) : '()';

    const exportFileDefaultName = `${name}-${professionClass}-${ancestry1Class}-${ancestry2Class}-${communityClass}-LV${level}.json`;

    const portableData = await prepareSheetForExport(formData);
    const customCards = extractCustomCardsFromSheet(portableData);

    // 标准解耦数据包结构
    const bundle: CharacterExportBundle = {
      exportFormat: 'DH-CHARACTER-BUNDLE',
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      character: portableData,
      customCards: customCards
    };

    const dataStr = JSON.stringify(bundle, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  } catch (error) {
    console.error("导出角色数据失败:", error);
    alert("导出角色数据失败");
  }
}

// Function to generate a printable name for the PDF
export function generatePrintableName(formData: SheetData): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  const characterName = formData.name || "UnnamedCharacter";
  const professionName = formData.professionRef?.name || "NoProfession";

  return `DH_${characterName}_${professionName}_${dateStr}.pdf`;
}
