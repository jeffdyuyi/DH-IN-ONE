import type { Metadata } from 'next'
import HomeClientApp from '@/components/home-client-app'

export const metadata: Metadata = {
  title: '标准匕首之心角色卡生成器 | DH-IN-ONE',
  description: '官方标准规则匕首之心车卡器，支持 9 大职业、种族、社群、领域法术手牌与装备自动化计算。',
}

export default function StandardCharacterPage() {
  return <HomeClientApp />
}
