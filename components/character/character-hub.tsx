"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  UserPlus, 
  Cpu, 
  Sparkles, 
  Trash2, 
  Copy, 
  Edit3, 
  Upload, 
  Download, 
  ArrowLeft, 
  Clock, 
  Shield, 
  Zap,
  Layers,
  FileJson
} from 'lucide-react'
import { 
  loadCharacterList, 
  saveCharacterList, 
  generateCharacterId,
  MAX_CHARACTERS,
  CHARACTER_DATA_PREFIX
} from '@/lib/multi-character-storage'
import { CharacterMetadata, CharacterList, SheetData } from '@/lib/sheet-data'
import { defaultSheetData } from '@/lib/default-sheet-data'
import { saveCharacterSheet } from '@/character/storage/character-save-storage'

export function CharacterHub() {
  const router = useRouter()
  const [characterList, setCharacterList] = useState<CharacterList>({
    characters: [],
    activeCharacterId: null,
    lastUpdated: new Date().toISOString()
  })
  const [characterDetails, setCharacterDetails] = useState<Record<string, SheetData>>({})
  const [loading, setLoading] = useState(true)

  // 加载所有角色卡元数据与详情
  const refreshList = () => {
    try {
      const list = loadCharacterList()
      setCharacterList(list)

      const details: Record<string, SheetData> = {}
      for (const char of list.characters) {
        const raw = localStorage.getItem(`${CHARACTER_DATA_PREFIX}${char.id}`)
        if (raw) {
          try {
            details[char.id] = JSON.parse(raw)
          } catch (e) {
            console.error(`Failed to parse character ${char.id}:`, e)
          }
        }
      }
      setCharacterDetails(details)
    } catch (err) {
      console.error('Failed to load character list:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshList()
  }, [])

  // 新建角色并分流
  const handleCreateNew = async (mode: 'standard' | 'cyberpunk_abyss_walker') => {
    if (characterList.characters.length >= MAX_CHARACTERS) {
      alert(`角色数量已达上限（最多 ${MAX_CHARACTERS} 个角色）。请删除不需要的角色后再试。`)
      return
    }

    const newId = generateCharacterId()
    const isCyber = mode === 'cyberpunk_abyss_walker'
    const defaultName = isCyber ? '未命名边缘行者' : '未命名冒险者'
    const saveName = isCyber ? '新赛博角色' : '新标准角色'

    const newSheet: SheetData = {
      ...defaultSheetData,
      name: defaultName,
      campaignMode: mode
    }

    // 保存至本地存储
    await saveCharacterSheet(newId, newSheet)

    const newMetadata: CharacterMetadata = {
      id: newId,
      saveName: saveName,
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      order: characterList.characters.length
    }

    const updatedList: CharacterList = {
      ...characterList,
      characters: [...characterList.characters, newMetadata],
      activeCharacterId: newId,
      lastUpdated: new Date().toISOString()
    }

    saveCharacterList(updatedList)

    // 自动路由分流
    if (isCyber) {
      router.push(`/character/cyberpunk?id=${newId}`)
    } else {
      router.push(`/character/standard?id=${newId}`)
    }
  }

  // 点击已有角色卡自动分流
  const handleOpenCharacter = (charId: string) => {
    const detail = characterDetails[charId]
    const isCyber = detail?.campaignMode === 'cyberpunk_abyss_walker'

    // 设置为活动角色
    const updatedList: CharacterList = {
      ...characterList,
      activeCharacterId: charId,
      lastUpdated: new Date().toISOString()
    }
    saveCharacterList(updatedList)

    if (isCyber) {
      router.push(`/character/cyberpunk?id=${charId}`)
    } else {
      router.push(`/character/standard?id=${charId}`)
    }
  }

  // 删除角色
  const handleDelete = (charId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const char = characterList.characters.find((c) => c.id === charId)
    if (!confirm(`确定要删除存档【${char?.saveName || '此角色'}】吗？此操作无法撤销。`)) {
      return
    }

    localStorage.removeItem(`${CHARACTER_DATA_PREFIX}${charId}`)
    const updatedChars = characterList.characters.filter((c) => c.id !== charId)
    const updatedList: CharacterList = {
      characters: updatedChars,
      activeCharacterId: characterList.activeCharacterId === charId ? (updatedChars[0]?.id || null) : characterList.activeCharacterId,
      lastUpdated: new Date().toISOString()
    }
    saveCharacterList(updatedList)
    refreshList()
  }

  // 复制角色
  const handleDuplicate = async (charId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (characterList.characters.length >= MAX_CHARACTERS) {
      alert(`角色数量已达上限（最多 ${MAX_CHARACTERS} 个角色）。`)
      return
    }

    const source = characterDetails[charId]
    const sourceMeta = characterList.characters.find((c) => c.id === charId)
    if (!source || !sourceMeta) return

    const newId = generateCharacterId()
    const newSaveName = `${sourceMeta.saveName} (副本)`
    const newSheet: SheetData = {
      ...source,
      name: `${source.name || '角色'} (副本)`
    }

    await saveCharacterSheet(newId, newSheet)

    const newMetadata: CharacterMetadata = {
      id: newId,
      saveName: newSaveName,
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      order: characterList.characters.length
    }

    const updatedList: CharacterList = {
      ...characterList,
      characters: [...characterList.characters, newMetadata],
      lastUpdated: new Date().toISOString()
    }

    saveCharacterList(updatedList)
    refreshList()
  }

  return (
    <div className="min-h-screen bg-[#0B0320] text-slate-100 font-sans selection:bg-[#FF007F] selection:text-white">
      {/* 顶部导航 */}
      <header className="border-b border-white/10 backdrop-blur-md bg-black/40 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回主站 Hub</span>
            </Link>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00FFA3] to-[#6C00FF] flex items-center justify-center font-bold text-xs text-black">
                DH
              </div>
              <h1 className="font-extrabold text-base tracking-wider">角色卡中心与车卡调度中枢</h1>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            存档位：<span className="text-[#00FFA3] font-bold">{characterList.characters.length}</span> / {MAX_CHARACTERS}
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* 新建角色操作区 */}
        <div className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-[#00FFA3]" />
            <span>创建新角色存档</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 按钮 1: 新建标准奇幻角色 */}
            <button
              onClick={() => handleCreateNew('standard')}
              className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-amber-400/60 hover:shadow-[0_0_24px_rgba(245,158,11,0.15)] transition-all text-left flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30">
                    标准规则
                  </span>
                  <span className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                    新建标准匕首之心角色
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  支持官方 9 职业、18 种族、9 社群、子职业、领域法术手牌与标准装备。
                </p>
              </div>
              <Sparkles className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform ml-4 flex-shrink-0" />
            </button>

            {/* 按钮 2: 新建爽博朋克角色 */}
            <button
              onClick={() => handleCreateNew('cyberpunk_abyss_walker')}
              className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-[#00FFA3]/60 hover:shadow-[0_0_24px_rgba(0,255,163,0.15)] transition-all text-left flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30">
                    爽博朋克特化
                  </span>
                  <span className="text-sm font-bold text-white group-hover:text-[#00FFA3] transition">
                    新建《渊边行者》赛博角色
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  专属身体 5 大区义体插槽改造、非法黑市交易、赛博消耗品与 A4 打印线框化。
                </p>
              </div>
              <Cpu className="w-6 h-6 text-[#00FFA3] group-hover:scale-110 transition-transform ml-4 flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* 角色存档列表 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center space-x-2">
              <Layers className="w-5 h-5 text-[#6C00FF]" />
              <span>我的本地角色存档 ({characterList.characters.length})</span>
            </h2>
          </div>

          {characterList.characters.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
              <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400 mb-2">当前暂无任何角色存档</p>
              <p className="text-xs text-slate-500">点击上方按钮即可创建你的第一张角色卡！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {characterList.characters.map((char) => {
                const detail = characterDetails[char.id]
                const isCyber = detail?.campaignMode === 'cyberpunk_abyss_walker'
                const charName = detail?.name || '未命名角色'
                const profession = detail?.profession || '未知职业'
                const level = detail?.level || '1'

                return (
                  <div
                    key={char.id}
                    onClick={() => handleOpenCharacter(char.id)}
                    className={`group relative p-5 rounded-2xl border transition-all duration-300 backdrop-blur-md bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer flex flex-col justify-between ${
                      isCyber
                        ? 'border-white/10 hover:border-[#00FFA3]/60 hover:shadow-[0_0_20px_rgba(0,255,163,0.1)]'
                        : 'border-white/10 hover:border-amber-400/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                    }`}
                  >
                    <div>
                      {/* 卡片头部标签 */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isCyber
                            ? 'bg-[#00FFA3]/10 text-[#00FFA3] border-[#00FFA3]/30'
                            : 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                        }`}>
                          {isCyber ? '爽博朋克' : '标准规则'}
                        </span>
                        <div className="flex items-center space-x-1 text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px]">
                            {new Date(char.lastModified).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* 角色名称与职业 */}
                      <h3 className="text-xl font-bold text-white group-hover:text-[#00FFA3] transition mb-1">
                        {charName}
                      </h3>
                      <div className="text-xs text-slate-400 mb-4 flex items-center space-x-2">
                        <span>存档：{char.saveName}</span>
                        <span>•</span>
                        <span>{profession} (LV.{level})</span>
                      </div>
                    </div>

                    {/* 卡片底部操作栏 */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                      <span className="text-[11px] group-hover:underline">点击进入车卡器 ➔</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => handleDuplicate(char.id, e)}
                          title="复制此存档"
                          className="p-1 hover:text-white hover:bg-white/10 rounded transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(char.id, e)}
                          title="删除此存档"
                          className="p-1 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
