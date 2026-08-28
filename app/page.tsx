import type { Metadata } from 'next'
import { PortalHub } from '@/components/hub/portal-hub'

export const metadata: Metadata = {
  title: '匕首心&爽博朋克in one | Daggerheart & Cyberpunk in One',
  description:
    '匕首心&爽博朋克in one (DH-IN-ONE) 是免费开源的一体化跑团工作台，集成爽博朋克赛博车卡器、匕首心卡牌工坊 V3、战役文档编辑器与本地公共卡牌库于一体。',
}

export default function HomePage() {
  return <PortalHub />
}
