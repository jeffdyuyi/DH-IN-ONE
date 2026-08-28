import type { Metadata } from 'next'
import { CampaignEditorApp } from '../../components/campaign/campaign-editor-app'

export const metadata: Metadata = {
  title: '匕首心战役文档编辑器 | DH-IN-ONE',
  description: '专业跑团模组与战役设定排版工具，支持从公共卡牌库一键插入敌人、环境险境与掉落物品，内建 DPCGL 合规声明。',
}

export default function CampaignPage() {
  return <CampaignEditorApp />
}
