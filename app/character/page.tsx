import type { Metadata } from 'next'
import { CharacterHub } from '@/components/character/character-hub'

export const metadata: Metadata = {
  title: '角色卡中心与车卡调度中枢 | DH-IN-ONE',
  description: '管理你的 Daggerheart 本地角色卡存档，支持标准奇幻与爽博朋克双规则无缝分流。',
}

export default function CharacterPage() {
  return <CharacterHub />
}
