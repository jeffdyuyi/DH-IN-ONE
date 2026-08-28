import type { Metadata } from 'next'
import { CyberpunkCharacterSheet } from '@/components/cyberpunk/cyberpunk-character-sheet'

export const metadata: Metadata = {
  title: '爽博朋克：渊边行者 | 专属车卡器 (DH-IN-ONE)',
  description:
    '《爽博朋克：渊边行者》官方特化车卡器，基于 Daggerheart 规则引擎打造，支持义体改造槽位、伤害阈值计算、随身消耗品与非法黑市改造。',
}

export default function HomePage() {
  return <CyberpunkCharacterSheet />
}
