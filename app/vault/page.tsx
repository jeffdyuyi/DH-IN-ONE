import type { Metadata } from 'next'
import { VaultHubApp } from '../../components/vault/vault-hub-app'

export const metadata: Metadata = {
  title: '公共本地卡牌库中枢 | DH-IN-ONE',
  description: '统一管理官方 120 种战利品/消耗品、工坊自制卡牌与赛博装备，支持全库备份、卡包导入与跨应用互通。',
}

export default function VaultPage() {
  return <VaultHubApp />
}
