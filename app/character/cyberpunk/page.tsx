import type { Metadata } from 'next'
import { CyberpunkCharacterSheet } from '../../../components/cyberpunk/cyberpunk-character-sheet'

export const metadata: Metadata = {
  title: '爽博朋克：渊边行者 特化车卡器 | DH-IN-ONE',
  description: '支持身体 5 大部位义体改造插槽、官方战利品直接装配、黑市非法改造与 A4 竖版 0 墨水线框打印。',
}

export default function CyberpunkCharacterPage() {
  return <CyberpunkCharacterSheet />
}
