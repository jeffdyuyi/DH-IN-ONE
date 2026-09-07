import type { SheetData } from '@/lib/sheet-data'
import {
  deleteCharacterImage,
  getCharacterImage,
  saveCharacterImage,
} from './character-image-repository'
import type { CharacterImageAssetMap, CharacterImageRole, CharacterSheetImageField } from './character-image-types'
import { blobToDataUrl, dataUrlToBlob, isImageDataUrl } from './data-url'

const IMAGE_FIELDS: Array<{ field: CharacterSheetImageField; role: CharacterImageRole }> = [
  { field: 'characterImage', role: 'portrait' },
  { field: 'companionImage', role: 'companion' },
]

export interface SheetStorageProjectionResult {
  storedSheet: SheetData
  runtimeSheet: SheetData
  writtenImageKeys: string[]
}

export interface MissingCharacterImageAsset {
  field: CharacterSheetImageField
  key: string
  mimeType: string
}

export interface SheetRuntimeHydrationResult {
  storedSheet: SheetData
  runtimeSheet: SheetData
  missingImages: MissingCharacterImageAsset[]
}

export interface ProjectSheetForStorageOptions {
  clearEmptyImageFields?: CharacterSheetImageField[]
}

function withoutExternalImageAssets(sheet: SheetData): SheetData {
  const copy = structuredClone(sheet)
  delete copy.imageAssets
  return copy
}

async function normalizeBlobForRuntime(blob: Blob, mimeType: string): Promise<Blob> {
  return new Blob([await blob.arrayBuffer()], { type: blob.type || mimeType })
}

export async function projectSheetForStorage(
  characterId: string,
  sheetData: SheetData,
  options: ProjectSheetForStorageOptions = {},
): Promise<SheetStorageProjectionResult> {
  const storedSheet: SheetData = structuredClone(sheetData)
  const runtimeSheet: SheetData = structuredClone(sheetData)
  const imageAssets: CharacterImageAssetMap = { ...(storedSheet.imageAssets ?? {}) }
  const writtenImageKeys: string[] = []
  const clearEmptyImageFields = new Set(options.clearEmptyImageFields ?? [])

  // 跨模式兼容：若 cyberpunkData 或 cyberpunk 中包含 portrait DataURL，而 characterImage 为空，同步提升为 characterImage 以便进行 IndexedDB 安全存储
  const rawCyberPortrait = storedSheet.cyberpunkData?.portrait || (storedSheet as any).cyberpunk?.portrait
  if (!storedSheet.characterImage && isImageDataUrl(rawCyberPortrait)) {
    storedSheet.characterImage = rawCyberPortrait
    runtimeSheet.characterImage = rawCyberPortrait
  }

  for (const { field, role } of IMAGE_FIELDS) {
    const value = storedSheet[field]
    if (value === '' && clearEmptyImageFields.has(field)) {
      delete imageAssets[field]
      continue
    }

    if (!isImageDataUrl(value)) continue

    const blob = await dataUrlToBlob(value)
    const record = await saveCharacterImage({
      characterId,
      role,
      blob,
      mimeType: blob.type,
    })

    imageAssets[field] = {
      key: record.key,
      mimeType: record.mimeType,
    }
    storedSheet[field] = ''
    writtenImageKeys.push(record.key)
  }

  // 确保 storedSheet 中不再遗留大体积 Base64，防止撑爆 localStorage 5MB 配额
  if (storedSheet.cyberpunkData && isImageDataUrl(storedSheet.cyberpunkData.portrait)) {
    storedSheet.cyberpunkData.portrait = ''
  }
  if ((storedSheet as any).cyberpunk && isImageDataUrl((storedSheet as any).cyberpunk.portrait)) {
    (storedSheet as any).cyberpunk.portrait = ''
  }

  storedSheet.imageAssets = imageAssets
  runtimeSheet.imageAssets = imageAssets
  return { storedSheet, runtimeSheet, writtenImageKeys }
}

export async function hydrateSheetForRuntimeWithDiagnostics(
  storedSheet: SheetData,
): Promise<SheetRuntimeHydrationResult> {
  const cleanedStoredSheet: SheetData = structuredClone(storedSheet)
  const runtimeSheet: SheetData = structuredClone(storedSheet)
  const storedImageAssets: CharacterImageAssetMap = { ...(cleanedStoredSheet.imageAssets ?? {}) }
  const runtimeImageAssets: CharacterImageAssetMap = { ...(runtimeSheet.imageAssets ?? {}) }
  const missingImages: MissingCharacterImageAsset[] = []

  for (const { field } of IMAGE_FIELDS) {
    const ref = storedSheet.imageAssets?.[field]
    if (!ref) continue

    const record = await getCharacterImage(ref.key)
    if (!record) {
      missingImages.push({
        field,
        key: ref.key,
        mimeType: ref.mimeType,
      })
      cleanedStoredSheet[field] = ''
      runtimeSheet[field] = ''
      delete storedImageAssets[field]
      delete runtimeImageAssets[field]
      continue
    }

    runtimeSheet[field] = await blobToDataUrl(await normalizeBlobForRuntime(record.blob, record.mimeType))
  }

  if (missingImages.length > 0) {
    cleanedStoredSheet.imageAssets = storedImageAssets
    runtimeSheet.imageAssets = runtimeImageAssets
  }

  // 恢复爽博朋克立绘：从已恢复的 characterImage 镜像回填，保证跨模式双向兼容
  if (runtimeSheet.characterImage) {
    if (runtimeSheet.cyberpunkData && !runtimeSheet.cyberpunkData.portrait) {
      runtimeSheet.cyberpunkData.portrait = runtimeSheet.characterImage
    }
    if ((runtimeSheet as any).cyberpunk && !(runtimeSheet as any).cyberpunk.portrait) {
      (runtimeSheet as any).cyberpunk.portrait = runtimeSheet.characterImage
    }
  }

  return {
    storedSheet: cleanedStoredSheet,
    runtimeSheet,
    missingImages,
  }
}

export async function hydrateSheetForRuntime(storedSheet: SheetData): Promise<SheetData> {
  return (await hydrateSheetForRuntimeWithDiagnostics(storedSheet)).runtimeSheet
}

export async function prepareImportedSheetForStorage(
  characterId: string,
  importedData: SheetData,
): Promise<SheetStorageProjectionResult> {
  return await projectSheetForStorage(characterId, withoutExternalImageAssets(importedData))
}

export async function prepareDuplicatedSheetForStorage(
  _sourceCharacterId: string,
  targetCharacterId: string,
  sourceData: SheetData,
): Promise<SheetStorageProjectionResult> {
  const hydratedSource = await hydrateSheetForRuntime(sourceData)
  return await projectSheetForStorage(targetCharacterId, hydratedSource)
}

export async function prepareSheetForExport(sheetData: SheetData): Promise<SheetData> {
  const exported = (await hydrateSheetForRuntimeWithDiagnostics(sheetData)).runtimeSheet
  delete exported.imageAssets
  return exported
}

export async function rollbackWrittenCharacterImages(imageKeys: string[]): Promise<void> {
  await Promise.all(imageKeys.map(key => deleteCharacterImage(key)))
}
