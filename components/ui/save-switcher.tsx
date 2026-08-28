"use client"

import Link from "next/link"
import type { CharacterMetadata } from "@/lib/sheet-data"

interface SaveSwitcherProps {
  characterList: CharacterMetadata[]
  currentCharacterId: string | null
  onOpenCharacterManagement: () => void
}

export function SaveSwitcher({
  characterList,
  currentCharacterId,
  onOpenCharacterManagement,
}: SaveSwitcherProps) {
  const currentSave = characterList.find(char => char.id === currentCharacterId)
  const displayName = currentSave?.saveName || '加载中...'

  return (
    <div className="flex h-12 items-center justify-between gap-2 md:h-10">
      <h1 className="sr-only">DaggerHeart 角色卡：{displayName}</h1>

      <button
        type="button"
        onClick={onOpenCharacterManagement}
        className="group flex h-full flex-1 min-w-0 items-center justify-center rounded-md px-3 text-center transition-colors duration-200 hover:bg-accent/60 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`打开存档管理，当前存档：${displayName}`}
        title="打开存档管理"
      >
        <span className="min-w-0 truncate text-center text-lg font-semibold leading-6 text-foreground">
          {displayName}
        </span>
      </button>

      {/* 顶栏一键切换至爽博朋克专属特化车卡器 */}
      <Link
        href="/cyberpunk"
        className="shrink-0 flex items-center gap-1.5 rounded-md border border-cyan-500/40 bg-cyan-950/40 px-2.5 py-1 text-xs font-mono font-bold text-cyan-300 transition-all hover:bg-cyan-900/60 hover:border-cyan-400 hover:shadow-[0_0_8px_#06b6d440]"
        title="一键切换至《爽博朋克：渊边行者》专属特化车卡器"
      >
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>爽博朋克 ⇄</span>
      </Link>
    </div>
  )
}

