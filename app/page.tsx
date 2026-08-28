import type { Metadata } from 'next'
import { PortalHub } from '@/components/hub/portal-hub'

export const metadata: Metadata = {
  title: 'DH-IN-ONE | Daggerheart 匕首之心多合一工具箱',
  description:
    'DH-IN-ONE 是免费开源的 Daggerheart 匕首之心一体化跑团中枢，集卡牌工坊 V3、战役文档编辑器、标准与爽博双规则车卡器与公共本地卡牌库于一体。',
}

export default function HomePage() {
  return <PortalHub />
}
