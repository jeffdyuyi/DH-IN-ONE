import type { Metadata } from 'next'
import { CyberpunkCharacterSheet } from '@/components/cyberpunk/cyberpunk-character-sheet'

export const metadata: Metadata = {
  title: '爽博朋克：渊边行者 | 专属车卡器',
  description:
    '基于 DaggerHeart 底层的《爽博朋克：渊边行者》特化车卡器，支持身体四大区改造槽位、护甲加值阈值计算、随身消耗品与非法改造黑市交易。',
}

export default function CyberpunkPage() {
  return <CyberpunkCharacterSheet />
}
